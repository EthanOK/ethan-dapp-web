import { useEffect, useState } from "react";
import { stringifyJson } from "@/lib/shared/Format";
import { BrowserProvider, formatEther } from "ethers";
import { initEthereumWeb3Auth } from "@/lib/web3auth/ethereumWeb3Auth";
import { useI18n } from "@/i18n";

const Web3AuthPage = () => {
  const { t } = useI18n();
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
        uiConsole({ error: t("web3auth.initFailed"), detail: error });
      }
    };
    init();
  }, [t]);

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
      uiConsole({ error: t("web3auth.connectFailed"), detail: error });
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
    uiConsole(t("common.loggedOut"));
  };

  const getUserInfo = async () => {
    const web3auth = await initEthereumWeb3Auth();
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole(t("common.providerNotReady"));
      return;
    }
    const signer = await getSigner();
    const address = await signer.getAddress();
    uiConsole(address);
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole(t("common.providerNotReady"));
      return;
    }
    const signer = await getSigner();
    const address = await signer.getAddress();
    const balance = formatEther(await signer.provider.getBalance(address));
    uiConsole(balance);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole(t("common.providerNotReady"));
      return;
    }
    const signer = await getSigner();
    const signedMessage = await signer.signMessage("YOUR_MESSAGE");
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole(t("common.providerNotReady"));
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
      uiConsole(t("common.web3authNotReady"));
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
            {t("web3auth.title")}
          </a>
        </h1>
        <p>{t("web3auth.subtitleEth")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("common.actions")}</h3>
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
                {t("web3auth.getUserInfo")}
              </button>
              <button
                type="button"
                onClick={getAccounts}
                className="cta-button mint-nft-button"
              >
                {t("web3auth.getAccounts")}
              </button>
              <button
                type="button"
                onClick={getBalance}
                className="cta-button mint-nft-button"
              >
                {t("web3auth.getBalance")}
              </button>
              <button
                type="button"
                onClick={signMessage}
                className="cta-button mint-nft-button"
              >
                {t("web3auth.signMessage")}
              </button>
              <button
                type="button"
                onClick={getPrivateKey}
                className="cta-button mint-nft-button"
              >
                {t("web3auth.getPrivateKey")}
              </button>
              <button
                type="button"
                onClick={signSnapShot}
                className="cta-button mint-nft-button"
              >
                {t("web3auth.signSnapshot")}
              </button>
              <button
                type="button"
                onClick={logout}
                className="cta-button mint-nft-button"
              >
                {t("common.logout")}
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
                  ? t("web3auth.initTitle")
                  : isConnecting
                    ? t("web3auth.openingLogin")
                    : t("common.login")
              }
            >
              {!isReady
                ? t("common.initializing")
                : isConnecting
                  ? t("common.connecting")
                  : t("common.login")}
            </button>
          )}
        </div>
        {consoleOutput && (
          <div className="feature-field" style={{ marginTop: 16 }}>
            <label>{t("common.output")}</label>
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
