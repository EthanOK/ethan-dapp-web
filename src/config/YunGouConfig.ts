/**
 * YunGou business contract configuration, indexed by chainId.
 * Kept separate from ChainsConfig: chain metadata only describes RPC /
 * native currency / block explorers, while deployed business contract
 * addresses live here. To add a new EVM chain, append its deployment
 * addresses below; business layers look up this table by chainId
 * automatically without touching other code.
 */

export interface YunGouChainContracts {
  /** YunGou2.0 contract address */
  yungou2_0?: string;
  /** YunGou aggregator contract address */
  aggregators?: string;
  /** YunGou order test data source, defaults to "main" */
  yungouOrderData?: "main" | "tbsc";
}

/** Ethereum mainnet chainId, used as fallback for unknown chains. */
const MAINNET_CHAIN_ID = 1;

export const YunGouContracts: Record<number, YunGouChainContracts> = {
  1: {
    yungou2_0: "0x0000006c517ed32ff128b33f137bb4ac31b0c6dd",
    aggregators: "0x0000007eE460B0928c2119E3B9747454A10d1557",
    yungouOrderData: "main"
  },
  11155111: {
    yungou2_0: "0x72fc74cf6d6899b4a0083728664fe2706948dab0",
    aggregators: "0x596Aa28bB2ca2D29E352bC21600DB5ECe3E69797",
    yungouOrderData: "main"
  },
  56: {
    yungou2_0: "0x0000006c517ed32ff128b33f137bb4ac31b0c6dd",
    aggregators: "0x0000007eE460B0928c2119E3B9747454A10d1557",
    yungouOrderData: "tbsc"
  },
  97: {
    yungou2_0: "0x0000006c517ed32ff128b33f137bb4ac31b0c6dd",
    aggregators: "0x0000A8086590DD83c8bd58A787412026B86eB772",
    yungouOrderData: "tbsc"
  }
};

/** Returns the YunGou contract config for a chainId (undefined if unknown). */
export const getYunGouChainContracts = (
  chainId: number
): YunGouChainContracts | undefined => YunGouContracts[chainId];

/** Mainnet YunGou contract config, used as fallback for unknown chains. */
export const getDefaultYunGouChainContracts = (): YunGouChainContracts =>
  YunGouContracts[MAINNET_CHAIN_ID] ?? {};
