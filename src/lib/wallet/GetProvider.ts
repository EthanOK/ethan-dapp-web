import {
  BrowserProvider,
  JsonRpcProvider,
  formatEther,
  type Provider,
  type Signer
} from "ethers";
import { SupportChains } from "@/config/ChainsConfig";
import { withCustomGasPrice } from "@/lib/evm/GasStrategy";
import { store } from "@/lib/wallet/Suscribers";

/** Wrap a signer so every sent transaction uses the dApp-selected gas speed. */
const wrapSignerWithGas = (signer: Signer): Signer => {
  const chainId = parseEvmChainIdFromStored(localStorage.getItem("chainId"));
  return withCustomGasPrice(signer, chainId ?? undefined);
};

export const parseEvmChainIdFromStored = (
  stored: string | null
): number | null => {
  if (!stored) return null;
  const s = String(stored).trim();
  if (s === "") return null;

  if (s.startsWith("eip155:")) {
    const id = s.split(":")[1];
    const n = Number(id);
    return Number.isFinite(n) ? n : null;
  }

  if (s.startsWith("solana:") || s.startsWith("bip122:")) return null;

  const n = Number(s);
  if (Number.isFinite(n) && /^\d+$/.test(s)) return n;

  return null;
};

export const getDefaultReadonlyProvider = (): JsonRpcProvider | null => {
  const stored = localStorage.getItem("chainId");
  const evmChainId = parseEvmChainIdFromStored(stored);
  if (!evmChainId) return null;
  return getReadonlyProviderForChain(evmChainId);
};

/** Public RPC provider for a specific EVM chain (read-only balance / metadata). */
const readonlyProviders = new Map<number, JsonRpcProvider>();

export const getReadonlyProviderForChain = (
  chainId: number
): JsonRpcProvider | null => {
  const cached = readonlyProviders.get(chainId);
  if (cached) return cached;

  const chain = SupportChains.find((c) => Number(c.id) === chainId);
  const rpc = chain?.rpcUrls?.[0];
  if (!rpc) return null;

  const provider = new JsonRpcProvider(rpc, chainId, { staticNetwork: true });
  readonlyProviders.set(chainId, provider);
  return provider;
};

const getProvider = async (): Promise<BrowserProvider | null> => {
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
  return null;
};

type Eip1193Request = (args: {
  method: string;
  params?: unknown[];
}) => Promise<unknown>;

type Eip1193Provider = { request: Eip1193Request };

/** Raw EIP-1193 provider (has `.request`) from the AppKit store. */
const getEip1193Provider = async (): Promise<Eip1193Provider | null> => {
  const reownProvider = store.eip155Provider as Eip1193Provider | undefined;
  if (reownProvider?.request) return reownProvider;
  return null;
};

const getSigner = async (): Promise<Signer | null> => {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    return wrapSignerWithGas(await provider.getSigner());
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
    const signer = wrapSignerWithGas(await provider.getSigner());
    const network = await provider.getNetwork();
    return [signer, Number(network.chainId)];
  } catch {
    return [null, null];
  }
};

export const getChainIdAndBalanceETHAndTransactionCount = async (
  account: string
): Promise<{ chainId: number; balance: string; nonce: number } | null> => {
  try {
    const provider = await getProvider();
    if (!provider) return null;
    const network = await provider.getNetwork();
    const balance = await provider.getBalance(account);
    const balanceETH = formatEther(balance);
    const nonce = await provider.getTransactionCount(account);
    return { chainId: Number(network.chainId), balance: balanceETH, nonce };
  } catch {
    return null;
  }
};

export type { Provider, Signer };

export { getProvider, getEip1193Provider, getSigner, getSignerAndChainId };
