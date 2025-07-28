import { ethers } from "ethers";
import Web3 from "web3";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import {
  main_rpc,
  goerli_rpc,
  projectId_walletconnect
} from "../common/SystemConfiguration";
import { SupportChains } from "../common/ChainsConfig";
import { BrowserProvider } from "ethers-v6";
import { store } from "./Suscribers";

export const switchChain = async (chainId) => {
  const chain = SupportChains.find((c) => c.id === chainId);
  if (!chain) {
    alert("Unsupported chain");
    return false;
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.chainId }]
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      // 未添加，尝试添加
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chain.chainId,
              chainName: chain.chainName,
              rpcUrls: chain.rpcUrls,
              nativeCurrency: chain.nativeCurrency,
              blockExplorerUrls: chain.blockExplorerUrls
            }
          ]
        });
        return true;
      } catch (error) {
        if (error.code === 4001 || error.code === -32002) {
          alert(error.message);
          return false;
        }
        return true;
      }
    } else if (error.code === 4001 || error.code === -32002) {
      alert(error.message);
    }
    return false;
  }
};

const getProvider = async () => {
  let type = localStorage.getItem("LoginType");
  if (type === "metamask") {
    let provider;
    // await provider.send("eth_requestAccounts", []);
    // window.ethereum.enable();
    try {
      let chainId = await window.ethereum.request({ method: "eth_chainId" });

      let chainId_local = localStorage.getItem("chainId");
      // if (chainId !== chainId_local) {
      //   let success = await switchChain(chainId_local);
      //   if (!success) {
      //     return null;
      //   }
      // }
      provider = new ethers.providers.Web3Provider(window.ethereum);
      let accounts = await provider.send("eth_requestAccounts", []);
      // console.log(accounts);
      return provider;
    } catch (error) {
      console.log("switch failure");
      return null;
    }
  }

  if (type === "reown") {
    try {
      const reownProvider = store.eip155Provider;
      const provider = new ethers.providers.Web3Provider(reownProvider);
      // let accounts = await provider.send("eth_requestAccounts", []);
      // console.log(accounts);
      return provider;
    } catch (error) {
      console.log(error);
    }
  }

  try {
    if (type === "walletconnect") {
      let chainId = localStorage.getItem("chainId");
      const optionalChains = SupportChains.map((c) => parseInt(c.id));

      let provider = await EthereumProvider.init({
        projectId: projectId_walletconnect,
        chains: [Number.parseInt(chainId)],
        optionalChains: optionalChains,
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTypedData",
          "eth_signTypedData_v4"
        ],
        optionalMethods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTypedData",
          "eth_signTypedData_v4"
        ],
        showQrModal: "true"
      });
      // await provider.connector.killSession();
      //  Enable session (triggers QR Code modal)
      await provider.enable();

      provider.on("chainChanged", async (chainId) => {
        console.log("chainChanged");
        console.log(chainId);
      });
      provider.on("disconnect", async () => {
        localStorage.clear();
        window.location.reload();
        console.log("walletconnect 断开连接");
      });
      const web3Provider = new ethers.providers.Web3Provider(provider);

      return web3Provider;
    }
  } catch (error) {
    console.log("walletconnect failure");
    return null;
  }
};

