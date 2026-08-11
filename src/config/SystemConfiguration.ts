import { id } from "ethers";

const chainName_S = "sepolia";
const chainName_TBSC = "bsctestnet";

const OPENSEA_MAIN_API = import.meta.env.REACT_APP_OPENSEA_MAIN_API;
const YUNGOU = "yungou.io";
const hashYUNGOU = id(YUNGOU);
const YUNGOU_END = hashYUNGOU.slice(0, 10);
const suffixOfYunGou = "0xba6d2ab1";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const bsc_rpc = "https://rpc.ankr.com/bsc";
const projectId_walletconnect = import.meta.env
  .REACT_APP_WALLETCONNECT_PROJECTID;

const ALCHEMY_KEY = import.meta.env.REACT_APP_ALCHEMY_KEY;

export const APP_VERSION = import.meta.env.REACT_APP_VERSION ?? "dev";
export const IS_DEVELOPMENT = import.meta.env.MODE === "development";

const React_Serve_Back = (
  import.meta.env.REACT_APP_API_URL ?? "https://ethan-dapp.onrender.com"
).replace(/\/+$/, "");

export const BRIC_DEX_PROXY_BASE_URL =
  import.meta.env.REACT_APP_BRIC_DEX_PROXY_BASE_URL ??
  `${React_Serve_Back}/api`;

const crossChain_tbsc = "0x6AAf3B8a8E42BeDc226e2d1F166Dfdc22d4b5182";

const PancakeRouter = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const UniswapRouter = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const DefaultChainId = "11155111";

const EXPIRES_TIME = "7d";
const SECRETKEY = "y0Gv3jsn8CnT!^4t$U2c9A@kR6*%PqLpQAWER";
const LOGIN_SOLANA_MESSAGE = "Welcome to ethan-yungou.vercel.app!";

const SOLANA_DEV_RPC = "https://rpc.ankr.com/solana_devnet";

export const EIP7702Delegator_Metamask =
  "0x63c0c19a282a1B52b07dD5a65b58948A07DAE32B";

export {
  PancakeRouter,
  UniswapRouter,
  chainName_S,
  YUNGOU_END,
  hashYUNGOU,
  OPENSEA_MAIN_API,
  suffixOfYunGou,
  bsc_rpc,
  chainName_TBSC,
  projectId_walletconnect,
  React_Serve_Back,
  DefaultChainId,
  crossChain_tbsc,
  EXPIRES_TIME,
  SECRETKEY,
  ZERO_ADDRESS,
  LOGIN_SOLANA_MESSAGE,
  SOLANA_DEV_RPC,
  ALCHEMY_KEY
};
