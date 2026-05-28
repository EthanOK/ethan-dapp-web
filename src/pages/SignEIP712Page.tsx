import { useEffect, useState } from "react";
import {
  signEIP712YunGouMessage,
  signEIP712OpenSeaMessage,
  signBulkOrderOpenSeaMessage,
  signCustomBulkOrderMessage
} from "@/lib/signing/SignFunc";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";
import { useEvmWallet } from "@/hooks";
import { stringifyJson } from "@/lib/shared/Format";
import { toast } from "sonner";

const SignEIP712Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useEvmWallet();

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
    if (result !== false) setMessage(stringifyJson(result, "\t"));
  };

  const signEIP712OpenSeaHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const result = await signEIP712OpenSeaMessage(signer, chainId);
    if (result !== false) setMessage(stringifyJson(result, "\t"));
  };

  const signBulkOrderOpenSeaHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const orders = await signBulkOrderOpenSeaMessage(signer, chainId);
    if (Array.isArray(orders) && orders.length > 0)
      setMessage(stringifyJson(orders, "\t"));
  };

  const signBulkOrdersHandler = async () => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const orders = await signCustomBulkOrderMessage(signer, chainId);
    if (Array.isArray(orders) && orders.length > 0)
      setMessage(stringifyJson(orders, "\t"));
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
        <p>Sign typed data (YunGou, OpenSea, etc.)</p>
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
