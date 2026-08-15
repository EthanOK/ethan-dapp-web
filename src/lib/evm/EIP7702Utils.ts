import { ZeroAddress, type AuthorizationLike, type Signer } from "ethers";

export const getDelegationAddress = async (
  signer: Signer
): Promise<string | null> => {
  const provider = signer.provider;
  if (!provider) return null;
  const address = await signer.getAddress();
  try {
    const code = await provider.getCode(address);
    if (code === "0x") return null;
    if (code.startsWith("0xef0100")) {
      return "0x" + code.slice(8);
    }
    return null;
  } catch (error) {
    console.error("检查委托状态时出错：", error);
    return null;
  }
};

export async function createAuthorization(
  wallet: Signer,
  nonce: number,
  authAddress: string
): Promise<unknown> {
  return wallet.authorize({ address: authAddress, nonce });
}

export async function createEIP7702Account(
  /**
   * The account that sends the type-4 transaction and pays the gas: the
   * connected wallet when sponsoring, otherwise the private-key wallet.
   */
  sponsorSigner: Signer,
  auth: unknown,
  /**
   * Optional gas-sponsorship target: the EOA being delegated. When set, the
   * tx `to` is `targetAccount` while the sender is `sponsorSigner`'s account —
   * the private-key wallet signs the authorization and the connected wallet
   * pays the gas. When omitted, `sponsorSigner` both signs and sends (it is
   * the delegated EOA).
   */
  targetAccount?: string,
  /**
   * Optional explicit tx nonce. When the caller already fetched the sender's
   * nonce (for the authorization), passing it here avoids a second
   * eth_getTransactionCount inside `sendTransaction`.
   */
  nonce?: number
): Promise<string> {
  const account = targetAccount ?? (await sponsorSigner.getAddress());
  const tx = await sponsorSigner.sendTransaction({
    type: 4,
    to: account,
    ...(nonce !== undefined ? { nonce } : {}),
    authorizationList: [auth as AuthorizationLike]
  });

  return tx.hash;
}

export async function revokeEIP7702Account(signer: Signer): Promise<string> {
  const currentNonce = await signer.getNonce();
  const account = await signer.getAddress();
  const revokeAuth = await signer.authorize({
    address: ZeroAddress,
    nonce: currentNonce + 1
  });

  const tx = await signer.sendTransaction({
    type: 4,
    to: account,
    authorizationList: [revokeAuth]
  });

  return tx.hash;
}
