import { ethers } from "ethers";
import { getSignerAndChainId, getSigner } from "@/lib/wallet/GetProvider";
import faucetABI from "@/abis/evm/faucetABI.json";
import erc20ABI from "@/abis/evm/erc20ABI.json";
import { faucetConfig } from "@/config/FaucetConfig";

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

export { getFaucetContract, getERC20Contract };
