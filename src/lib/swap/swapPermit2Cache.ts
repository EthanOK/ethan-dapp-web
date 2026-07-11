export type Permit2Signature = {
  nonce: bigint;
  deadline: bigint;
  signature: string;
};

const DEADLINE_BUFFER_SEC = 30;

type CachedPermit2Entry = Permit2Signature & {
  chainId: number;
  owner: string;
  token: string;
  amount: string;
};

const permit2Cache = new Map<string, CachedPermit2Entry>();

function cacheKey(
  chainId: number,
  owner: string,
  token: string,
  amount: bigint
): string {
  return `${chainId}:${owner.toLowerCase()}:${token.toLowerCase()}:${amount.toString()}`;
}

function isPermit2StillValid(deadline: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return deadline > now + BigInt(DEADLINE_BUFFER_SEC);
}

/** Reuse a recent Permit2 signature when swap params are unchanged. */
export function readCachedPermit2Signature(
  chainId: number,
  owner: string,
  token: string,
  amount: bigint
): Permit2Signature | null {
  const entry = permit2Cache.get(cacheKey(chainId, owner, token, amount));
  if (!entry || !isPermit2StillValid(entry.deadline)) {
    return null;
  }
  return {
    nonce: entry.nonce,
    deadline: entry.deadline,
    signature: entry.signature
  };
}

export function writeCachedPermit2Signature(
  chainId: number,
  owner: string,
  token: string,
  amount: bigint,
  signature: Permit2Signature
): void {
  permit2Cache.set(cacheKey(chainId, owner, token, amount), {
    ...signature,
    chainId,
    owner: owner.toLowerCase(),
    token: token.toLowerCase(),
    amount: amount.toString()
  });
}

/** Drop cached signature after a successful swap (nonce consumed on-chain). */
export function clearCachedPermit2Signature(
  chainId: number,
  owner: string,
  token: string,
  amount: bigint
): void {
  permit2Cache.delete(cacheKey(chainId, owner, token, amount));
}
