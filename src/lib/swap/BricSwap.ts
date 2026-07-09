import {
  BricAggregatorHelper,
  ERC20Helper,
  MULTICALL3_ADDRESS,
  Permit2Address,
  TxStatus,
  type CallResult,
  type SwapRouterDataOutput
} from "@bric-labs/bric-sdk";
import {
  JsonRpcProvider,
  MaxUint256,
  ZeroAddress,
  type Provider,
  type Signer
} from "ethers";
import { BRIC_SUPPORTED_AGGREGATORS, initBricSdk } from "@/config/BricConfig";
import { SupportChains } from "@/config/ChainsConfig";
import type { SwapChainDefinition } from "@/config/SwapChainConfig";

function isNativeToken(token: string): boolean {
  return token.toLowerCase() === ZeroAddress.toLowerCase();
}

function requiresAllowanceReset(
  chain: SwapChainDefinition,
  token: string,
  currentAllowance: bigint
): boolean {
  if (currentAllowance <= 0n) return false;
  const list = chain.tokensRequiringAllowanceReset ?? [];
  return list.some((t) => t.toLowerCase() === token.toLowerCase());
}

function assertTxSucceeded(result: CallResult, fallbackMessage: string): void {
  if (result.status === TxStatus.Reverted) {
    throw new Error(result.error?.message ?? fallbackMessage);
  }
}

export type SwapQuoteResult = SwapRouterDataOutput & {
  minReceived: bigint;
};

export type Permit2Signature = {
  nonce: bigint;
  deadline: bigint;
  signature: string;
};

/** True when quote includes on-chain swap calldata (can execute). */
export function isExecutableSwapQuote(quote: SwapQuoteResult): boolean {
  return quote.swapData != null;
}

/** Use `message` from bric-sdk / wallet errors (unwrap JSON if needed). */
export function readSwapErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw) as { message?: string };
    if (typeof parsed?.message === "string") return parsed.message;
  } catch {
    /* plain string */
  }
  return raw;
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

  const preview = isNativeToken(params.tokenIn)
    ? aggregator.previewSwapExactInput.bind(aggregator)
    : aggregator.previewSwapExactInputWithPermit2.bind(aggregator);

  const quote = await preview(
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

export type Permit2TokenApprovalResult = {
  reset?: CallResult;
  approve: CallResult;
};

/** One-time ERC20 approve to Permit2 when allowance is insufficient. */
export async function ensurePermit2TokenApproval(params: {
  chain: SwapChainDefinition;
  signer: Signer;
  token: string;
  owner: string;
  amount: bigint;
}): Promise<Permit2TokenApprovalResult | null> {
  if (isNativeToken(params.token)) return null;

  const provider = params.signer.provider;
  if (!provider) throw new Error("Signer has no provider");

  const erc20Helper = new ERC20Helper(
    provider,
    MULTICALL3_ADDRESS,
    true
  ).connect(params.signer);
  const [row] = await erc20Helper.batchBalancesAndAllowances(
    [params.token],
    Permit2Address,
    params.owner
  );
  if (row.allowance >= params.amount) return null;

  let reset: CallResult | undefined;
  if (requiresAllowanceReset(params.chain, params.token, row.allowance)) {
    reset = await erc20Helper.approve(params.token, Permit2Address, 0n);
    assertTxSucceeded(reset, "Failed to reset Permit2 allowance");
  }

  const approve = await erc20Helper.approve(
    params.token,
    Permit2Address,
    MaxUint256
  );
  assertTxSucceeded(approve, "Permit2 approve failed");
  return reset ? { reset, approve } : { approve };
}

/** EIP-712 Permit2 signature for ERC20 input; native tokens skip signing. */
export async function signSwapPermit2(params: {
  chain: SwapChainDefinition;
  signer: Signer;
  token: string;
  amount: bigint;
}): Promise<Permit2Signature | null> {
  if (isNativeToken(params.token)) return null;

  const aggregator = await createBricAggregator(params.chain, params.signer);
  const result = await aggregator.signPermitTransferFromWithPermit2(
    params.token,
    params.amount
  );

  if (result.error) {
    throw new Error(result.error.message);
  }
  if (
    result.signature == null ||
    result.nonce == null ||
    result.deadline == null
  ) {
    throw new Error("");
  }

  return {
    nonce: result.nonce,
    deadline: result.deadline,
    signature: result.signature
  };
}

export async function executeSwapExactInput(params: {
  chain: SwapChainDefinition;
  signer: Signer;
  tokenIn: string;
  amountIn: bigint;
  tokenOut: string;
  quote: SwapQuoteResult;
  receiver: string;
  permit2?: Permit2Signature | null;
}): Promise<CallResult> {
  if (!params.quote.swapData) {
    throw new Error("Insufficient balance or swap route unavailable");
  }

  const aggregator = await createBricAggregator(params.chain, params.signer);
  aggregator.setOptions({ waitForConfirmation: true, autoGasBuffer: true });

  if (!isNativeToken(params.tokenIn) && !params.permit2) {
    throw new Error("Permit2 signature required");
  }

  const result = isNativeToken(params.tokenIn)
    ? await aggregator.swapExactInput(
        params.tokenIn,
        params.amountIn,
        params.tokenOut,
        params.quote.minReceived,
        params.receiver,
        params.quote.swapData
      )
    : await aggregator.swapExactInputWithPermit2(
        params.tokenIn,
        params.amountIn,
        params.tokenOut,
        params.quote.minReceived,
        params.receiver,
        params.quote.swapData,
        params.permit2!.nonce,
        params.permit2!.deadline,
        params.permit2!.signature
      );

  assertTxSucceeded(result, "Swap reverted");
  return result;
}
