export type SwapWhitelistToken = {
  symbol: string;
  underlyingAsset: string;
  tokenAddress: string;
  decimals: number;
};

/** Static snapshot from Bric whitelist API (one-time). */
export const SWAP_TOKEN_WHITELIST: SwapWhitelistToken[] = [
  {
    symbol: "ETH",
    underlyingAsset: "Ethereum",
    tokenAddress: "0x0000000000000000000000000000000000000000",
    decimals: 18
  },
  {
    symbol: "USDT",
    underlyingAsset: "Tether USD",
    tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    decimals: 6
  },
  {
    symbol: "USDC",
    underlyingAsset: "USD Coin",
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
    decimals: 6
  },
  {
    symbol: "BMNRon",
    underlyingAsset: "BitMine Immersion Technologies",
    tokenAddress: "0x33483a58079b4225b10e57958ca28ad7b9cdbaf7",
    decimals: 18
  },
  {
    symbol: "PAXG",
    underlyingAsset: "Paxos Gold",
    tokenAddress: "0x45804880de22913dafe09f4980848ece6ecbaf78",
    decimals: 18
  },
  {
    symbol: "XAUT",
    underlyingAsset: "Tether Gold",
    tokenAddress: "0x68749665ff8d2d112fa859aa293f07a622782f38",
    decimals: 6
  },
  {
    symbol: "CRCLon",
    underlyingAsset: "Circle Internet Group",
    tokenAddress: "0x3632dea96a953c11dac2f00b4a05a32cd1063fae",
    decimals: 18
  },
  {
    symbol: "COINon",
    underlyingAsset: "Coinbase",
    tokenAddress: "0xf042cfa86cf1d598a75bdb55c3507a1f39f9493b",
    decimals: 18
  },
  {
    symbol: "NVDAon",
    underlyingAsset: "NVIDIA",
    tokenAddress: "0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee",
    decimals: 18
  },
  {
    symbol: "GOOGLon",
    underlyingAsset: "Alphabet Class A",
    tokenAddress: "0xba47214edd2bb43099611b208f75e4b42fdcfedc",
    decimals: 18
  },
  {
    symbol: "AAPLon",
    underlyingAsset: "Apple",
    tokenAddress: "0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c",
    decimals: 18
  },
  {
    symbol: "METAon",
    underlyingAsset: "Meta Platforms",
    tokenAddress: "0x59644165402b611b350645555b50afb581c71eb2",
    decimals: 18
  },
  {
    symbol: "TSLAon",
    underlyingAsset: "Tesla",
    tokenAddress: "0xf6b1117ec07684d3958cad8beb1b302bfd21103f",
    decimals: 18
  },
  {
    symbol: "AMZNon",
    underlyingAsset: "Amazon",
    tokenAddress: "0xbb8774fb97436d23d74c1b882e8e9a69322cfd31",
    decimals: 18
  },
  {
    symbol: "MSFTon",
    underlyingAsset: "Microsoft",
    tokenAddress: "0xb812837b81a3a6b81d7cd74cfb19a7f2784555e5",
    decimals: 18
  },
  {
    symbol: "SLVon",
    underlyingAsset: "iShares Silver Trust",
    tokenAddress: "0xf3e4872e6a4cf365888d93b6146a2baa7348f1a4",
    decimals: 18
  },
  {
    symbol: "SPCXon",
    underlyingAsset: "SpaceX",
    tokenAddress: "0xc9eef266834730340a55b6cc24621b31baf55581",
    decimals: 18
  }
];

export const SWAP_WHITELIST_BY_SYMBOL: Record<string, SwapWhitelistToken> =
  Object.fromEntries(SWAP_TOKEN_WHITELIST.map((t) => [t.symbol, t]));
