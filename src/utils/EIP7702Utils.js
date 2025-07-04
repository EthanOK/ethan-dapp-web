import { ZeroAddress } from "ethers-v6";

export const getDelegationAddress = async (signer) => {
  const provider = signer.provider;
  const address = await signer.getAddress();
  try {
    // 获取 EOA 地址的代码
    const code = await provider.getCode(address);

    if (code === "0x") {
      // console.log(`❌ 未找到 ${address} 的委托`);
      return null;
    }

    // 检查它是否是 EIP-7702 委托 (以 0xef0100 开头)
    if (code.startsWith("0xef0100")) {
      // 提取委托的地址 (删除 0xef0100 前缀)
      const delegatedAddress = "0x" + code.slice(8); // 删除 0xef0100 (8 个字符)

      // console.log(`✅ 找到 ${address} 的委托`);
      // console.log(`📍 委托给：${delegatedAddress}`);
      // console.log(`📝 完整委托代码：${code}`);

      return delegatedAddress;
    } else {
      // console.log(`❓ 地址有代码但不是 EIP-7702 委托：${code}`);
      return null;
    }
  } catch (error) {
    console.error("检查委托状态时出错：", error);
    return null;
  }
};

export async function createAuthorization(wallet, nonce, authAddress) {
  const auth = await wallet.authorize({
    address: authAddress,
    nonce: nonce
  });

  return auth;
}

export async function createEIP7702Account(signer, auth) {
  const account = await signer.getAddress();
  try {
    // 发送带有创建授权的交易
    const tx = await signer.sendTransaction({
      type: 4,
      to: account,
      authorizationList: [auth]
    });
    console.log("已发送创建授权交易：", tx.hash);

    return tx.hash;
  } catch (error) {
    return null;
  }
}

export async function revokeEIP7702Account(signer) {
  const currentNonce = await signer.getNonce();
  const account = await signer.getAddress();

  // 创建授权以撤销 (将地址设置为零地址)
  const revokeAuth = await signer.authorize({
    address: ZeroAddress,
    nonce: currentNonce + 1
  });

  console.log("已创建撤销授权");

  // 发送带有撤销授权的交易
  const tx = await signer.sendTransaction({
    type: 4,
    to: account,
    authorizationList: [revokeAuth]
  });
  console.log("已发送撤销交易：", tx.hash);
  return tx.hash;
}
