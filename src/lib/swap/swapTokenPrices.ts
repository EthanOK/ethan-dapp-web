import { ZeroAddress, formatUnits } from "ethers";
import { tokenBalanceKey, type TokenSide } from "@/lib/swap/swapTokenRules";

const KYBER_PRICE_URL =
  "https://token-api.kyberengineering.io/api/v1/public/tokens/prices";

/** Kyber native ETH placeholder — same as bric-sdk. */
const KYBER_NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/** USD price from Kyber (average of buy/sell). */
export type SwapTokenPriceInfo = {
  priceUsd: number;
  priceBuy?: number;
  priceSell?: number;
};

/** Lowercase token address → USD price. ETH uses ZeroAddress key. */
export type SwapTokenPriceMap = Record<string, SwapTokenPriceInfo>;

type KyberPriceRow = { PriceBuy: number; PriceSell: number };

type KyberPriceResponse = {
  code: number;
  data?: Record<string, Record<string, KyberPriceRow>>;
};

function toKyberTokenAddress(address: string): {
  address: string;
  isNative: boolean;
} {
  if (address.toLowerCase() === ZeroAddress.toLowerCase()) {
    return { address: KYBER_NATIVE_TOKEN_ADDRESS, isNative: true };
  }
  return { address, isNative: false };
}

function fromKyberTokenAddress(
  address: string,
  needNativeConvert: boolean
): string {
  if (
    needNativeConvert &&
    address.toLowerCase() === KYBER_NATIVE_TOKEN_ADDRESS.toLowerCase()
  ) {
    return ZeroAddress;
  }
  return address;
}

function normalizeKyberResponse(
  chainId: number,
  data: KyberPriceResponse,
  hadNative: boolean
): SwapTokenPriceMap {
  const rows = data.data?.[String(chainId)];
  if (!rows) return {};

  const out: SwapTokenPriceMap = {};
  for (const [token, info] of Object.entries(rows)) {
    const priceBuy = info.PriceBuy;
    const priceSell = info.PriceSell;
    if (!Number.isFinite(priceBuy) || !Number.isFinite(priceSell)) continue;
    const key = tokenBalanceKey(fromKyberTokenAddress(token, hadNative));
    out[key] = {
      priceUsd: (priceBuy + priceSell) / 2,
      priceBuy,
      priceSell
    };
  }
  return out;
}

/**
 * Batch fetch token USD prices in one Kyber API call (browser CORS-safe).
 * Network: POST token-api.kyberengineering.io/.../tokens/prices
 */
export async function fetchSwapTokenPrices(
  chainId: number,
  tokenAddresses: string[]
): Promise<SwapTokenPriceMap> {
  const unique = [
    ...new Set(tokenAddresses.map((a) => a.trim()).filter(Boolean))
  ];
  if (unique.length === 0) return {};

  let hadNative = false;
  const kyberTokens = unique.map((addr) => {
    const mapped = toKyberTokenAddress(addr);
    if (mapped.isNative) hadNative = true;
    return mapped.address;
  });

  const response = await fetch(KYBER_PRICE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [chainId]: kyberTokens })
  });

  if (!response.ok) {
    throw new Error(`Kyber price HTTP ${response.status}`);
  }

  const data = (await response.json()) as KyberPriceResponse;
  if (data.code !== 0) {
    throw new Error(`Kyber price API code ${data.code}`);
  }

  return normalizeKyberResponse(chainId, data, hadNative);
}

/** Same as {@link fetchSwapTokenPrices} but accepts catalog `TokenSide` entries. */
export async function fetchSwapTokenPricesForSides(
  chainId: number,
  tokens: TokenSide[]
): Promise<SwapTokenPriceMap> {
  return fetchSwapTokenPrices(
    chainId,
    tokens.map((t) => t.tokenAddress)
  );
}

export function getSwapTokenPrice(
  map: SwapTokenPriceMap,
  tokenAddress: string
): SwapTokenPriceInfo | undefined {
  return map[tokenBalanceKey(tokenAddress)];
}

/** Human-readable token balance × USD price. */
export function calcTokenUsdValue(
  balance: bigint,
  decimals: number,
  priceUsd: number
): number {
  if (balance === 0n || priceUsd <= 0) return 0;
  return Number(formatUnits(balance, decimals)) * priceUsd;
}

const SWAP_USD_MIN_DISPLAY = 0.000001;

function formatUsdWithSixDecimals(usd: number): string {
  const fixed = usd.toFixed(6).replace(/\.?0+$/, "");
  return `$${fixed}`;
}

/** Compact USD label for swap amount rows (e.g. $395.82). */
export function formatSwapUsdValue(usd: number): string {
  if (!Number.isFinite(usd) || usd <= 0) return "";
  if (usd < SWAP_USD_MIN_DISPLAY) return "<$0.000001";
  if (usd >= 1_000_000) {
    return `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }
  if (usd >= 0.01) {
    return `$${usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return formatUsdWithSixDecimals(usd);
}
