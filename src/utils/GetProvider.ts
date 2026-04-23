import { ethers } from "ethers";
import type { Signer } from "ethers";
import type { providers } from "ethers";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { projectId_walletconnect } from "../common/SystemConfiguration";
import { SupportChains } from "../common/ChainsConfig";
import { BrowserProvider } from "ethers-v6";
import { store } from "./Suscribers";

type Ethers5Provider = providers.Web3Provider;

const parseEvmChainIdFromStored = (stored: string | null): number | null => {
  if (!stored) return null;
  const s = String(stored).trim();
  if (s === "") return null;

  // CAIP-2: eip155:1
  if (s.startsWith("eip155:")) {
    const id = s.split(":")[1];
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }

  // non-EVM namespaces
  if (s.startsWith("solana:") || s.startsWith("bip122:")) return null;

  // plain numeric chain id
  const n = Number(s);
  if (Number.isFinite(n) && /^\d+$/.test(s)) return n;

  return null;
};

export const getDefaultReadonlyProvider =
  (): providers.StaticJsonRpcProvider | null => {
    const stored = localStorage.getItem("chainId");
    const evmChainId = parseEvmChainIdFromStored(stored);
    if (!evmChainId) return null;
    const chain = SupportChains.find((c) => Number(c.id) === evmChainId);
    const rpc = chain?.rpcUrls?.[0];
    if (!rpc) return null;
    return new ethers.providers.StaticJsonRpcProvider(rpc, evmChainId);
  };

export const switchChain = async (chainId: string): Promise<boolean> => {
  const chain = SupportChains.find((c) => c.id === chainId);
  if (!chain || !window.ethereum) {
    alert("Unsupported chain");
    return false;
  }
  type EthRequest = (args: {
    method: string;
    params?: unknown[];
  }) => Promise<unknown>;
  const eth = window.ethereum as { request: EthRequest } | undefined;
  try {
    await eth!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chain.chainId }]
    });
    return true;
  } catch (err: unknown) {
    const error = err as { code?: number; message?: string };
    if (error.code === 4902) {
      try {
        await eth!.request({
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
      } catch (e: unknown) {
        const addErr = e as { code?: number; message?: string };
        if (addErr.code === 4001 || addErr.code === -32002) {
          alert(addErr.message);
          return false;
        }
        return true;
      }
    }
    if (error.code === 4001 || error.code === -32002) {
      alert(error.message);
    }
    return false;
  }
};

const getProvider = async (): Promise<Ethers5Provider | null> => {
  const type = localStorage.getItem("LoginType");
  if (type === "metamask" && window.ethereum) {
    try {
      const eth = window.ethereum as {
        request: (a: {
          method: string;
          params?: unknown[];
        }) => Promise<unknown>;
      };
      await eth.request({ method: "eth_chainId" });
      const provider = new ethers.providers.Web3Provider(
        eth as ethers.providers.ExternalProvider
      );
      await provider.send("eth_requestAccounts", []);
      return provider;
    } catch {
      return null;
    }
  }
  if (type === "reown") {
    try {
      const reownProvider = store.eip155Provider as unknown;
      if (reownProvider) {
        return new ethers.providers.Web3Provider(
          reownProvider as ethers.providers.ExternalProvider
        );
      }
    } catch {
      // ignore
    }
  }
  if (type === "walletconnect") {
    try {
      const chainId = localStorage.getItem("chainId") ?? "";
      const optionalChains = SupportChains.map((c) => parseInt(c.id, 10));
      const provider = await EthereumProvider.init({
        projectId: projectId_walletconnect ?? "",
        chains: [Number.parseInt(chainId, 10)],
        optionalChains,
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
        showQrModal: true
      });
      await provider.enable();
      provider.on("disconnect", () => {
        localStorage.clear();
        window.location.reload();
      });
      return new ethers.providers.Web3Provider(
        provider as ethers.providers.ExternalProvider
      );
    } catch {
      return null;
    }
  }
  return null;
};

export const getProviderV6 = async (): Promise<
  BrowserProvider | Ethers5Provider | null
> => {
  const type = localStorage.getItem("LoginType");
  if (type === "metamask" && window.ethereum) {
    try {
      const eth = window.ethereum as {
        request: (a: {
          method: string;
          params?: unknown[];
        }) => Promise<unknown>;
      };
      await eth.request({ method: "eth_chainId" });
      const provider = new BrowserProvider(eth as never);
      await provider.send("eth_requestAccounts", []);
      return provider;
    } catch {
      return null;
    }
  }
  if (type === "reown") {
    try {
      const reownProvider = store.eip155Provider;
      if (
        reownProvider &&
        typeof (reownProvider as { request?: unknown }).request === "function"
      ) {
        return new BrowserProvider(reownProvider as never);
      }
    } catch {
      // ignore
    }
  }
  if (type === "walletconnect") {
    try {
      const chainId = localStorage.getItem("chainId") ?? "";
      const optionalChains = SupportChains.map((c) => parseInt(c.id, 10));
      const provider = await EthereumProvider.init({
        projectId: projectId_walletconnect ?? "",
        chains: [Number.parseInt(chainId, 10)],
        optionalChains,
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
        showQrModal: true
      });
      await provider.enable();
      provider.on("disconnect", () => {
        localStorage.clear();
        window.location.reload();
      });
      return new ethers.providers.Web3Provider(provider);
    } catch {
      return null;
    }
  }
  return null;
};

const getProviderWeb3 = async (): Promise<unknown> => {
  const chainIdStr = localStorage.getItem("chainId");
  const chainId = parseInt(chainIdStr ?? "0", 10);
  const { main_rpc, goerli_rpc } =
    await import("../common/SystemConfiguration");
  let rpc: string | undefined;
  if (chainId === 1) rpc = main_rpc;
  else if (chainId === 5) rpc = goerli_rpc;
  if (!rpc) return undefined;
  const Web3 = (await import("web3")).default;
  return new Web3(rpc).currentProvider;
};

const getChainId = async (): Promise<number | null> => {
  const provider = await getProvider();
  if (!provider) return null;
  const network = await provider.getNetwork();
  return network.chainId;
};

const getSigner = async (): Promise<Signer | null> => {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    return provider.getSigner();
  } catch {
    return null;
  }
};

