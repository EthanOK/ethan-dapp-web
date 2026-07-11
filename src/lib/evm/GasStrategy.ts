import {
  formatUnits,
  type FeeData,
  type Provider,
  type Signer,
  type TransactionRequest
} from "ethers";
import { getReadonlyProviderForChain } from "@/lib/wallet/GetProvider";

export type NetworkGasKind = "eip1559" | "legacy";

export type NetworkGasSnapshot = {
  chainId: number;
  kind: NetworkGasKind;
  /** EIP-1559: max base + priority (tx estimate); legacy: gas price */
  effectiveGasGwei: string | null;
  baseFeeGwei: string | null;
  priorityFeeGwei: string | null;
  /** EIP-1559: max base fee cap sent with txs (base × 1.05) */
  maxBaseFeeGwei: string | null;
  maxFeeGwei: string | null;
  gasPriceGwei: string | null;
  updatedAt: number;
};

type GasMarketData = {
  feeData: FeeData;
  baseFee: bigint | null;
  maxFee: bigint | null;
  gasPrice: bigint | null;
  rpcPriority: bigint | null;
  marketPriority: bigint;
  isEip1559: boolean;
};

/** Raw gas fees from the last header poll (shared with tx overrides). */
type GasPriceCacheEntry = {
  chainId: number;
  kind: NetworkGasKind;
  baseFee: bigint | null;
  marketPriority: bigint;
  maxFee: bigint | null;
  gasPrice: bigint | null;
  updatedAt: number;
};

const GAS_CACHE_MAX_AGE_MS = 60_000;
const gasPriceCache = new Map<number, GasPriceCacheEntry>();

function setGasPriceCache(entry: GasPriceCacheEntry): void {
  gasPriceCache.set(entry.chainId, entry);
}

function getGasPriceCache(chainId: number): GasPriceCacheEntry | null {
  const entry = gasPriceCache.get(chainId);
  if (!entry) return null;
  if (Date.now() - entry.updatedAt > GAS_CACHE_MAX_AGE_MS) return null;
  return entry;
}

function marketToGasPriceCache(
  chainId: number,
  market: GasMarketData
): GasPriceCacheEntry {
  return {
    chainId,
    kind: market.isEip1559 ? "eip1559" : "legacy",
    baseFee: market.baseFee,
    marketPriority: market.marketPriority,
    maxFee: market.maxFee,
    gasPrice: market.gasPrice,
    updatedAt: Date.now()
  };
}

function gasCacheToOverrides(
  entry: GasPriceCacheEntry
): Partial<TransactionRequest> {
  if (entry.kind === "eip1559" && entry.maxFee != null) {
    const baseFee = entry.baseFee ?? 0n;
    const priority = entry.marketPriority;
    const maxFeePerGas =
      baseFee > 0n ? (baseFee * 105n) / 100n + priority : entry.maxFee;
    return { maxPriorityFeePerGas: priority, maxFeePerGas };
  }

  if (entry.gasPrice != null && entry.gasPrice > 0n) {
    return { gasPrice: entry.gasPrice };
  }

  return {};
}

export function parseEvmChainId(
  raw: string | number | undefined | null
): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;

  if (s.startsWith("eip155:")) {
    const n = Number(s.split(":")[1]);
    return Number.isFinite(n) ? n : null;
  }
  if (s.startsWith("solana:") || s.startsWith("bip122:")) return null;

  const n = Number(s);
  return Number.isFinite(n) && /^\d+$/.test(s) ? n : null;
}

export function formatGwei(value: bigint): string {
  const gwei = formatUnits(value, 9);
  const num = Number(gwei);
  if (!Number.isFinite(num)) return gwei;
  if (num === 0) return "0";
  if (num < 0.0001) return num.toFixed(6);
  if (num < 0.01) return num.toFixed(4);
  if (num < 1) return num.toFixed(4);
  if (num < 10) return num.toFixed(2);
  return num.toFixed(1);
}

