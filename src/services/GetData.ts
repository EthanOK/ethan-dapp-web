import { AlchemyProvider } from "ethers";
import { React_Serve_Back, ALCHEMY_KEY } from "@/config/SystemConfiguration";
import { getReadonlyProviderForChain } from "@/lib/wallet/GetProvider";

const url = React_Serve_Back;

export const getOrderHashSignatureOpenSea = async (
  chainId: string | number,
  contract: string,
  tokenId: string | number
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const requestParameters = { chainId, tokenAddress: contract, tokenId };
  const result = await fetch(`${url}/api/getOrderHashSignatureOpenSea`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify(requestParameters)
  });
  return result.json();
};

export const getENSByAddress = async (
  address: string
): Promise<{ code: number; data: string | null }> => {
  const apiKey = ALCHEMY_KEY?.trim();

  try {
    const provider = apiKey
      ? new AlchemyProvider(1, apiKey)
      : getReadonlyProviderForChain(1);
    if (!provider) return { code: 200, data: null };

    const name = await provider.lookupAddress(address);
    return { code: 200, data: name };
  } catch {
    return { code: 200, data: null };
  }
};

export interface ENSByNameResult {
  address: string | null;
  expirationDate: string | null;
  createdDate: string | null;
}

export const getAddressByENS = async (
  ens: string
): Promise<{
  code: number;
  data: ENSByNameResult | null;
  message?: string;
}> => {
  const apiKey = ALCHEMY_KEY?.trim();

  try {
    const provider = apiKey
      ? new AlchemyProvider(1, apiKey)
      : getReadonlyProviderForChain(1);
    if (!provider)
      return { code: 500, message: "No provider available", data: null };

    const [address, metaResponse] = await Promise.all([
      provider.resolveName(ens),
      fetch(`${ENS_METADATA_BASE}/${ens}`).catch(() => null)
    ]);

    if (!address) return { code: 200, data: null };

    let expirationDate: string | null = null;
    let createdDate: string | null = null;
    if (metaResponse && (metaResponse as Response).ok) {
      const metadata = (await (
        metaResponse as Response
      ).json()) as ENSMetadataResponse;
      const expAttr = metadata.attributes?.find(
        (a) => a.trait_type === "Expiration Date"
      );
      const createdAttr = metadata.attributes?.find(
        (a) => a.trait_type === "Created Date"
      );
      expirationDate = expAttr
        ? new Date(expAttr.value as number).toLocaleDateString("zh-CN")
        : null;
      createdDate = createdAttr
        ? new Date(createdAttr.value as number).toLocaleDateString("zh-CN")
        : null;
    }

    return { code: 200, data: { address, expirationDate, createdDate } };
  } catch {
    return { code: 200, data: null };
  }
};

const ENS_METADATA_BASE =
  "https://metadata.ens.domains/mainnet/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85";

type ENSMetadataResponse = {
  name?: string;
  attributes?: Array<{ trait_type: string; value: unknown }>;
};

export interface ENSByTokenIdResult {
  name: string | null;
  expirationDate: string | null;
}

export const getENSByTokenId = async (
  tokenId: string | number
): Promise<{ code: number; data: ENSByTokenIdResult | null }> => {
  try {
    const url = `${ENS_METADATA_BASE}/${tokenId}`;
    const response = await fetch(url);
    if (!response.ok) return { code: 200, data: null };
    const metadata = (await response.json()) as ENSMetadataResponse;
    const name = metadata.name ?? null;
    const expAttr = metadata.attributes?.find(
      (a) => a.trait_type === "Expiration Date"
    );
    const expirationDate = expAttr
      ? new Date(expAttr.value as number).toLocaleDateString("zh-CN")
      : null;
    return { code: 200, data: { name, expirationDate } };
  } catch {
    return { code: 200, data: null };
  }
};

export const getPriceBaseUSDTByBinance = async (): Promise<{
  code: number;
  data: { ethPrice: string };
}> => {
  const result = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT",
    { method: "GET" }
  );
  const result_json = (await result.json()) as { price: string };
  return { code: 200, data: { ethPrice: result_json.price } };
};
