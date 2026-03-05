import { ethers, utils } from "ethers";
import { React_Serve_Back, main_rpc } from "../common/SystemConfiguration";

const url = React_Serve_Back;

export const getSystemData = async (): Promise<unknown[]> => {
  const requestParameters = {
    userAddress: localStorage.getItem("userAddress")
  };
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getSystemData`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Token": userToken
    },
    body: JSON.stringify(requestParameters)
  });
  const result_json = (await result.json()) as {
    code: number;
    message?: string;
    data?: unknown[];
  };
  if (result_json.code === -400) {
    alert("token 过期，请重新登陆");
    return [];
  }
  if (result_json.code === -401) {
    alert(result_json.message);
    return [];
  }
  return result_json.data ?? [];
};

export const getUserToken = async (params: unknown): Promise<unknown> => {
  const result = await fetch(`${url}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params)
  });
  return result.json();
};

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

export const getENSOfAddress = async (address: string): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getENSOfAddress`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ address })
  });
  return result.json();
};

export const getENSOfAddressTheGraph = async (
  address: string
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getENSOfAddressTheGraph`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ address })
  });
  return result.json();
};

export const getAddressOfENS = async (ens: string): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getAddressOfENS`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ ens })
  });
  return result.json();
};

export const getAddressOfENSTheGraph = async (
  ens: string
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getAddressOfENSTheGraph`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ ens })
  });
  return result.json();
};

export const getNameByTokenIdTheGraph = async (
  tokenId: string | number
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getENSByTokenIdTheGraph`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ tokenId })
  });
  return result.json();
};

export const getENSByTokenId = async (
  tokenId: string | number
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getENSByTokenId`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ tokenId })
  });
  return result.json();
};

export const getENSOfAddressByContract = async (
  address: string
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getENSOfAddressByContract`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ address })
  });
  return result.json();
};

export const getCrossChainSignature = async (
  chainId: string | number,
  ccType: string,
  amount: string | number
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getCrossChainSignature`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ chainId, ccType, amount })
  });
  return result.json();
};

export const getClaimYGIOBalance = async (
  chainId: string | number
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const result = await fetch(`${url}/api/getClaimYGIOBalance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "User-Token": userToken },
    body: JSON.stringify({ chainId })
  });
  return result.json();
};

export const getENSUniversalResolver = async (
  address: string
): Promise<{ code: number; data: string | null }> => {
  const normalizedAddress = utils.getAddress(address);
  const dnsName =
    normalizedAddress.substring(2).toLowerCase() + ".addr.reverse";
  const reverseName = utils.dnsEncode(dnsName);
  const contractABI = [
    "function reverse(bytes reverseName) view returns (string, address, address, address)"
  ];
  const contractInterface = new ethers.utils.Interface(contractABI);
  const data = contractInterface.encodeFunctionData("reverse", [reverseName]);
  const requestParameters = {
    method: "eth_call",
    params: [
      { to: "0xc0497e381f536be9ce14b0dd3817cbcae57d2f62", data },
      "latest"
    ],
    id: 44,
    jsonrpc: "2.0"
  };
  try {
    const result = await fetch(main_rpc ?? "", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestParameters)
    });
    const result_json = (await result.json()) as {
      error?: unknown;
      result?: string;
    };
    if ("error" in result_json) {
      return { code: 200, data: null };
    }
    const abi = ["string", "address", "address", "address"];
    const decodedData = ethers.utils.defaultAbiCoder.decode(
      abi,
      result_json.result ?? "0x"
    );
    return { code: 200, data: decodedData[0] as string };
  } catch {
    return { code: 200, data: null };
  }
};

export const getPriceBaseUSDT = async (): Promise<unknown> => {
  const result = await fetch(`${url}/api/getPriceBaseUSDT`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  return result.json();
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

export const getBlurLoginMessageByOpensea = async (
  userAddress: string
): Promise<{ data?: string } | null> => {
  const postURL = "https://api.pro.opensea.io/blur/auth/challenge";
  try {
    const response = await fetch(postURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: userAddress })
    });
    if (!response.ok) return null;
    const responseData = (await response.json()) as { data?: string };
    if (responseData.data?.toLowerCase() !== "success".toLowerCase())
      return null;
    return responseData;
  } catch {
    return null;
  }
};

export const getBlurLoginMessageByNFTGO = async (
  userAddress: string
): Promise<unknown> => {
  const postURL =
    "https://api.nftgo.io/api/v1/nft-aggregator/blur/auth/challenge";
  try {
    const response = await fetch(postURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: userAddress })
    });
    if (!response.ok) return null;
    const responseData = (await response.json()) as {
      errorCode?: number;
      data?: unknown;
    };
    if (responseData.errorCode !== 0) return null;
    return responseData.data;
  } catch {
    return null;
  }
};

export const getBlurAccessTokenByOpensea = async (
  requestData: unknown
): Promise<string | null> => {
  const postURL = "https://api.pro.opensea.io/blur/auth/login";
  try {
    const response = await fetch(postURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) return null;
    const responseData = (await response.json()) as {
      data?: string;
      accessToken?: string;
    };
    if (responseData.data?.toLowerCase() !== "success".toLowerCase())
      return null;
    return responseData.accessToken ?? null;
  } catch {
    return null;
  }
};

export const getBlurAccessTokenByNFTGO = async (
  requestData: unknown
): Promise<string | null> => {
  const postURL = "https://api.nftgo.io/api/v1/nft-aggregator/blur/auth/login";
  try {
    const response = await fetch(postURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData)
    });
    if (!response.ok) return null;
    const responseData = (await response.json()) as {
      errorCode?: number;
      data?: { blurAuth?: string };
    };
    if (responseData.errorCode !== 0) return null;
    return responseData.data?.blurAuth ?? null;
  } catch {
    return null;
  }
};
