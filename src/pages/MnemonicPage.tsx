import { useEffect, useRef, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import AddressStyledQR, {
  prewarmAddressStyledQr
} from "@/components/AddressStyledQR";
import { BitcoinIcon } from "@/components/icons/BitcoinIcon";
import { EthereumIcon } from "@/components/icons/EthereumIcon";
import { SolanaIcon } from "@/components/icons/SolanaIcon";
import { TronIcon } from "@/components/icons/TronIcon";
import {
  BITCOIN_ADDRESS_TYPES,
  MnemonicDeriveError,
  deriveAddressesFromMnemonic,
  generateMnemonic,
  type BitcoinAddressType,
  type DerivedAddresses,
  type MnemonicStrength
} from "@/lib/wallet/deriveAddressesFromMnemonic";

type ChainKey = keyof DerivedAddresses;
type ChainIconProps = { size?: number | string; className?: string };

/** Entropy size used for the phrase generated on first load: 128 bit → 12 words. */
const DEFAULT_STRENGTH: MnemonicStrength = 128;

/** Native SegWit is the modern default and what most wallets show first. */
const DEFAULT_BTC_TYPE: BitcoinAddressType = "native";

const CHAIN_ROWS: { key: ChainKey; Icon: ComponentType<ChainIconProps> }[] = [
  { key: "eth", Icon: EthereumIcon },
  { key: "btc", Icon: BitcoinIcon },
  { key: "sol", Icon: SolanaIcon },
  { key: "tron", Icon: TronIcon }
];

const MnemonicPage = () => {
  const { t } = useI18n();
  const [mnemonic, setMnemonic] = useState("");
  const [strength, setStrength] = useState<MnemonicStrength>(DEFAULT_STRENGTH);
  const [btcType, setBtcType] = useState<BitcoinAddressType>(DEFAULT_BTC_TYPE);
  const [addresses, setAddresses] = useState<DerivedAddresses | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrChain, setQrChain] = useState<ChainKey | null>(null);

  /**
   * The last phrase this component generated itself. Used to tell "the field
   * still holds our own phrase" apart from "the user typed or edited words",
   * so regenerating never silently discards manual input.
   */
  const generatedRef = useRef<string | null>(null);

  const runDerive = (value: string) => {
    setError(null);
    setAddresses(null);
    try {
      setAddresses(deriveAddressesFromMnemonic(value));
    } catch (err: unknown) {
      const code = err instanceof MnemonicDeriveError ? err.code : "invalid";
      setError(
        code === "empty" ? t("tools.error.empty") : t("tools.error.invalid")
      );
    }
  };

  /**
   * Fresh phrase from this device's CSPRNG, then derive immediately so the
   * result list always matches what is in the textarea. Nothing is persisted
   * and nothing is sent anywhere — the entropy never leaves this component.
   */
  const applyGenerated = (bits: MnemonicStrength) => {
    try {
      const phrase = generateMnemonic(bits);
      generatedRef.current = phrase;
      setMnemonic(phrase);
      runDerive(phrase);
    } catch (err: unknown) {
      setAddresses(null);
      // Only a missing CSPRNG means "no crypto"; anything else is a bad phrase.
      setError(
        err instanceof MnemonicDeriveError && err.code === "no-crypto"
          ? t("tools.error.noCrypto")
          : t("tools.error.invalid")
      );
    }
  };

  useEffect(() => {
    // Pre-warm the QR singleton so the first modal open has no blank flash.
    // The field starts empty and is filled with a locally generated phrase, so
    // a fresh visit never shows a hard-coded or previously seen mnemonic.
    prewarmAddressStyledQr();
    applyGenerated(DEFAULT_STRENGTH);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape closes the QR modal; the overlay itself is mouse-only.
  useEffect(() => {
    if (qrChain === null) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setQrChain(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [qrChain]);

  const deriveHandler = () => runDerive(mnemonic);

  const strengthHandler = (value: string) => {
    const next: MnemonicStrength = value === "256" ? 256 : 128;
    setStrength(next);
    // Re-roll only while the field still holds a phrase we generated; manual
    // input is left untouched.
    if (generatedRef.current !== null && mnemonic === generatedRef.current) {
      applyGenerated(next);
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

  /**
   * Flatten the derivation result to "one address per row": Bitcoin resolves to
   * whichever format the row's selector points at, so copy / QR / display all
   * read from a single shape.
   */
  const values: Record<ChainKey, string> | null =
    addresses === null
      ? null
      : {
          btc: addresses.btc[btcType],
          eth: addresses.eth,
          sol: addresses.sol,
          tron: addresses.tron
        };

  const qrLabel =
    qrChain === null
      ? ""
      : qrChain === "btc"
        ? `${t("tools.btc")} · ${t(`tools.btcType.${btcType}`)}`
        : t(`tools.${qrChain}`);

  const qrValue = qrChain !== null && values !== null ? values[qrChain] : "";

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("tools.title")}</h1>
        <p>{t("tools.subtitle")}</p>
      </section>

      <section className="feature-panel">
        <p className="eip7702-security-note">{t("tools.warning")}</p>
        <div className="feature-field">
          <div className="tools-field-head">
            <label htmlFor="tools-mnemonic">{t("tools.mnemonic")}</label>
            <label className="tools-word-count" htmlFor="tools-word-count">
              <span>{t("tools.wordCount")}</span>
              <select
                id="tools-word-count"
                value={strength}
                onChange={(e) => strengthHandler(e.target.value)}
              >
                <option value={128}>12</option>
                <option value={256}>24</option>
              </select>
            </label>
          </div>
          <textarea
            id="tools-mnemonic"
            value={mnemonic}
            onChange={(e) => {
              setMnemonic(e.target.value);
              // Any edit invalidates the list below. Keeping the old result
              // visible next to a changed phrase risks the user copying an
              // address that belongs to the previous mnemonic.
              setAddresses(null);
              setError(null);
            }}
            placeholder={t("tools.mnemonicPlaceholder")}
            rows={4}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        {error !== null && <p className="tools-error">{error}</p>}
        <div className="feature-actions tools-actions">
          <button
            type="button"
            onClick={() => applyGenerated(strength)}
            className="tools-generate-btn"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
            {t("tools.generate")}
          </button>
          <button
            type="button"
            onClick={deriveHandler}
            className="cta-button mint-nft-button"
          >
            {t("tools.derive")}
          </button>
        </div>
        <p className="tools-local-note">{t("tools.localNote")}</p>
      </section>

      {values !== null && (
        <section className="feature-panel">
          <div className="tools-chain-list">
            {CHAIN_ROWS.map(({ key, Icon }) => {
              const value = values[key];
              return (
                <div className="tools-chain-row" key={key}>
                  <Icon size={40} className="tools-chain-icon" />
                  <div className="tools-chain-info">
                    {key === "btc" ? (
                      <div className="tools-chain-name-row">
                        <span className="tools-chain-name">
                          {t("tools.btc")}
                        </span>
                        <select
                          className="tools-btc-type"
                          value={btcType}
                          onChange={(e) =>
                            setBtcType(e.target.value as BitcoinAddressType)
                          }
                          aria-label={t("tools.btcTypeLabel")}
                        >
                          {BITCOIN_ADDRESS_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {t(`tools.btcType.${type}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="tools-chain-name">
                        {t(`tools.${key}`)}
                      </span>
                    )}
                    <span className="tools-chain-address">{value}</span>
                  </div>
                  <div className="tools-chain-actions">
                    <button
                      type="button"
                      className="tools-icon-btn"
                      onClick={() => void copyAddress(value)}
                      aria-label={t("common.copy")}
                    >
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="tools-icon-btn"
                      onClick={() => setQrChain(key)}
                      aria-label={t("tools.qrCode")}
                    >
                      <svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <rect width="5" height="5" x="3" y="3" rx="1" />
                        <rect width="5" height="5" x="16" y="3" rx="1" />
                        <rect width="5" height="5" x="3" y="16" rx="1" />
                        <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                        <path d="M21 21v.01" />
                        <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                        <path d="M3 12h.01" />
                        <path d="M12 3h.01" />
                        <path d="M12 16v.01" />
                        <path d="M16 12h1" />
                        <path d="M21 12v.01" />
                        <path d="M12 21v-1" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {qrChain !== null && values !== null && (
        <div
          className="tools-qr-overlay"
          onClick={() => setQrChain(null)}
          role="presentation"
        >
          <div
            className="tools-qr-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tools-qr-heading"
          >
            <button
              type="button"
              className="tools-qr-close"
              onClick={() => setQrChain(null)}
              aria-label={t("common.close")}
            >
              ×
            </button>
            <p id="tools-qr-heading" className="tools-qr-title">
              {qrLabel}
            </p>
            <div className="tools-qr-code-box">
              <AddressStyledQR
                value={qrValue}
                className="tools-qr-styled-root"
              />
            </div>
            <p className="tools-qr-hint">{t("tools.qrHint")}</p>
            <div className="tools-qr-address">
              <span className="tools-qr-address-text">{qrValue}</span>
            </div>
            <button
              type="button"
              className="tools-qr-copy"
              onClick={() => void copyAddress(qrValue)}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t("common.copyAddress")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MnemonicPage;
