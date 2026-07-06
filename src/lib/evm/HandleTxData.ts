import {
  concat,
  type BigNumberish,
  type Signer,
  type TransactionResponse
} from "ethers";
import { equalityStringIgnoreCase } from "@/lib/shared/Utils";
import { toast } from "sonner";
import { tGlobal } from "@/i18n";

type WalletError = { code?: number | string; message?: string };

const addSuffixOfTxData = async (
  inputData: string,
  suffixData: string
): Promise<string> => {
  return concat([inputData, suffixData]);
};

const getNewTx = async (
  signer: Signer,
  contractAddress: string,
  inputData: string,
  suffixData: string,
  value_wei: BigNumberish
): Promise<TransactionResponse | null> => {
  try {
    const newTXData = concat([inputData, suffixData]);
    const tx = await signer.sendTransaction({
      to: contractAddress,
      data: newTXData,
      value: value_wei
    });
    return tx;
  } catch (error: unknown) {
    const e = error as WalletError;
    if (e.code === -32000) {
      toast.error(e.message ?? tGlobal("common.txFailed"));
    } else if (
      equalityStringIgnoreCase(String(e.code ?? ""), "ACTION_REJECTED")
    ) {
      toast.error(tGlobal("common.txRejected"));
    }
    return null;
  }
};

export { addSuffixOfTxData, getNewTx };
