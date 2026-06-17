import { CHAIN_ID_MAPPING } from "@bric-labs/bric-sdk";
import { SWAP_PAY_TOKENS } from "@/config/SwapPayTokens";
import { SWAP_TOKEN_WHITELIST } from "@/fixtures/SwapTokenWhitelist";
import {
  payTokenSide,
  whitelistTokenSide,
  type TokenSide
} from "@/lib/swap/swapTokenSide";

/** Per-chain swap configuration — extend SWAP_CHAINS when adding networks. */
export type SwapChainDefinition = {
  chainId: number;
  name: string;
  networkBadge: string;
  payTokens: typeof SWAP_PAY_TOKENS;
  whitelist: typeof SWAP_TOKEN_WHITELIST;
  bricSwapAddress: string;
  bricMulticallAddress: string;
  enabled: boolean;
};

export const SWAP_CHAIN_ETHEREUM: SwapChainDefinition = {
  chainId: CHAIN_ID_MAPPING.ETHEREUM,
  name: "Ethereum Mainnet",
  networkBadge: "Ethereum",
  payTokens: SWAP_PAY_TOKENS,
  whitelist: SWAP_TOKEN_WHITELIST,
  bricSwapAddress: "0xF7803651Be70EA1df2882880D637189f533BCe46",
  bricMulticallAddress: "0x61cd896fe0Da27644E11790f5f385093D11C0BE9",
  enabled: true
};

/** Registered swap chains. Only `enabled` entries are usable in the UI. */
export const SWAP_CHAINS: SwapChainDefinition[] = [SWAP_CHAIN_ETHEREUM];

export function getSwapChainConfig(
  chainId: number
): SwapChainDefinition | undefined {
  return SWAP_CHAINS.find((c) => c.chainId === chainId && c.enabled);
}

/** Default swap chain for the page (first enabled entry). */
export function getDefaultSwapChain(): SwapChainDefinition {
  const chain = SWAP_CHAINS.find((c) => c.enabled);
  if (!chain) throw new Error("No enabled swap chain configured");
  return chain;
}

export function isSwapChainSupported(chainId: number): boolean {
  return getSwapChainConfig(chainId) != null;
}

export function buildDefaultTokenSides(
  chain: SwapChainDefinition
): TokenSide[] {
  return [
    ...chain.payTokens.map((t) => payTokenSide(t, chain.chainId)),
    ...chain.whitelist.map((t) => whitelistTokenSide(t, chain.chainId))
  ];
}
