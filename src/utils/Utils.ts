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
import { BigNumber, ethers, providers } from "ethers";
import { Decimal } from "decimal.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Alchemy, Network } from "alchemy-sdk";
import { SupportChains } from "../common/ChainsConfig";

const equalityStringIgnoreCase = (
  string1: string,
  string2: string
): boolean => {
  try {
    return string1.toLowerCase() === string2.toLowerCase();
  } catch {
    return false;
  }
};

const getScanURL = async (): Promise<string> => {
  const chainIdStr = localStorage.getItem("chainId");
  const chainId = parseInt(chainIdStr ?? "0", 10);
  if (!Number.isFinite(chainId)) {
    throw new Error(`Invalid chainId: ${chainIdStr}`);
  }
  const chainInfo = SupportChains.find(
    (item) => parseInt(item.id, 10) === chainId
  );
  if (!chainInfo) {
    throw new Error(`Chain info not found for chainId: ${chainId}`);
  }
  return chainInfo.blockExplorerUrls[0];
};

const getInfuraProvider = async (): Promise<
  providers.JsonRpcProvider | undefined
> => {
  const chainIdStr = localStorage.getItem("chainId");
  const chainId = parseInt(chainIdStr ?? "0", 10);
  if (chainId === 1) {
    return new providers.JsonRpcProvider(process.env.REACT_APP_MAINNET_RPC);
  }
  if (chainId === 11155111) {
    return new providers.JsonRpcProvider(process.env.REACT_APP_SEPOLIA_RPC);
  }
  return undefined;
};

const getYunGouAddress = async (): Promise<string | undefined> => {
  const chainIdStr = localStorage.getItem("chainId");
  const chainId = parseInt(chainIdStr ?? "0", 10);
  if (chainId === 1) return YunGou2_0_main;
  if (chainId === 5) return YunGou2_0_goerli;
  if (chainId === 97) return YunGou2_0_tbsc;
  if (chainId === 56) return YunGou2_0_bsc;
  return undefined;
};

const getYunGouAggregatorsAddress = async (): Promise<string> => {
  const chainIdStr = localStorage.getItem("chainId");
  let chainId = parseInt(chainIdStr ?? "0", 10);
  if (chainId === 1) return YunGouAggregators_main;
  if (chainId === 5) return YunGouAggregators_goerli;
  if (chainId === 97) return YunGouAggregators_tbsc;
  if (chainId === 56) return YunGouAggregators_bsc;
  if (chainId === 11155111) return YunGouAggregators_sepolia;
  return YunGouAggregators_main;
};

const getYunGouAddressAndParameters = async (chainId: string | number) => {
  const id = typeof chainId === "string" ? parseInt(chainId, 10) : chainId;
  let YG_Address: string;
  let parameters: unknown;
  if (id === 1) {
    YG_Address = YunGou2_0_main;
    parameters = order_data.parameters;
  } else if (id === 5) {
    YG_Address = YunGou2_0_goerli;
    parameters = order_data.parameters;
  } else if (id === 97) {
    YG_Address = YunGou2_0_tbsc;
    parameters = order_data_tbsc.parameters;
  } else if (id === 56) {
    YG_Address = YunGou2_0_tbsc;
    parameters = order_data_tbsc.parameters;
  } else if (id === 11155111) {
    YG_Address = YunGou2_0_sepolia;
    parameters = order_data.parameters;
  } else {
    YG_Address = YunGou2_0_main;
    parameters = order_data.parameters;
  }
  return [YG_Address, parameters];
};

// order_data / order_data_tbsc from JS testdata; types relaxed for compatibility
const getYunGouAddressAndOrder = async (
  chainId: string | number
): Promise<[string, typeof order_data] | undefined> => {
  const id = typeof chainId === "string" ? parseInt(chainId, 10) : chainId;
  let YG_Address: string;
  let order: typeof order_data;
  if (id === 1) {
    YG_Address = YunGou2_0_main;
    order = order_data;
  } else if (id === 5) {
    YG_Address = YunGou2_0_goerli;
    order = order_data;
  } else if (id === 97) {
    YG_Address = YunGou2_0_tbsc;
    order = order_data_tbsc as unknown as typeof order_data;
  } else if (id === 56) {
    YG_Address = YunGou2_0_tbsc;
    order = order_data_tbsc as unknown as typeof order_data;
  } else {
    return undefined;
  }
  return [YG_Address, order];
};

