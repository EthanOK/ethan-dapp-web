import { Contract, formatUnits, JsonRpcProvider, parseUnits } from "ethers";
import {
  PancakeRouter,
  UniswapRouter,
  bsc_rpc,
  main_rpc
} from "@/config/SystemConfiguration";
import routerABI from "@/abis/evm/UniswapV2RouterABI.json";
import erc20ABI from "@/abis/evm/erc20ABI.json";

const getTokenPrice = async (
  platform: string,
  token0: string,
  token1: string
): Promise<string> => {
  try {
    let rpc: string | undefined;
    let routerV2: string | undefined;

    console.log(platform);
    if (platform === "1") {
      routerV2 = UniswapRouter;
      rpc = main_rpc;
    } else if (platform === "56") {
      routerV2 = PancakeRouter;
      rpc = bsc_rpc;
    }

    if (!rpc || !routerV2) {
      return "error";
    }

    const provider = new JsonRpcProvider(rpc);
    const routerContract = new Contract(routerV2, routerABI, provider);
    const token0Contract = new Contract(token0, erc20ABI, provider);
    const token1Contract = new Contract(token1, erc20ABI, provider);

    const decimals0 = await token0Contract.decimals();
    const decimals1 = await token1Contract.decimals();
    const symbol0 = await token0Contract.symbol();
    const symbol1 = await token1Contract.symbol();

    const amounts = await routerContract.getAmountsOut(
      parseUnits("1", decimals0),
      [token0, token1]
    );
    const token1Price = formatUnits(amounts[1], decimals1);
    const pairPrice = `1 ${symbol0} = ${token1Price} ${symbol1}`;

    console.log(pairPrice);
    return pairPrice;
  } catch (error) {
    console.log(error);
    return "error";
  }
};

export { getTokenPrice };
