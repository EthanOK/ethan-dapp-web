export interface ChainConfig {
  id: string;
  chainId: string;
  name: string;
  chainName: string;
  rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrls: string[];
}

export const SupportChains: ChainConfig[] = [
  {
    id: "1",
    chainId: "0x1",
    name: "Ethereum",
    chainName: "Ethereum Mainnet",
    rpcUrls: ["https://gateway.tenderly.co/public/mainnet"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"]
  },
  {
    id: "11155111",
    chainId: "0xaa36a7",
    name: "Sepolia",
    chainName: "Sepolia Testnet",
    rpcUrls: ["https://0xrpc.io/sep"],
    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  {
    id: "560048",
    chainId: "0x88BB0",
    name: "Hoodi",
    chainName: "Hoodi Testnet",
    rpcUrls: ["https://0xrpc.io/hoodi"],
    nativeCurrency: { name: "HoodiETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://hoodi.etherscan.io"]
  },
  {
    id: "56",
    chainId: "0x38",
    name: "BSC",
    chainName: "Binance Smart Chain",
    rpcUrls: [
      "https://bsc-dataseed.bnbchain.org",
      "https://bsc-rpc.publicnode.com"
    ],
    nativeCurrency: { name: "Binance Coin", symbol: "BNB", decimals: 18 },
    blockExplorerUrls: ["https://bscscan.com"]
  },
  {
    id: "97",
    chainId: "0x61",
    name: "TBSC",
    chainName: "Binance Smart Chain Testnet",
    rpcUrls: ["https://bsc-testnet-rpc.publicnode.com"],
    nativeCurrency: { name: "Binance Testnet", symbol: "BNB", decimals: 18 },
    blockExplorerUrls: ["https://testnet.bscscan.com"]
  },
  {
    id: "8453",
    chainId: "0x2105",
    name: "Base",
    chainName: "Base Mainnet",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://basescan.org"]
  },
  {
    id: "84532",
    chainId: "0x14a34",
    name: "Base Sepolia",
    chainName: "Base Sepolia Testnet",
    rpcUrls: ["https://sepolia.base.org"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.basescan.org"]
  },
  {
    id: "196",
    chainId: "0xc4",
    name: "X Layer",
    chainName: "OKX X Layer",
    rpcUrls: ["https://rpc.xlayer.tech"],
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    blockExplorerUrls: ["https://www.oklink.com/x-layer"]
  }
];
