import type { Connection, Transaction } from "@solana/web3.js";
import type { PublicKey } from "@solana/web3.js";

type PhantomLikeProvider = {
  publicKey: PublicKey;
  signAndSendTransaction(
    transaction: Transaction
  ): Promise<{ signature: string }>;
};

const sendTransactionOfPhantom = async (
  connection: Connection,
  provider: PhantomLikeProvider,
  transaction: Transaction
): Promise<string | null> => {
  try {
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    transaction.feePayer = provider.publicKey;
    transaction.recentBlockhash = blockhash;

    const { signature } = await provider.signAndSendTransaction(transaction);
    await connection.getSignatureStatus(signature);
    return signature;
  } catch {
    return null;
  }
};

export { sendTransactionOfPhantom };
