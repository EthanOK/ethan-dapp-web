import { getBlurCalldata } from "./GetBlurCallData";
import { getSignerAndChainId } from "./GetProvider";
import { addSuffixOfTxData } from "./HandleTxData";
import { suffixOfYunGou } from "../common/SystemConfiguration";
import { getScanURL } from "./Utils";

type BlurTxData = {
  to: string;
  data: string;
  value: string;
};

type TxLike = {
  hash: string;
};

export const onlyBuyBlurNFT = async (
  contract: string,
  tokenId: string | number,
  userAddress: string,
  blurAccessToken: string
): Promise<[string | null, TxLike | null]> => {
  const [signer, chainId] = await getSignerAndChainId();

  if (!signer || chainId !== 1) {
    alert("Please switch to Mainnet");
    return [null, null];
  }

  const blurData = (await getBlurCalldata(
    contract,
    tokenId,
    userAddress,
    blurAccessToken
  )) as BlurTxData | null | 0;

  if (blurData === null) {
    alert("Blur Order Data is NULL");
    return [null, null];
  } else if (blurData === 0) {
    return [null, null];
  }

  try {
    let inputData = blurData.data;
    if (inputData.endsWith("ff738719")) {
      inputData = inputData.slice(0, -8);
    }

    const latestData = addSuffixOfTxData(inputData, suffixOfYunGou);

    const tx = await signer.sendTransaction({
      to: blurData.to,
      data: latestData,
      value: blurData.value
    } as any);

    if (!tx) {
      return [null, null];
    }

    console.log("fulfillBasicOrder... please await");
    const etherscanURL = await getScanURL();
    const baseUrl = etherscanURL ?? "";
    console.log(`Please See: ${baseUrl}/tx/${tx.hash}`);
    const message_ = `${baseUrl}/tx/${tx.hash}`;

    return [message_, tx];
  } catch (error) {
    console.log(error);
    alert("User refuses transaction");
    return [null, null];
  }
};