export const getSignerV6 = async () => {
  try {
    const provider = await getProviderV6();
    if (!provider) return null;
    return provider.getSigner();
  } catch {
    return null;
  }
};

const getAccount = async (): Promise<string | null> => {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    const signer = provider.getSigner();
    return signer.getAddress();
  } catch {
    return null;
  }
};

const getSignerAndChainId = async (): Promise<
  [Signer | null, number | null]
> => {
  try {
    const provider = await getProvider();
    if (!provider) return [null, null];
    const signer = provider.getSigner();
    const network = await provider.getNetwork();
    return [signer, network.chainId];
  } catch {
    return [null, null];
  }
};

const getSignerAndAccountAndChainId = async (): Promise<
  [Signer | null, string | null, number | null]
> => {
  try {
    const provider = await getProvider();
    if (!provider) return [null, null, null];
    const signer = provider.getSigner();
    const account = await signer.getAddress();
    const network = await provider.getNetwork();
    return [signer, account, network.chainId];
  } catch {
    return [null, null, null];
  }
};

const getBalance = async (
  account: string
): Promise<ethers.BigNumber | null> => {
  const provider = await getProvider();
  if (!provider) return null;
  return provider.getBalance(account);
};

const getBalanceETH = async (account: string): Promise<string | null> => {
  const balance = await getBalance(account);
  if (!balance) return null;
  return ethers.utils.formatEther(balance);
};

const getTransactionCount = async (account: string): Promise<number | null> => {
  const provider = await getProvider();
  if (!provider) return null;
  return provider.getTransactionCount(account);
};

export const getChainIdAndBalanceETHAndTransactionCount = async (
  account: string
): Promise<{ chainId: number; balance: string; nonce: number } | null> => {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(account);
    const balanceETH = ethers.utils.formatEther(balance);
    const nonce = await provider.getTransactionCount(account);
    return { chainId: network.chainId, balance: balanceETH, nonce };
  } catch {
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
  getSignerAndAccountAndChainId,
  getAccount
};
