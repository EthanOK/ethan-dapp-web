import {
  YunGou2_0_main,
  YunGou2_0_goerli,
  YunGou2_0_tbsc,
  YunGou2_0_bsc,
  YunGouAggregators_bsc,
  YunGouAggregators_main,
  YunGouAggregators_tbsc,
  YunGouAggregators_goerli,
  ALCHEMY_KEY_V3,
  YunGou2_0_sepolia,
  YunGouAggregators_sepolia,
  DISCORD_WEBHOOK_URL
} from "../common/SystemConfiguration";
import { order_data, order_data_tbsc } from "../testdata/orderdata_yungou";
import { BigNumber, ethers, providers, utils } from "ethers";
import { Decimal } from "decimal.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Alchemy, Network } from "alchemy-sdk";
import { SupportChains } from "../common/ChainsConfig";

const equalityStringIgnoreCase = (string1, string2) => {
  try {
    if (string1.toLowerCase() === string2.toLowerCase()) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

const getScanURL = async () => {
  let chainId = localStorage.getItem("chainId");
  chainId = parseInt(chainId);

  const chainInfo = SupportChains.find(
    (item) => parseInt(item.chainId) === chainId
  );

  if (!chainInfo) {
    throw new Error(`Chain info not found for chainId: ${chainId}`);
  }

  let scanurl = chainInfo?.blockExplorerUrls[0];

  return scanurl;
};

const getInfuraProvider = async () => {
  let chainId = localStorage.getItem("chainId");
  chainId = parseInt(chainId);
  let provider;
  if (chainId === 1) {
    provider = new providers.JsonRpcProvider(process.env.REACT_APP_MAINNET_RPC);
  } else if (chainId === 11155111) {
    provider = new providers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC);
  }
  return provider;
};

const getYunGouAddress = async () => {
  let chainId = localStorage.getItem("chainId");
  chainId = parseInt(chainId);
  let address;
  if (chainId === 1) {
    address = YunGou2_0_main;
  } else if (chainId === 5) {
    address = YunGou2_0_goerli;
  } else if (chainId === 97) {
    address = YunGou2_0_tbsc;
  } else if (chainId === 56) {
    address = YunGou2_0_bsc;
  }
  return address;
};

const getYunGouAggregatorsAddress = async () => {
  let chainId = localStorage.getItem("chainId");
  chainId = parseInt(chainId);
  let address;
  if (chainId === 1) {
    address = YunGouAggregators_main;
  } else if (chainId === 5) {
    address = YunGouAggregators_goerli;
  } else if (chainId === 97) {
    address = YunGouAggregators_tbsc;
  } else if (chainId === 56) {
    address = YunGouAggregators_bsc;
  } else if (chainId === 11155111) {
    address = YunGouAggregators_sepolia;
  } else {
    address = YunGouAggregators_main;
  }
  return address;
};

const getYunGouAddressAndParameters = async (chainId) => {
  let YG_Address;
  let parameters;
  chainId = parseInt(chainId);
  if (chainId === 1) {
    YG_Address = YunGou2_0_main;
    parameters = order_data.parameters;
  } else if (chainId === 5) {
    YG_Address = YunGou2_0_goerli;
    parameters = order_data.parameters;
  } else if (chainId === 97) {
    YG_Address = YunGou2_0_tbsc;
    parameters = order_data_tbsc.parameters;
  } else if (chainId === 56) {
    YG_Address = YunGou2_0_tbsc;
    parameters = order_data_tbsc.parameters;
  } else if (chainId === 11155111) {
    YG_Address = YunGou2_0_sepolia;
    parameters = order_data.parameters;
  } else {
    YG_Address = YunGou2_0_main;
    parameters = order_data.parameters;
  }
  return [YG_Address, parameters];
};
const getYunGouAddressAndOrder = async (chainId) => {
  let YG_Address;
  let order;
  chainId = parseInt(chainId);
  if (chainId === 1) {
    YG_Address = YunGou2_0_main;
    order = order_data;
  } else if (chainId === 5) {
    YG_Address = YunGou2_0_goerli;
    order = order_data;
  } else if (chainId === 97) {
    YG_Address = YunGou2_0_tbsc;
    order = order_data_tbsc;
  } else if (chainId === 56) {
    YG_Address = YunGou2_0_tbsc;
    order = order_data_tbsc;
  }
  return [YG_Address, order];
};
const isAddress = (address) => {
  return utils.isAddress(address);
};

const isContract = async (provider, address) => {
  // 判断一个地址是不是合约地址
  const code = await provider.getCode(address);
  return code.length > 2 ? true : false;
};

// 将一个字符串解池化为一个数组 “[1,2,3]” => [1,2,3]

const stringToArray = (string) => {
  if (string === "[]" || string === "") return [];
  const hexStringArray = string.substring(1, string.length - 1).split(",");
  const stringArray = hexStringArray.map((hexString) => {
    return hexString.trim(); // 去掉前后的空格
  });
  return stringArray;
};

const getDecimal = (bigNumber, decimals) => {
  return Number(ethers.utils.formatUnits(bigNumber, decimals));
};

const getDecimalBigNumber = (number, decimals) => {
  return ethers.utils.parseUnits(number, decimals);
};
// 将一个合约地址保留前4与后4位

const getExtractAddress = (address) => {
  let str = String(address);
  if (str === "null") {
    return "null";
  }
  return (
    str.substring(0, 6) + "..." + str.substring(str.length - 4, str.length)
  );
};

// Convert UTF-8 to bytes string
const utf8ToHexBytes = (str) => {
  const bytes = ethers.utils.toUtf8Bytes(str);

  const hexString = ethers.utils.hexlify(bytes);
  return hexString;
};

const caculatePriceBySqrtPriceX96 = (sqrtPriceX96_) => {
  let sqrtPriceX96 = BigNumber.from(sqrtPriceX96_);
  let sqrtPriceX96_m2 = sqrtPriceX96.mul(sqrtPriceX96).toString();
  let _X_m2_192 = BigNumber.from("2").pow(192).toString();
  // console.log(new Decimal(sqrtPriceX96_m2));
  let price_y_x = new Decimal(sqrtPriceX96_m2)
    .div(new Decimal(_X_m2_192))
    .toNumber();
  console.log(typeof price_y_x);
  let price_x_y = 1 / price_y_x;
  console.log(typeof price_x_y);
  return price_y_x + " or " + price_x_y;
};

function getAddressCreate(sender, nonce) {
  // from + nonce
  let address = ethers.utils.getContractAddress({ from: sender, nonce: nonce });
  return address;
}

async function getAssociatedAddress(mintAddress, ownerAddress) {
  return (
    await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(ownerAddress)
    )
  ).toString();
}

