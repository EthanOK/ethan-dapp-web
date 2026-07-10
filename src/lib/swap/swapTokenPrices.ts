import { ZeroAddress, formatUnits } from "ethers";
import {
  COINGECKO_API_BASE,
  COINGECKO_API_HEADERS
} from "@/lib/price/CoinGeckoApi";
import { tokenBalanceKey, type TokenSide } from "@/lib/swap/swapTokenRules";
import {
  isSwapTokenPriceCacheFresh,
  listUncachedTokenAddresses,
  pickCachedTokenPrices,
  readSwapTokenPriceCache,
  writeSwapTokenPriceCache
} from "@/lib/swap/swapTokenPriceCache";

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

/** USD price from CoinGecko simple/token_price. */
export type SwapTokenPriceInfo = {
  priceUsd: number;
  /** 24h change percentage from CoinGecko when available. */
  change24hPct?: number;
  marketCapUsd?: number;
  volume24hUsd?: number;
  lastUpdatedAt?: number;
};

/** Lowercase token address → USD price. ETH uses ZeroAddress key. */
export type SwapTokenPriceMap = Record<string, SwapTokenPriceInfo>;

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
      unique.map((address) =>
        isNativeTokenAddress(address) ? config.wrappedNativeAddress : address
      )
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
    if (isNativeTokenAddress(address)) {
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

  const cached = pickCachedTokenPrices(chainId, unique);
  const fresh = isSwapTokenPriceCacheFresh(chainId);
  const uncached = listUncachedTokenAddresses(chainId, unique);

  if (fresh && uncached.length === 0) {
    return cached;
  }

  const tokensToFetch = fresh ? uncached : unique;
  if (tokensToFetch.length === 0) {
    return cached;
  }

  try {
    const prices = await fetchCoinGeckoTokenPrices(chainId, tokensToFetch);
    writeSwapTokenPriceCache(chainId, prices);
    return pickCachedTokenPrices(chainId, unique);
  } catch (error) {
    if (Object.keys(cached).length > 0) return cached;
    throw error;
  }
}

/** Batch fetch token USD prices via CoinGecko simple/token_price. */
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

export { readSwapTokenPriceCache } from "@/lib/swap/swapTokenPriceCache";

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

/** Shown under swap amounts when USD price is temporarily unavailable. */
export const SWAP_USD_UNAVAILABLE = "$--";

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
