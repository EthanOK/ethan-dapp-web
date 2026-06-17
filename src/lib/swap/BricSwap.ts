import {
  BricAggregatorHelper,
  ERC20Helper,
  TxStatus,
  getContractAddresses,
  type CallResult,
  type SwapRouterDataOutput
} from "@bric-labs/bric-sdk";
import { ZeroAddress, type Signer } from "ethers";
import {
  BRIC_MAINNET_CHAIN_ID,
  BRIC_SUPPORTED_AGGREGATORS,
  BRIC_SWAP_AGGREGATOR_ADDRESS,
  initBricSdk
} from "@/config/BricConfig";

export type SwapQuoteResult = SwapRouterDataOutput & {
  minReceived: bigint;
};

/** True when quote includes on-chain swap calldata (can execute). */
export function isExecutableSwapQuote(quote: SwapQuoteResult): boolean {
  return quote.swapData != null;
}

function readQuoteAmountOut(quote: SwapRouterDataOutput): bigint {
  if (quote.amountOut == null) return 0n;
  try {
    return BigInt(quote.amountOut);
  } catch {
    return 0n;
  }
}

export async function createBricAggregator(
  signer: Signer
): Promise<BricAggregatorHelper> {
  initBricSdk();
  const helper = new BricAggregatorHelper(
    signer,
    BRIC_MAINNET_CHAIN_ID,
    BRIC_SWAP_AGGREGATOR_ADDRESS,
    { waitForConfirmation: true, autoGasBuffer: true },
    signer.provider!,
    BRIC_SUPPORTED_AGGREGATORS
  );
  return helper.connect(signer, true);
}

export async function fetchSwapQuote(params: {
  signer: Signer;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  slippageDecimal: number;
  from: string;
}): Promise<SwapQuoteResult> {
  const aggregator = await createBricAggregator(params.signer);
  const quote = await aggregator.previewSwapExactInput(
    params.tokenIn,
    params.amountIn,
    params.tokenOut,
    params.slippageDecimal,
    params.from,
    true
  );

  const amountOut = readQuoteAmountOut(quote);
  const executable = quote.swapData != null;

  if (quote.error && !executable && amountOut === 0n) {
    throw new Error(quote.error);
  }
  if (!executable && amountOut === 0n) {
    throw new Error(quote.error ?? "No swap route found");
  }

  return {
    ...quote,
    minReceived: quote.minReceived ?? 0n
  };
}

export async function ensureErc20Allowance(params: {
  signer: Signer;
  token: string;
  owner: string;
  amount: bigint;
}): Promise<CallResult | null> {
  if (params.token === ZeroAddress) return null;

  const provider = params.signer.provider;
  if (!provider) throw new Error("Signer has no provider");

  const { BRIC_MULTICALL } = getContractAddresses(BRIC_MAINNET_CHAIN_ID);
  const erc20Helper = new ERC20Helper(provider, BRIC_MULTICALL, true).connect(
    params.signer
  );
  const spender = BRIC_SWAP_AGGREGATOR_ADDRESS;
  const [row] = await erc20Helper.batchBalancesAndAllowances(
    [params.token],
    spender,
    params.owner
  );
  if (row.allowance >= params.amount) return null;

  return erc20Helper.approve(params.token, spender, params.amount);
}

export async function executeSwapExactInput(params: {
  signer: Signer;
  tokenIn: string;
  amountIn: bigint;
  tokenOut: string;
  quote: SwapQuoteResult;
  receiver: string;
}): Promise<CallResult> {
  if (!params.quote.swapData) {
    throw new Error("Insufficient balance or swap route unavailable");
  }

  const aggregator = await createBricAggregator(params.signer);
  aggregator.setOptions({ waitForConfirmation: true, autoGasBuffer: true });

  const result = await aggregator.swapExactInput(
    params.tokenIn,
    params.amountIn,
    params.tokenOut,
    params.quote.minReceived,
    params.receiver,
    params.quote.swapData!
  );

  if (result.status === TxStatus.Reverted) {
    throw new Error(result.error?.message ?? "Swap reverted");
  }
  return result;
}
