import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import wsol_idl from "@/abis/solana/wsol_idl.json";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedAddress } from "@/lib/shared/Utils";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

const getWethProgram = (
  connection: Connection,
  wallet: anchor.Wallet
): Program => {
  const provider = new anchor.AnchorProvider(connection, wallet, {});
  return new Program(wsol_idl as anchor.Idl, provider);
};

export const getStoragePDA = (): string => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("storage_pda")],
    new PublicKey(wsol_idl.address)
  )[0].toBase58();
};

export const getWethMintAddress = (): string => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("wsol_mint")],
    new PublicKey(wsol_idl.address)
  )[0].toBase58();
};

export const getDestinationAddress = (
  mint: string | PublicKey,
  owner: string | PublicKey
): PublicKey => {
  const mintKey = typeof mint === "string" ? new PublicKey(mint) : mint;
  const ownerKey = typeof owner === "string" ? new PublicKey(owner) : owner;
  return getAssociatedTokenAddressSync(mintKey, ownerKey);
};

export const getMetadataPDA = (mint: PublicKey): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer()
    ],
    TOKEN_METADATA_PROGRAM_ID
  )[0];
};

export const getWethBalance = async (
  connection: Connection,
  owner: string
): Promise<string> => {
  let balance = "0";
  try {
    const ata = await getAssociatedAddress(getWethMintAddress(), owner);
    const res = await connection.getTokenAccountBalance(new PublicKey(ata));
    balance = res.value.amount;
  } catch {
    // account may not exist
  }
  return balance;
};

export { getWethProgram };
