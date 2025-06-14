import { ethers, BigNumber } from "ethers";
import { getSignerAndChainId, getSigner } from "./GetProvider";
import faucetABI from "../contracts/faucetABI.json";
import erc20ABI from "../contracts/erc20ABI.json";
import erc721ABI from "../contracts/erc721A.json";
import crossChainABI from "../contracts/crossChainABI.json";
import { faucetConfig } from "../common/ChainsConfig";
const getContract = async (contractAddress, abi, signer) => {
  let contract = new ethers.Contract(contractAddress, abi, signer);
  return contract;
};

const getFaucetContract = async () => {
  let [signer, chainId] = await getSignerAndChainId();
  let contractAddress = faucetConfig[chainId].faucet;

  let contract = new ethers.Contract(contractAddress, faucetABI, signer);
  return contract;
};

const getERC20Contract = async (token) => {
  let signer = await getSigner();
  let contract = new ethers.Contract(token, erc20ABI, signer);
  return contract;
};
export const getERC20Decimals = async (token) => {
  let decimals = 0;
  try {
    let signer = await getSigner();
    let contract = new ethers.Contract(token, erc20ABI, signer);
    decimals = await contract.decimals();
  } catch (error) {}

  return decimals;
};

const getERC721Contract = async (token) => {
  let signer = await getSigner();
  let contract = new ethers.Contract(token, erc721ABI, signer);
  return contract;
};

const getCrossChainContract = async (token) => {
  let signer = await getSigner();
  let contract = new ethers.Contract(token, crossChainABI, signer);
  return contract;
};
export {
  getContract,
  getFaucetContract,
  getERC20Contract,
  getCrossChainContract,
  getERC721Contract
};
