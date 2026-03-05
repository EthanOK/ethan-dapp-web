import { ethers } from "ethers";
import type { Signer } from "ethers";
import { getSignerAndChainId, getSigner } from "./GetProvider";
import faucetABI from "../contracts/faucetABI.json";
import erc20ABI from "../contracts/erc20ABI.json";
import erc721ABI from "../contracts/erc721A.json";
import crossChainABI from "../contracts/crossChainABI.json";
import { faucetConfig } from "../common/FaucetConfig";

const getContract = async (
  contractAddress: string,
  abi: ethers.ContractInterface,
  signer: Signer
): Promise<ethers.Contract> => {
  return new ethers.Contract(contractAddress, abi, signer);
};

const getFaucetContract = async (): Promise<ethers.Contract | null> => {
  const [signer, chainId] = await getSignerAndChainId();
  if (!signer || chainId == null) return null;
  const chainConfig = faucetConfig[String(chainId)] as
    | Record<string, string>
    | undefined;
  const contractAddress = chainConfig?.faucet;
  if (!contractAddress) return null;
  return new ethers.Contract(
    contractAddress,
    faucetABI as ethers.ContractInterface,
    signer
  );
};

const getERC20Contract = async (
  token: string
): Promise<ethers.Contract | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  return new ethers.Contract(
    token,
    erc20ABI as ethers.ContractInterface,
    signer
  );
};

export const getERC20Decimals = async (token: string): Promise<number> => {
  try {
    const signer = await getSigner();
    if (!signer) return 0;
    const contract = new ethers.Contract(
      token,
      erc20ABI as ethers.ContractInterface,
      signer
    );
    const decimals = await contract.decimals();
    return Number(decimals);
  } catch {
    return 0;
  }
};

const getERC721Contract = async (
  token: string
): Promise<ethers.Contract | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  return new ethers.Contract(
    token,
    erc721ABI as ethers.ContractInterface,
    signer
  );
};

const getCrossChainContract = async (
  token: string
): Promise<ethers.Contract | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  return new ethers.Contract(
    token,
    crossChainABI as ethers.ContractInterface,
    signer
  );
};

export {
  getContract,
  getFaucetContract,
  getERC20Contract,
  getCrossChainContract,
  getERC721Contract
};
