import type { SwapWhitelistToken } from "@/fixtures/SwapTokenWhitelist";

/** Static snapshot placeholder for BSC whitelist (disabled for now). */
export const SWAP_TOKEN_WHITELIST_BSC: SwapWhitelistToken[] = [
  {
    symbol: "BNB",
    underlyingAsset: "BNB",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    decimals: 18
  },
  {
    symbol: "USDT",
    underlyingAsset: "Tether USD (BSC)",
    tokenAddress: "0x55d398326f99059ff775485246999027b3197955",
    decimals: 18
  },
  {
    symbol: "USDC",
    underlyingAsset: "USD Coin (BSC)",
    tokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    decimals: 18
  },
  {
    symbol: "XAUT",
    underlyingAsset: "Tether Gold (BSC)",
    tokenAddress: "0x21caef8a43163eea865baee23b9c2e327696a3bf",
    decimals: 18
  }
];

export const SWAP_WHITELIST_BSC_BY_SYMBOL: Record<string, SwapWhitelistToken> =
  Object.fromEntries(SWAP_TOKEN_WHITELIST_BSC.map((t) => [t.symbol, t]));
