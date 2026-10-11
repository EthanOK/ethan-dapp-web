import { formatUnits, Interface, JsonRpcProvider, ZeroAddress } from "ethers";
import {
  PancakeFactory,
  UniswapFactory,
  UniswapFactoryBase
} from "@/config/SystemConfiguration";
import { SupportChains } from "@/config/ChainsConfig";
import erc20ABI from "@/abis/evm/erc20ABI.json";
import {
  decodeMulticallResult,
  MULTICALL3_ADDRESS,
  multicall3Aggregate3StaticCall,
  type Multicall3Call
} from "@/lib/evm/Multicall3";

const ERC20_IFACE = new Interface(erc20ABI);
const FACTORY_IFACE = new Interface([
  "function getPair(address tokenA, address tokenB) view returns (address pair)"
]);
const PAIR_IFACE = new Interface([
  "function token0() view returns (address)",
  "function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)"
]);

/**
 * V2 factory per chain. This is all the chain-specific wiring there is — the
 * pair and its reserves are found through the factory, and the RPC comes from
 * SupportChains.
 */
const V2_FACTORIES: Record<string, string> = {
  "1": UniswapFactory,
  "56": PancakeFactory,
  "8453": UniswapFactoryBase
};

/**
 * Marginal price of token0 in token1: the ratio of the pool's reserves, i.e.
 * what an infinitesimal trade gets.
 *
 * Deliberately not `getAmountsOut` for a whole token — that reports the
 * proceeds of a trade big enough to move the pool, which on a shallow pool is
 * nowhere near the price (a $35 pool quotes ~17 USDT for 1 WETH).
 */
export type TokenPrice = {
  /** "1 token0 = x token1" */
  price: string;
  /** The same rate read the other way round: "1 token1 = y token0". */
  reversePrice: string;
};

const getTokenPrice = async (
  chainId: string,
  token0: string,
  token1: string
): Promise<TokenPrice | null> => {
  try {
    const factory = V2_FACTORIES[chainId];
    const rpc = SupportChains.find((c) => c.id === chainId)?.rpcUrls?.[0];

    if (!factory || !rpc) {
      return null;
    }

    const provider = new JsonRpcProvider(rpc);

    const metaCalls: Multicall3Call[] = [
      {
        target: factory,
        allowFailure: false,
        callData: FACTORY_IFACE.encodeFunctionData("getPair", [token0, token1])
      },
      {
        target: token0,
        allowFailure: false,
        callData: ERC20_IFACE.encodeFunctionData("decimals")
      },
      {
        target: token1,
        allowFailure: false,
        callData: ERC20_IFACE.encodeFunctionData("decimals")
      },
      {
        target: token0,
        allowFailure: false,
        callData: ERC20_IFACE.encodeFunctionData("symbol")
      },
      {
        target: token1,
        allowFailure: false,
        callData: ERC20_IFACE.encodeFunctionData("symbol")
      }
    ];

    const meta = await multicall3Aggregate3StaticCall(
      provider,
      metaCalls,
      MULTICALL3_ADDRESS
    );

    const pair = decodeMulticallResult<string>(
      FACTORY_IFACE,
      "getPair",
      meta[0]
    );
    const decimals0 = decodeMulticallResult<bigint>(
      ERC20_IFACE,
      "decimals",
      meta[1]
    );
    const decimals1 = decodeMulticallResult<bigint>(
      ERC20_IFACE,
      "decimals",
      meta[2]
    );
    const symbol0 = decodeMulticallResult<string>(
      ERC20_IFACE,
      "symbol",
      meta[3]
    );
    const symbol1 = decodeMulticallResult<string>(
      ERC20_IFACE,
      "symbol",
      meta[4]
    );

    if (
      !pair ||
      pair === ZeroAddress ||
      decimals0 == null ||
      decimals1 == null ||
      symbol0 == null ||
      symbol1 == null
    ) {
      return null;
    }

    const pairCalls: Multicall3Call[] = [
      {
        target: pair,
        allowFailure: false,
        callData: PAIR_IFACE.encodeFunctionData("token0")
      },
      {
        target: pair,
        allowFailure: false,
        callData: PAIR_IFACE.encodeFunctionData("getReserves")
      }
    ];

    const pairState = await multicall3Aggregate3StaticCall(
      provider,
      pairCalls,
      MULTICALL3_ADDRESS
    );

    const pairToken0 = decodeMulticallResult<string>(
      PAIR_IFACE,
      "token0",
      pairState[0]
    );
    // getReserves returns three values, so decode it directly instead of going
    // through the single-value helper.
    const reserves = PAIR_IFACE.decodeFunctionResult(
      "getReserves",
      pairState[1].returnData
    );
    const reserve0 = reserves[0] as bigint;
    const reserve1 = reserves[1] as bigint;

    if (pairToken0 == null) {
      return null;
    }

    // The pair orders its tokens by address, which need not be the order the
    // user typed them in.
    const token0First = pairToken0.toLowerCase() === token0.toLowerCase();
    const reserveToken0 = token0First ? reserve0 : reserve1;
    const reserveToken1 = token0First ? reserve1 : reserve0;

    if (reserveToken0 === 0n) {
      return null;
    }

    const perToken =
      Number(formatUnits(reserveToken1, Number(decimals1))) /
      Number(formatUnits(reserveToken0, Number(decimals0)));

    if (!Number.isFinite(perToken) || perToken === 0) {
      return null;
    }

    // Both directions come from the same ratio, so the page can flip between
    // them without another round trip.
    //
    // 10 significant digits: the old 18-decimal expansion ("2503.101089173425407353")
    // was float64 noise past the first ~16 digits and long enough to force the
    // result frame onto two lines. Round-tripping through Number() also drops
    // trailing zeros and picks exponent form on its own for sub-1e-6 rates.
    const formatRate = (rate: number) => String(Number(rate.toPrecision(10)));

    return {
      price: `1 ${symbol0} = ${formatRate(perToken)} ${symbol1}`,
      reversePrice: `1 ${symbol1} = ${formatRate(1 / perToken)} ${symbol0}`
    };
  } catch (error) {
    console.error(error);
    return null;
  }
};

export { getTokenPrice };
