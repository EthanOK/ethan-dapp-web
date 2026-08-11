import { ALCHEMY_KEY } from "@/config/SystemConfiguration";
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
import {
  getYunGouChainContracts,
  getDefaultYunGouChainContracts
} from "@/config/YunGouConfig";
import { parseEvmChainIdFromStored } from "@/lib/wallet/GetProvider";
import { AlchemyProvider } from "ethers";

/** Normalize a chainId argument (number | string, may be "eip155:1") to number. */
const toNumericChainId = (chainId: string | number): number | null =>
  typeof chainId === "number" ? chainId : parseEvmChainIdFromStored(chainId);

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

/** Look up a chain config by chainId (from ChainsConfig.SupportChains). */
const getChainConfigById = (chainId: number) =>
  SupportChains.find((item) => parseInt(item.id, 10) === chainId);

const getScanURL = async (): Promise<string> => {
  const chainIdStr = localStorage.getItem("chainId");
  const chainId = parseEvmChainIdFromStored(chainIdStr);
  if (chainId === null) {
    throw new Error(`Invalid chainId: ${chainIdStr}`);
  }
  const chainInfo = getChainConfigById(chainId);
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
  const chainInfo = getChainConfigById(chainId);
  const base = chainInfo?.blockExplorerUrls?.[0];
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/address/${address}`;
};

const getAlchemyProvider = async (): Promise<JsonRpcProvider | undefined> => {
  const apiKey = ALCHEMY_KEY?.trim();
  if (!apiKey) return undefined;

  const chainId = parseEvmChainIdFromStored(localStorage.getItem("chainId"));
  if (chainId === null) return undefined;
  const provider = new AlchemyProvider(chainId, apiKey);
  return provider;
};

const getYunGouAddress = async (): Promise<string | undefined> => {
  const chainId = parseEvmChainIdFromStored(localStorage.getItem("chainId"));
  if (chainId === null) return undefined;
  return getYunGouChainContracts(chainId)?.yungou2_0;
};

const getYunGouAggregatorsAddress = async (): Promise<string> => {
  const chainId = parseEvmChainIdFromStored(localStorage.getItem("chainId"));
  // Fall back to the mainnet aggregator for unknown chains (historical behavior)
  const aggregators =
    (chainId !== null
      ? getYunGouChainContracts(chainId)?.aggregators
      : undefined) ?? getDefaultYunGouChainContracts().aggregators;
  return aggregators ?? "";
};

const getYunGouAddressAndParameters = async (chainId: string | number) => {
  const id = toNumericChainId(chainId);
  // Fall back to the mainnet contract for unknown chains (historical behavior)
  const contracts =
    (id !== null ? getYunGouChainContracts(id) : undefined) ??
    getDefaultYunGouChainContracts();
  const YG_Address = contracts.yungou2_0 ?? "";
  const parameters =
    contracts.yungouOrderData === "tbsc"
      ? order_data_tbsc.parameters
      : order_data.parameters;
  return [YG_Address, parameters];
};

// order_data / order_data_tbsc from JS testdata; types relaxed for compatibility
const getYunGouAddressAndOrder = async (
  chainId: string | number
): Promise<[string, typeof order_data] | undefined> => {
  const id = toNumericChainId(chainId);
  if (id === null) return undefined;
  const contracts = getYunGouChainContracts(id);
  const YG_Address = contracts?.yungou2_0;
  if (!YG_Address) return undefined;
  const order =
    contracts.yungouOrderData === "tbsc"
      ? (order_data_tbsc as unknown as typeof order_data)
      : order_data;
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
    return `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/`;
  }
  if (Number(chainId) === 11155111) {
    return `https://eth-sepolia.g.alchemy.com/nft/v3/${ALCHEMY_KEY}/`;
  }
  return null;
}

function getAlchemy(chainId: string | number): Alchemy | null {
  if (Number(chainId) === 1) {
    return new Alchemy({
      apiKey: ALCHEMY_KEY,
      network: Network.ETH_MAINNET
    });
  }
  if (Number(chainId) === 11155111) {
    return new Alchemy({
      apiKey: ALCHEMY_KEY,
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
  getAlchemyProvider
};