function toBigInt(value: bigint | null | undefined): bigint | null {
  if (value == null) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

/** Latest block + fee data (2 RPC calls). */
async function fetchGasMarketData(provider: Provider): Promise<GasMarketData> {
  const [feeData, block] = await Promise.all([
    provider.getFeeData(),
    provider.getBlock("latest")
  ]);

  const baseFee = toBigInt(block?.baseFeePerGas ?? null);
  const maxFee = toBigInt(feeData.maxFeePerGas ?? null);
  const gasPrice = toBigInt(feeData.gasPrice ?? null);
  const rpcPriority = toBigInt(feeData.maxPriorityFeePerGas ?? null);

  const derived =
    baseFee != null && gasPrice != null && gasPrice >= baseFee
      ? gasPrice - baseFee
      : null;

  // Prefer gasPrice − baseFee; wallet RPC often returns inflated maxPriorityFeePerGas (e.g. 1 Gwei).
  const marketPriority =
    derived != null
      ? derived
      : rpcPriority != null && rpcPriority >= 0n
        ? rpcPriority
        : 0n;

  const isEip1559 = maxFee != null && (rpcPriority != null || derived != null);

  return {
    feeData,
    baseFee,
    maxFee,
    gasPrice,
    rpcPriority,
    marketPriority,
    isEip1559
  };
}

/** Read current network gas for header display (2 RPC calls per refresh). */
export async function fetchNetworkGasSnapshot(
  provider: Provider,
  chainId: number
): Promise<NetworkGasSnapshot> {
  const market = await fetchGasMarketData(provider);
  setGasPriceCache(marketToGasPriceCache(chainId, market));

  if (market.isEip1559 && market.maxFee != null) {
    const maxBaseFee =
      market.baseFee != null && market.baseFee > 0n
        ? (market.baseFee * 105n) / 100n
        : null;
    const maxFeePerGas =
      maxBaseFee != null ? maxBaseFee + market.marketPriority : market.maxFee;

    return {
      chainId,
      kind: "eip1559",
      effectiveGasGwei: maxFeePerGas != null ? formatGwei(maxFeePerGas) : null,
      baseFeeGwei: market.baseFee != null ? formatGwei(market.baseFee) : null,
      priorityFeeGwei: formatGwei(market.marketPriority),
      maxBaseFeeGwei: maxBaseFee != null ? formatGwei(maxBaseFee) : null,
      maxFeeGwei: formatGwei(maxFeePerGas),
      gasPriceGwei: null,
      updatedAt: Date.now()
    };
  }

  const effectiveLegacy =
    market.gasPrice != null && market.gasPrice > 0n ? market.gasPrice : null;

  return {
    chainId,
    kind: "legacy",
    effectiveGasGwei:
      effectiveLegacy != null ? formatGwei(effectiveLegacy) : null,
    baseFeeGwei: null,
    priorityFeeGwei: null,
    maxBaseFeeGwei: null,
    maxFeeGwei: null,
    gasPriceGwei:
      market.gasPrice != null && market.gasPrice > 0n
        ? formatGwei(market.gasPrice)
        : null,
    updatedAt: Date.now()
  };
}

function hasGasPricing(request: TransactionRequest): boolean {
  return (
    request.maxFeePerGas != null ||
    request.maxPriorityFeePerGas != null ||
    request.gasPrice != null
  );
}

function marketToOverrides(market: GasMarketData): Partial<TransactionRequest> {
  if (market.isEip1559 && market.maxFee != null) {
    const baseFee = market.baseFee ?? 0n;
    const priority = market.marketPriority;
    const maxFeePerGas =
      baseFee > 0n ? (baseFee * 105n) / 100n + priority : market.maxFee;
    return { maxPriorityFeePerGas: priority, maxFeePerGas };
  }

  if (market.gasPrice != null && market.gasPrice > 0n) {
    return { gasPrice: market.gasPrice };
  }

  return {};
}

/** EIP-1559 or legacy gas price fields (prefers header poll cache, else public RPC). */
export async function resolveGasPriceOverrides(
  provider: Provider,
  chainId?: number
): Promise<Partial<TransactionRequest>> {
  if (chainId != null) {
    const cached = getGasPriceCache(chainId);
    if (cached) return gasCacheToOverrides(cached);
  }

  const gasProvider =
    chainId != null
      ? (getReadonlyProviderForChain(chainId) ?? provider)
      : provider;
  const market = await fetchGasMarketData(gasProvider);
  if (chainId != null) {
    setGasPriceCache(marketToGasPriceCache(chainId, market));
  }
  return marketToOverrides(market);
}

/**
 * Wrap a signer so bric-sdk sends use dApp gas prices. Pass chainId to read fees
 * from the public RPC (matches header display); wallet RPC often inflates priority.
 */
export function withCustomGasPrice(signer: Signer, chainId?: number): Signer {
  const provider = signer.provider;
  if (!provider) return signer;

  return new Proxy(signer, {
    get(target, prop, receiver) {
      if (prop === "sendTransaction") {
        return async (tx: TransactionRequest) => {
          if (hasGasPricing(tx)) {
            return target.sendTransaction(tx);
          }
          const overrides = await resolveGasPriceOverrides(provider, chainId);
          return target.sendTransaction({ ...overrides, ...tx });
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    }
  }) as Signer;
}
