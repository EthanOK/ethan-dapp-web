import { ZeroAddress, Signer } from "ethers-v6";

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
  signer: Signer,
  auth: unknown
): Promise<string | null> {
  const account = await signer.getAddress();
  try {
    const tx = await signer.sendTransaction({
      type: 4,
      to: account,
      authorizationList: [auth as import("ethers-v6").AuthorizationLike]
    });
    console.log("已发送创建授权交易：", tx.hash);
    return tx.hash;
  } catch (error) {
    console.error("创建授权失败：", error);
    return null;
  }
}

export async function revokeEIP7702Account(signer: Signer): Promise<string> {
  const currentNonce = await signer.getNonce();
  const account = await signer.getAddress();
  const revokeAuth = await signer.authorize({
    address: ZeroAddress,
    nonce: currentNonce + 1
  });
  console.log("已创建撤销授权");
  const tx = await signer.sendTransaction({
    type: 4,
    to: account,
    authorizationList: [revokeAuth]
  });
  console.log("已发送撤销交易：", tx.hash);
  return tx.hash;
}
