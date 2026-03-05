import { formatEther, formatUnits } from "ethers/lib/utils";
import type { BigNumber, providers } from "ethers";

export interface EstimateTxFeeResult {
  gasPrice: string;
  gasUsed: string;
  fee: string;
}

export const estimateTxFee = async (
  provider: providers.Web3Provider,
  from: string,
  to: string,
  data: string,
  value: BigNumber
): Promise<EstimateTxFeeResult> => {
  const gasPrice = await provider.getGasPrice();
  console.log(`Gas Price: ${formatUnits(gasPrice, 9)} Gwei`);

  const estGas = await provider.estimateGas({
    from,
    to: to === "" ? undefined : to,
    data,
    value,
    gasPrice
  });

  console.log(`Gas Used: ${estGas.toString()}`);

  const estFees = estGas.mul(gasPrice);
  console.log(`Transaction Fee: ${formatEther(estFees)} Ether`);

  return {
    gasPrice: formatUnits(gasPrice, 9),
    gasUsed: estGas.toString(),
    fee: formatEther(estFees)
  };
};
