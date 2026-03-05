import { useEffect, useState } from "react";
import {
  signEIP712YunGouMessage,
  signEIP712OpenSeaMessage,
  signBlurLoginMessage,
  signBulkOrderOpenSeaMessage,
  signCustomBulkOrderMessage
} from "../utils/SignFunc";
import { getSignerAndChainId } from "../utils/GetProvider";
import {
  getBlurAccessTokenByNFTGO,
  getBlurLoginMessageByNFTGO
} from "../api/GetData";
import { login } from "../utils/ConnectWallet";
import { useAppKitAccount } from "@reown/appkit/react";

const SignEIP712Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) configData();
  }, [isMounted]);

  const configData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const signEIP712YunGouHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const result = await signEIP712YunGouMessage(signer, chainId);
    if (result !== false) setMessage(JSON.stringify(result, null, "\t"));
  };

  const signEIP712OpenSeaHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const result = await signEIP712OpenSeaMessage(signer, chainId);
    if (result !== false) setMessage(JSON.stringify(result, null, "\t"));
  };

  const signBulkOrderOpenSeaHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const orders = await signBulkOrderOpenSeaMessage(signer, chainId);
    if (Array.isArray(orders) && orders.length > 0)
      setMessage(JSON.stringify(orders, null, "\t"));
  };

  const signBulkOrdersHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const orders = await signCustomBulkOrderMessage(signer, chainId);
    if (Array.isArray(orders) && orders.length > 0)
      setMessage(JSON.stringify(orders, null, "\t"));
  };

  const signLoginBlurHandler = async () => {
    const [signer] = await getSignerAndChainId();
    if (!signer) return;
    const loginData = await getBlurLoginMessageByNFTGO(
      await signer.getAddress()
    );
    if (loginData === null) {
      alert("获取登陆信息是失败");
      return;
    }
    const messageString = (loginData as { message?: string }).message ?? "";
    const result = await signBlurLoginMessage(signer, messageString);
    const requestData = {
      message: (loginData as { message?: string }).message,
      walletAddress: (loginData as { walletAddress?: string }).walletAddress,
      expiresOn: (loginData as { expiresOn?: string }).expiresOn,
      hmac: (loginData as { hmac?: string }).hmac,
      signature: result
    };
    const blurAccessToken = await getBlurAccessTokenByNFTGO(requestData);
    if (blurAccessToken)
      localStorage.setItem("blurAccessToken", blurAccessToken);
    if (result !== false) setMessage(JSON.stringify(result, null, "\t"));
  };

  const signEthanDappHandler = async () => {
    await login();
  };

  return (
    <center>
      <div>
        <h2>EIP 712</h2>
        <button
          onClick={signEIP712YunGouHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          signEIP712Message YunGou
        </button>
        <p />
        <button
          onClick={signEIP712OpenSeaHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          signEIP712Message OpenSea
        </button>
        <p />
        <button
          onClick={signBulkOrderOpenSeaHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          signBulkOrder OpenSea
        </button>
        <p />
        <button
          onClick={signBulkOrdersHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          signCustomBulkOrders
        </button>
        <p />
        <button
          onClick={signLoginBlurHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          sign Login Blur
        </button>
        <p />
        <button
          onClick={signEthanDappHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          sign Login Ethan Dapp
        </button>
      </div>
      <div>
        <h2>
          Please See:
          <p />
          <textarea
            value={message}
            readOnly
            style={{ width: "1200px", height: "280px" }}
          />
        </h2>
      </div>
    </center>
  );
};

export default SignEIP712Page;
