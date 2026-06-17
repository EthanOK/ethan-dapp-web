import { Contract, Interface, type TransactionResponse } from "ethers";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";
import { signEIP712Message } from "@/lib/signing/SignFunc";
import YGMEABI from "@/abis/evm/YGMEABI.json";
import BatchTransferTokenABI from "@/abis/evm/BatchTransferTokenABI.json";
import {
  DefaultChainId,
  batchTransferToken_sepolia
} from "@/config/SystemConfiguration";
import {
  getScanURL,
  equalityStringIgnoreCase,
  getInfuraProvider
} from "@/lib/shared/Utils";
import { faucetConfig } from "@/config/FaucetConfig";

function getSwapCallData(account: string, amount: string): string {
  const YGMEInterface = new Interface(YGMEABI);
  return YGMEInterface.encodeFunctionData("swap", [
    account,
    "0x0000000000000000000000000000000000000000",
    amount
  ]);
}

export const mintNFT = async (
  mintAmount: string
): Promise<[string | null, TransactionResponse | null]> => {
  const etherscanURL = await getScanURL();
  await getInfuraProvider();
  const [signer, chainId] = await getSignerAndChainId();
  if (!signer || chainId == null) return [null, null];

  const defaultIdNum = DefaultChainId != null ? Number(DefaultChainId) : 0;
  if (chainId == null || Number(chainId) !== defaultIdNum) {
    alert("only sepolia");
    return [null, null];
  }

  const contractAddress = batchTransferToken_sepolia;
  const chainConfig = faucetConfig[String(chainId)] as
    | Record<string, string>
    | undefined;
  const ygme = chainConfig?.ygme;
  if (!ygme) return [null, null];

  try {
    const batchTransfer = new Contract(
      contractAddress,
      BatchTransferTokenABI,
      signer
    );
    const account = await signer.getAddress();
    const calls = [
      { target: ygme, callData: getSwapCallData(account, mintAmount) }
    ];
    const preparetx = await batchTransfer.aggregate.populateTransaction(calls);
    const tx = await signer.sendTransaction({
      to: contractAddress,
      data: preparetx.data
    });
    const message_ = `${etherscanURL}/tx/${tx.hash}`;
    return [message_, tx];
  } catch (error: unknown) {
    console.log(error);
    const e = error as { code?: string; message?: string };
    if (equalityStringIgnoreCase(String(e?.code ?? ""), "ACTION_REJECTED")) {
      alert("User Rejected Transaction");
    }
    if (Number(e?.code) === -32000) {
      alert(e?.message);
    }
    return [null, null];
  }
};

export const signEIP712MessageMintNft = async (
  mintAmount: string
): Promise<[string | null, TransactionResponse | null]> => {
  try {
    const etherscanURL = await getScanURL();
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return [null, null];

    const defaultIdNum = DefaultChainId != null ? Number(DefaultChainId) : 0;
    if (chainId == null || Number(chainId) !== defaultIdNum) {
      console.log("only sepolia");
      return [null, null];
    }

    const signature = await signEIP712Message(signer, chainId);
    if (signature === null) return [null, null];

    const contractAddress = batchTransferToken_sepolia;
    const chainConfig = faucetConfig[String(chainId)] as
      | Record<string, string>
      | undefined;
    const ygme = chainConfig?.ygme;
    if (!ygme) return [null, null];

    const batchTransfer = new Contract(
      contractAddress,
      BatchTransferTokenABI,
      signer
    );
    const tx = await batchTransfer.aggregate([
      {
        target: ygme,
        callData: getSwapCallData(await signer.getAddress(), mintAmount)
      }
    ]);
    const message_ = `${etherscanURL}/tx/${tx.hash}`;
    return [message_, tx];
  } catch (error: unknown) {
    console.log(error);
    const e = error as { code?: string; message?: string };
    if (equalityStringIgnoreCase(String(e?.code ?? ""), "ACTION_REJECTED")) {
      alert("User Rejected Transaction");
    }
    if (Number(e?.code) === -32000) {
      alert(e?.message);
    }
    return [null, null];
  }
};
