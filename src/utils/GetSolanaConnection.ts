import { Connection, clusterApiUrl } from "@solana/web3.js";

const getDevConnection = (): Connection => {
  return new Connection(clusterApiUrl("devnet"), "confirmed");
};

const getTestConnection = (): Connection => {
  return new Connection(clusterApiUrl("testnet"), "confirmed");
};

const getMainConnection = (): Connection => {
  return new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
};

export { getDevConnection, getTestConnection, getMainConnection };
