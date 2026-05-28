import { Contract } from "ethers";
import { getSignerAndChainId, getSigner } from "@/lib/wallet/GetProvider";
import faucetABI from "@/abis/evm/faucetABI.json";
import erc20ABI from "@/abis/evm/erc20ABI.json";
import { faucetConfig } from "@/config/FaucetConfig";

const getFaucetContract = async (): Promise<Contract | null> => {
  const [signer, chainId] = await getSignerAndChainId();
  if (!signer || chainId == null) return null;
  const chainConfig = faucetConfig[String(chainId)] as
    | Record<string, string>
    | undefined;
  const contractAddress = chainConfig?.faucet;
  if (!contractAddress) return null;
  return new Contract(contractAddress, faucetABI, signer);
};

const getERC20Contract = async (token: string): Promise<Contract | null> => {
  const signer = await getSigner();
  if (!signer) return null;
  return new Contract(token, erc20ABI, signer);
};

export const getERC20Decimals = async (token: string): Promise<number> => {
  try {
    const signer = await getSigner();
    if (!signer) return 0;
    const contract = new Contract(token, erc20ABI, signer);
    const decimals = await contract.decimals();
    return Number(decimals);
  } catch {
    return 0;
  }
};

export { getFaucetContract, getERC20Contract };
