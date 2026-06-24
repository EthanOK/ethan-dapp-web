import { tokenBalanceKey, type TokenSide } from "@/lib/swap/swapTokenRules";

const balanceCache = new Map<string, Record<string, bigint>>();

function cacheKey(chainId: number, account: string): string {
  return `${chainId}:${account.toLowerCase()}`;
}

/** Last batch-fetched balances for a chain + wallet (in-memory). */
export function readSwapTokenBalanceCache(
  chainId: number,
  account: string
): Record<string, bigint> {
  return balanceCache.get(cacheKey(chainId, account)) ?? {};
}

export function writeSwapTokenBalanceCache(
  chainId: number,
  account: string,
  balances: Record<string, bigint>
): void {
  if (Object.keys(balances).length === 0) return;
  const key = cacheKey(chainId, account);
  balanceCache.set(key, {
    ...balanceCache.get(key),
    ...balances
  });
}

export function pickCachedTokenBalances(
  chainId: number,
  account: string,
  tokens: TokenSide[]
): Record<string, bigint> {
  const cached = readSwapTokenBalanceCache(chainId, account);
  const picked: Record<string, bigint> = {};
  for (const side of tokens) {
    const key = tokenBalanceKey(side.tokenAddress);
    if (key in cached) picked[key] = cached[key];
  }
  return picked;
}
