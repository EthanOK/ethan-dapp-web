import {
  BricAggregatorHelper,
  ERC20Helper,
  TxStatus,
  type CallResult,
  type SwapRouterDataOutput
} from "@bric-labs/bric-sdk";
import {
  JsonRpcProvider,
  ZeroAddress,
  type Provider,
  type Signer
} from "ethers";
import { BRIC_SUPPORTED_AGGREGATORS, initBricSdk } from "@/config/BricConfig";
import { SupportChains } from "@/config/ChainsConfig";
import type { SwapChainDefinition } from "@/config/SwapChainConfig";

function requiresAllowanceReset(
  chain: SwapChainDefinition,
  token: string,
  currentAllowance: bigint
): boolean {
  if (currentAllowance <= 0n) return false;
  const list = chain.tokensRequiringAllowanceReset ?? [];
  return list.some((t) => t.toLowerCase() === token.toLowerCase());
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

function getReadonlyProviderForChain(chainId: number): JsonRpcProvider {
  const chain = SupportChains.find((c) => Number(c.id) === chainId);
  const rpc = chain?.rpcUrls?.[0];
  if (!rpc) {
    throw new Error(`No RPC configured for chain ${chainId}`);
  }
  return new JsonRpcProvider(rpc, chainId);
}

export async function createBricAggregator(
  chain: SwapChainDefinition,
  signer: Signer
): Promise<BricAggregatorHelper> {
  initBricSdk();
  const helper = new BricAggregatorHelper(
    signer,
    chain.chainId,
    chain.bricSwapAddress,
    { waitForConfirmation: true, autoGasBuffer: true },
    signer.provider!,
    BRIC_SUPPORTED_AGGREGATORS
  );
  return helper.connect(signer, true);
}

export async function createBricAggregatorReadonly(
  chain: SwapChainDefinition,
  provider?: Provider
): Promise<BricAggregatorHelper> {
  initBricSdk();
  return new BricAggregatorHelper(
    null,
    chain.chainId,
    chain.bricSwapAddress,
    { waitForConfirmation: true, autoGasBuffer: true },
    provider ?? getReadonlyProviderForChain(chain.chainId),
    BRIC_SUPPORTED_AGGREGATORS
  );
}

export async function fetchSwapQuote(params: {
  chain: SwapChainDefinition;
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
    ? await createBricAggregator(params.chain, params.signer)
    : await createBricAggregatorReadonly(params.chain);

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
  chain: SwapChainDefinition;
  signer: Signer;
  token: string;
  owner: string;
  amount: bigint;
}): Promise<Erc20AllowanceResult | null> {
  if (params.token === ZeroAddress) return null;

  const provider = params.signer.provider;
  if (!provider) throw new Error("Signer has no provider");

  const erc20Helper = new ERC20Helper(
    provider,
    params.chain.bricMulticallAddress,
    true
  ).connect(params.signer);
  const spender = params.chain.bricSwapAddress;
  const [row] = await erc20Helper.batchBalancesAndAllowances(
    [params.token],
    spender,
    params.owner
  );
  if (row.allowance >= params.amount) return null;

  let reset: CallResult | undefined;
  if (requiresAllowanceReset(params.chain, params.token, row.allowance)) {
    reset = await erc20Helper.approve(params.token, spender, 0n);
    assertApproveSucceeded(reset, "Failed to reset allowance");
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
  chain: SwapChainDefinition;
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

  const aggregator = await createBricAggregator(params.chain, params.signer);
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
