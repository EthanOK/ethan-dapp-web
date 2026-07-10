import { formatUnits, type FeeData, type Provider } from "ethers";

export type NetworkGasKind = "eip1559" | "legacy";

export type NetworkGasSnapshot = {
  chainId: number;
  kind: NetworkGasKind;
  /** EIP-1559: base + priority; legacy: gas price */
  effectiveGasGwei: string | null;
  baseFeeGwei: string | null;
  priorityFeeGwei: string | null;
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

  const marketPriority =
    derived != null && derived >= 0n ? derived : (rpcPriority ?? 0n);

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

  if (market.isEip1559 && market.maxFee != null) {
    const effectiveGas =
      market.baseFee != null
        ? market.baseFee + market.marketPriority
        : market.marketPriority;

    return {
      chainId,
      kind: "eip1559",
      effectiveGasGwei: formatGwei(effectiveGas),
      baseFeeGwei: market.baseFee != null ? formatGwei(market.baseFee) : null,
      priorityFeeGwei: formatGwei(market.marketPriority),
      maxFeeGwei: formatGwei(market.maxFee),
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
    maxFeeGwei: null,
    gasPriceGwei:
      market.gasPrice != null && market.gasPrice > 0n
        ? formatGwei(market.gasPrice)
        : null,
    updatedAt: Date.now()
  };
}
