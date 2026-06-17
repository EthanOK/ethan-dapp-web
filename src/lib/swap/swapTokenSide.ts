import type { SwapWhitelistToken } from "@/fixtures/SwapTokenWhitelist";

export type TokenSide = {
  kind: "whitelist" | "custom";
  key: string;
  tokenAddress: string;
  symbol: string;
  decimals: number;
  name?: string;
  chainId?: number;
};

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
