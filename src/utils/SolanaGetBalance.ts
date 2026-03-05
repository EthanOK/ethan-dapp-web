import { Connection, PublicKey } from "@solana/web3.js";

export const getSolBalance = async (
  connection: Connection,
  ownerAddress: string
): Promise<number | null> => {
  let balance: number | null = null;

  try {
    balance = await connection.getBalance(new PublicKey(ownerAddress));
    return balance;
  } catch (error) {
    console.log(error);
    return balance;
  }
};
