import { useEffect, useMemo, useState } from "react";
import * as buffer from "buffer";
import {
  clusterApiUrl,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  signSolanaMessage,
  verifySolanaSignature,
  verifySolanaSignatureV2
} from "../utils/SolanaSignAndVerify";
import { getDevConnection } from "../utils/GetSolanaConnection";
import { getSolBalance } from "../utils/SolanaGetBalance";
import { sendTransactionOfPhantom } from "../utils/PhantomSendTransaction";
import { getAssociatedAddress, stringToArray } from "../utils/Utils";
import base58 from "bs58";
import { toast } from "sonner";
import {
  ConnectionProvider,
  useAnchorWallet,
  useWallet,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

const SolanaUtilsContent = () => {
  window.Buffer = buffer.Buffer;
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentSolanaAccount, setCurrentSolanaAccount] = useState(null);
  const [accountSOLBalance, setAccountSOLBalance] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [associatedAddress, setAssociatedAddress] = useState("");
  const [solPrivateKey, setSolPrivateKey] = useState("");
  const [solPublicKey, setSolPublicKey] = useState("");
  const [solKeypair, setSolKeypair] = useState("");
  const [solKeypairPublicKey, setSolKeypairPublicKey] = useState("");

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
    if (connected) {
      localStorage.setItem("currentSolanaAccount", publicKey.toBase58());
    }
  };
  const updateShowData = async () => {
    if (!connected) {
      setCurrentSolanaAccount("");
      setAccountSOLBalance(0);
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
    const publicKey = wallet.publicKey;

    const account_Address = publicKey.toBase58();

    console.log(
      "Connected to Phantom wallet. Public key:",
      publicKey.toBase58()
    );

    localStorage.setItem("currentSolanaAccount", account_Address);

    // console.log(provider);
    const loginTime = new Date().toLocaleString();

    const message =
      `Welcome to ${origin} !` +
      "\nAccount: " +
      account_Address +
      "\nLoginTime: " +
      loginTime;
    const message_Uint8Array = new TextEncoder().encode(message);
    let signature_string = null;

    try {
      const signResult = await signMessage(message_Uint8Array);
      signature_string = base58.encode(signResult);
    } catch (error) {
      toast.error("User rejected the signature.");
      return;
    }

    if (signature_string === null) {
      setMessage("");
      toast.error("User rejected the signature.");
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

  const disConnectHandler = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    await disconnect();

    setMessage("");
    setAccountSOLBalance(0);
  };

  const airDropHandler = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (currentSolanaAccount === "" || currentSolanaAccount === null) {
      return;
    }

    const connection = getDevConnection();

    try {
      const signature = await connection.requestAirdrop(
        new PublicKey(currentSolanaAccount),
        2 * LAMPORTS_PER_SOL
      );
      console.log(signature);
      toast.success("AIRDROP Success!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error("AIRDROP Failure!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };

  const transferSOLHandler = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (currentSolanaAccount === "" || currentSolanaAccount === null) {
      return;
    }
    const toSolAddressInput = document.getElementById("toSolAddress");
    const toSolAddressInputValue = toSolAddressInput.value;
    const addressArray = stringToArray(toSolAddressInputValue);
    if (addressArray.length === 0) {
      toast.error("To address is null");
      return;
    }
    addressArray.forEach((address) => {
      if (address.length !== 44 && address.length !== 43) {
        toast.error("To address is not valid");
        return;
      }
    });

    try {
      const connection = getDevConnection();

      const items = [];
      addressArray.forEach((toAddress) => {
        items.push(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(toAddress),
            lamports: 0.5 * LAMPORTS_PER_SOL
          })
        );
      });

      const transaction = new Transaction().add(...items);

      const signature = await sendTransaction(transaction, connection);

      console.log(signature);
      if (signature === null) {
        toast.error("send Sol Failure!");
      } else {
        toast.success("send Sol Success!");
      }

      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error("send Sol Failure!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };

  const getAssociatedAddressHandler = async () => {
    const ownerAddress = document.getElementById("ownerAddress").value;
    const mintAddress = document.getElementById("mintAddress").value;

    const associatedAddress = await getAssociatedAddress(
      mintAddress,
      ownerAddress
    );

    console.log(associatedAddress);
    setAssociatedAddress(associatedAddress);
  };

  const getSOLPrivatekeyHandler = async () => {
    let keypair = document.getElementById("keypair").value;
    if (keypair === "") {
      keypair = document.getElementById("keypair").placeholder;
    }
    const pair = JSON.parse(keypair);
    const privateKey = base58.encode(pair);
    try {
      setSolPrivateKey(privateKey);

      setSolPublicKey(
        Keypair.fromSecretKey(new Uint8Array(pair)).publicKey.toString()
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getSOLKeypairHandler = async () => {
    let privateKey = document.getElementById("privateKey").value;
    if (privateKey === "") {
      privateKey = document.getElementById("privateKey").placeholder;
    }

    try {
      const keypair = Keypair.fromSecretKey(base58.decode(privateKey));
      setSolKeypair("[" + keypair.secretKey.toString() + "]");
      setSolKeypairPublicKey(keypair.publicKey.toString());
    } catch (error) {
      toast.error(error.message);
    }
  };

  const loginSolanaButton = () => {
    return (
      <button
        onClick={signSolanaMessageHandler}
        className="cta-button mint-nft-button"
      >
        Sign Solana Message
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

  const transferSOLButton = () => {
    return (
      <button
        onClick={transferSOLHandler}
        className="cta-button mint-nft-button"
      >
        Everyone transfer 0.5 SOL
      </button>
    );
  };

  const getAssociatedAddressButton = () => {
    return (
      <button
        onClick={getAssociatedAddressHandler}
        className="cta-button mint-nft-button"
      >
        getAssociatedAddress
      </button>
    );
  };

  const getSOLPrivatekeyButton = () => {
    return (
      <button
        onClick={getSOLPrivatekeyHandler}
        className="cta-button mint-nft-button"
      >
        getSolPrivatekey
      </button>
    );
  };

  const getSOLKeypairButton = () => {
    return (
      <button
        onClick={getSOLKeypairHandler}
        className="cta-button mint-nft-button"
      >
        getSOLKeypair
      </button>
    );
  };

  const airDropButton = () => {
    return (
      <button onClick={airDropHandler} className="cta-button mint-nft-button">
        AirDrop 2 SOL
      </button>
    );
  };

  return (
    <center>
      <div>
        {showAlert && <div className="alert"></div>}
        <h2>Solana Utils</h2>
        Solana Account: {currentSolanaAccount}
        <p></p>
        Balance(DEV): {accountSOLBalance} SOL
        <p></p>
        <WalletMultiButton />
        <p></p>
        {currentAccount ? loginSolanaButton() : PleaseLogin()}
        <p></p>
        {currentAccount ? airDropButton() : PleaseLogin()}
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
            style={{ width: "1200px", height: "100px" }}
          ></textarea>
        </h2>
      </div>

      <p></p>

      <div className="bordered-div">
        <h2>Batch Transfer SOL</h2>
        <label className="label">ToAddress:</label>
        <textarea
          className="textarea"
          id="toSolAddress"
          placeholder="[3c5MLawkv9DY4C4zh39xHMic8MCTfBLVEZRSG4cWjjiH,AQAMLqdN3LSvaHx5tCVeWZWDRTGqL7QuvNgojCb3pS6Z]"
          style={{ width: "400px", height: "100px" }}
        ></textarea>

        <p></p>
        {currentSolanaAccount ? transferSOLButton() : PleaseLogin()}
      </div>

      <p></p>
      <div className="bordered-div">
        <h2>Get Associated Address</h2>
        <label className="label">ownerAddress:</label>
        <textarea
          className="textarea"
          id="ownerAddress"
          placeholder="2xuEyZoSkiiNBAgL21XobUCraojPUZ82GHuWpCPgpyXF"
          style={{ width: "450px", height: "16px" }}
        ></textarea>
        <p></p>
        <label className="label">mintAddress:</label>
        <textarea
          className="textarea"
          id="mintAddress"
          placeholder="2xuEyZoSkiiNBAgL21XobUCraojPUZ82GHuWpCPgpyXF"
          style={{ width: "450px", height: "16px" }}
        ></textarea>
        <p></p>
        {getAssociatedAddressButton()}
        <p></p>
        Associated Address: {associatedAddress}
      </div>

      <p></p>
      <div className="bordered-div">
        <h3>Keypair To PrivateKey</h3>
        <div>
          <label className="label">keypair:</label>
          <textarea
            className="multiline-textarea"
            id="keypair"
            placeholder="[38,109,228,83,26,37,10,17,191,88,35,2,57,168,81,242,69,45,39,19,105,131,213,152,160,107,31,59,226,22,114,180,137,182,45,71,20,19,69,96,3,136,126,234,234,23,153,66,217,243,223,192,247,89,16,24,11,17,240,172,138,172,13,244]"
            style={{ height: "70px", width: "500px", fontSize: "14px" }}
          ></textarea>
          <p></p>
          {getSOLPrivatekeyButton()}
          <p></p>
          PrivateKey: {solPrivateKey}
          <p></p>
          PublicKey: {solPublicKey}
        </div>
      </div>
      <p></p>
      <div className="bordered-div">
        <h3>PrivateKey To Keypair</h3>
        <div>
          <label className="label">privateKey:</label>
          <textarea
            className="multiline-textarea"
            id="privateKey"
            placeholder="mZeFbFsK1Ezt29Z9pA5ZbSMbw8PZyB4DPTtSEPwHqYr5zfaWJCHRPSrDkwNTjcHKLzJSLQduzLCJhNbrgNXio4f"
            style={{ height: "70px", width: "500px", fontSize: "14px" }}
          ></textarea>
          <p></p>
          {getSOLKeypairButton()}
          <p></p>
          <label>Keypair:</label>
          <textarea
            value={solKeypair}
            readOnly
            style={{
              width: "500px",
              height: "60px",
              fontSize: "12px",
              fontFamily: "monospace"
            }}
          />
          <p></p>
          PublicKey: {solKeypairPublicKey}
        </div>
      </div>
    </center>
  );
};

const SolanaUtilsPage = () => {
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
          <SolanaUtilsContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaUtilsPage;
