import { useEffect, useState } from "react";
import { headerNetworksAll, modal } from "@/app/Wallet";
import HeaderGasStatus from "@/app/HeaderGasStatus";
import { useReownWalletSync } from "@/hooks/useReownWalletSync";
import { useHeaderChainId } from "@/hooks/useHeaderChainId";
import { useOpenAppKitModal } from "@/hooks/useOpenAppKitModal";
import { useI18n } from "@/i18n";

const MOBILE_HEADER_MQ = "(max-width: 768px)";

/** Keep AppKit modal/button theme in sync with the app theme (data-theme attr). */
function useSyncAppKitTheme() {
  useEffect(() => {
    const sync = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      try {
        modal.setThemeMode(theme === "light" ? "light" : "dark");
      } catch {
        /* ignore: modal may not be ready */
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => observer.disconnect();
  }, []);
}

function useMobileHeaderLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_HEADER_MQ).matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_HEADER_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

/**
 * Wallet-dependent header cluster (network selector + connect button).
 *
 * Lazy-loaded on purpose: importing this module pulls in `@/app/Wallet`
 * (`createAppKit` + the EVM/Solana/Bitcoin adapters, viem, etc.). Keeping it
 * out of the eager `App` graph removes that whole stack from the entry chunk,
 * so first paint no longer ships the wallet SDK bundle.
 *
 * Hybrid connect control: a stable plain button before the wallet SDK is
 * connected, then the official `appkit-button` (account UI with balance) once
 * connected — at that point the SDK is hydrated, so the web component renders
 * reliably.
 */
function WalletControls() {
  const { t } = useI18n();
  const isMobileHeader = useMobileHeaderLayout();
  const { address, isConnected, currentChainId } = useReownWalletSync();
  const { chainId, handleHeaderNetworkChange } = useHeaderChainId({
    isConnected,
    address,
    currentChainId
  });
  const { isConnecting, openConnectModal } = useOpenAppKitModal();

  useSyncAppKitTheme();

  const handleConnect = () => {
    void openConnectModal();
  };

  const connectLabel = isConnecting
    ? t("common.connecting")
    : isMobileHeader
      ? t("common.connect")
      : t("common.connectWallet");

  return (
    <div
      className={
        "app-header-wallet-controls" + (isConnected ? " is-connected" : "")
      }
    >
      <label htmlFor="app-network" className="app-header-network-label">
        Network
      </label>
      <HeaderGasStatus chainId={String(chainId ?? "")} />
      <select
        id="app-network"
        className="app-header-network-select"
        value={String(chainId ?? "")}
        onChange={handleHeaderNetworkChange}
        aria-label="Network"
      >
        {headerNetworksAll.map((network) => {
          const value = String(
            (network as { caipNetworkId?: string; id?: string | number })
              .caipNetworkId ?? (network as { id?: string | number }).id
          );
          return (
            <option key={value} value={value}>
              {network.name}
            </option>
          );
        })}
      </select>
      <div className="w3-connect-wrap">
        {isConnected ? (
          <appkit-button
            balance={isMobileHeader ? "hide" : "show"}
            label={t("common.connectWallet")}
            style={{ display: "block", marginLeft: "auto" }}
          />
        ) : (
          <button
            type="button"
            className="cta-button connect-wallet-button"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {connectLabel}
          </button>
        )}
      </div>
    </div>
  );
}

export default WalletControls;
