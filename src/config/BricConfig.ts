import {
  setBricDexProxyBaseUrl,
  setSwapAggregatorPriority,
  SupportedAggregator
} from "@bric-labs/bric-sdk";

export const BRIC_DEX_PROXY_BASE_URL =
  process.env.REACT_APP_BRIC_DEX_PROXY_BASE_URL ??
  "https://new-test.bric.one/bric-api";

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
