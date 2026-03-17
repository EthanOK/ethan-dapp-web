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
import { toast } from "sonner";

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
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
  }, [isMounted]);

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
      toast.error("获取登陆信息失败");
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

  const copyResult = async () => {
    if (!message) return;
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Copied to clipboard");
    } catch (e) {
      try {
        const el = document.createElement("textarea");
        el.value = message;
        el.setAttribute("readonly", "true");
        el.style.position = "fixed";
        el.style.top = "-1000px";
        el.style.left = "-1000px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast.success("Copied to clipboard");
      } catch (err) {
        console.error("copy failed", e, err);
        toast.error("Copy failed. Please select and copy manually.");
      }
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>EIP-712 Sign</h1>
        <p>Sign typed data (YunGou, OpenSea, Blur, etc.)</p>
      </section>
      <section className="feature-panel">
        <h3>Actions</h3>
        <div className="feature-actions feature-actions-row">
          <button
            onClick={signEIP712YunGouHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Sign EIP-712 YunGou
          </button>
          <button
            onClick={signEIP712OpenSeaHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Sign EIP-712 OpenSea
          </button>
          <button
            onClick={signBulkOrderOpenSeaHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Sign bulk order OpenSea
          </button>
          <button
            onClick={signBulkOrdersHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Sign custom bulk orders
          </button>
          {/* <button
            onClick={signLoginBlurHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Sign login Blur
          </button>
          <button
            onClick={signEthanDappHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Sign login Ethan DApp
          </button> */}
        </div>
      </section>
      {message && (
        <section className="feature-panel">
          <div className="feature-panel-header">
            <h3>Result</h3>
            <button
              type="button"
              onClick={copyResult}
              className="mini-action-button"
              title="Copy result"
            >
              Copy
            </button>
          </div>
          <pre
            style={{
              margin: 0,
              padding: 16,
              background: "var(--w3-bg-elevated)",
              border: "1px solid var(--w3-border)",
              borderRadius: "var(--w3-radius-sm)",
              fontSize: "0.8rem",
              overflow: "auto",
              maxHeight: 320,
              fontFamily: "var(--w3-font-mono)",
              lineHeight: 1.35
            }}
          >
            {message}
          </pre>
        </section>
      )}
    </div>
  );
};

export default SignEIP712Page;
