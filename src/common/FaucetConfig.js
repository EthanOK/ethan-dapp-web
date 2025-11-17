import { normalizeFaucetConfigKeys } from "../utils/Utils";

// token name should toLowerCase
const faucetConfigRaw = {
  97: {
    // TBSC
    faucet: "0x1ef1b1405dCda2375Fc8430DE5560016F0D8DBe0",
    ygio: "0x0Fa4640F99f876D78Fc964AFE0DD6649e7C23c4f",
    ygme: "0xDb6c494BE6Aae80cc042f9CDA24Ce573aD163A46",
    usdt: "0xa52770d379e6276e8f798143032442b29D47b567"
  },
  11155111: {
    // Sepolia
    faucet: "0xaD1dA61611ca6764c8C87806Bb39C66AF212F560",
    // ygio: "0x5Bb9dE881543594D17a7Df91D62459024c4EEf02",
    ygme: "0x709B78B36b7208f668A3823c1d1992C0805E4f4d",
    usdt: "0x590dcA422b660071F978E5A69851A18529B45415",
    stETH: "0x1d1d95791Dcc3fa1714Be0c8D81B81b6e84B3C14",
    usdc: "0x6125c3dA36152A5e68a5AC5686A09d6244690bcf",
    BRIC: "0x5e2D167F44Ff91D5e541F0550dBd27bc01f94755",
    USDe: "0xD65ca3f40DdD89f8A702811CFb0267d14B47d0a2",
    "TSLA-B": "0xFB9B3eB69Ed3aba67ACE2f5aec1FFbFC0b4bE8A1",
    "NVDA-B": "0xE0fED50FC039aE3A0F83C4c72EB592AE5BaD4062",
    "APPL-B": "0xfBFaDc2405640350a79307C406df832cd09CAAfB",
    "META-B": "0xa5955BB625Da796fC0Af249aBCddEf2cC8Cd48cD"
  },
  560048: {
    // Hoodi
    faucet: "0x88272A2F9481A18B648A03a076FbfaB5381e31D2",
    stETH: "0xC291F277f3Bc02fbe69D6d940AeD674E077e5749",
    USDe: "0x9558f8e7bd117741d2fae0c0d7bd6d542a4d7cdb"
  }
};

export const faucetConfig = normalizeFaucetConfigKeys(faucetConfigRaw);

// 按链分组的代币列表
export const faucetTokenListByChain = {
  11155111: [
    // Sepolia
    { label: "USDT", faucetAmount: 100000 },
    { label: "USDC", faucetAmount: 100000 },
    { label: "stETH", faucetAmount: 10000 },
    { label: "USDe", faucetAmount: 100000 },
    { label: "BRIC", faucetAmount: 10000 },
    { label: "TSLA-B", faucetAmount: 10000 },
    { label: "NVDA-B", faucetAmount: 10000 },
    { label: "APPL-B", faucetAmount: 10000 },
    { label: "META-B", faucetAmount: 10000 }
  ],
  560048: [
    // Hoodi
    { label: "stETH", faucetAmount: 10000 },
    { label: "USDe", faucetAmount: 100000 }
  ]
};

// 兼容旧代码，保留默认的 Sepolia 代币列表
export const faucetTokenList = faucetTokenListByChain[11155111];

// 根据链ID获取代币列表
export const getFaucetTokenListByChain = (chainId) => {
  return faucetTokenListByChain[chainId] || [];
};

export const faucetChainIdList = [11155111, 560048];

// 获取链名称
export const getChainName = (chainId) => {
  const chainNames = {
    11155111: "Sepolia",
    560048: "Hoodi"
  };
  return chainNames[chainId] || `Chain ${chainId}`;
};

export const getFaucetTokenAddress = (chainId, tokenName) => {
  const tokenKey = tokenName.toLowerCase();
  return faucetConfig[chainId]?.[tokenKey];
};
