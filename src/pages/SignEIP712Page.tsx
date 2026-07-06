import { useEffect, useState } from "react";
import {
  signEIP712YunGouMessage,
  signEIP712OpenSeaMessage,
  signBulkOrderOpenSeaMessage,
  signCustomBulkOrderMessage
} from "@/lib/signing/SignFunc";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";
import { stringifyJson } from "@/lib/shared/Format";
import { toast } from "sonner";

const SignEIP712Page = () => {
  const { t } = useI18n();
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
      toast.success(t("common.copiedToClipboard"));
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
        toast.success(t("common.copiedToClipboard"));
      } catch (err) {
        console.error("copy failed", e, err);
        toast.error(t("common.copyManual"));
      }
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("signEip712.title")}</h1>
        <p>{t("signEip712.subtitle")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("common.actions")}</h3>
        <div className="feature-actions feature-actions-row">
          <button
            onClick={signEIP712YunGouHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("signEip712.signYunGou")}
          </button>
          <button
            onClick={signEIP712OpenSeaHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("signEip712.signOpenSea")}
          </button>
          <button
            onClick={signBulkOrderOpenSeaHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("signEip712.signBulkOpenSea")}
          </button>
          <button
            onClick={signBulkOrdersHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("signEip712.signCustomBulk")}
          </button>
        </div>
      </section>
      {message && (
        <section className="feature-panel">
          <div className="feature-panel-header">
            <h3>{t("common.result")}</h3>
            <button
              type="button"
              onClick={copyResult}
              className="mini-action-button"
              title={t("common.copyResult")}
            >
              {t("common.copy")}
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
