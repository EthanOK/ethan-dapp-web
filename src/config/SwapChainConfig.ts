import { CHAIN_ID_MAPPING } from "@bric-labs/bric-sdk";
import { ZeroAddress, isAddress } from "ethers";
import { SWAP_TOKEN_WHITELIST } from "@/fixtures/SwapTokenWhitelist";
import { SWAP_TOKEN_WHITELIST_BSC } from "@/fixtures/SwapTokenWhitelistBsc";
import { whitelistTokenSide, type TokenSide } from "@/lib/swap/swapTokenSide";

/** Per-chain swap configuration — extend SWAP_CHAINS when adding networks. */
export type SwapChainDefinition = {
  chainId: number;
  name: string;
  networkBadge: string;
  /** Small chain badge on token avatars (picker list). */
  chainAvatarBadge: string;
  chainAvatarColor: string;
  nativeSymbol: string;
  tokens: typeof SWAP_TOKEN_WHITELIST;
  bricSwapAddress: string;
  /**
   * Tokens that require allowance reset (approve 0) before setting a new
   * non-zero allowance to Permit2 (e.g. mainnet USDT).
   */
  tokensRequiringAllowanceReset?: string[];
  enabled: boolean;
};

export const SWAP_CHAIN_ETHEREUM: SwapChainDefinition = {
  chainId: CHAIN_ID_MAPPING.ETHEREUM,
  name: "Ethereum Mainnet",
  networkBadge: "Ethereum",
  chainAvatarBadge: "E",
  chainAvatarColor: "#627eea",
  nativeSymbol: "ETH",
  tokens: SWAP_TOKEN_WHITELIST,
  bricSwapAddress: "0xF7803651Be70EA1df2882880D637189f533BCe46",
  tokensRequiringAllowanceReset: [
    // USDT (Ethereum mainnet)
    "0xdac17f958d2ee523a2206206994597c13d831ec7"
  ],
  enabled: true
};

export const SWAP_CHAIN_BSC: SwapChainDefinition = {
  chainId: CHAIN_ID_MAPPING.BSC,
  name: "BNB Smart Chain",
  networkBadge: "BNB Chain",
  chainAvatarBadge: "B",
  chainAvatarColor: "#f0b90b",
  nativeSymbol: "BNB",
  tokens: SWAP_TOKEN_WHITELIST_BSC,
  // TODO: add bric swap address
  bricSwapAddress: "0x0000000000000000000000000000000000000000",
  enabled: true
};

/** True when `bricSwapAddress` is set to a non-zero contract. */
export function isBricSwapAddressConfigured(
  chain: SwapChainDefinition
): boolean {
  const address = chain.bricSwapAddress.trim();
  return (
    isAddress(address) && address.toLowerCase() !== ZeroAddress.toLowerCase()
  );
}

/** Enabled chain with a configured BricSwap router/spender. */
export function isSwapChainOperational(chain: SwapChainDefinition): boolean {
  return chain.enabled && isBricSwapAddressConfigured(chain);
}

/** Registered swap chains. Only `enabled` entries are usable in the UI. */
export const SWAP_CHAINS: SwapChainDefinition[] = [
  SWAP_CHAIN_ETHEREUM,
  SWAP_CHAIN_BSC
];

/** All swap chains enabled in the UI. */
export function getEnabledSwapChains(): SwapChainDefinition[] {
  return SWAP_CHAINS.filter((c) => c.enabled);
}

export function getSwapChainConfig(
  chainId: number
): SwapChainDefinition | undefined {
  return SWAP_CHAINS.find((c) => c.chainId === chainId && c.enabled);
}

/** Default swap chain for the page (first enabled, configured entry). */
export function getDefaultSwapChain(): SwapChainDefinition {
  const chain = SWAP_CHAINS.find((c) => isSwapChainOperational(c));
  if (!chain) throw new Error("No operational swap chain configured");
  return chain;
}

export function isSwapChainSupported(chainId: number): boolean {
  const chain = getSwapChainConfig(chainId);
  return chain != null && isBricSwapAddressConfigured(chain);
}

export function buildDefaultTokenSides(
  chain: SwapChainDefinition
): TokenSide[] {
  return [...chain.tokens.map((t) => whitelistTokenSide(t, chain.chainId))];
}
