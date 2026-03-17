/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — TODO: 逐步补充类型
import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import {
  SolanaPrivateKeyProvider,
  SolanaWallet
} from "@web3auth/solana-provider";
import { ethers } from "ethers";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

const clientId =
  "BGaYve_5NaFEkrmlHuvoCcTA9Lj0DJV2JoOOyJyGA2Ch3q6KjPV7olKu1CU03zOmTJ0eLrr0ErEvZbGRlXs6Ju4"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
};

const chainConfig_solana = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x3", // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
  rpcTarget: "https://api.devnet.solana.com",
  displayName: "Solana Testnet",
  blockExplorerUrl: "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
  logo: "https://images.toruswallet.io/solana.svg"
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: chainConfig }
});
const privateKeyProvider_solana = new SolanaPrivateKeyProvider({
  config: { chainConfig: chainConfig_solana }
});

// const web3auth = new Web3Auth({
//   clientId,
//   web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
//   privateKeyProvider: privateKeyProvider,
// });

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider: privateKeyProvider_solana
});

let web3authInitPromise: Promise<void> | null = null;
const initWeb3AuthModal = async () => {
  if (!web3authInitPromise) web3authInitPromise = web3auth.initModal();
  return web3authInitPromise;
};

const Web3AuthSolanaPage = () => {
  const [provider, setProvider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        // IMP START - SDK Initialization
        await initWeb3AuthModal();
        // IMP END - SDK Initialization
        // initModal 完成即可认为页面 ready（即便未连接时 provider 可能为 null）
        setIsReady(true);

        const p = web3auth.provider;
        setProvider(p);

        // 只有在已连接时，provider 才具备完整的 solana rpc methods（否则可能出现 Method not found）
        if (web3auth.connected && p) {
          setLoggedIn(true);
          const sw = new SolanaWallet(p);
          setSolanaWallet(sw);
          try {
            const conn = await getConnnection(sw);
            setConnection(conn);
          } catch (error) {
            console.error(error);
            uiConsole({
              error: "Get solana provider config failed",
              detail: error
            });
          }
        } else {
          setLoggedIn(false);
          setSolanaWallet(null);
          setConnection(null);
        }
      } catch (error) {
        console.error(error);
        uiConsole({ error: "Web3Auth initModal failed", detail: error });
        // 即便初始化失败，也允许用户点击尝试重新触发连接（避免“彻底没反应”）
        setIsReady(true);
      }
    };

    init();
  }, []);

  const loginHandler = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      if (!isReady) await initWeb3AuthModal();
      // IMP START - Login
      const web3authProvider = await web3auth.connect();
      // IMP END - Login
      setProvider(web3authProvider);
      const sw = new SolanaWallet(web3authProvider);
      setSolanaWallet(sw);
      const conn = await getConnnection(sw);
      setConnection(conn);
      console.log("solanaWallet", sw);

      if (web3auth.connected) {
        setLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
      uiConsole({ error: "Web3Auth connect failed", detail: error });
    } finally {
      setIsConnecting(false);
    }
  };

  const unloggedInView = (
    <button
      type="button"
      onClick={loginHandler}
      className="cta-button mint-nft-button"
      disabled={!isReady || isConnecting}
      aria-disabled={!isReady || isConnecting}
      title={
        !isReady
          ? "Web3Auth 正在初始化…"
          : isConnecting
            ? "正在打开登录…"
            : "Login"
      }
    >
      {!isReady ? "Initializing..." : isConnecting ? "Connecting..." : "Login"}
    </button>
  );

  const getConnnection = async (solanaWallet) => {
    const connectionConfig = await solanaWallet.request({
      method: "solana_provider_config",
      params: []
    });
    const connection = new Connection(connectionConfig.rpcTarget);
    return connection;
  };

  const getUserInfo = async () => {
    // IMP START - Get User Information
    const user = await web3auth.getUserInfo();
    // IMP END - Get User Information
    uiConsole(user);
  };

  const getSigner = async () => {
    // IMP START - Get Signer
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    return ethersProvider.getSigner();
  };

  const logout = async () => {
    // IMP START - Logout
    await web3auth.logout();
    // IMP END - Logout
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  // IMP START - Blockchain Calls
  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    // Get user's Ethereum public address
    // const signer = await getSigner();
    // const accounts = await signer.getAddress();

    // Get user's Solana public address
    const accounts = await solanaWallet.requestAccounts();
    uiConsole(accounts);
    return accounts;
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    // const signer = await getSigner();
    // // Get user's Ethereum public address
    // const address = await signer.getAddress();
    // // Get user's balance in ether
    // const balance = ethers.utils.formatEther(
    //   await signer.provider.getBalance(address)
    // );

    const accounts = await getAccounts();
    const balance = await connection.getBalance(new PublicKey(accounts[0]));

    // solana  format balance
    const balance_sol = balance / LAMPORTS_PER_SOL;

    uiConsole(balance_sol + " SOL");
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const originalMessage = "This is Web3Auth";

    // const signer = await getSigner();

    // Sign the message
    // const signedMessage = await signer.signMessage(originalMessage);

    const signedMessage = await solanaWallet.signMessage(
      Buffer.from(originalMessage, "utf8")
    );
    uiConsole(bs58.encode(signedMessage));
  };
  // IMP END - Blockchain Calls

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    // const privateKey = await provider.request({
    //   method: "eth_private_key",
    // });
    const privateKey = await web3auth.provider.request({
      method: "solanaPrivateKey"
    });

    const buffer = Buffer.from(privateKey, "hex");

    const privateKey_base58 = bs58.encode(buffer);

    uiConsole(privateKey_base58);
  };

  const [consoleOutput, setConsoleOutput] = useState("");
  function uiConsole(...args) {
    const str = JSON.stringify(args?.length ? args : {}, null, 2);
    setConsoleOutput(str);
    console.log(...args);
  }

  const loggedInView = (
    <>
      <button
        type="button"
        onClick={getUserInfo}
        className="cta-button mint-nft-button"
      >
        Get User Info
      </button>
      <button
        type="button"
        onClick={getAccounts}
        className="cta-button mint-nft-button"
      >
        Get Accounts
      </button>
      <button
        type="button"
        onClick={getBalance}
        className="cta-button mint-nft-button"
      >
        Get Balance
      </button>
      <button
        type="button"
        onClick={signMessage}
        className="cta-button mint-nft-button"
      >
        Sign Message
      </button>
      <button
        type="button"
        onClick={getPrivateKey}
        className="cta-button mint-nft-button"
      >
        Get PrivateKey
      </button>
      <button
        type="button"
        onClick={logout}
        className="cta-button mint-nft-button"
      >
        Log Out
      </button>
    </>
  );

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>
          <a
            href="https://web3auth.io/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit" }}
          >
            Web3Auth Solana
          </a>
        </h1>
        <p>Social / email login for Solana</p>
      </section>
      <section className="feature-panel">
        <h3>Actions</h3>
        <div
          className="feature-actions"
          style={{ flexDirection: "column", alignItems: "flex-start" }}
        >
          {loggedIn ? loggedInView : unloggedInView}
        </div>
        {consoleOutput && (
          <div className="feature-field" style={{ marginTop: 16 }}>
            <label>Output</label>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: "var(--w3-bg-elevated)",
                border: "1px solid var(--w3-border)",
                borderRadius: "var(--w3-radius-sm)",
                fontSize: "0.8rem",
                overflow: "auto",
                maxHeight: 200,
                fontFamily: "var(--w3-font-mono)",
                whiteSpace: "pre-wrap"
              }}
            >
              {consoleOutput}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default Web3AuthSolanaPage;
