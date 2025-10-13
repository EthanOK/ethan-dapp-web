import { useEffect, useState } from "react";
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

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  useAnchorWallet,
  useWallet,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import base58 from "bs58";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const WsolPageContent = () => {
  window.Buffer = buffer.Buffer;
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentSolanaAccount, setCurrentSolanaAccount] = useState(null);
  const [accountSOLBalance, setAccountSOLBalance] = useState(null);
  const [accountWethBalance, setAccountWethBalance] = useState(null);
  const [isDepositProcessing, setIsDepositProcessing] = useState(false);
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);

  const { connected, publicKey, signMessage, disconnect, sendTransaction } =
    useWallet();

  const wallet = useAnchorWallet();

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

      const connection = getDevConnection();
      const balance = await getSolBalance(connection, accountSolana);

      setAccountSOLBalance(balance / LAMPORTS_PER_SOL);

      setAccountWethBalance(
        (await getWethBalance(connection, accountSolana)) / LAMPORTS_PER_SOL
      );
    } catch (error) {
      console.log(error);
    }
  };

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
    const connection = getDevConnection();
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
        const tx = await sendTransaction(txTransaction, connection);
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
    const connection = getDevConnection();
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
      const tx = await sendTransaction(txTransaction, connection);
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
    const connection = getDevConnection();
    const program = getWethProgram(connection, wallet);

    try {
      const txTransaction = await program.methods
        .withdraw(new BN(LAMPORTS_PER_SOL))
        .accountsPartial({
          signer: wallet.publicKey
        })
        .transaction();
      const tx = await sendTransaction(txTransaction, connection);
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
        <WalletMultiButton />
        <p></p>
        Solana Account: {currentSolanaAccount}
        <p></p>
        Balance(DEV): {accountSOLBalance} SOL
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

// 外层包装组件，提供 Provider
const WsolPage = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      /**
       * Wallets that implement either of these standards will be available automatically.
       *
       *   - Solana Mobile Stack Mobile Wallet Adapter Protocol
       *     (https://github.com/solana-mobile/mobile-wallet-adapter)
       *   - Solana Wallet Standard
       *     (https://github.com/anza-xyz/wallet-standard)
       *
       * If you wish to support a wallet that supports neither of those standards,
       * instantiate its legacy wallet adapter here. Common legacy adapters can be found
       * in the npm package `@solana/wallet-adapter-wallets`.
       */
      new UnsafeBurnerWalletAdapter()
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WsolPageContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WsolPage;
