import { ethers } from "ethers";
import type { BigNumberish, Signer, providers } from "ethers";

export const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

export type Multicall3Call = {
  target: string;
  allowFailure: boolean;
  callData: string;
};

export type Multicall3Result = {
  success: boolean;
  returnData: string;
};

const MULTICALL3_ABI = [
  "function aggregate3(tuple(address target,bool allowFailure,bytes callData)[] calls) payable returns (tuple(bool success,bytes returnData)[] returnData)",
  "function aggregate3Value(tuple(address target,bool allowFailure,uint256 value,bytes callData)[] calls) payable returns (tuple(bool success,bytes returnData)[] returnData)"
];

export type Multicall3ValueCall = {
  target: string;
  allowFailure: boolean;
  value: BigNumberish;
  callData: string;
};

/**
 * Multicall3 `aggregate3` via **static call** (`eth_call`).
 *
 * Implementation detail: uses `contract.callStatic.aggregate3(...)`, so it will
 * never send a transaction or consume gas.
 */
export const multicall3Aggregate3StaticCall = async (
  provider: providers.Provider,
  calls: Multicall3Call[],
  multicallAddress: string = MULTICALL3_ADDRESS
): Promise<Multicall3Result[]> => {
  const contract = new ethers.Contract(
    multicallAddress,
    MULTICALL3_ABI,
    provider
  );
  const res = (await contract.callStatic.aggregate3(calls)) as Array<{
    success: boolean;
    returnData: string;
  }>;
  return res.map((r) => ({
    success: !!r.success,
    returnData: String(r.returnData)
  }));
};

/**
 * Multicall3 `aggregate3Value` (sends a transaction).
 *
 * Useful for batch native transfers: set each call's `value` and use `callData: "0x"`.
 */
export const multicall3Aggregate3Value = async (
  signer: Signer,
  calls: Multicall3ValueCall[],
  opts?: { multicallAddress?: string; totalValue?: BigNumberish }
): Promise<providers.TransactionResponse> => {
  const multicallAddress = opts?.multicallAddress ?? MULTICALL3_ADDRESS;

  const contract = new ethers.Contract(
    multicallAddress,
    MULTICALL3_ABI,
    signer
  );

  const totalValue =
    opts?.totalValue ??
    calls.reduce(
      (acc, c) => acc.add(ethers.BigNumber.from(c.value)),
      ethers.BigNumber.from(0)
    );

  const tx = await contract.aggregate3Value(calls, { value: totalValue });
  return tx;
};

export const decodeMulticallResult = <T = unknown>(
  iface: ethers.utils.Interface,
  functionFragment: string,
  result: Multicall3Result
): T | undefined => {
  if (!result?.success) return undefined;
  const data = result?.returnData ?? "0x";
  if (typeof data !== "string" || data === "0x") return undefined;
  try {
    const decoded = iface.decodeFunctionResult(functionFragment, data);
    return decoded?.[0] as T;
  } catch {
    return undefined;
  }
};
