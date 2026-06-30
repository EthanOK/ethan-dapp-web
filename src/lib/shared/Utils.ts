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
  main_rpc,
  sepolia_rpc
} from "@/config/SystemConfiguration";
import { order_data, order_data_tbsc } from "@/fixtures/OrderDataYungou";
import {
  formatUnits,
  getCreateAddress,
  hexlify,
  isAddress,
  JsonRpcProvider,
  parseUnits,
  toUtf8Bytes,
  type Provider
} from "ethers";
import { Decimal } from "decimal.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { Alchemy, Network } from "alchemy-sdk";
import { SupportChains } from "@/config/ChainsConfig";

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

const getScanTxURL = async (txHash: string): Promise<string> => {
  const base = (await getScanURL()).replace(/\/$/, "");
  return `${base}/tx/${txHash}`;
};

const getScanAddressURL = (chainId: number, address: string): string => {
  const chainInfo = SupportChains.find(
    (item) => parseInt(item.id, 10) === chainId
  );
  const base = chainInfo?.blockExplorerUrls?.[0];
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/address/${address}`;
};

const getInfuraProvider = async (): Promise<JsonRpcProvider | undefined> => {
  const chainIdStr = localStorage.getItem("chainId");
  const chainId = parseInt(chainIdStr ?? "0", 10);
  if (chainId === 1) {
    return new JsonRpcProvider(main_rpc);
  }
  if (chainId === 11155111) {
    return new JsonRpcProvider(sepolia_rpc);
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

const checkIsAddress = (address: string): boolean => {
  return isAddress(address);
};

const isContract = async (
  provider: Provider,
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

const getDecimal = (value: bigint, decimals: number): number => {
  return Number(formatUnits(value, decimals));
};

const getDecimalBigNumber = (number: string, decimals: number): bigint => {
  return parseUnits(number, decimals);
};

const getExtractAddress = (address: string | null): string => {
  const str = String(address);
  if (str === "null") return "null";
  return (
    str.substring(0, 6) + "..." + str.substring(str.length - 4, str.length)
  );
};

const utf8ToHexBytes = (str: string): string => {
  return hexlify(toUtf8Bytes(str));
};

const caculatePriceBySqrtPriceX96 = (
  sqrtPriceX96_: string | bigint
): string => {
  const sqrtPriceX96 = BigInt(sqrtPriceX96_);
  const sqrtPriceX96_m2 = (sqrtPriceX96 * sqrtPriceX96).toString();
  const _X_m2_192 = (2n ** 192n).toString();
  const price_y_x = new Decimal(sqrtPriceX96_m2)
    .div(new Decimal(_X_m2_192))
    .toNumber();
  const price_x_y = 1 / price_y_x;
  return price_y_x + " or " + price_x_y;
};

function getAddressCreate(sender: string, nonce: number): string {
  return getCreateAddress({ from: sender, nonce });
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

export {
  equalityStringIgnoreCase,
  getScanURL,
  getScanTxURL,
  getScanAddressURL,
  getYunGouAddress,
  getYunGouAddressAndParameters,
  getYunGouAddressAndOrder,
  checkIsAddress as isAddress,
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
