import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  displayNameForNetwork,
  headerNetworkGroups,
  headerNetworksAll,
  modal
} from "@/app/Wallet";
import HeaderGasStatus from "@/app/HeaderGasStatus";
import { useReownWalletSync } from "@/hooks/useReownWalletSync";
import { useHeaderChainId } from "@/hooks/useHeaderChainId";
import { useOpenAppKitModal } from "@/hooks/useOpenAppKitModal";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";
import { useI18n } from "@/i18n";
import { readCachedSession, shortAddress } from "@/lib/wallet/cachedSession";
import { NavIcon } from "@/app/navIcons";

/**
 * Widths of the header's right column at which the wallet cluster gives things
 * up. Measured on the column rather than the viewport: the column only gets a
 * 1fr share of the header grid — the search box and the settings buttons take
 * the rest — so a 1440px window leaves it about 535px, not 1440. Keying this to
 * the viewport missed that entirely.
 *
 * The balance is the first of the two to go, the chain name never goes. The row
 * can hold a gas badge plus a balance-bearing pill, or a gas badge plus the
 * address, but not both: 495px is where the balance stops fitting next to the
 * badge, and the badge wins because it says something the pill does not. The
 * name is not part of this decision at all — it ellipsizes (App.css) instead of
 * being hidden, so it is never traded away for either.
 */
const BALANCE_DROP_PX = 490;

/** A disconnected row is ~130px cheaper, so the label only shortens this far. */
const SHORT_CONNECT_LABEL_PX = 330;

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

/**
 * Reports how much room the header's right column has, for the two decisions
 * React has to make on its own: the balance lives inside <appkit-button>'s
 * shadow DOM and the connect label is JSX text, so neither is reachable from a
 * CSS container query.
 */
function useCompactWalletCluster() {
  // Anchored on the cluster: that is where React can hand us an element. The
  // measured box is the column above it.
  const anchorRef = useRef<HTMLDivElement | null>(null);
  // Infinite until measured. The layout effect below runs before paint, so the
  // first frame already carries the real decision.
  const [columnWidth, setColumnWidth] = useState(Number.POSITIVE_INFINITY);

  useLayoutEffect(() => {
    const column = anchorRef.current?.closest(".app-header-right");
    if (!column) return;

    const measure = () => {
      setColumnWidth(column.getBoundingClientRect().width);
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(column);
    return () => observer.disconnect();
  }, []);

  return {
    anchorRef,
    dropBalance: columnWidth < BALANCE_DROP_PX,
    shortConnectLabel: columnWidth < SHORT_CONNECT_LABEL_PX
  };
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
  const { anchorRef, dropBalance, shortConnectLabel } =
    useCompactWalletCluster();
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
    return found ? displayNameForNetwork(found) : null;
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
    : shortConnectLabel
      ? t("common.connect")
      : t("common.connectWallet");

  return (
    <div
      ref={anchorRef}
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
              {headerNetworkGroups.map((group) => (
                <div
                  key={group.key}
                  className="app-header-network-group"
                  role="group"
                  aria-label={t(`common.${group.key}`)}
                >
                  <div className="app-header-network-group-label">
                    {t(`common.${group.key}`)}
                  </div>
                  {group.networks.map((network) => {
                    const value = String(
                      (
                        network as {
                          caipNetworkId?: string;
                          id?: string | number;
                        }
                      ).caipNetworkId ??
                        (network as { id?: string | number }).id
                    );
                    const active = String(chainId ?? "") === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={
                          "app-header-network-option" +
                          (active ? " is-active" : "")
                        }
                        onClick={() => handleNetworkSelect(value)}
                      >
                        {displayNameForNetwork(network)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w3-connect-wrap">
        {isConnected && address ? (
          <appkit-button
            balance={dropBalance ? "hide" : "show"}
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
            {!dropBalance && optimistic.balance && (
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
