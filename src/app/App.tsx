import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useLocation
} from "react-router-dom";
import "@/app/App.css";
import { Toaster } from "sonner";
// Import the light hooks directly (not via the `@/hooks` barrel) so the eager
// App graph never reaches the wallet hooks → `@/app/Wallet` → `createAppKit`.
// The wallet stack is loaded lazily through `<WalletControls />` below.
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import { useI18n } from "@/i18n";
import { readCachedSession, shortAddress } from "@/lib/wallet/cachedSession";
import { NAV_GROUPS } from "@/app/navigation";
import { NavIcon } from "@/app/navIcons";
import CommandPalette, { MOD_KEY } from "@/app/CommandPalette";
import ThemeToggle from "@/app/ThemeToggle";
import LanguageMenu from "@/app/LanguageMenu";

/**
 * The brand mark: a hexagon standing in for the "0" of the hex prefix, holding
 * a slashed zero and an ×. Same artwork as `public/favicon.svg` and the PWA
 * icons — the mark is one file's worth of geometry used at three sizes, so it
 * has to stay legible down to 16px (hence the thick strokes and the single
 * gradient, no fine detail).
 *
 * Unlike the nav icons this one is filled with its own gradient rather than
 * inheriting `currentColor`: it is a badge, not a glyph.
 */
function LogoMarkIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 32 32" aria-hidden>
      <defs>
        <linearGradient id="logo-mark-fill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#4c1bb0" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 L27.7 9 V23 L16 29.5 L4.3 23 V9 Z"
        fill="url(#logo-mark-fill)"
        stroke="url(#logo-mark-fill)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="16"
        r="5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
      />
      <path
        d="M9.45 18.55 L14.55 13.45"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M17.5 11.5 L26 20.5 M26 11.5 L17.5 20.5"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const HomePage = lazy(() => import("@/pages/HomePage"));
