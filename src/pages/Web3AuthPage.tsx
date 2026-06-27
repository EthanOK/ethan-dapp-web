import { useEffect, useState } from "react";
import { stringifyJson } from "@/lib/shared/Format";
import { BrowserProvider, formatEther } from "ethers";
import { initEthereumWeb3Auth } from "@/lib/web3auth/ethereumWeb3Auth";

const Web3AuthPage = () => {
  const [provider, setProvider] = useState<unknown>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const uiConsole = (...args: unknown[]) => {
    const str = stringifyJson(args?.length ? args : {}, 2);
    setConsoleOutput(str);
    console.log(...args);
  };

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = await initEthereumWeb3Auth();
        setProvider(web3auth.provider);
        if (web3auth.connected) setLoggedIn(true);
        setIsReady(true);
      } catch (error) {
        console.error(error);
        uiConsole({ error: "Web3Auth initModal failed", detail: error });
      }
    };
    init();
  }, []);

  const loginHandler = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const web3auth = await initEthereumWeb3Auth();
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      if (web3auth.connected) setLoggedIn(true);
    } catch (error) {
      console.error(error);
      uiConsole({ error: "Web3Auth connect failed", detail: error });
    } finally {
      setIsConnecting(false);
    }
  };

  const getSigner = async () => {
    const ethersProvider = new BrowserProvider(provider as never);
    return ethersProvider.getSigner();
  };

  const logout = async () => {
    const web3auth = await initEthereumWeb3Auth();
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  const getUserInfo = async () => {
    const web3auth = await initEthereumWeb3Auth();
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signer = await getSigner();
    const address = await signer.getAddress();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signer = await getSigner();
    const address = await signer.getAddress();
    const balance = formatEther(await signer.provider.getBalance(address));
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const signer = await getSigner();
    const signedMessage = await signer.signMessage("YOUR_MESSAGE");
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const pkProvider = provider as {
      request: (args: { method: string }) => Promise<unknown>;
    };
    const privateKey = await pkProvider.request({ method: "eth_private_key" });
    uiConsole(privateKey);
  };

  const signSnapShot = async () => {
    if (!provider) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const [{ Wallet }, { Web3Provider }, { signSetAlias }] = await Promise.all([
      import("@ethersproject/wallet"),
      import("@ethersproject/providers"),
      import("@/lib/signing/SignsnapsShot")
    ]);
    const web3Provider = new Web3Provider(
      provider as import("@ethersproject/providers").ExternalProvider
    );
    const account = await web3Provider.getSigner().getAddress();
    const randomAddress = Wallet.createRandom().address;
    const result = await signSetAlias(web3Provider, account, randomAddress);
    uiConsole(result);
  };

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
            Web3Auth
          </a>
        </h1>
        <p>Social / email login for Ethereum</p>
      </section>
      <section className="feature-panel">
        <h3>Actions</h3>
        <div
          className="feature-actions"
          style={{ flexDirection: "column", alignItems: "flex-start" }}
        >
          {loggedIn ? (
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
                onClick={signSnapShot}
                className="cta-button mint-nft-button"
              >
                Sign SnapShot
              </button>
              <button
                type="button"
                onClick={logout}
                className="cta-button mint-nft-button"
              >
                Log Out
              </button>
            </>
          ) : (
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
              {!isReady
                ? "Initializing..."
                : isConnecting
                  ? "Connecting..."
                  : "Login"}
            </button>
          )}
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

export default Web3AuthPage;
