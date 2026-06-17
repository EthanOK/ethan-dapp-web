import {
  getDefaultSwapChain,
  type SwapChainDefinition
} from "@/config/SwapChainConfig";
import {
  customTokenSide,
  payTokenSide,
  whitelistTokenSide,
  type TokenSide
} from "@/lib/swap/swapTokenSide";

export type { TokenSide } from "@/lib/swap/swapTokenSide";
export {
  customTokenSide,
  payTokenSide,
  whitelistTokenSide
} from "@/lib/swap/swapTokenSide";

export const SLIPPAGE_PRESETS = [
  { label: "0.1%", bps: 10, decimal: 0.001 },
  { label: "0.5%", bps: 50, decimal: 0.005 },
  { label: "1%", bps: 100, decimal: 0.01 },
  { label: "3%", bps: 300, decimal: 0.03 },
  { label: "5%", bps: 500, decimal: 0.05 }
] as const;

export const DEFAULT_SLIPPAGE = SLIPPAGE_PRESETS[1];

export function addressesEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function isSameTokenSide(a: TokenSide, b: TokenSide): boolean {
  return addressesEqual(a.tokenAddress, b.tokenAddress);
}

export function encodeTokenSelectKey(side: TokenSide): string {
  if (side.kind === "custom") return `custom:${side.key}`;
  return `${side.kind}:${side.key}`;
}

export function buildPaySelectOptions(
  chain = getDefaultSwapChain()
): TokenSide[] {
  return [
    ...chain.payTokens.map((t) => payTokenSide(t, chain.chainId)),
    ...chain.whitelist.map((t) => whitelistTokenSide(t, chain.chainId))
  ];
}

export function tokenBalanceKey(tokenAddress: string): string {
  return tokenAddress.toLowerCase();
}

function defaultTokenSideRank(
  side: TokenSide,
  chain = getDefaultSwapChain()
): number {
  if (side.kind === "pay") {
    const i = chain.payTokens.findIndex((t) => t.id === side.key);
    return i >= 0 ? i : 99;
  }
  if (side.kind === "whitelist") {
    const i = chain.whitelist.findIndex((t) => t.symbol === side.key);
    return 100 + (i >= 0 ? i : 99);
  }
  return 1000;
}

/** Non-zero balances first (desc), then default catalog order. */
export function sortTokenSidesByBalance(
  sides: TokenSide[],
  balances: Record<string, bigint>,
  chain = getDefaultSwapChain()
): TokenSide[] {
  return [...sides].sort((a, b) => {
    const balA = balances[tokenBalanceKey(a.tokenAddress)] ?? 0n;
    const balB = balances[tokenBalanceKey(b.tokenAddress)] ?? 0n;
    const hasA = balA > 0n;
    const hasB = balB > 0n;
    if (hasA !== hasB) return (hasB ? 1 : 0) - (hasA ? 1 : 0);
    if (hasA && hasB && balA !== balB) return balA > balB ? -1 : 1;
    const rank =
      defaultTokenSideRank(a, chain) - defaultTokenSideRank(b, chain);
    if (rank !== 0) return rank;
    return a.symbol.localeCompare(b.symbol);
  });
}

export function filterTokenSidesByQuery(
  sides: TokenSide[],
  query: string,
  chain = getDefaultSwapChain()
): TokenSide[] {
  const q = query.trim().toLowerCase();
  if (!q) return sides;
  return sides.filter((side) => {
    if (side.symbol.toLowerCase().includes(q)) return true;
    if (side.tokenAddress.toLowerCase().includes(q)) return true;
    if (side.kind !== "whitelist") return false;
    const meta = chain.whitelist.find((t) => t.symbol === side.symbol);
    return meta?.underlyingAsset.toLowerCase().includes(q) ?? false;
  });
}

export function getTokenDisplayName(
  side: TokenSide,
  chain = getDefaultSwapChain()
): string {
  if (side.kind === "custom") return side.name ?? side.symbol;
  if (side.kind === "whitelist") {
    const meta = chain.whitelist.find((t) => t.symbol === side.symbol);
    return meta?.underlyingAsset ?? side.symbol;
  }
  if (side.symbol === "ETH") return "Ethereum";
  if (side.symbol === "USDT") return "Tether USD";
  if (side.symbol === "USDC") return "USD Coin";
  return side.symbol;
}

/** Receive options = full catalog minus the current pay token. */
export function buildReceiveSelectOptions(
  pay: TokenSide,
  catalog: TokenSide[] = buildPaySelectOptions()
): TokenSide[] {
  return catalog.filter((side) => !isSameTokenSide(side, pay));
}

export function isReceiveAllowed(pay: TokenSide, receive: TokenSide): boolean {
  return !isSameTokenSide(pay, receive);
}

export function coerceReceiveSide(
  pay: TokenSide,
  receive: TokenSide,
  fallback: TokenSide,
  catalog: TokenSide[] = buildPaySelectOptions()
): TokenSide {
  if (isReceiveAllowed(pay, receive)) return receive;
  const allowed = buildReceiveSelectOptions(pay, catalog);
  if (allowed.length > 0) return allowed[0];
  return fallback;
}

export function resolveTokenSideFromSelectKey(
  selectKey: string,
  customAddress: string,
  customMeta?: { symbol: string; decimals: number; name?: string } | null,
  catalog: TokenSide[] = buildPaySelectOptions(),
  chain = getDefaultSwapChain()
): TokenSide | null {
  if (selectKey === "custom") {
    if (!customMeta || !customAddress.trim()) return null;
    return customTokenSide(
      customAddress.trim(),
      customMeta.symbol,
      customMeta.decimals,
      customMeta.name,
      chain.chainId
    );
  }

  const colon = selectKey.indexOf(":");
  if (colon === -1) return null;
  const kind = selectKey.slice(0, colon);
  const key = selectKey.slice(colon + 1);

  if (kind === "custom" && key) {
    return (
      catalog.find(
        (t) =>
          t.kind === "custom" &&
          (t.key === key || addressesEqual(t.tokenAddress, key))
      ) ?? null
    );
  }

  if (kind === "pay" && key) {
    const token = chain.payTokens.find((t) => t.id === key);
    return token ? payTokenSide(token, chain.chainId) : null;
  }
  if (kind === "whitelist" && key) {
    const token = chain.whitelist.find((t) => t.symbol === key);
    return token ? whitelistTokenSide(token, chain.chainId) : null;
  }
  return null;
}