const MarketChartPage = lazy(() => import("@/pages/MarketChartPage"));
const MarketListPage = lazy(() => import("@/pages/MarketListPage"));
const SolanaUtilsPage = lazy(() => import("@/pages/SolanaUtilsPage"));
const ENSPage = lazy(() => import("@/pages/ENSPage"));
const GetCollectionPage = lazy(() => import("@/pages/GetCollectionPage"));
const YunGouAggregatorsPage = lazy(
  () => import("@/pages/YunGouAggregatorsPage")
);
const GetOpenSeaDataPage = lazy(() => import("@/pages/GetOpenSeaDataPage"));
const BuyNFTPage = lazy(() => import("@/pages/BuyNFTPage"));
const GetIPFSPage = lazy(() => import("@/pages/GetIPFSPage"));
const FaucetTokenPage = lazy(() => import("@/pages/FaucetTokenPage"));
const SwapPage = lazy(() => import("@/pages/SwapPage"));
const CreateTransactionPage = lazy(
  () => import("@/pages/CreateTransactionPage")
);
const ERC20AllowancePage = lazy(() => import("@/pages/ERC20AllowancePage"));
const LayerZeroOFTBridgePage = lazy(
  () => import("@/pages/LayerZeroOFTBridgePage")
);
const SignTool = lazy(() => import("@/pages/utils/SignTool"));
const GasTool = lazy(() => import("@/pages/utils/GasTool"));
const PriceTool = lazy(() => import("@/pages/utils/PriceTool"));
const IpfsTool = lazy(() => import("@/pages/utils/IpfsTool"));
const ContractAddressTool = lazy(
  () => import("@/pages/utils/ContractAddressTool")
);
const MnemonicPage = lazy(() => import("@/pages/MnemonicPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const ERC6551Page = lazy(() => import("@/pages/ERC6551Page"));
const EIP7702Page = lazy(() => import("@/pages/EIP7702Page"));
const Web3AuthPage = lazy(() => import("@/pages/Web3AuthPage"));
const Web3AuthSolanaPage = lazy(() => import("@/pages/Web3AuthSolanaPage"));
const WsolPage = lazy(() => import("@/pages/WsolPage"));

const WalletControls = lazy(() => import("@/app/WalletControls"));

const prefetchSwapPage = () => {
  void import("@/pages/SwapPage");
};

/**
 * Render the optimistic "connected" pill inside the Suspense fallback. WalletControls
 * is lazy-loaded, so before its chunk finishes parsing the only thing the header
 * can show is whatever we can read from localStorage synchronously. This avoids
 * the "empty Network label" flash on a fresh page load.
 */
function WalletControlsFallback() {
  const snapshot = readCachedSession();
  return (
    <div
      className={
        "app-header-wallet-controls" +
        (snapshot.hasSession ? " is-connected" : "")
      }
    >
      <label htmlFor="app-network" className="app-header-network-label">
        Network
      </label>
      <div className="app-header-network-wrap">
        <button
          type="button"
          id="app-network"
          className="app-header-network-select"
          aria-haspopup="listbox"
          aria-expanded={false}
          aria-label="Network"
          disabled
        >
          Network
        </button>
      </div>
      <div className="w3-connect-wrap">
        {snapshot.hasSession && snapshot.address ? (
          <button
            type="button"
            className="cta-button connect-wallet-button app-header-wallet-pill"
            disabled
            aria-busy="true"
          >
            <span className="app-header-wallet-pill-avatar" aria-hidden />
            <span className="app-header-wallet-pill-addr">
              {shortAddress(snapshot.address)}
            </span>
            {snapshot.balance && (
              <span className="app-header-wallet-pill-balance">
                {Number(snapshot.balance.balance).toFixed(3)}{" "}
                {snapshot.balance.symbol}
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            className="cta-button connect-wallet-button"
            disabled
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

if (typeof window !== "undefined") {
  (window as Window).Buffer =
    (window as Window).Buffer ?? require("buffer").Buffer;
}

function DocumentSurface() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isMarketsSurface = pathname === "/markets" || pathname === "/market";
    if (isMarketsSurface) {
      document.documentElement.dataset.surface = "markets";
      return;
    }
    delete document.documentElement.dataset.surface;
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    prefetchSwapPage();
    // Start downloading the wallet chunk on the first idle frame so the
    // Suspense fallback above the header is barely visible after a refresh.
    // WalletControls pulls in `@/app/Wallet` (createAppKit + adapters + viem),
    // which is the slow part — kicking the import off early keeps the rest
    // of the page interactive while we wait for AppKit to rehydrate.
    if (typeof window === "undefined") return;
    const prefetchWalletControls = () => {
      void import("@/app/WalletControls");
    };
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
    };
    if (typeof win.requestIdleCallback === "function") {
      win.requestIdleCallback(prefetchWalletControls);
      return;
    }
    const timerId = window.setTimeout(prefetchWalletControls, 0);
    return () => window.clearTimeout(timerId);
  }, []);

  const { t } = useI18n();
  const {
    isSidebarOpen,
    toggleSidebar,
    closeSidebarOnMobile,
    setIsSidebarOpen
  } = useResponsiveSidebar();
  // Theme state lives in <ThemeToggle />; it is always mounted in the header,
  // so `data-theme` stays in sync from the first paint. The locale picker is a
  // separate control next to it.
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K toggles the page launcher. Bound on window rather than on an
  // element so it still fires while focus sits inside a page form.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Router>
      <DocumentSurface />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontSize: "14px",
            background: "var(--w3-bg-elevated)",
            border: "1px solid var(--w3-border)",
            color: "var(--w3-text)"
          }
        }}
      />
      <div className="app-shell">
        <header className="app-header">
          <div className="app-header-left">
            <button
              type="button"
              className={
                "app-header-menu-btn" + (isSidebarOpen ? " is-open" : "")
              }
              onClick={toggleSidebar}
              aria-label={
                isSidebarOpen ? t("nav.closeMenu") : t("nav.openMenu")
              }
              aria-expanded={isSidebarOpen}
              aria-controls="app-sidebar"
              title={isSidebarOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            >
              <span className="app-header-menu-icon" aria-hidden>
                <span className="app-header-menu-bar" />
                <span className="app-header-menu-bar" />
                <span className="app-header-menu-bar" />
              </span>
            </button>
            <NavLink to="/" className="app-logo">
              <span className="app-logo-mark">
                <LogoMarkIcon />
              </span>
              <span className="app-logo-text">
                <span className="app-logo-accent">0x</span>Ethan DApp
              </span>
            </NavLink>
          </div>
          <div className="app-header-center">
            <button
              type="button"
              className="app-search-trigger"
              onClick={() => setPaletteOpen(true)}
              aria-label={t("command.openSearch")}
              title={t("command.openSearch")}
            >
              <span className="app-search-trigger-icon" aria-hidden>
                <NavIcon name="search" size={15} />
              </span>
              <span className="app-search-trigger-label">
                {t("command.openSearch")}
              </span>
              <kbd className="app-search-trigger-kbd">{MOD_KEY}K</kbd>
            </button>
          </div>
          <div className="app-header-right">
            <ThemeToggle />
            <LanguageMenu />
            <Suspense fallback={<WalletControlsFallback />}>
              <WalletControls />
            </Suspense>
          </div>
        </header>

        <div
          className={
            "app-body" +
            (isSidebarOpen ? " sidebar-open" : " sidebar-collapsed")
          }
        >
          <div
            className={`app-sidebar-overlay ${isSidebarOpen ? "is-visible" : ""}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden={!isSidebarOpen}
          />
          <aside
            id="app-sidebar"
            className={`app-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}
          >
            <div className="sidebar-mobile-head">
              <span className="sidebar-mobile-title">{t("nav.menu")}</span>
              <button
                type="button"
                className="sidebar-mobile-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label={t("nav.closeMenu")}
              >
                ✕
              </button>
            </div>
            <nav className="sidebar-nav">
              {NAV_GROUPS.map((group) => (
                <div className="sidebar-section" key={group.id}>
                  {group.titleKey && (
                    <div className="sidebar-section-title">
                      {t(group.titleKey)}
                    </div>
                  )}
                  {group.items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.to}
                      className={({ isActive }) =>
                        "sidebar-link" + (isActive ? " active" : "")
                      }
                      end={item.to === "/"}
                      onClick={closeSidebarOnMobile}
                      onMouseEnter={
                        item.id === "bricswap" ? prefetchSwapPage : undefined
                      }
                      onFocus={
                        item.id === "bricswap" ? prefetchSwapPage : undefined
                      }
                    >
                      <span className="sidebar-link-icon" aria-hidden>
                        <NavIcon name={item.id} size={16} />
                      </span>
                      <span className="sidebar-link-text">
                        {t(item.titleKey)}
                      </span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </nav>
            <button
              type="button"
              className="sidebar-collapse-tab"
              onClick={toggleSidebar}
              aria-label={
                isSidebarOpen ? t("nav.collapseMenu") : t("nav.expandMenu")
              }
              title={
                isSidebarOpen ? t("nav.collapseMenu") : t("nav.expandMenu")
              }
            >
              <span className="sidebar-collapse-icon" aria-hidden>
                {isSidebarOpen ? "◀" : "▶"}
              </span>
            </button>
          </aside>

          <main className="app-main">
            <Suspense fallback={null}>
              <Routes>
                {/* Every route the app serves. `NAV_GROUPS` pins a subset in
                    the sidebar and ⌘K; the remaining routes are abandoned and
                    deliberately linked from nowhere (see navigation.ts). */}
                <Route path="/" element={<HomePage />} />
                <Route path="/markets" element={<MarketListPage />} />
                <Route path="/market" element={<MarketChartPage />} />
                <Route path="/ens" element={<ENSPage />} />
                <Route path="/getCollection" element={<GetCollectionPage />} />
                <Route
                  path="/yunGouAggregators"
                  element={<YunGouAggregatorsPage />}
                />
                {/* EIP712 signing moved into the Sign tool; keep the old
                    address working for bookmarks and shared links. */}
                <Route
                  path="/signEIP712"
                  element={<Navigate to="/signature" replace />}
                />
                <Route
                  path="/getOpenSeaData"
                  element={<GetOpenSeaDataPage />}
                />
                <Route path="/buyNFT" element={<BuyNFTPage />} />
                <Route path="/getIPFS" element={<GetIPFSPage />} />
                <Route path="/faucet" element={<FaucetTokenPage />} />
                <Route path="/bricswap" element={<SwapPage />} />
                <Route
                  path="/createTransaction"
                  element={<CreateTransactionPage />}
                />
                <Route
                  path="/erc20Allowance"
                  element={<ERC20AllowancePage />}
                />
                <Route
                  path="/layerzeroOftBridge"
                  element={<LayerZeroOFTBridgePage />}
                />
                <Route path="/signature" element={<SignTool />} />
                <Route path="/gasFee" element={<GasTool />} />
                <Route path="/tokenPrice" element={<PriceTool />} />
                <Route path="/ipfsGateway" element={<IpfsTool />} />
                <Route
                  path="/contractAddress"
                  element={<ContractAddressTool />}
                />
                <Route path="/erc6551" element={<ERC6551Page />} />
                <Route path="/eip7702" element={<EIP7702Page />} />
                <Route path="/web3Auth" element={<Web3AuthPage />} />
                {/* Solana */}
                <Route path="/solanaUtils" element={<SolanaUtilsPage />} />
                <Route path="/wsolSolana" element={<WsolPage />} />
                <Route
                  path="/web3AuthSolana"
                  element={<Web3AuthSolanaPage />}
                />
                {/* Tools */}
                <Route path="/mnemonic" element={<MnemonicPage />} />
                {/* Catch-all: unmatched paths (retired routes, typos, stale
                    bookmarks) get an explicit 404 instead of a blank pane. */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <CommandPalette
          open={paletteOpen}
          onClose={() => setPaletteOpen(false)}
        />
      </div>
    </Router>
  );
}

export default App;
