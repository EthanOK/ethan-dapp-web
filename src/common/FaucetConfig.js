import { normalizeFaucetConfigKeys } from "../utils/Utils";

// token name should toLowerCase
const faucetConfigRaw = {
  5: {
    // Goerli
    faucet: "0xC1f60B81c6dAb5BE517a53983708488F9978D0Eb",
    ygio: "0xd042eF5cF97c902bF8F53244F4a81ec4f8E465Ab",
    ygme: "0x28D1bC817DE02C9f105A6986eF85cB04863C3042",
    usdt: "0x965A558b312E288F5A77F851F7685344e1e73EdF"
  },
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
    ygio: "0x5Bb9dE881543594D17a7Df91D62459024c4EEf02",
    ygme: "0x709B78B36b7208f668A3823c1d1992C0805E4f4d",
    usdt: "0x590dcA422b660071F978E5A69851A18529B45415",
    wstETH: "0xa9686DAcB46cb07ab14290dAF1b0B4feeAD99366"
  }
};

export const faucetConfig = normalizeFaucetConfigKeys(faucetConfigRaw);

export const faucetTokenList = [
  { label: "YGIO", faucetAmount: 1000 },
  { label: "USDT", faucetAmount: 1000 },
  { label: "WstETH", faucetAmount: 5 }
];

export const getFaucetTokenAddress = (chainId, tokenName) => {
  const tokenKey = tokenName.toLowerCase();
  return faucetConfig[chainId]?.[tokenKey];
};