function getAlchemyURL(chainId) {
  if (Number(chainId) === 1) {
    return `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY_V3}/`;
  } else if (Number(chainId) === 11155111) {
    return `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_KEY_V3}/`;
  }
  return null;
}
function getAlchemy(chainId) {
  if (Number(chainId) === 1) {
    return new Alchemy({
      apiKey: ALCHEMY_KEY_V3,
      network: Network.ETH_MAINNET
    });
  } else if (Number(chainId) === 11155111) {
    return new Alchemy({
      apiKey: ALCHEMY_KEY_V3,
      network: Network.ETH_SEPOLIA
    });
  }
  return null;
}

export const normalizeFaucetConfigKeys = (config) => {
  const normalized = {};

  for (const chainId in config) {
    const original = config[chainId];
    const lowered = {};

    for (const key in original) {
      lowered[key.toLowerCase()] = original[key];
    }

    normalized[chainId] = lowered;
  }

  return normalized;
};

export const sendToWebhook = async (data) => {
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: JSON.stringify(data, null, 4)
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Webhook发送失败:", error);
    return null;
  }
};

export {
  equalityStringIgnoreCase,
  getScanURL,
  getYunGouAddress,
  getYunGouAddressAndParameters,
  getYunGouAddressAndOrder,
  isAddress,
  stringToArray,
  getYunGouAggregatorsAddress,
  getDecimal,
  getDecimalBigNumber,
  getExtractAddress,
  utf8ToHexBytes,
  caculatePriceBySqrtPriceX96,
  getAddressCreate,
  getAssociatedAddress,
  isContract,
  getAlchemyURL,
  getAlchemy,
  getInfuraProvider
};
