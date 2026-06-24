import { tokenBalanceKey } from "@/lib/swap/swapTokenRules";
import type { SwapTokenPriceMap } from "@/lib/swap/swapTokenPrices";

export const SWAP_TOKEN_PRICE_CACHE_TTL_MS = 30_000;

type ChainPriceCacheEntry = {
  prices: SwapTokenPriceMap;
  fetchedAt: number;
};

const priceCacheByChain = new Map<number, ChainPriceCacheEntry>();

export function readSwapTokenPriceCache(chainId: number): SwapTokenPriceMap {
  return priceCacheByChain.get(chainId)?.prices ?? {};
}

export function isSwapTokenPriceCacheFresh(
  chainId: number,
  now = Date.now()
): boolean {
  const entry = priceCacheByChain.get(chainId);
  if (!entry) return false;
  return now - entry.fetchedAt < SWAP_TOKEN_PRICE_CACHE_TTL_MS;
}

export function writeSwapTokenPriceCache(
  chainId: number,
  prices: SwapTokenPriceMap
): void {
  if (Object.keys(prices).length === 0) return;
  const prev = priceCacheByChain.get(chainId);
  priceCacheByChain.set(chainId, {
    prices: { ...prev?.prices, ...prices },
    fetchedAt: Date.now()
  });
}

export function pickCachedTokenPrices(
  chainId: number,
  tokenAddresses: string[]
): SwapTokenPriceMap {
  const cached = readSwapTokenPriceCache(chainId);
  const picked: SwapTokenPriceMap = {};
  for (const address of tokenAddresses) {
    const key = tokenBalanceKey(address);
    if (cached[key]) picked[key] = cached[key];
  }
  return picked;
}

/** Token addresses with no cached price yet on this chain. */
export function listUncachedTokenAddresses(
  chainId: number,
  tokenAddresses: string[]
): string[] {
  const cached = readSwapTokenPriceCache(chainId);
  return tokenAddresses.filter((address) => !cached[tokenBalanceKey(address)]);
}
