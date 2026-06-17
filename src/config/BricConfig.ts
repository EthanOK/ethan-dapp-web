import {
  CHAIN_ID_MAPPING,
  setBricDexProxyBaseUrl,
  setSwapAggregatorPriority,
  RwaBuySwapAggregatorPriority,
  RwaSellSwapAggregatorPriority,
  SupportedAggregator
} from "@bric-labs/bric-sdk";

export const BRIC_MAINNET_CHAIN_ID = CHAIN_ID_MAPPING.ETHEREUM;

/** Mainnet BricSwapAggregator — approve spender + BricAggregatorHelper target */
export const BRIC_SWAP_AGGREGATOR_ADDRESS =
  "0xF7803651Be70EA1df2882880D637189f533BCe46";

/** Matches SDK ETHEREUM_CORE_ADDRESSES.BRIC_MULTICALL */
export const BRIC_MULTICALL_ADDRESS =
  "0x61cd896fe0Da27644E11790f5f385093D11C0BE9";

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
