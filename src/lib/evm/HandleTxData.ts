import { ethers } from "ethers";
import type { Signer } from "ethers";
import type { providers } from "ethers";
import { equalityStringIgnoreCase } from "@/lib/shared/Utils";
import { toast } from "sonner";

type WalletError = { code?: number | string; message?: string };

const addSuffixOfTxData = async (
  inputData: string,
  suffixData: string
): Promise<string> => {
  return ethers.utils.hexConcat([inputData, suffixData]);
};

const getNewTx = async (
  signer: Signer,
  contractAddress: string,
  inputData: string,
  suffixData: string,
  value_wei: ethers.BigNumberish
): Promise<providers.TransactionResponse | null> => {
  try {
    const newTXData = ethers.utils.hexConcat([inputData, suffixData]);
    const tx = await signer.sendTransaction({
      to: contractAddress,
      data: newTXData,
      value: value_wei
    });
    return tx;
  } catch (error: unknown) {
    const e = error as WalletError;
    if (e.code === -32000) {
      toast.error(e.message ?? "Transaction failed");
    } else if (
      equalityStringIgnoreCase(String(e.code ?? ""), "ACTION_REJECTED")
    ) {
      toast.error("User Rejected Transaction");
    }
    return null;
  }
};

export { addSuffixOfTxData, getNewTx };
