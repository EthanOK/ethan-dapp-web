import { useEffect, useRef, useState } from "react";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";
import { stringifyJson } from "@/lib/shared/Format";
import {
  signBulkOrderOpenSeaMessage,
  signCustomBulkOrderMessage,
  signEIP712OpenSeaMessage,
  signEIP712YunGouMessage,
  signHexDataMessage
} from "@/lib/signing/SignFunc";
import { getSigner, getSignerAndChainId } from "@/lib/wallet/GetProvider";
import ResultBlock from "@/pages/utils/ResultBlock";

/** The signer once `getSignerAndChainId` has been null-checked. */
type WalletSigner = NonNullable<
  Awaited<ReturnType<typeof getSignerAndChainId>>[0]
>;

/**
 * Two signing paths: a raw hex message, and EIP712 typed data (the four
 * marketplace payloads). They differ only in what gets handed to the wallet,
 * so they share one panel behind a segmented control — hex first, matching the
 * order the page description promises.
 */
type SignTab = "hex" | "eip712";

/** The four marketplace payloads, picked from one selector instead of four buttons. */
type Eip712Type = "yungou" | "openSea" | "bulkOpenSea" | "customBulk";

type Eip712Signer = (signer: WalletSigner, chainId: number) => Promise<unknown>;

const EIP712_SIGNERS: Record<Eip712Type, Eip712Signer> = {
  yungou: signEIP712YunGouMessage,
  openSea: signEIP712OpenSeaMessage,
  bulkOpenSea: signBulkOrderOpenSeaMessage,
  customBulk: signCustomBulkOrderMessage
};

// `as const` keeps the label keys literal so `t()` accepts them.
const EIP712_OPTIONS = [
  { value: "yungou", labelKey: "signEip712.signYunGou" },
  { value: "openSea", labelKey: "signEip712.signOpenSea" },
  { value: "bulkOpenSea", labelKey: "signEip712.signBulkOpenSea" },
  { value: "customBulk", labelKey: "signEip712.signCustomBulk" }
] as const;

export default function SignTool() {
  const { t } = useI18n();
  const { address } = useEvmWallet();
  const [tab, setTab] = useState<SignTab>("hex");
  const [eip712Type, setEip712Type] = useState<Eip712Type>("yungou");

  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [hexData, setHexData] = useState("0x");
  const [signature, setSignature] = useState("");

  const hexInputRef = useRef<HTMLTextAreaElement>(null);

  // The field opens with the prefix already in it and the caret parked after
  // it, so the first keystroke appends instead of landing in front of "0x".
  // Re-runs on tab: switching away unmounts the textarea, and a freshly
  // mounted one would put the caret back at index 0.
  useEffect(() => {
    if (tab !== "hex") return;
    const input = hexInputRef.current;
    if (input) input.setSelectionRange(input.value.length, input.value.length);
  }, [tab]);

  // The connected wallet wins; the cached address only keeps the buttons
  // usable across a reload until the wallet reconnects.
  useEffect(() => {
    if (address) {
      setCurrentAccount(address);
      return;
    }
    const cached = localStorage.getItem("userAddress");
    if (cached !== null) setCurrentAccount(cached);
  }, [address]);

  const runTypedData = async (
    sign: (signer: WalletSigner, chainId: number) => Promise<unknown>
  ) => {
    const [signer, chainId] = await getSignerAndChainId();
    if (!signer || chainId == null) return;
    const result = await sign(signer, chainId);
    if (result === false) return;
    if (Array.isArray(result) && result.length === 0) return;
    setMessage(stringifyJson(result, "\t"));
  };

  const signHex = async () => {
    const signer = await getSigner();
    if (!signer) return;
    try {
      setSignature((await signHexDataMessage(signer, hexData)) ?? "");
    } catch {
      alert(t("common.invalidArgument"));
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("utils.signSection")}</h1>
        <p>{t("utils.signDesc")}</p>
      </section>

      <div className="segmented-wrap">
        <div
          className="segmented"
          role="tablist"
          aria-label={t("utils.signSection")}
        >
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "hex"}
            onClick={() => setTab("hex")}
          >
            {t("utils.signHex")}
          </button>
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "eip712"}
            onClick={() => setTab("eip712")}
          >
            {t("signEip712.title")}
          </button>
        </div>
      </div>

      {tab === "hex" ? (
        <section className="feature-panel">
          <div className="feature-field">
            <label htmlFor="hexData">{t("utils.hexData")}</label>
            <textarea
              id="hexData"
              ref={hexInputRef}
              value={hexData}
              onChange={(event) => setHexData(event.target.value)}
              placeholder="0xc0e8f831a90406f3a15e808f3f1ec26ea4bc214cfb986cdb4b0623b22bbf8ed3"
              rows={2}
            />
          </div>
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={signHex}
              className="cta-button mint-nft-button"
              disabled={!currentAccount}
            >
              {t("utils.signButton")}
            </button>
          </div>
          <ResultBlock value={signature} />
        </section>
      ) : (
        <section className="feature-panel">
          <div className="feature-field">
            <span className="choice-label" id="eip712-type-label">
              {t("signEip712.type")}
            </span>
            <div
              className="choice-grid"
              role="radiogroup"
              aria-labelledby="eip712-type-label"
            >
              {EIP712_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={eip712Type === option.value}
                  className="choice-card"
                  onClick={() => setEip712Type(option.value)}
                >
                  <span className="choice-card-dot" aria-hidden="true" />
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={() => runTypedData(EIP712_SIGNERS[eip712Type])}
              className="cta-button mint-nft-button"
              disabled={!currentAccount}
            >
              {t("signEip712.signButton")}
            </button>
          </div>
          <ResultBlock value={message} />
        </section>
      )}
    </div>
  );
}
