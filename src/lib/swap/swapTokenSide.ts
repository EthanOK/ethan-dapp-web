import type { SwapPayToken } from "@/config/SwapPayTokens";
import type { SwapWhitelistToken } from "@/fixtures/SwapTokenWhitelist";

export type TokenSide = {
  kind: "pay" | "whitelist" | "custom";
  key: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  name?: string;
  chainId?: number;
};

export function payTokenSide(token: SwapPayToken, chainId?: number): TokenSide {
  return {
    kind: "pay",
    key: token.id,
    tokenAddress: token.tokenAddress,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId
  };
}

export function whitelistTokenSide(
  token: SwapWhitelistToken,
  chainId?: number
): TokenSide {
  return {
    kind: "whitelist",
    key: token.symbol,
    tokenAddress: token.tokenAddress,
    symbol: token.symbol,
    decimals: token.decimals,
    chainId
  };
}

export function customTokenSide(
  address: string,
  symbol: string,
  decimals: number,
  name?: string,
  chainId?: number
): TokenSide {
  return {
    kind: "custom",
    key: address.toLowerCase(),
    tokenAddress: address,
    symbol,
    decimals,
    name,
    chainId
  };
}
