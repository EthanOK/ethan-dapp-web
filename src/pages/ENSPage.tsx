import { useState } from "react";
import {
  getENSByAddress,
  getAddressByENS,
  getENSByTokenId,
  type ENSByTokenIdResult,
  type ENSByNameResult
} from "@/services/GetData";
import { isAddress } from "@/lib/shared/Utils";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

const ENSPage = () => {
  const { t } = useI18n();
  const [addressInput, setAddressInput] = useState(
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
  );
  const [ensInput, setEnsInput] = useState("vitalik.eth");
  const [tokenIdInput, setTokenIdInput] = useState(
    "79233663829379634837589865448569342784712482819484549289560981379859480642508"
  );
  const [messageENS, setMessageENS] = useState("");
  const [messageAddress, setMessageAddress] = useState("");
  const [messageAddressExpiration, setMessageAddressExpiration] = useState("");
  const [messageAddressCreated, setMessageAddressCreated] = useState("");
  const [messageName, setMessageName] = useState("");
  const [messageExpiration, setMessageExpiration] = useState("");

  const parseAddress = (val: string): string | null => {
    const trimmed = val.trim();
    if (trimmed.length === 44 && trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as string;
        return isAddress(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return isAddress(trimmed) ? trimmed : null;
  };

  const getENSHandler = async () => {
    const addr = parseAddress(addressInput);
    if (!addr) {
      toast.error(t("common.invalidAddress"));
      return;
    }
    const result = await getENSByAddress(addr);
    if (result.code !== 200) {
      toast.error((result as { message?: string }).message);
      return;
    }
    setMessageENS(result.data === null ? "null" : String(result.data));
  };

  const getAddressHandler = async () => {
    const ens = ensInput.trim();
    if (ens.length < 4) {
      toast.error(t("ens.nameTooShort"));
      return;
    }
    const result = (await getAddressByENS(ens)) as {
      code?: number;
      message?: string;
      data?: ENSByNameResult | null;
    };
    if (result.code !== 200) {
      toast.error(result.message);
      return;
    }
    if (!result.data || !result.data.address) {
      setMessageAddress("null");
      setMessageAddressExpiration("");
      setMessageAddressCreated("");
      return;
    }
    setMessageAddress(result.data.address);
    setMessageAddressExpiration(result.data.expirationDate ?? "");
    setMessageAddressCreated(result.data.createdDate ?? "");
  };

  const getNameByTokenIdHandler = async () => {
    const tokenId = tokenIdInput.trim();
    if (tokenId.length < 64) {
      toast.error(t("ens.tokenIdTooShort"));
      return;
    }
    const result = (await getENSByTokenId(tokenId)) as {
      code?: number;
      message?: string;
      data?: ENSByTokenIdResult | null;
    };
    if (result.code !== 200) {
      toast.error(result.message);
      return;
    }
    if (!result.data) {
      setMessageName("null");
      setMessageExpiration("");
      return;
    }
    setMessageName(
      result.data.name === null ? "null" : String(result.data.name)
    );
    setMessageExpiration(result.data.expirationDate ?? "");
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("ens.title")}</h1>
        <p>{t("ens.subtitle")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("ens.byAddress")}</h3>
        <div className="feature-field">
          <label htmlFor="ens-address">{t("common.address")}</label>
          <input
            id="ens-address"
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getENSHandler}
            className="cta-button mint-nft-button"
          >
            {t("ens.getEns")}
          </button>
        </div>
        {messageENS && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <label>{t("common.result")}</label>
            <div
              style={{
                padding: "10px 12px",
                background: "var(--w3-bg-elevated)",
                borderRadius: "var(--w3-radius-sm)",
                border: "1px solid var(--w3-border)",
                fontFamily: "var(--w3-font-mono)",
                color: "var(--w3-accent)"
              }}
            >
              {messageENS}
            </div>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>{t("ens.byEns")}</h3>
        <div className="feature-field">
          <label htmlFor="ens-name">{t("ens.nameLabel")}</label>
          <input
            id="ens-name"
            type="text"
            value={ensInput}
            onChange={(e) => setEnsInput(e.target.value)}
            placeholder="abc.eth"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getAddressHandler}
            className="cta-button mint-nft-button"
          >
            {t("ens.getAddress")}
          </button>
        </div>
        {messageAddress && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <label>{t("common.result")}</label>
            <div
              style={{
                padding: "10px 12px",
                background: "var(--w3-bg-elevated)",
                borderRadius: "var(--w3-radius-sm)",
                border: "1px solid var(--w3-border)",
                fontFamily: "var(--w3-font-mono)",
                color: "var(--w3-accent)",
                wordBreak: "break-all"
              }}
            >
              {messageAddress}
            </div>
            {messageAddressExpiration && (
              <div
                style={{
                  marginTop: 8,
                  padding: "10px 12px",
                  background: "var(--w3-bg-elevated)",
                  borderRadius: "var(--w3-radius-sm)",
                  border: "1px solid var(--w3-border)",
                  fontSize: "0.875rem",
                  color: "var(--w3-text-secondary)"
                }}
              >
                {t("ens.expirationDate")}: {messageAddressExpiration}
              </div>
            )}
            {messageAddressCreated && (
              <div
                style={{
                  marginTop: 8,
                  padding: "10px 12px",
                  background: "var(--w3-bg-elevated)",
                  borderRadius: "var(--w3-radius-sm)",
                  border: "1px solid var(--w3-border)",
                  fontSize: "0.875rem",
                  color: "var(--w3-text-secondary)"
                }}
              >
                {t("ens.createdDate")}: {messageAddressCreated}
              </div>
            )}
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>{t("ens.byTokenId")}</h3>
        <div className="feature-field">
          <label htmlFor="ens-tokenid">{t("ens.tokenIdLabel")}</label>
          <input
            id="ens-tokenid"
            type="text"
            value={tokenIdInput}
            onChange={(e) => setTokenIdInput(e.target.value)}
            placeholder="79233663829379634837589865448569342784712482819484549289560981379859480642508"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getNameByTokenIdHandler}
            className="cta-button mint-nft-button"
          >
            {t("ens.getNameByTokenId")}
          </button>
        </div>
        {messageName && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <label>{t("common.result")}</label>
            <div
              style={{
                padding: "10px 12px",
                background: "var(--w3-bg-elevated)",
                borderRadius: "var(--w3-radius-sm)",
                border: "1px solid var(--w3-border)",
                fontFamily: "var(--w3-font-mono)",
                color: "var(--w3-accent)"
              }}
            >
              {messageName}
            </div>
            {messageExpiration && (
              <div
                style={{
                  marginTop: 8,
                  padding: "10px 12px",
                  background: "var(--w3-bg-elevated)",
                  borderRadius: "var(--w3-radius-sm)",
                  border: "1px solid var(--w3-border)",
                  fontSize: "0.875rem",
                  color: "var(--w3-text-secondary)"
                }}
              >
                {t("ens.expirationDate")}: {messageExpiration}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default ENSPage;
