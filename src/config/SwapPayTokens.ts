import { ZeroAddress } from "ethers";

export type SwapPayToken = {
  symbol: "ETH" | "USDT" | "USDC";
  id: string;
  tokenAddress: string;
  decimals: number;
};

export const SWAP_PAY_TOKENS: SwapPayToken[] = [
  { id: "eth", symbol: "ETH", tokenAddress: ZeroAddress, decimals: 18 },
  {
    id: "usdt",
    symbol: "USDT",
    tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6
  },
  {
    id: "usdc",
    symbol: "USDC",
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6
  }
];

export const SWAP_PAY_TOKEN_BY_ID: Record<string, SwapPayToken> =
  Object.fromEntries(SWAP_PAY_TOKENS.map((t) => [t.id, t]));
