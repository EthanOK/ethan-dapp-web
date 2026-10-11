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
import ResultBlock from "@/pages/utils/ResultBlock";

/**
 * Three ways into the same registry: a name from an address, an address from a
 * name, or a name from its token id. Only one runs at a time, so they share
 * one panel behind a segmented control — by address first, the direction most
 * lookups go.
 */
type EnsTab = "address" | "name" | "tokenId";

const ENSPage = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState<EnsTab>("address");

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

  // The dates that come back with a record trail the result as a single line
  // rather than each taking a box of their own.
  const nameResultMeta = [
    messageAddressExpiration
      ? `${t("ens.expirationDate")}: ${messageAddressExpiration}`
      : "",
    messageAddressCreated
      ? `${t("ens.createdDate")}: ${messageAddressCreated}`
      : ""
  ]
    .filter(Boolean)
    .join(" · ");

  const tokenIdResultMeta = messageExpiration
    ? `${t("ens.expirationDate")}: ${messageExpiration}`
    : undefined;

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("ens.title")}</h1>
        <p>{t("ens.subtitle")}</p>
      </section>

      <div className="segmented-wrap">
        <div className="segmented" role="tablist" aria-label={t("ens.title")}>
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "address"}
            onClick={() => setTab("address")}
          >
            {t("common.address")}
          </button>
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "name"}
            onClick={() => setTab("name")}
          >
            {t("ens.nameLabel")}
          </button>
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "tokenId"}
            onClick={() => setTab("tokenId")}
          >
            {t("ens.tokenIdLabel")}
          </button>
        </div>
      </div>

      {tab === "address" && (
        <section className="feature-panel">
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
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={getENSHandler}
              className="cta-button mint-nft-button"
            >
              {t("ens.getEns")}
            </button>
          </div>
          <ResultBlock value={messageENS} />
        </section>
      )}

      {tab === "name" && (
        <section className="feature-panel">
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
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={getAddressHandler}
              className="cta-button mint-nft-button"
            >
              {t("ens.getAddress")}
            </button>
          </div>
          <ResultBlock value={messageAddress} sub={nameResultMeta} />
        </section>
      )}

      {tab === "tokenId" && (
        <section className="feature-panel">
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
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={getNameByTokenIdHandler}
              className="cta-button mint-nft-button"
            >
              {t("ens.getNameByTokenId")}
            </button>
          </div>
          <ResultBlock value={messageName} sub={tokenIdResultMeta} />
        </section>
      )}
    </div>
  );
};

export default ENSPage;
