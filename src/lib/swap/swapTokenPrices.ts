import { ZeroAddress, formatUnits } from "ethers";
import {
  COINGECKO_API_BASE,
  COINGECKO_API_HEADERS
} from "@/lib/price/CoinGeckoApi";
import { tokenBalanceKey, type TokenSide } from "@/lib/swap/swapTokenRules";

const KYBER_PRICE_URL =
  "https://token-api.kyberengineering.io/api/v1/public/tokens/prices";

/** Kyber native ETH placeholder — same as bric-sdk. */
const KYBER_NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

const COINGECKO_CHAIN_CONFIG: Record<
  number,
  { platform: string; wrappedNativeAddress: string }
> = {
  1: {
    platform: "ethereum",
    wrappedNativeAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  },
  56: {
    platform: "binance-smart-chain",
    wrappedNativeAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  }
};

/** USD price (CoinGecko CEX aggregate preferred; Kyber DEX fallback). */
export type SwapTokenPriceInfo = {
  priceUsd: number;
  /** 24h change percentage from CoinGecko when available. */
  change24hPct?: number;
  marketCapUsd?: number;
  volume24hUsd?: number;
  lastUpdatedAt?: number;
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

type CoinGeckoSimplePriceResponse = Record<
  string,
  {
    usd?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
    usd_24h_change?: number;
    last_updated_at?: number;
  }
>;

/** Shared query flags for CoinGecko `/simple/token_price` endpoints. */
export const COINGECKO_SIMPLE_TOKEN_PRICE_INCLUDES = {
  include_market_cap: "true",
  include_24hr_vol: "true",
  include_24hr_change: "true",
  include_last_updated_at: "true"
} as const;

function isNativeTokenAddress(address: string): boolean {
  return address.toLowerCase() === ZeroAddress.toLowerCase();
}

function isKyberNativePlaceholder(address: string): boolean {
  return address.toLowerCase() === KYBER_NATIVE_TOKEN_ADDRESS.toLowerCase();
}

function isNativeLikeTokenAddress(address: string): boolean {
  return isNativeTokenAddress(address) || isKyberNativePlaceholder(address);
}

function toKyberTokenAddress(address: string): {
  address: string;
  isNative: boolean;
} {
  if (isNativeTokenAddress(address)) {
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

function readCoinGeckoTokenPrice(
  rows: CoinGeckoSimplePriceResponse,
  address: string
): SwapTokenPriceInfo | null {
  const row =
    rows[address.toLowerCase()] ??
    rows[address] ??
    Object.entries(rows).find(
      ([key]) => key.toLowerCase() === address.toLowerCase()
    )?.[1];
  const price = row?.usd;
  if (price == null || !Number.isFinite(price) || price <= 0) return null;

  const change24hPct = row?.usd_24h_change;
  const marketCapUsd = row?.usd_market_cap;
  const volume24hUsd = row?.usd_24h_vol;
  const lastUpdatedAt = row?.last_updated_at;
  return {
    priceUsd: price,
    ...(change24hPct != null && Number.isFinite(change24hPct)
      ? { change24hPct }
      : {}),
    ...(marketCapUsd != null &&
    Number.isFinite(marketCapUsd) &&
    marketCapUsd > 0
      ? { marketCapUsd }
      : {}),
    ...(volume24hUsd != null &&
    Number.isFinite(volume24hUsd) &&
    volume24hUsd > 0
      ? { volume24hUsd }
      : {}),
    ...(lastUpdatedAt != null && Number.isFinite(lastUpdatedAt)
      ? { lastUpdatedAt }
      : {})
  };
}

async function fetchCoinGeckoTokenPrices(
  chainId: number,
  tokenAddresses: string[]
): Promise<SwapTokenPriceMap> {
  const config = COINGECKO_CHAIN_CONFIG[chainId];
  if (!config) return {};

  const unique = [
    ...new Set(tokenAddresses.map((a) => a.trim()).filter(Boolean))
  ];
  if (unique.length === 0) return {};

  const contractAddresses = [
    ...new Set(
      unique.map((address) => {
        if (isNativeLikeTokenAddress(address)) {
          return config.wrappedNativeAddress;
        }
        return address;
      })
    )
  ];

  const params = new URLSearchParams({
    contract_addresses: contractAddresses.join(","),
    vs_currencies: "usd",
    ...COINGECKO_SIMPLE_TOKEN_PRICE_INCLUDES
  });
  const response = await fetch(
    `${COINGECKO_API_BASE}/simple/token_price/${config.platform}?${params}`,
    { headers: COINGECKO_API_HEADERS }
  );
  if (!response.ok) {
    throw new Error(`CoinGecko price HTTP ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoSimplePriceResponse;
  const out: SwapTokenPriceMap = {};

  for (const address of unique) {
    if (isNativeLikeTokenAddress(address)) {
      const info = readCoinGeckoTokenPrice(data, config.wrappedNativeAddress);
      if (!info) continue;
      out[tokenBalanceKey(ZeroAddress)] = info;
      continue;
    }

    const info = readCoinGeckoTokenPrice(data, address);
    if (!info) continue;
    out[tokenBalanceKey(address)] = info;
  }

  return out;
}

async function fetchKyberTokenPrices(
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

const inflightPriceFetches = new Map<string, Promise<SwapTokenPriceMap>>();

function buildPriceFetchKey(chainId: number, tokenAddresses: string[]): string {
  const unique = [
    ...new Set(
      tokenAddresses.map((a) => a.trim().toLowerCase()).filter(Boolean)
    )
  ].sort();
  return `${chainId}:${unique.join(",")}`;
}

async function fetchSwapTokenPricesInternal(
  chainId: number,
  tokenAddresses: string[]
): Promise<SwapTokenPriceMap> {
  const unique = [
    ...new Set(tokenAddresses.map((a) => a.trim()).filter(Boolean))
  ];
  if (unique.length === 0) return {};

  let prices: SwapTokenPriceMap = {};
  try {
    prices = await fetchCoinGeckoTokenPrices(chainId, unique);
  } catch (error) {
    console.warn(
      "[BricSwap] CoinGecko price fetch failed, falling back to Kyber:",
      error instanceof Error ? error.message : error
    );
  }

  const missing = unique.filter((address) => !prices[tokenBalanceKey(address)]);
  if (missing.length === 0) return prices;

  try {
    const kyberPrices = await fetchKyberTokenPrices(chainId, missing);
    return { ...prices, ...kyberPrices };
  } catch (error) {
    if (Object.keys(prices).length > 0) {
      console.warn(
        "[BricSwap] Kyber fallback price fetch failed:",
        error instanceof Error ? error.message : error
      );
      return prices;
    }
    throw error;
  }
}

/**
 * Batch fetch token USD prices. CoinGecko (CEX aggregate) is preferred for
 * Ondo/RWA tokens; Kyber DEX prices fill gaps for custom unlisted tokens.
 */
export async function fetchSwapTokenPrices(
  chainId: number,
  tokenAddresses: string[]
): Promise<SwapTokenPriceMap> {
  const key = buildPriceFetchKey(chainId, tokenAddresses);
  const inflight = inflightPriceFetches.get(key);
  if (inflight) return inflight;

  const task = fetchSwapTokenPricesInternal(chainId, tokenAddresses).finally(
    () => {
      if (inflightPriceFetches.get(key) === task) {
        inflightPriceFetches.delete(key);
      }
    }
  );
  inflightPriceFetches.set(key, task);
  return task;
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

/** Format CoinGecko 24h change for token picker rows. */
export function formatSwapTokenChange24h(change24hPct: number | undefined): {
  text: string;
  isUp: boolean;
} | null {
  if (change24hPct == null || !Number.isFinite(change24hPct)) return null;
  const isUp = change24hPct >= 0;
  return {
    text: `${isUp ? "+" : ""}${change24hPct.toFixed(2)}%`,
    isUp
  };
}

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