export const getProviderV6 = async () => {
  let type = localStorage.getItem("LoginType");
  if (type === "metamask") {
    let provider;
    // await provider.send("eth_requestAccounts", []);
    // window.ethereum.enable();
    try {
      let chainId = await window.ethereum.request({ method: "eth_chainId" });

      let chainId_local = localStorage.getItem("chainId");
      // if (chainId !== chainId_local) {
      //   let success = await switchChain(chainId_local);
      //   if (!success) {
      //     return null;
      //   }
      // }
      provider = new BrowserProvider(window.ethereum);
      let accounts = await provider.send("eth_requestAccounts", []);
      // console.log(accounts);
      return provider;
    } catch (error) {
      console.log("switch failure");
      return null;
    }
  }

  if (type === "reown") {
    try {
      const reownProvider = store.eip155Provider;
      const provider = new BrowserProvider(reownProvider);
      // let accounts = await provider.send("eth_requestAccounts", []);
      // console.log(accounts);
      return provider;
    } catch (error) {
      console.log(error);
    }
  }

  try {
    if (type === "walletconnect") {
      let chainId = localStorage.getItem("chainId");
      const optionalChains = SupportChains.map((c) => parseInt(c.id));

      let provider = await EthereumProvider.init({
        projectId: projectId_walletconnect,
        chains: [Number.parseInt(chainId)],
        optionalChains: optionalChains,
        methods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTypedData",
          "eth_signTypedData_v4"
        ],
        optionalMethods: [
          "eth_sendTransaction",
          "personal_sign",
          "eth_signTypedData",
          "eth_signTypedData_v4"
        ],
        showQrModal: "true"
      });
      // await provider.connector.killSession();
      //  Enable session (triggers QR Code modal)
      await provider.enable();

      provider.on("chainChanged", async (chainId) => {
        console.log("chainChanged");
        console.log(chainId);
      });
      provider.on("disconnect", async () => {
        localStorage.clear();
        window.location.reload();
        console.log("walletconnect 断开连接");
      });
      const web3Provider = new ethers.providers.Web3Provider(provider);

      return web3Provider;
    }
  } catch (error) {
    console.log("walletconnect failure");
    return null;
  }
};

const getProviderWeb3 = async () => {
  let chainId = localStorage.getItem("chainId");
  chainId = parseInt(chainId);
  let rpc;
  if (chainId === 1) {
    rpc = main_rpc;
  } else if (chainId === 5) {
    rpc = goerli_rpc;
  }

  const providerWeb3 = new Web3(rpc).currentProvider;
  return providerWeb3;
};

const getChainId = async () => {
  const provider = await getProvider();
  const network = await provider.getNetwork();
  const chainId = network.chainId;
  return chainId;
};

const getSigner = async () => {
  try {
    const provider = await getProvider();
    const signer = provider.getSigner();
    return signer;
  } catch (error) {
    return null;
  }
};

export const getSignerV6 = async () => {
  try {
    const provider = await getProviderV6();
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    return null;
  }
};

const getAccount = async () => {
  try {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    return account;
  } catch (error) {
    return null;
  }
};
const getSignerAndChainId = async () => {
  try {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    return [signer, chainId];
  } catch (error) {
    return [null, null];
  }
};
const getSignerAndAccountAndChainId = async () => {
  try {
    const provider = await getProvider();
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    return [signer, account, chainId];
  } catch (error) {
    console.log(error);
    return [null, null, null];
  }
};

const getBalance = async (account) => {
  const provider = await getProvider();
  const balance = await provider.getBalance(account);
  return balance;
};

const getBalanceETH = async (account) => {
  const balance = await getBalance(account);
  const balanceETH = ethers.utils.formatEther(balance);
  return balanceETH;
};

const getTransactionCount = async (account) => {
  const provider = await getProvider();
  const count = await provider.getTransactionCount(account);
  return count;
};

const getChainIdAndBalanceETHAndTransactionCount = async (account) => {
  try {
    const provider = await getProvider();
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const balance = await provider.getBalance(account);
    const balanceETH = ethers.utils.formatEther(balance);
    const nonce = await provider.getTransactionCount(account);
    return {
      chainId,
      balance: balanceETH,
      nonce
    };
  } catch (error) {
    return null;
  }
};

export {
  getProvider,
  getSigner,
  getChainId,
  getProviderWeb3,
  getBalance,
  getBalanceETH,
  getTransactionCount,
  getSignerAndChainId,
  getChainIdAndBalanceETHAndTransactionCount,
  getSignerAndAccountAndChainId,
  getAccount
};
