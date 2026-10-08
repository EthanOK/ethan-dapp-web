import { useEffect, useState } from "react";
import { headerNetworksAll, modal } from "@/app/Wallet";
import HeaderGasStatus from "@/app/HeaderGasStatus";
import { useReownWalletSync } from "@/hooks/useReownWalletSync";
import { useHeaderChainId } from "@/hooks/useHeaderChainId";
import { useOpenAppKitModal } from "@/hooks/useOpenAppKitModal";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";
import { useI18n } from "@/i18n";
import { readCachedSession, shortAddress } from "@/lib/wallet/cachedSession";
import { NavIcon } from "@/app/navIcons";

// Widened from 768px: once the network selector and gas badge are in play the
// 768–900px range is the tightest part of the header, so it also uses the
// compact "Connect" label and hides the balance inside <appkit-button>.
const MOBILE_HEADER_MQ = "(max-width: 900px)";

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
  // Captured synchronously on first render so the header can show an
  // address+balance pill immediately while AppKit's session rehydration runs.
  const [optimistic, setOptimistic] = useState(() => readCachedSession());
  const { address, isConnected, currentChainId, status } = useReownWalletSync();
  const { chainId, handleHeaderNetworkChange } = useHeaderChainId({
    isConnected,
    address,
    currentChainId
  });
  const { isConnecting, openConnectModal } = useOpenAppKitModal();
  const [networkPickerOpen, setNetworkPickerOpen] = useState(false);
  const networkMenuRef = useOutsideDismiss(networkPickerOpen, () =>
    setNetworkPickerOpen(false)
  );

  // When AppKit settles into "disconnected" (initial hydrate or explicit
  // disconnect), the `useReownWalletSync` effect just wiped the optimistic
  // cache. Re-read it so the header doesn't keep showing an old address.
  useEffect(() => {
    if (status === "disconnected") {
      setOptimistic(readCachedSession());
    }
  }, [status]);

  useSyncAppKitTheme();

  const currentNetworkName = (() => {
    if (chainId == null) return null;
    const found = headerNetworksAll.find(
      (n) =>
        (n as { caipNetworkId?: string }).caipNetworkId === String(chainId) ||
        String((n as { id?: string | number }).id) === String(chainId)
    );
    return found?.name ?? null;
  })();

  const handleNetworkSelect = (value: string) => {
    setNetworkPickerOpen(false);
    handleHeaderNetworkChange({
      target: { value }
    } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

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
      {/* Gas + network share one capsule so the header right side reads as a
          single wallet cluster instead of three separate controls. */}
      <div className="app-header-network-cluster">
        <HeaderGasStatus chainId={String(chainId ?? "")} />
        <div className="app-header-network-wrap" ref={networkMenuRef}>
          <button
            type="button"
            id="app-network"
            className={
              "app-header-network-select" +
              (networkPickerOpen ? " is-open" : "")
            }
            onClick={() => setNetworkPickerOpen((value) => !value)}
            aria-haspopup="listbox"
            aria-expanded={networkPickerOpen}
            aria-label="Network"
          >
            <span className="app-header-network-dot" aria-hidden />
            <span className="app-header-network-name">
              {currentNetworkName ?? "Network"}
            </span>
            <span className="app-header-network-chevron" aria-hidden>
              <NavIcon name="chevron" size={12} />
            </span>
          </button>
          {networkPickerOpen && (
            <div
              className="app-header-network-menu"
              role="listbox"
              aria-label="Network"
            >
              {headerNetworksAll.map((network) => {
                const value = String(
                  (
                    network as {
                      caipNetworkId?: string;
                      id?: string | number;
                    }
                  ).caipNetworkId ?? (network as { id?: string | number }).id
                );
                const active = String(chainId ?? "") === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={
                      "app-header-network-option" + (active ? " is-active" : "")
                    }
                    onClick={() => handleNetworkSelect(value)}
                  >
                    {network.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="w3-connect-wrap">
        {isConnected && address ? (
          <appkit-button
            balance={isMobileHeader ? "hide" : "show"}
            label={t("common.connectWallet")}
            style={{ display: "block", marginLeft: "auto" }}
          />
        ) : optimistic.hasSession && optimistic.address ? (
          <button
            type="button"
            className="cta-button connect-wallet-button app-header-wallet-pill"
            // Disabled placeholder; once AppKit rehydrates the real
            // <appkit-button> swaps in and becomes interactive.
            disabled
            aria-busy="true"
            title={t("common.connecting")}
          >
            <span className="app-header-wallet-pill-avatar" aria-hidden />
            <span className="app-header-wallet-pill-addr">
              {shortAddress(optimistic.address)}
            </span>
            {!isMobileHeader && optimistic.balance && (
              <span className="app-header-wallet-pill-balance">
                {Number(optimistic.balance.balance).toFixed(3)}{" "}
                {optimistic.balance.symbol}
              </span>
            )}
          </button>
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
