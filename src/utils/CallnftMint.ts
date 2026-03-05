import { getSignerAndChainId } from "./GetProvider";
import { ethers } from "ethers";
import { signEIP712Message } from "./SignFunc";
import YGMEABI from "../contracts/YGMEABI.json";
import BatchTransferTokenABI from "../contracts/BatchTransferTokenABI.json";
import {
  DefaultChainId,
  batchTransferToken_sepolia
} from "../common/SystemConfiguration";
import {
  getScanURL,
  equalityStringIgnoreCase,
  getInfuraProvider
} from "./Utils";
import { faucetConfig } from "../common/FaucetConfig";

function getSwapCallData(account: string, amount: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const YGMEInterface = new ethers.utils.Interface(YGMEABI as any);
  return YGMEInterface.encodeFunctionData("swap", [
    account,
    "0x0000000000000000000000000000000000000000",
    amount
  ]);
}

export const mintNFT = async (
  mintAmount: string
): Promise<[string | null, ethers.ContractTransaction | null]> => {
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
    const batchTransfer = new ethers.Contract(
      contractAddress,
      BatchTransferTokenABI as ethers.ContractInterface,
      signer
    );
    const account = await signer.getAddress();
    const calls = [
      { target: ygme, callData: getSwapCallData(account, mintAmount) }
    ];
    const preparetx = await batchTransfer.populateTransaction.aggregate(calls);
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
): Promise<[string | null, ethers.ContractTransaction | null]> => {
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

    const batchTransfer = new ethers.Contract(
      contractAddress,
      BatchTransferTokenABI as ethers.ContractInterface,
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