const isAddress = (address: string): boolean => {
  return ethers.utils.isAddress(address);
};

const isContract = async (
  provider: providers.Provider,
  address: string
): Promise<boolean> => {
  const code = await provider.getCode(address);
  return !!(code && code.length > 2);
};

const stringToArray = (string: string): string[] => {
  if (string === "[]" || string === "") return [];
  const hexStringArray = string.substring(1, string.length - 1).split(",");
  return hexStringArray.map((hexString) => hexString.trim());
};

const getDecimal = (bigNumber: ethers.BigNumber, decimals: number): number => {
  return Number(ethers.utils.formatUnits(bigNumber, decimals));
};

const getDecimalBigNumber = (
  number: string,
  decimals: number
): ethers.BigNumber => {
  return ethers.utils.parseUnits(number, decimals);
};

const getExtractAddress = (address: string | null): string => {
  const str = String(address);
  if (str === "null") return "null";
  return (
    str.substring(0, 6) + "..." + str.substring(str.length - 4, str.length)
  );
};

const utf8ToHexBytes = (str: string): string => {
  const bytes = ethers.utils.toUtf8Bytes(str);
  return ethers.utils.hexlify(bytes);
};

const caculatePriceBySqrtPriceX96 = (
  sqrtPriceX96_: string | ethers.BigNumber
): string => {
  const sqrtPriceX96 = BigNumber.from(sqrtPriceX96_);
  const sqrtPriceX96_m2 = sqrtPriceX96.mul(sqrtPriceX96).toString();
  const _X_m2_192 = BigNumber.from("2").pow(192).toString();
  const price_y_x = new Decimal(sqrtPriceX96_m2)
    .div(new Decimal(_X_m2_192))
    .toNumber();
  const price_x_y = 1 / price_y_x;
  return price_y_x + " or " + price_x_y;
};

function getAddressCreate(sender: string, nonce: number): string {
  return ethers.utils.getContractAddress({ from: sender, nonce });
}

async function getAssociatedAddress(
  mintAddress: string,
  ownerAddress: string
): Promise<string> {
  return (
    await getAssociatedTokenAddress(
      new PublicKey(mintAddress),
      new PublicKey(ownerAddress)
    )
  ).toString();
}

function getAlchemyURL(chainId: string | number): string | null {
  if (Number(chainId) === 1) {
    return `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY_V3}/`;
  }
  if (Number(chainId) === 11155111) {
    return `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_KEY_V3}/`;
  }
  return null;
}

function getAlchemy(chainId: string | number): Alchemy | null {
  if (Number(chainId) === 1) {
    return new Alchemy({
      apiKey: ALCHEMY_KEY_V3,
      network: Network.ETH_MAINNET
    });
  }
  if (Number(chainId) === 11155111) {
    return new Alchemy({
      apiKey: ALCHEMY_KEY_V3,
      network: Network.ETH_SEPOLIA
    });
  }
  return null;
}

export const normalizeFaucetConfigKeys = <T extends Record<string, string>>(
  config: Record<string, T> | Record<number, T>
): Record<string, Record<string, string>> => {
  const normalized: Record<string, Record<string, string>> = {};
  const configObj = config as Record<string, T>;
  for (const chainId of Object.keys(configObj)) {
    const original = configObj[chainId];
    const lowered: Record<string, string> = {};
    for (const key of Object.keys(original)) {
      lowered[key.toLowerCase()] = original[key];
    }
    normalized[String(chainId)] = lowered;
  }
  return normalized;
};

export const sendToWebhook = async (data: unknown): Promise<unknown> => {
  try {
    const response = await fetch(DISCORD_WEBHOOK_URL ?? "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: JSON.stringify(data, null, 4) })
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
