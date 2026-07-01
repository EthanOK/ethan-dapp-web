import { OpenSeaSDK, Chain } from "@opensea/sdk";
import type { BrowserProvider, JsonRpcProvider, Signer } from "ethers";
import { OPENSEA_MAIN_API } from "@/config/SystemConfiguration";

/** Wallet BrowserProvider is valid at runtime; OpenSea SDK types are narrower. */
export type OpenSeaSignerOrProvider =
  | Signer
  | JsonRpcProvider
  | BrowserProvider;

export const createOpenSeaSDK = (
  provider: OpenSeaSignerOrProvider,
  chain: Chain
): OpenSeaSDK =>
  // OpenSea SDK types target ethers CJS; this app uses ethers ESM.
  new OpenSeaSDK(provider as any, {
    chain,
    apiKey: OPENSEA_MAIN_API
  });
