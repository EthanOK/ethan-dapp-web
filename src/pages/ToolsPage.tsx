import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import {
  deriveAddressesFromMnemonic,
  type DerivedAddresses
} from "@/lib/wallet/deriveAddressesFromMnemonic";

const ToolsPage = () => {
  const { t } = useI18n();
  const [mnemonic, setMnemonic] = useState("");
  const [addresses, setAddresses] = useState<DerivedAddresses | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deriveHandler = () => {
    setError(null);
    setAddresses(null);
    try {
      const result = deriveAddressesFromMnemonic(mnemonic);
      setAddresses(result);
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : "invalid";
      if (code === "empty") {
        setError(t("tools.error.empty"));
      } else {
        setError(t("tools.error.invalid"));
      }
    }
  };

  const copyAddress = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("common.copiedToClipboard"));
    } catch {
      toast.error(t("common.copyFailed"));
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("tools.title")}</h1>
        <p>{t("tools.subtitle")}</p>
      </section>

      <section className="feature-panel">
        <p className="eip7702-security-note">{t("tools.warning")}</p>
        <div className="feature-field">
          <label htmlFor="tools-mnemonic">{t("tools.mnemonic")}</label>
          <textarea
            id="tools-mnemonic"
            value={mnemonic}
            onChange={(e) => setMnemonic(e.target.value)}
            placeholder={t("tools.mnemonicPlaceholder")}
            rows={4}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        {error !== null && <p className="tools-error">{error}</p>}
        <div className="feature-actions">
          <button
            type="button"
            onClick={deriveHandler}
            className="cta-button mint-nft-button"
          >
            {t("tools.derive")}
          </button>
        </div>
      </section>

      {addresses !== null && (
        <section className="feature-panel">
          <h3>{t("common.result")}</h3>
          {(
            [
              ["btc", addresses.btc, t("tools.btc")],
              ["eth", addresses.eth, t("tools.eth")],
              ["sol", addresses.sol, t("tools.sol")]
            ] as const
          ).map(([key, value, label]) => (
            <div className="feature-field" key={key}>
              <label htmlFor={`tools-${key}`}>{label}</label>
              <div className="tools-address-row">
                <input
                  id={`tools-${key}`}
                  type="text"
                  value={value}
                  readOnly
                  spellCheck={false}
                  onFocus={(e) => e.currentTarget.select()}
                />
                <button
                  type="button"
                  className="cta-button mint-nft-button tools-copy-btn"
                  onClick={() => void copyAddress(value)}
                >
                  {t("common.copy")}
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ToolsPage;
