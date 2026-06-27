import {
  setBricDexProxyBaseUrl,
  setSwapAggregatorPriority,
  setSwapConfig,
  SupportedAggregator
} from "@bric-labs/bric-sdk";
import { BRIC_DEX_PROXY_BASE_URL } from "./SystemConfiguration";

/** Per-aggregator quote/swap HTTP timeout passed to bric-sdk orchestration. */
export const BRIC_AGGREGATOR_TIMEOUT_MS = 6000;

let bricSdkInitialized = false;

export const BRIC_SUPPORTED_AGGREGATORS = [
  SupportedAggregator.KYBER,
  SupportedAggregator.BRICOKX,
  SupportedAggregator.BRICBITGET,
  SupportedAggregator.PARASWAP
];

/** Idempotent SDK global config — safe to call from SwapPage mount. */
export function initBricSdk(): void {
  if (bricSdkInitialized) return;
  setBricDexProxyBaseUrl(BRIC_DEX_PROXY_BASE_URL);
  setSwapConfig({ aggregatorTimeoutMs: BRIC_AGGREGATOR_TIMEOUT_MS });
  setSwapAggregatorPriority([
    [
      SupportedAggregator.KYBER,
      SupportedAggregator.BRICOKX,
      SupportedAggregator.BRICBITGET
    ],
    [SupportedAggregator.PARASWAP]
  ]);
  bricSdkInitialized = true;
}
