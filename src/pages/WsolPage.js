import { useEffect, useState } from "react";
import * as buffer from "buffer";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getPhantomProvider } from "../utils/GetPhantomProvider";
import {
  signSolanaMessage,
  verifySolanaSignature,
  verifySolanaSignatureV2
} from "../utils/SolanaSignAndVerify";
import { getDevConnection } from "../utils/GetSolanaConnection";
import { getSolBalance } from "../utils/SolanaGetBalance";
import {
  getMetadataPDA,
  getWethMintAddress,
  getWethProgram,
  getWethBalance
} from "../utils/GetWsolProgram";
import { BN } from "@coral-xyz/anchor";
import { toast } from "sonner";

const WsolPage = () => {
  window.Buffer = buffer.Buffer;
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentSolanaAccount, setCurrentSolanaAccount] = useState(null);
  const [accountSOLBalance, setAccountSOLBalance] = useState(null);
  const [accountWethBalance, setAccountWethBalance] = useState(null);
  const [isDepositProcessing, setIsDepositProcessing] = useState(false);
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updateShowData, 3000);

    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

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
    if (!window.solana) {
      alert("Please install Phantom wallet to use this app");
      return;
    }

    const provider = await getPhantomProvider();

    const publicKey = provider.publicKey;

    const account_Address = publicKey.toBase58();

    console.log(
      "Connected to Phantom wallet. Public key:",
      publicKey.toBase58()
    );

    localStorage.setItem("currentSolanaAccount", account_Address);

    console.log(provider);
    const loginTime = new Date().toLocaleString();

    const message =
      `Welcome to ${origin} !` +
      "\nAccount: " +
      account_Address +
      "\nLoginTime: " +
      loginTime;

    const signature_string = await signSolanaMessage(provider, message);

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
    if (!window.solana) {
      alert("Please install Phantom wallet to use this app");
      return;
    }
    const connection = getDevConnection();
    const provider = await getPhantomProvider();
    const program = getWethProgram(connection, provider);

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
        const tx = await program.methods
          .initialize()
          .accountsPartial({
            signer: provider.publicKey,
            wethMetadata: wsol_mint_metadata
          })
          // .signers([owner])
          .rpc();
        console.log(tx);
        toast.success("initialize success");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const depositHandler = async () => {
    setIsDepositProcessing(true);
    const connection = getDevConnection();
    const provider = await getPhantomProvider();
    const program = getWethProgram(connection, provider);

    try {
      const tx = await program.methods
        .deposit(new BN(LAMPORTS_PER_SOL))
        .accountsPartial({
          signer: provider.publicKey
        })
        // .signers([owner])
        .rpc();
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
    const provider = await getPhantomProvider();
    const program = getWethProgram(connection, provider);

    try {
      const tx = await program.methods
        .withdraw(new BN(LAMPORTS_PER_SOL))
        .accountsPartial({
          signer: provider.publicKey
        })
        // .signers([owner])
        .rpc();
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
    if (!window.solana) {
      toast.error("Please install Phantom wallet to use this app");
      return;
    }

    const provider = await getPhantomProvider();
    await provider.disconnect();

    setMessage("");
    setAccountSOLBalance(0);
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

export default WsolPage;
