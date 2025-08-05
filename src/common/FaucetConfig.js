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
    usdc: "0x6125c3dA36152A5e68a5AC5686A09d6244690bcf"
  }
};

export const faucetConfig = normalizeFaucetConfigKeys(faucetConfigRaw);

export const faucetTokenList = [
  // { label: "YGIO", faucetAmount: 1000 },
  { label: "USDT", faucetAmount: 1000 },
  { label: "USDC", faucetAmount: 1000 },
  { label: "stETH", faucetAmount: 100 }
];

export const getFaucetTokenAddress = (chainId, tokenName) => {
  const tokenKey = tokenName.toLowerCase();
  return faucetConfig[chainId]?.[tokenKey];
};
