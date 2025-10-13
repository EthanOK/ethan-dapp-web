import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import wsol_idl from "../idls/wsol_idl.json";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedAddress } from "./Utils";

import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);
const getWethProgram = (connection, wallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet);
  const program = new Program(wsol_idl, provider);
  return program;
};

export const getStoragePDA = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("storage_pda")],
    new PublicKey(wsol_idl.address)
  )[0].toBase58();
};

export const getWethMintAddress = () => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("wsol_mint")],
    new PublicKey(wsol_idl.address)
  )[0].toBase58();
};

export const getDestinationAddress = (mint, owner) => {
  mint = new PublicKey(mint);
  owner = new PublicKey(owner);
  return getAssociatedTokenAddressSync(mint, owner);
};

export const getMetadataPDA = (mint) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};

export const getWethBalance = async (connection, owner) => {
  let balance = "0";
  try {
    let ata = await getAssociatedAddress(getWethMintAddress(), owner);

    const res = await connection.getTokenAccountBalance(new PublicKey(ata));
    balance = res.value.amount;
  } catch (error) {}

  return balance;
};

export { getWethProgram };
