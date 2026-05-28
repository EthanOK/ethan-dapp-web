import { getSignerAndAccountAndChainId } from "./GetProvider";
import { ethers, BigNumber } from "ethers";
import type { Contract, providers } from "ethers";
import usdtabi from "../contracts/usdtABI.json";
import luckyBabyabi from "../contracts/luckyBabyABI.json";
import { getScanURL, equalityStringIgnoreCase } from "./Utils";

const luckyBabyAddress = "0x66fD5106a5Af336CE81fd38A5AB2FFFD9bCD1C8c";

type WalletError = {
  code?: number | string;
  message?: string;
  reason?: string;
  error?: { code?: number; message?: string };
};

type TxResult = [string | null, providers.TransactionResponse | null];

const parseWalletError = (error: unknown): string | undefined => {
  const e = error as WalletError;
  if (equalityStringIgnoreCase(String(e.code ?? ""), "ACTION_REJECTED")) {
    return "User Reject Transaction";
  }
  if (e.code === -32000) {
    return e.message;
  }
  if (e.error?.code === -32603) {
    return e.error.message;
  }
  if (equalityStringIgnoreCase(String(e.code ?? ""), "CALL_EXCEPTION")) {
    return e.reason;
  }
  return undefined;
};

const participate = async (count: number): Promise<TxResult> => {
  if (count === 0) {
    alert("count must be greater than 0");
    return [null, null];
  }
  const etherscanURL = await getScanURL();
  const [signer, account, chainId] = await getSignerAndAccountAndChainId();

  if (!signer || !account || chainId !== 5) {
    if (chainId !== 5) {
      console.log("only goerli");
      alert("only goerli");
    }
    return [null, null];
  }

  const luckyBaby = new ethers.Contract(
    luckyBabyAddress,
    luckyBabyabi,
    signer
  ) as Contract & {
    currentIssueId(): Promise<BigNumber>;
    issueDatas(issueId: BigNumber): Promise<{
      openState: boolean;
      payToken: { token: string; amount: BigNumber };
    }>;
    getCountRemainOfAccount(
      account: string,
      issueId: BigNumber
    ): Promise<BigNumber>;
    participate(
      issueId: BigNumber,
      count: number
    ): Promise<providers.TransactionResponse>;
  };

  const currentIssueId = await luckyBaby.currentIssueId();
  const issueData = await luckyBaby.issueDatas(currentIssueId);

  if (issueData.openState) {
    alert("The Issue Already Opened");
    return [null, null];
  }

  const countRemain = await luckyBaby.getCountRemainOfAccount(
    account,
    currentIssueId
  );
  console.log("countRemain:" + countRemain.toString());
  if (count > countRemain.toNumber()) {
    alert("Remain count: " + countRemain.toString());
    return [null, null];
  }

  const payAmount = issueData.payToken.amount.mul(count);
  const payToken = new ethers.Contract(
    issueData.payToken.token,
    usdtabi,
    signer
  ) as Contract & {
    balanceOf(account: string): Promise<BigNumber>;
    allowance(owner: string, spender: string): Promise<BigNumber>;
    approve(
      spender: string,
      amount: string
    ): Promise<providers.TransactionResponse>;
  };

  try {
    const balance = await payToken.balanceOf(account);
    if (payAmount.gt(balance)) {
      alert("Insufficient balance");
      return [null, null];
    }
    const allowance = await payToken.allowance(account, luckyBabyAddress);
    if (payAmount.gt(allowance)) {
      const approveTx = await payToken.approve(
        luckyBabyAddress,
        payAmount.toString()
      );
      const approveResult = await approveTx.wait();
      if (approveResult.status !== 1) {
        alert("Approve failed");
        return [null, null];
      }
    }
    const tx = await luckyBaby.participate(currentIssueId, count);
    console.log(" participate ... please await");
    const message_ = `${etherscanURL}/tx/${tx.hash}`;
    console.log(`Please See: ${message_}`);
    return [message_, tx];
  } catch (error: unknown) {
    const message_ = parseWalletError(error);
    if (message_) alert(message_);
    return [message_ ?? null, null];
  }
};

const openPrizePool = async (): Promise<TxResult> => {
  const etherscanURL = await getScanURL();
  try {
    const [signer, , chainId] = await getSignerAndAccountAndChainId();
    if (!signer || chainId !== 5) {
      return [null, null];
    }

    const luckyBaby = new ethers.Contract(
      luckyBabyAddress,
      luckyBabyabi,
      signer
    ) as Contract & {
      currentIssueId(): Promise<BigNumber>;
      openPrizePool(
        issueId: BigNumber,
        args: unknown[]
      ): Promise<providers.TransactionResponse>;
    };

    const currentIssueId = await luckyBaby.currentIssueId();
    const tx = await luckyBaby.openPrizePool(currentIssueId, []);
    console.log("openPrizePool ... please await");
    const message_ = `${etherscanURL}/tx/${tx.hash}`;
    console.log(`Please See: ${message_}`);
    return [message_, tx];
  } catch (error: unknown) {
    const message_ = parseWalletError(error);
    return [message_ ?? null, null];
  }
};

