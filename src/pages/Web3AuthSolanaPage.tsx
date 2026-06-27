/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — TODO: add types incrementally
import { useEffect, useState } from "react";
import { stringifyJson } from "@/lib/shared/Format";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import {
  createSolanaWallet,
  initSolanaWeb3Auth
} from "@/lib/web3auth/solanaWeb3Auth";

const Web3AuthSolanaPage = () => {
  const [provider, setProvider] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [solanaWallet, setSolanaWallet] = useState(null);
  const [connection, setConnection] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const [consoleOutput, setConsoleOutput] = useState("");
  function uiConsole(...args) {
    const str = stringifyJson(args?.length ? args : {}, 2);
    setConsoleOutput(str);
    console.log(...args);
  }

  const getConnnection = async (wallet) => {
    const connectionConfig = await wallet.request({
      method: "solana_provider_config",
      params: []
    });
    return new Connection(connectionConfig.rpcTarget);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = await initSolanaWeb3Auth();
        setIsReady(true);

        const p = web3auth.provider;
        setProvider(p);

        if (web3auth.connected && p) {
          setLoggedIn(true);
          const sw = await createSolanaWallet(p);
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
        setIsReady(true);
      }
    };

    init();
  }, []);

  const loginHandler = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const web3auth = await initSolanaWeb3Auth();
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      const sw = await createSolanaWallet(web3authProvider);
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

  const getUserInfo = async () => {
    const web3auth = await initSolanaWeb3Auth();
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    const web3auth = await initSolanaWeb3Auth();
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    setSolanaWallet(null);
    setConnection(null);
    uiConsole("logged out");
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const accounts = await solanaWallet.requestAccounts();
    uiConsole(accounts);
    return accounts;
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const accounts = await getAccounts();
    const balance = await connection.getBalance(new PublicKey(accounts[0]));
    const balance_sol = balance / LAMPORTS_PER_SOL;

    uiConsole(balance_sol + " SOL");
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const originalMessage = "This is Web3Auth";
    const signedMessage = await solanaWallet.signMessage(
      Buffer.from(originalMessage, "utf8")
    );
    uiConsole(bs58.encode(signedMessage));
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const web3auth = await initSolanaWeb3Auth();
    const privateKey = await web3auth.provider.request({
      method: "solanaPrivateKey"
    });

    const buffer = Buffer.from(privateKey, "hex");
    const privateKey_base58 = bs58.encode(buffer);

    uiConsole(privateKey_base58);
  };

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
