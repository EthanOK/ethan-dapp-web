import base58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { verifyAsync } from "@noble/ed25519";
import { sign } from "tweetnacl";

type SolanaMessageSigner = {
  signMessage(
    message: Uint8Array,
    display?: string
  ): Promise<{ signature: Uint8Array }>;
};

const signSolanaMessage = async (
  provider_solana: SolanaMessageSigner,
  message_string: string
): Promise<string | null> => {
  try {
    const message_Uint8Array = new TextEncoder().encode(message_string);
    const signResult = await provider_solana.signMessage(
      message_Uint8Array,
      "utf8"
    );
    return base58.encode(signResult.signature);
  } catch {
    return null;
  }
};

const verifySolanaSignature = async (
  signature_string: string,
  message_string: string,
  account_string: string
): Promise<boolean> => {
  const signature = base58.decode(signature_string);
  const message = new TextEncoder().encode(message_string);
  const publicKey = new PublicKey(account_string);
  return verifyAsync(signature, message, publicKey.toBytes());
};

const verifySolanaSignatureV2 = (
  signature_string: string,
  message_string: string,
  account_string: string
): boolean => {
  const signature = base58.decode(signature_string);
  const message = new TextEncoder().encode(message_string);
  const publicKey = new PublicKey(account_string);
  return sign.detached.verify(message, signature, publicKey.toBytes());
};

export { signSolanaMessage, verifySolanaSignature, verifySolanaSignatureV2 };
