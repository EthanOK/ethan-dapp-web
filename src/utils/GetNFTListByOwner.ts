import { getAlchemyURL } from "./Utils";

export interface OwnedNftItem {
  tokenId?: string;
  [key: string]: unknown;
}

export interface GetContractsForOwnerResult {
  contracts: unknown[];
  totalCount: number;
}

export interface GetNFTListByOwnerAndContractResult {
  contract: string;
  tokenIds: string[];
  totalCount: number;
}

export const getNFTListByOwner = async (
  chainId: number,
  owner: string
): Promise<void> => {
  let pageKey: string | null = "";
  const ownedNfts: OwnedNftItem[] = [];
  const alchemyURL = getAlchemyURL(chainId);

  if (!alchemyURL) return;

  while (pageKey !== null) {
    const pageKeyStr = pageKey.length > 0 ? `&pageKey=${pageKey}` : "";
    const res = await fetch(
      `${alchemyURL}getNFTsForOwner?owner=${owner}&withMetadata=false&pageSize=100${pageKeyStr}`
    );
    const data = (await res.json()) as {
      pageKey?: string;
      ownedNfts?: OwnedNftItem[];
    };
    pageKey = data.pageKey ?? null;
    if (data.ownedNfts) ownedNfts.push(...data.ownedNfts);
  }
  console.log(ownedNfts.length);
};

export const getNFTListByOwnerAndContract = async (
  chainId: number,
  owner: string,
  contract: string
): Promise<GetNFTListByOwnerAndContractResult | null> => {
  let pageKey: string | null = "";
  const ownedNfts: OwnedNftItem[] = [];
  const tokenIds = new Set<string>();
  const alchemyURL = getAlchemyURL(chainId);

  if (alchemyURL === null) return null;

  while (pageKey !== null) {
    const pageKeyStr = pageKey.length > 0 ? `&pageKey=${pageKey}` : "";
    const res = await fetch(
      `${alchemyURL}getNFTsForOwner?owner=${owner}&withMetadata=false&pageSize=100&contractAddresses[]=${contract}${pageKeyStr}`
    );
    const data = (await res.json()) as {
      pageKey?: string;
      ownedNfts?: OwnedNftItem[];
    };
    pageKey = data.pageKey ?? null;
    if (data.ownedNfts) ownedNfts.push(...data.ownedNfts);
  }

  ownedNfts.forEach((item) => {
    if (item.tokenId) tokenIds.add(item.tokenId);
  });

  return {
    contract,
    tokenIds: Array.from(tokenIds),
    totalCount: tokenIds.size
  };
};

export const getContractsForOwner = async (
  chainId: number,
  owner: string
): Promise<GetContractsForOwnerResult | null> => {
  let pageKey: string | null = "";
  const contracts: unknown[] = [];
  const alchemyURL = getAlchemyURL(chainId);

  if (alchemyURL === null) return null;

  while (pageKey !== null) {
    const pageKeyStr = pageKey.length > 0 ? `&pageKey=${pageKey}` : "";
    const res = await fetch(
      `${alchemyURL}getContractsForOwner?owner=${owner}&pageSize=100&withMetadata=true${pageKeyStr}`
    );
    const data = (await res.json()) as {
      pageKey?: string;
      contracts?: unknown[];
    };
    pageKey = data.pageKey ?? null;
    if (data.contracts) contracts.push(...data.contracts);
  }

  return {
    contracts,
    totalCount: contracts.length
  };
};
