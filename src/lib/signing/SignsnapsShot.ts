import snapshot from "@snapshot-labs/snapshot.js";

const SEQUENCER_URL = "https://testnet.seq.snapshot.org";
const signClient = new snapshot.Client712(SEQUENCER_URL) || null;

export async function signSetAlias(
  web3: any,
  address: string,
  alias: string
): Promise<any | null> {
  if (!signClient) return null;

  try {
    const result = await signClient.alias(web3, address, {
      alias
    });
    console.log("result:", result);
    return result;
  } catch (error) {
    console.log("error:", error);
    return null;
  }
}
