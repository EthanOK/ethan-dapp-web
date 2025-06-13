export const SupportChains = [
  {
    id: "1",
    chainId: "0x1",
    name: "Ethereum",
    chainName: "Ethereum Mainnet",
    rpcUrls: ["https://rpc.ankr.com/eth"],
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://etherscan.io"]
  },
  {
    id: "11155111",
    chainId: "0xaa36a7",
    name: "Sepolia",
    chainName: "Sepolia Testnet",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  {
    id: "56",
    chainId: "0x38",
    name: "BSC",
    chainName: "Binance Smart Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    nativeCurrency: { name: "Binance Coin", symbol: "BNB", decimals: 18 },
    blockExplorerUrls: ["https://bscscan.com"]
  },
  {
    id: "97",
    chainId: "0x61",
    name: "TBSC",
    chainName: "Binance Smart Chain Testnet",
    rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
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
    id: "196",
    chainId: "0xc4",
    name: "X Layer",
    chainName: "OKX X Layer",
    rpcUrls: ["https://rpc.xlayer.tech"],
    nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
    blockExplorerUrls: ["https://www.oklink.com/x-layer"]
  }
];

export const faucetConfig = {
  5: {
    // Goerli
    faucet: "0xC1f60B81c6dAb5BE517a53983708488F9978D0Eb",
    ygio: "0xd042eF5cF97c902bF8F53244F4a81ec4f8E465Ab",
    yulp: "0x333FA70Aaf2a9B4979EB59bcfF2B2f846DBD8DE3",
    ygme: "0x28D1bC817DE02C9f105A6986eF85cB04863C3042",
    usdt: "0x965A558b312E288F5A77F851F7685344e1e73EdF"
  },
  97: {
    // TBSC
    faucet: "0x1ef1b1405dCda2375Fc8430DE5560016F0D8DBe0",
    ygio: "0x0Fa4640F99f876D78Fc964AFE0DD6649e7C23c4f",
    yulp: "0x21DEf0EeF658237579f40603164Eb86c3453ad97",
    ygme: "0xDb6c494BE6Aae80cc042f9CDA24Ce573aD163A46",
    usdt: "0xa52770d379e6276e8f798143032442b29D47b567"
  },
  11155111: {
    // Sepolia
    faucet: "0xaD1dA61611ca6764c8C87806Bb39C66AF212F560",
    ygio: "0x5Bb9dE881543594D17a7Df91D62459024c4EEf02",
    yulp: "0x333FA70Aaf2a9B4979EB59bcfF2B2f846DBD8DE3",
    ygme: "0x709B78B36b7208f668A3823c1d1992C0805E4f4d",
    usdt: "0x590dcA422b660071F978E5A69851A18529B45415",
    wsteth: "0xa9686DAcB46cb07ab14290dAF1b0B4feeAD99366"
  }
};

export const getFaucetTokenAddress = (chainId, tokenName) => {
  const tokenKey = tokenName.toLowerCase();
  return faucetConfig[chainId]?.[tokenKey];
};
