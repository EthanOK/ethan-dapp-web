/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — TODO: 逐步补充类型
import { useEffect, useRef, useState } from "react";
import * as buffer from "buffer";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  verifySolanaSignature,
  verifySolanaSignatureV2
} from "../utils/SolanaSignAndVerify";
import { getDevConnection } from "../utils/GetSolanaConnection";
import { getSolBalance } from "../utils/SolanaGetBalance";
import {
  getMetadataPDA,
  getWethMintAddress,
  getWethProgram,
  getWethBalance,
  getDestinationAddress,
  getStoragePDA
} from "../utils/GetWsolProgram";
import { BN } from "@coral-xyz/anchor";
import { toast } from "sonner";

import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import base58 from "bs58";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const WsolPageContent = () => {
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection: appKitConnection } = useAppKitConnection();
  const connection = appKitConnection ?? getDevConnection();

  window.Buffer = buffer.Buffer;
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentSolanaAccount, setCurrentSolanaAccount] = useState(null);
  const [accountSOLBalance, setAccountSOLBalance] = useState(null);
  const [accountWethBalance, setAccountWethBalance] = useState(null);
  const [isDepositProcessing, setIsDepositProcessing] = useState(false);
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);

  const connected = !!walletProvider?.publicKey;
  const publicKey = walletProvider?.publicKey;
  const signMessage = walletProvider?.signMessage?.bind(walletProvider);
  const disconnect = walletProvider?.disconnect?.bind(walletProvider);
  const sendTransaction = walletProvider?.sendTransaction?.bind(walletProvider);
  const wallet = walletProvider;

  const connectionRef = useRef(connection);
  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updateShowData, 3000);

    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, [connected]);

  useEffect(() => {
    if (isMounted) {
      configData();
    }
  }, [isMounted]);

  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem("currentSolanaAccount", publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const configData = async () => {
    setCurrentAccount("0x");
    let account = localStorage.getItem("userAddress");
    if (account !== null) {
      setCurrentAccount(account);
    }
  };
  const updateShowData = async () => {
    if (!connected) {
      setCurrentSolanaAccount("");
      setAccountSOLBalance(0);
      setAccountWethBalance(0);
      return;
    }
    try {
      let accountSolana = localStorage.getItem("currentSolanaAccount");
      setCurrentSolanaAccount(accountSolana);

      if (accountSolana === "" || accountSolana === null) {
        return;
      }

      const balance = await getSolBalance(connectionRef.current, accountSolana);

      setAccountSOLBalance(balance / LAMPORTS_PER_SOL);

      setAccountWethBalance(
        (await getWethBalance(connectionRef.current, accountSolana)) /
          LAMPORTS_PER_SOL
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendPreparedTransaction = async (
    txTransaction: Transaction,
    connection: Connection
  ) => {
    const latestBlockhash = await connection.getLatestBlockhash();
    txTransaction.feePayer = wallet.publicKey;
    txTransaction.recentBlockhash = latestBlockhash.blockhash;
    return sendTransaction(txTransaction, connection);
  };

  // 网络切换（connection 改变）时立刻刷新一次余额
  useEffect(() => {
    if (connected) {
      updateShowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, connection]);

  const PleaseLogin = () => {
    return (
      <button className="cta-button unlogin-nft-button">PleaseLogin</button>
    );
  };

  const signSolanaMessageHandler = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    const account_Address = publicKey.toBase58();

    localStorage.setItem("currentSolanaAccount", account_Address);

    const loginTime = new Date().toLocaleString();

    const LOGIN_MESSAGE =
      `Welcome to ${origin} !` +
      "\nAccount: " +
      account_Address +
      "\nLoginTime: " +
      loginTime;

    const message = new TextEncoder().encode(LOGIN_MESSAGE);
    let signature_string = null;
    try {
      const signResult = await signMessage(message);

      signature_string = base58.encode(signResult);
    } catch (error) {
      toast.error("User rejected the signature.");
      return;
    }

    if (signature_string === null) {
      setMessage("");
      alert("User rejected the signature.");
    } else {
      setMessage(signature_string);

      console.log(signature_string.length);

      const verifyR = await verifySolanaSignature(
        signature_string,
        message,
        account_Address
      );

      console.log(verifyR);

      const verifyR2 = await verifySolanaSignatureV2(
        signature_string,
        message,
        account_Address
      );

      console.log(verifyR2);
    }
  };

  const initializeHandler = async () => {
    const program = getWethProgram(connection, wallet);

    const wsol_mint = PublicKey.findProgramAddressSync(
      [Buffer.from("wsol_mint")],
      program.programId
    )[0];

    const wsol_mint_metadata = getMetadataPDA(wsol_mint);

    let state = false;

    try {
      const accountinfo = await connection.getAccountInfo(wsol_mint);

      if (accountinfo) {
        state = true;
      }
    } catch (error) {
      state = false;
    }

    if (state) {
      toast.error("Already initialized");
    } else {
      try {
        const txTransaction = await program.methods
          .initialize()
          .accountsPartial({
            signer: wallet.publicKey,
            wethMetadata: wsol_mint_metadata
          })
          .transaction();
        const tx = await sendPreparedTransaction(txTransaction, connection);
        console.log(tx);
        toast.success("initialize success");
      } catch (error) {
        console.log(error);
        toast.error("initialize failed");
      }
    }
  };

  const depositHandler = async () => {
    setIsDepositProcessing(true);
    const program = getWethProgram(connection, wallet);

    try {
      const storage_PDA = getStoragePDA();

      const wsol_mint = getWethMintAddress();

      const destination = getDestinationAddress(wsol_mint, wallet.publicKey);
      const txTransaction = await program.methods
        .deposit(new BN(LAMPORTS_PER_SOL))
        .accountsStrict({
          signer: wallet.publicKey,
          storageAccount: storage_PDA,
          wsolMint: wsol_mint,
          destination: destination,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();
      const tx = await sendPreparedTransaction(txTransaction, connection);
      console.log(tx);
      toast.success("deposit success");
    } catch (error) {
      console.log(error);
      toast.error("deposit failed");
      setTimeout(() => {}, 2000);
    } finally {
      setIsDepositProcessing(false);
    }
  };

  const withdrwaHandler = async () => {
    setIsWithdrawProcessing(true);
    const program = getWethProgram(connection, wallet);

    try {
      const txTransaction = await program.methods
        .withdraw(new BN(LAMPORTS_PER_SOL))
        .accountsPartial({
          signer: wallet.publicKey
        })
        .transaction();
      const tx = await sendPreparedTransaction(txTransaction, connection);
      console.log(tx);
      toast.success("withdraw success");
    } catch (error) {
      console.log(error);
      toast.error("withdraw failed");
    } finally {
      setIsWithdrawProcessing(false);
    }
  };

  const disConnectHandler = async () => {
    await disconnect();
    localStorage.removeItem("currentSolanaAccount");

    setMessage("");
    setAccountSOLBalance(0);
    setCurrentSolanaAccount("");
  };

  const loginSolanaButton = () => {
    return (
      <button
        onClick={signSolanaMessageHandler}
        className="cta-button mint-nft-button"
      >
        Login Solana
      </button>
    );
  };

  const initializeButton = () => {
    return (
      <button
        onClick={initializeHandler}
        className="cta-button mint-nft-button"
      >
        initialize
      </button>
    );
  };

  const depositButton = () => {
    return (
      <button
        onClick={depositHandler}
        className="cta-button mint-nft-button"
        disabled={!currentSolanaAccount || isDepositProcessing}
      >
        {isDepositProcessing ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #ffffff",
                borderRightColor: "transparent",
                borderRadius: "50%",
                animation: "rotate 1s linear infinite",
                marginRight: "8px"
              }}
            ></span>
            Processing...
          </>
        ) : (
          "deposit 1 SOL"
        )}
      </button>
    );
  };

  const withdrawButton = () => {
    return (
      <button
        onClick={withdrwaHandler}
        className="cta-button mint-nft-button"
        disabled={!currentSolanaAccount || isWithdrawProcessing}
      >
        {isWithdrawProcessing ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #ffffff",
                borderRightColor: "transparent",
                borderRadius: "50%",
                animation: "rotate 1s linear infinite",
                marginRight: "8px"
              }}
            ></span>
            Processing...
          </>
        ) : (
          "withdraw 1 WSOL"
        )}
      </button>
    );
  };

  const disConnectButton = () => {
    return (
      <button
        onClick={disConnectHandler}
        className="cta-button mint-nft-button"
      >
        DisConnect
      </button>
    );
  };

  return (
    <center>
      <div className="bordered-div">
        <h2>Login Solana</h2>
        {/* <appkit-button /> */}
        <p></p>
        Solana Account: {currentSolanaAccount}
        <p></p>
        Balance: {accountSOLBalance} SOL
        <p></p>
        <p></p>
        {currentAccount ? loginSolanaButton() : PleaseLogin()}
        <p></p>
        <p></p>
        {currentAccount ? disConnectButton() : PleaseLogin()}
      </div>
      <div>
        <h2>
          Please See:
          <p></p>
          <textarea
            type="text"
            value={message}
            readOnly
            style={{ width: "600px", height: "60px" }}
          ></textarea>
        </h2>
      </div>
      <h2>WSOL</h2>
      <p>address: {getWethMintAddress()}</p>
      <p>balance: {accountWethBalance} WSOL</p>
      <div className="bordered-div">
        <h3>Initialize</h3>
        <p></p>
        {initializeButton()}
      </div>
      <p></p>
      <div className="bordered-div">
        <h3>Deposit</h3>
        <p></p>
        {depositButton()}
      </div>

      <p></p>
      <div className="bordered-div">
        <h3>Withdraw</h3>
        <p></p>
        {withdrawButton()}
      </div>
    </center>
  );
};

const WsolPage = () => {
  return <WsolPageContent />;
};

export default WsolPage;
