import {
  BricAggregatorHelper,
  ERC20Helper,
  TxStatus,
  getContractAddresses,
  type CallResult,
  type SwapRouterDataOutput
} from "@bric-labs/bric-sdk";
import {
  JsonRpcProvider,
  ZeroAddress,
  type Provider,
  type Signer
} from "ethers";
import {
  BRIC_MAINNET_CHAIN_ID,
  BRIC_SUPPORTED_AGGREGATORS,
  BRIC_SWAP_AGGREGATOR_ADDRESS,
  initBricSdk
} from "@/config/BricConfig";
import { SupportChains } from "@/config/ChainsConfig";

/** Mainnet USDT — non-zero allowance must be cleared before a new approval. */
const MAINNET_USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7";

function requiresUsdtAllowanceReset(
  token: string,
  currentAllowance: bigint
): boolean {
  return (
    token.toLowerCase() === MAINNET_USDT_ADDRESS.toLowerCase() &&
    currentAllowance > 0n
  );
}

function assertApproveSucceeded(
  result: CallResult,
  fallbackMessage: string
): void {
  if (result.status === TxStatus.Reverted) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }
}

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

function getReadonlyProviderForChain(
  chainId: number = BRIC_MAINNET_CHAIN_ID
): JsonRpcProvider {
  const chain = SupportChains.find((c) => Number(c.id) === chainId);
  const rpc = chain?.rpcUrls?.[0];
  if (!rpc) {
    throw new Error(`No RPC configured for chain ${chainId}`);
  }
  return new JsonRpcProvider(rpc, chainId);
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

export async function createBricAggregatorReadonly(
  chainId: number = BRIC_MAINNET_CHAIN_ID,
  provider?: Provider
): Promise<BricAggregatorHelper> {
  initBricSdk();
  return new BricAggregatorHelper(
    null,
    chainId,
    BRIC_SWAP_AGGREGATOR_ADDRESS,
    { waitForConfirmation: true, autoGasBuffer: true },
    provider ?? getReadonlyProviderForChain(chainId),
    BRIC_SUPPORTED_AGGREGATORS
  );
}

export async function fetchSwapQuote(params: {
  signer?: Signer | null;
  tokenIn: string;
  tokenOut: string;
  amountIn: bigint;
  slippageDecimal: number;
  from?: string;
  checkBalance?: boolean;
}): Promise<SwapQuoteResult> {
  const checkBalance =
    params.checkBalance ?? Boolean(params.signer && params.from);
  const aggregator = params.signer
    ? await createBricAggregator(params.signer)
    : await createBricAggregatorReadonly();

  const quote = await aggregator.previewSwapExactInput(
    params.tokenIn,
    params.amountIn,
    params.tokenOut,
    params.slippageDecimal,
    params.from,
    checkBalance
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

export type Erc20AllowanceResult = {
  reset?: CallResult;
  approve: CallResult;
};

export async function ensureErc20Allowance(params: {
  signer: Signer;
  token: string;
  owner: string;
  amount: bigint;
}): Promise<Erc20AllowanceResult | null> {
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

  let reset: CallResult | undefined;
  if (requiresUsdtAllowanceReset(params.token, row.allowance)) {
    reset = await erc20Helper.approve(params.token, spender, 0n);
    assertApproveSucceeded(reset, "Failed to reset USDT allowance");
  }

  const approve = await erc20Helper.approve(
    params.token,
    spender,
    params.amount
  );
  assertApproveSucceeded(approve, "Approve failed");
  return reset ? { reset, approve } : { approve };
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
