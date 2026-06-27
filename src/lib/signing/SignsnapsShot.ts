const SEQUENCER_URL = "https://testnet.seq.snapshot.org";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SnapshotClient = { alias: (...args: any[]) => Promise<unknown> };

let signClientPromise: Promise<SnapshotClient | null> | null = null;

async function getSignClient(): Promise<SnapshotClient | null> {
  if (!signClientPromise) {
    signClientPromise = import("@snapshot-labs/snapshot.js").then(
      (snapshot) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
        const Client712 =
          (snapshot.default as any)?.Client712 ?? (snapshot as any).Client712;
        return Client712 ? new Client712(SEQUENCER_URL) : null;
      }
    );
  }
  return signClientPromise;
}

export async function signSetAlias(
  web3: unknown,
  address: string,
  alias: string
): Promise<unknown | null> {
  const signClient = await getSignClient();
  if (!signClient) return null;

  try {
    const result = await signClient.alias(web3, address, { alias });
    console.log("result:", result);
    return result;
  } catch (error) {
    console.log("error:", error);
    return null;
  }
}
