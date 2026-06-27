import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from "react-router-dom";
import "@/app/App.css";
import { Toaster } from "sonner";
import { headerNetworksAll } from "@/app/Wallet";
import {
  useAppTheme,
  useHeaderChainId,
  useReownWalletSync,
  useResponsiveSidebar
} from "@/hooks";

const HomePage = lazy(() => import("@/pages/HomePage"));
const MarketChartPage = lazy(() => import("@/pages/MarketChartPage"));
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

const prefetchSwapPage = () => {
  void import("@/pages/SwapPage");
};

if (typeof window !== "undefined") {
  (window as Window).Buffer =
    (window as Window).Buffer ?? require("buffer").Buffer;
}

function App() {
  useEffect(() => {
    prefetchSwapPage();
  }, []);

  const { theme, toggleTheme } = useAppTheme();
  const {
    isSidebarOpen,
    toggleSidebar,
    closeSidebarOnMobile,
    setIsSidebarOpen
  } = useResponsiveSidebar();
  const { address, isConnected, currentChainId } = useReownWalletSync();
  const { chainId, handleHeaderNetworkChange } = useHeaderChainId({
    isConnected,
    address,
    currentChainId
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      localStorage.setItem("LoginType", "reown");
    } catch (error) {
      console.error("Reown连接失败:", error);
      localStorage.removeItem("LoginType");
    } finally {
      setIsConnecting(false);
    }
  };

  const connectReownButton = () => (
    <appkit-button
      label={isConnecting ? "Connecting..." : "Connect Wallet"}
      style={{ display: "block", marginLeft: "auto" }}
      onClick={handleConnect}
    />
  );

  const ethNavItems = [
    { title: "0xEthan DApp", linkTo: "/" },
    { title: "BricSwap", linkTo: "/bricswap" },
    { title: "Estimate TxFee", linkTo: "/estimateTxFee" },
    { title: "Create Transaction", linkTo: "/createTransaction" },
    { title: "ERC20 Allowance", linkTo: "/erc20Allowance" },
    { title: "OFT Bridge (LayerZero)", linkTo: "/layerzeroOftBridge" },
    { title: "Faucet Token", linkTo: "/faucet" },
    { title: "Burn Token", linkTo: "/burn" },
    { title: "ENS Service", linkTo: "/ens" },
    { title: "Mint NFT", linkTo: "/mintnft" },
    { title: "Sign EIP712", linkTo: "/signEIP712" },
    { title: "EIP7702", linkTo: "/eip7702" },
    { title: "Utils", linkTo: "/utils" },
    { title: "ERC6551", linkTo: "/erc6551" },
    { title: "Web3Auth", linkTo: "/web3Auth" },
    { title: "Web3Auth Solana", linkTo: "/web3AuthSolana" }
  ];

  const solanaNavItems = [
    { title: "Solana Utils", linkTo: "/solanaUtils" },
    { title: "WSOL Solana", linkTo: "/wsolSolana" }
  ];

  return (
    <Router>
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
              aria-label={isSidebarOpen ? "关闭菜单" : "打开菜单"}
              aria-expanded={isSidebarOpen}
              aria-controls="app-sidebar"
              title={isSidebarOpen ? "关闭菜单" : "打开菜单"}
            >
              <span className="app-header-menu-icon" aria-hidden>
                <span className="app-header-menu-bar" />
                <span className="app-header-menu-bar" />
                <span className="app-header-menu-bar" />
              </span>
            </button>
            <NavLink to="/" className="app-logo">
              <span className="app-logo-accent">0x</span>Ethan DApp
            </NavLink>
          </div>
          <div className="app-header-right">
            <button
              type="button"
              className="app-header-theme-toggle"
              onClick={toggleTheme}
              title={theme === "dark" ? "切换到浅色" : "切换到深色"}
              aria-label={
                theme === "dark" ? "切换到浅色模式" : "切换到深色模式"
              }
            >
              <span className="app-header-theme-icon" aria-hidden>
                {theme === "dark" ? "☀️" : "🌙"}
              </span>
            </button>
            <label htmlFor="app-network" className="app-header-network-label">
              Network
            </label>
            <select
              id="app-network"
              className="app-header-network-select"
              value={String(chainId ?? "")}
              onChange={handleHeaderNetworkChange}
              aria-label="当前网络"
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
            <div className="w3-connect-wrap">{connectReownButton()}</div>
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
              <span className="sidebar-mobile-title">Menu</span>
              <button
                type="button"
                className="sidebar-mobile-close"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="关闭菜单"
              >
                ✕
              </button>
            </div>
            <nav className="sidebar-nav">
              <div className="sidebar-section">
                <div className="sidebar-section-title">Ethereum</div>
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
                    <span className="sidebar-link-text">{item.title}</span>
                  </NavLink>
                ))}
              </div>
              <div className="sidebar-section">
                <div className="sidebar-section-title">Solana</div>
                {solanaNavItems.map((item) => (
                  <NavLink
                    key={item.linkTo}
                    to={item.linkTo}
                    className={({ isActive }) =>
                      "sidebar-link" + (isActive ? " active" : "")
                    }
                    onClick={closeSidebarOnMobile}
                  >
                    <span className="sidebar-link-text">{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
            <button
              type="button"
              className="sidebar-collapse-tab"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? "收起菜单" : "展开菜单"}
              title={isSidebarOpen ? "收起菜单" : "展开菜单"}
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
