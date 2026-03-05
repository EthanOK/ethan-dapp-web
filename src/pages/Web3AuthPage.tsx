import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { ethers } from "ethers";
import { signSetAlias } from "../utils/SignsnapsShot";
import { Wallet } from "@ethersproject/wallet";
import { Web3Provider } from "@ethersproject/providers";

const clientId =
  "BGaYve_5NaFEkrmlHuvoCcTA9Lj0DJV2JoOOyJyGA2Ch3q6KjPV7olKu1CU03zOmTJ0eLrr0ErEvZbGRlXs6Ju4";

const chainConfig = {
  chainNamespace: "eip155" as const,
  chainId: "0xaa36a7",
  rpcTarget: "https://0xrpc.io/sep",
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png"
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig }
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
  privateKeyProvider
});

const Web3AuthPage = () => {
  const [provider, setProvider] = useState<unknown>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        setProvider(web3auth.provider);
        if (web3auth.connected) setLoggedIn(true);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, []);

  const loginHandler = async () => {
    const web3authProvider = await web3auth.connect();
    setProvider(web3authProvider);
    if (web3auth.connected) setLoggedIn(true);
  };

  const uiConsole = (...args: unknown[]) => {
    const el = document.querySelector("#console>p");
    if (el) {
      (el as HTMLElement).innerHTML = JSON.stringify(
        args?.length ? args : {},
        null,
        2
      );
    }
    console.log(...args);
  };

  const getSigner = async () => {
    const ethersProvider = new ethers.providers.Web3Provider(
      provider as ethers.providers.ExternalProvider
    );
    return ethersProvider.getSigner();
  };

  const logout = async () => {
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    uiConsole("logged out");
  };

  const getUserInfo = async () => {
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
    const balance = ethers.utils.formatEther(
      await signer.provider.getBalance(address)
    );
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
    const web3Provider = new Web3Provider(
      provider as import("@ethersproject/providers").ExternalProvider
    );
    const account = await web3Provider.getSigner().getAddress();
    const randomAddress = Wallet.createRandom().address;
    const result = await signSetAlias(web3Provider, account, randomAddress);
    uiConsole(result);
  };

  return (
    <center>
      <div>
        <h2>
          <a href="https://web3auth.io/" target="_blank" rel="noreferrer">
            Web3Auth
          </a>
        </h2>
        <div className="bordered-div">
          <div className="container">
            <p />
            <div className="grid">
              {loggedIn ? (
                <>
                  <div className="flex-container">
                    <div>
                      <button onClick={getUserInfo} className="card">
                        Get User Info
                      </button>
                    </div>
                    <div>
                      <button onClick={getAccounts} className="card">
                        Get Accounts
                      </button>
                    </div>
                    <div>
                      <button onClick={getBalance} className="card">
                        Get Balance
                      </button>
                    </div>
                    <div>
                      <button onClick={signMessage} className="card">
                        Sign Message
                      </button>
                    </div>
                    <div>
                      <button onClick={getPrivateKey} className="card">
                        Get PrivateKey
                      </button>
                    </div>
                    <div>
                      <button onClick={signSnapShot} className="card">
                        Sign SnapShot
                      </button>
                    </div>
                    <div>
                      <button onClick={logout} className="card">
                        Log Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button onClick={loginHandler} className="card">
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
        <div>
          <div id="console" style={{ whiteSpace: "pre-line" }}>
            <p style={{ whiteSpace: "pre-line" }} />
          </div>
        </div>
      </div>
    </center>
  );
};

export default Web3AuthPage;
