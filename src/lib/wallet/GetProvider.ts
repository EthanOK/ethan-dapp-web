import {
  BrowserProvider,
  JsonRpcProvider,
  JsonRpcSigner,
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

/**
 * Resolve the connected EVM address by polling eth_accounts until it returns
 * a non-empty list. Avoids ethers' no-arg getSigner() -> eth_requestAccounts,
 * which the embedded wallet does not answer during/after an account-type
 * switch (e.g. choosing smartAccount), so the sign popup never appears.
 */
const getSignerAddress = async (timeoutMs = 12000): Promise<string | null> => {
  const provider = await getProvider();
  if (!provider) return null;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const accounts = (await provider.send("eth_accounts", [])) as
        | string[]
        | undefined;
      if (Array.isArray(accounts) && accounts.length > 0 && accounts[0]) {
        return accounts[0];
      }
    } catch {
      // frame not ready yet — keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  console.error(
    "[GetProvider] eth_accounts empty after",
    timeoutMs,
    "ms —",
    store.eip155Provider
  );
  return null;
};

/**
 * Build a signer bound to the embedded-wallet account WITHOUT going through
 * ethers' BrowserProvider.getSigner(address): that path runs hasSigner() ->
 * eth_accounts and falls back to eth_requestAccounts when the address is not
 * listed yet — the embedded wallet rejects eth_requestAccounts
 * ("Requested RPC call is not allowed"), so the sign popup never appears.
 * Constructing JsonRpcSigner directly only ever sends personal_sign.
 */
const buildSigner = async (): Promise<Signer | null> => {
  const provider = await getProvider();
  if (!provider) return null;
  const frameUser = store.eip155Provider as
    | { user?: { address?: string } }
    | undefined;
  // Sign with the account the user actually selected (user.address mirrors the
  // AppKit account type — EOA or smartAccount). For smartAccount the embedded
  // wallet returns an ERC-6492 wrapped signature; the backend deploys the
  // account and verifies via ERC-1271. Do NOT switch to the EOA here, or the
  // SIWE identity would silently become the EOA instead of the smart account.
  const address = frameUser?.user?.address ?? (await getSignerAddress());
  if (!address) return null;
  return wrapSignerWithGas(new JsonRpcSigner(provider, address));
};

const getSigner = async (): Promise<Signer | null> => {
  try {
    return await buildSigner();
  } catch (error) {
    console.error("[GetProvider] getSigner failed:", error);
    return null;
  }
};

/**
 * The Reown embedded wallet (Google/social login) sets `isConnected` before its
 * W3mFrame `user` is fully initialized (GET_USER may lag by seconds). Wait for
 * the frame's `user` only when the provider is the embedded wallet (it exposes
 * a `user` field). External wallets (MetaMask etc.) have no `user` concept and
 * are considered ready immediately.
 */
const waitForProviderReady = async (timeoutMs = 12000): Promise<boolean> => {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const p = store.eip155Provider as
      | ({ isInitialized?: boolean; user?: { address?: string } } & Record<
          string,
          unknown
        >)
      | null
      | undefined;
    if (!p) {
      // provider not registered yet — keep polling
    } else if ("user" in p) {
      // embedded wallet: wait until the frame's user (account) is loaded
      if (p.isInitialized && p.user?.address) return true;
    } else {
      // external wallet — no frame user to wait for
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  console.error(
    "[GetProvider] eip155 provider not ready after",
    timeoutMs,
    "ms —",
    store.eip155Provider
  );
  return false;
};

const getSignerAndChainId = async (): Promise<
  [Signer | null, number | null]
> => {
  try {
    const provider = await getProvider();
    if (!provider) return [null, null];
    if (!(await waitForProviderReady())) return [null, null];
    const signer = await buildSigner();
    if (!signer) return [null, null];
    const network = await provider.getNetwork();
    return [signer, Number(network.chainId)];
  } catch (error) {
    // Real error is needed to debug — do not swallow it silently.
    console.error("[GetProvider] getSignerAndChainId failed:", error);
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
