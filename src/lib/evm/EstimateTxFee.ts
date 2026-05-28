import { formatEther, formatUnits, type BrowserProvider } from "ethers";

export interface EstimateTxFeeResult {
  gasPrice: string;
  gasUsed: string;
  fee: string;
}

export const estimateTxFee = async (
  provider: BrowserProvider,
  from: string,
  to: string,
  data: string,
  value: bigint
): Promise<EstimateTxFeeResult> => {
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice ?? 0n;
  console.log(`Gas Price: ${formatUnits(gasPrice, 9)} Gwei`);

  const estGas = await provider.estimateGas({
    from,
    to: to === "" ? undefined : to,
    data,
    value,
    gasPrice
  });

  console.log(`Gas Used: ${estGas.toString()}`);

  const estFees = estGas * gasPrice;
  console.log(`Transaction Fee: ${formatEther(estFees)} Ether`);

  return {
    gasPrice: formatUnits(gasPrice, 9),
    gasUsed: estGas.toString(),
    fee: formatEther(estFees)
  };
};
