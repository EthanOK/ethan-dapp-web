import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation
} from "react-router-dom";
import "@/app/App.css";
import { Toaster } from "sonner";
// Import the light hooks directly (not via the `@/hooks` barrel) so the eager
// App graph never reaches the wallet hooks → `@/app/Wallet` → `createAppKit`.
// The wallet stack is loaded lazily through `<WalletControls />` below.
import { useAppTheme } from "@/hooks/useAppTheme";
import { useResponsiveSidebar } from "@/hooks/useResponsiveSidebar";
import {
  useI18n,
  APP_LOCALES,
  getLocaleLabelKey,
  type AppLocale,
  type TranslationKey
} from "@/i18n";

function LogoMarkIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L4 7v10l8 5 8-5V7l-8-5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M12 12l8-5M12 12v10M12 12L4 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThemeSunIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4l1.4-1.4M17 7l1.4-1.4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ThemeMoonIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3a9 9 0 1 0 9 9 7.2 7.2 0 0 1-9-9z" fill="currentColor" />
    </svg>
  );
}

function LocaleGlobeIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

function HeaderLocaleMenu() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const timerId = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const selectLocale = (next: AppLocale) => {
    setLocale(next);
    setOpen(false);
  };

  return (
    <div className="app-header-locale-wrap" ref={menuRef}>
      <button
        type="button"
        className="app-header-locale-toggle"
        onClick={() => setOpen((value) => !value)}
        title={t("locale.language")}
        aria-label={t("locale.language")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="app-header-locale-icon" aria-hidden>
          <LocaleGlobeIcon />
        </span>
      </button>
      {open && (
        <div
          className="app-header-locale-menu"
          role="listbox"
          aria-label={t("locale.language")}
        >
          {APP_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              className={
                "app-header-locale-option" +
                (locale === code ? " is-active" : "")
              }
              onClick={() => selectLocale(code)}
            >
              {t(getLocaleLabelKey(code))}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const HomePage = lazy(() => import("@/pages/HomePage"));
const MarketChartPage = lazy(() => import("@/pages/MarketChartPage"));
const MarketListPage = lazy(() => import("@/pages/MarketListPage"));
const SolanaUtilsPage = lazy(() => import("@/pages/SolanaUtilsPage"));
const ENSPage = lazy(() => import("@/pages/ENSPage"));
const MintNFTPage = lazy(() => import("@/pages/MintNFTPage"));
const GetCollectionPage = lazy(() => import("@/pages/GetCollectionPage"));
const YunGouAggregatorsPage = lazy(
  () => import("@/pages/YunGouAggregatorsPage")
);
const SignEIP712Page = lazy(() => import("@/pages/SignEIP712Page"));
const GetOpenSeaDataPage = lazy(() => import("@/pages/GetOpenSeaDataPage"));
const BuyNFTPage = lazy(() => import("@/pages/BuyNFTPage"));
const GetIPFSPage = lazy(() => import("@/pages/GetIPFSPage"));
const FaucetTokenPage = lazy(() => import("@/pages/FaucetTokenPage"));
const SwapPage = lazy(() => import("@/pages/SwapPage"));
const BurnTokenPage = lazy(() => import("@/pages/BurnTokenPage"));
const CreateTransactionPage = lazy(
  () => import("@/pages/CreateTransactionPage")
);
const ERC20AllowancePage = lazy(() => import("@/pages/ERC20AllowancePage"));
const LayerZeroOFTBridgePage = lazy(
  () => import("@/pages/LayerZeroOFTBridgePage")
);
const UtilsPage = lazy(() => import("@/pages/UtilsPage"));
const ERC6551Page = lazy(() => import("@/pages/ERC6551Page"));
const EIP7702Page = lazy(() => import("@/pages/EIP7702Page"));
const EstimateTxFeePage = lazy(() => import("@/pages/EstimateTxFeePage"));
const Web3AuthPage = lazy(() => import("@/pages/Web3AuthPage"));
const Web3AuthSolanaPage = lazy(() => import("@/pages/Web3AuthSolanaPage"));
const WsolPage = lazy(() => import("@/pages/WsolPage"));

const WalletControls = lazy(() => import("@/app/WalletControls"));

const prefetchSwapPage = () => {
  void import("@/pages/SwapPage");
};

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
  }, []);

  const { theme, toggleTheme } = useAppTheme();
  const { t } = useI18n();
  const {
    isSidebarOpen,
    toggleSidebar,
    closeSidebarOnMobile,
    setIsSidebarOpen
  } = useResponsiveSidebar();

  const ethNavItems: { titleKey: TranslationKey; linkTo: string }[] = [
    { titleKey: "nav.home", linkTo: "/" },
    { titleKey: "nav.markets", linkTo: "/markets" },
    { titleKey: "nav.bricswap", linkTo: "/bricswap" },
    { titleKey: "nav.estimateTxFee", linkTo: "/estimateTxFee" },
    { titleKey: "nav.createTransaction", linkTo: "/createTransaction" },
    { titleKey: "nav.erc20Allowance", linkTo: "/erc20Allowance" },
    { titleKey: "nav.oftBridge", linkTo: "/layerzeroOftBridge" },
    { titleKey: "nav.faucet", linkTo: "/faucet" },
    { titleKey: "nav.burn", linkTo: "/burn" },
    { titleKey: "nav.ens", linkTo: "/ens" },
    { titleKey: "nav.mintNft", linkTo: "/mintnft" },
    { titleKey: "nav.signEip712", linkTo: "/signEIP712" },
    { titleKey: "nav.eip7702", linkTo: "/eip7702" },
    { titleKey: "nav.utils", linkTo: "/utils" },
    { titleKey: "nav.erc6551", linkTo: "/erc6551" },
    { titleKey: "nav.web3Auth", linkTo: "/web3Auth" },
    { titleKey: "nav.web3AuthSolana", linkTo: "/web3AuthSolana" }
  ];

  const solanaNavItems: { titleKey: TranslationKey; linkTo: string }[] = [
    { titleKey: "nav.solanaUtils", linkTo: "/solanaUtils" },
    { titleKey: "nav.wsol", linkTo: "/wsolSolana" }
  ];

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
          <div className="app-header-right">
            <HeaderLocaleMenu />
            <button
              type="button"
              className="app-header-theme-toggle"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? t("theme.switchToLight")
                  : t("theme.switchToDark")
              }
              aria-label={
                theme === "dark"
                  ? t("theme.switchToLight")
                  : t("theme.switchToDark")
              }
            >
              <span className="app-header-theme-icon" aria-hidden>
                {theme === "dark" ? <ThemeSunIcon /> : <ThemeMoonIcon />}
              </span>
            </button>
            <Suspense
              fallback={
                <div className="app-header-wallet-controls">
                  <span className="app-header-network-label">Network</span>
                </div>
              }
            >
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
              <div className="sidebar-section">
                <div className="sidebar-section-title">{t("nav.ethereum")}</div>
                {ethNavItems.map((item) => (
                  <NavLink
                    key={item.linkTo}
                    to={item.linkTo}
                    className={({ isActive }) =>
                      "sidebar-link" + (isActive ? " active" : "")
                    }
                    end={item.linkTo === "/"}
                    onClick={closeSidebarOnMobile}
                    onMouseEnter={
                      item.linkTo === "/bricswap" ? prefetchSwapPage : undefined
                    }
                    onFocus={
                      item.linkTo === "/bricswap" ? prefetchSwapPage : undefined
                    }
                  >
                    <span className="sidebar-link-text">
                      {t(item.titleKey)}
                    </span>
                  </NavLink>
                ))}
              </div>
              <div className="sidebar-section">
                <div className="sidebar-section-title">{t("nav.solana")}</div>
                {solanaNavItems.map((item) => (
                  <NavLink
                    key={item.linkTo}
                    to={item.linkTo}
                    className={({ isActive }) =>
                      "sidebar-link" + (isActive ? " active" : "")
                    }
                    onClick={closeSidebarOnMobile}
                  >
                    <span className="sidebar-link-text">
                      {t(item.titleKey)}
                    </span>
                  </NavLink>
                ))}
              </div>
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
                <Route path="/" element={<HomePage />} />
                <Route path="/markets" element={<MarketListPage />} />
                <Route path="/market" element={<MarketChartPage />} />
                <Route path="/solanaUtils" element={<SolanaUtilsPage />} />
                <Route path="/ens" element={<ENSPage />} />
                <Route path="/mintnft" element={<MintNFTPage />} />
                <Route path="/getCollection" element={<GetCollectionPage />} />
                <Route
                  path="/yunGouAggregators"
                  element={<YunGouAggregatorsPage />}
                />
                <Route path="/signEIP712" element={<SignEIP712Page />} />
                <Route
                  path="/getOpenSeaData"
                  element={<GetOpenSeaDataPage />}
                />
                <Route path="/buyNFT" element={<BuyNFTPage />} />
                <Route path="/getIPFS" element={<GetIPFSPage />} />
                <Route path="/faucet" element={<FaucetTokenPage />} />
                <Route path="/bricswap" element={<SwapPage />} />
                <Route path="/burn" element={<BurnTokenPage />} />
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
                <Route path="/utils" element={<UtilsPage />} />
                <Route path="/erc6551" element={<ERC6551Page />} />
                <Route path="/eip7702" element={<EIP7702Page />} />
                <Route path="/estimateTxFee" element={<EstimateTxFeePage />} />
                <Route path="/web3Auth" element={<Web3AuthPage />} />
                <Route
                  path="/web3AuthSolana"
                  element={<Web3AuthSolanaPage />}
                />
                <Route path="/wsolSolana" element={<WsolPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