const incrementNewIssue = async (
  numberMax: number,
  countMaxPer: number,
  startTime: number,
  endTime: number,
  payToken: unknown,
  prize: unknown
): Promise<TxResult> => {
  const etherscanURL = await getScanURL();
  try {
    const [signer, , chainId] = await getSignerAndAccountAndChainId();
    if (!signer || chainId !== 5) {
      return [null, null];
    }

    const luckyBaby = new ethers.Contract(
      luckyBabyAddress,
      luckyBabyabi,
      signer
    ) as Contract & {
      incrementNewIssue(
        numberMax: number,
        countMaxPer: number,
        startTime: number,
        endTime: number,
        payToken: unknown,
        prize: unknown
      ): Promise<providers.TransactionResponse>;
    };

    const tx = await luckyBaby.incrementNewIssue(
      numberMax,
      countMaxPer,
      startTime,
      endTime,
      payToken,
      prize
    );
    console.log("increment NewIssue ... please await");
    const message_ = `${etherscanURL}/tx/${tx.hash}`;
    console.log(`Please See: ${message_}`);
    return [message_, tx];
  } catch (error: unknown) {
    const message_ = parseWalletError(error);
    return [message_ ?? null, null];
  }
};

const getWinners = async (): Promise<string[] | null> => {
  try {
    const [signer, , chainId] = await getSignerAndAccountAndChainId();
    if (!signer || chainId !== 5) {
      return [];
    }

    const luckyBaby = new ethers.Contract(
      luckyBabyAddress,
      luckyBabyabi,
      signer
    ) as Contract & {
      currentIssueId(): Promise<BigNumber>;
      getWinners(issueId: BigNumber): Promise<string[]>;
    };

    const currentIssueId = await luckyBaby.currentIssueId();
    return await luckyBaby.getWinners(currentIssueId);
  } catch (error: unknown) {
    const message_ = parseWalletError(error);
    if (message_) alert(message_);
    return null;
  }
};

const redeemPrize = async (): Promise<TxResult> => {
  const etherscanURL = await getScanURL();
  try {
    const [signer, , chainId] = await getSignerAndAccountAndChainId();
    if (!signer || chainId !== 5) {
      return [null, null];
    }

    const luckyBaby = new ethers.Contract(
      luckyBabyAddress,
      luckyBabyabi,
      signer
    ) as Contract & {
      currentIssueId(): Promise<BigNumber>;
      redeemPrize(issueId: BigNumber): Promise<providers.TransactionResponse>;
    };

    const currentIssueId = await luckyBaby.currentIssueId();
    const tx = await luckyBaby.redeemPrize(currentIssueId);
    console.log(" participate ... please await");
    const message_ = `${etherscanURL}/tx/${tx.hash}`;
    console.log(`Please See: ${message_}`);
    return [message_, tx];
  } catch (error: unknown) {
    const message_ = parseWalletError(error);
    return [message_ ?? null, null];
  }
};

const getNumberParticipants = async (): Promise<
  [BigNumber | null, BigNumber | null]
> => {
  try {
    const [signer, , chainId] = await getSignerAndAccountAndChainId();
    if (!signer || chainId !== 5) {
      return [null, null];
    }

    const luckyBaby = new ethers.Contract(
      luckyBabyAddress,
      luckyBabyabi,
      signer
    ) as Contract & {
      currentIssueId(): Promise<BigNumber>;
      getNumberParticipants(
        issueId: BigNumber
      ): Promise<[BigNumber, BigNumber]>;
    };

    const currentIssueId = await luckyBaby.currentIssueId();
    const numbers = await luckyBaby.getNumberParticipants(currentIssueId);
    return [numbers[0], numbers[1]];
  } catch {
    return [null, null];
  }
};

const getCurrentIssueIdOpenState = async (): Promise<
  [BigNumber | null, boolean | null]
> => {
  try {
    const [signer, , chainId] = await getSignerAndAccountAndChainId();
    if (!signer || chainId !== 5) {
      return [null, null];
    }

    const luckyBaby = new ethers.Contract(
      luckyBabyAddress,
      luckyBabyabi,
      signer
    ) as Contract & {
      currentIssueId(): Promise<BigNumber>;
      issueDatas(issueId: BigNumber): Promise<{ openState: boolean }>;
    };

    const currentIssueId = await luckyBaby.currentIssueId();
    const issueData = await luckyBaby.issueDatas(currentIssueId);
    return [currentIssueId, issueData.openState];
  } catch {
    return [null, null];
  }
};

export {
  participate,
  getWinners,
  redeemPrize,
  getNumberParticipants,
  getCurrentIssueIdOpenState,
  openPrizePool,
  incrementNewIssue
};
