import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink
} from "react-router-dom";
import MintNFTPage from "./pages/MintNFTPage";
import SignEIP712Page from "./pages/SignEIP712Page";
import HomePage from "./pages/HomePage";
import GetOpenSeaDataPage from "./pages/GetOpenSeaDataPage";
import GetIPFSPage from "./pages/GetIPFSPage";
import "./App.css";
import {
  DefaultChainId,
  projectId_walletconnect
} from "./common/SystemConfiguration";
import BuyNFTPage from "./pages/BuyNFTPage";
import ENSPage from "./pages/ENSPage";
import FaucetTokenPage from "./pages/FaucetTokenPage";
import UtilsPage from "./pages/UtilsPage";
import BurnTokenPage from "./pages/BurnTokenPage";
import SolanaUtilsPage from "./pages/SolanaUtilsPage";
import BuyBlurNFTPage from "./pages/BuyBlurNFTPage";
import ERC6551Page from "./pages/ERC6551Page";
import EstimateTxFeePage from "./pages/EstimateTxFeePage";
import CreateTransactionPage from "./pages/CreateTransactionPage";
import GetCollectionPage from "./pages/GetCollectionPage";
import YunGouAggregatorsPage from "./pages/YunGouAggregatorsPage";
import Web3AuthPage from "./pages/Web3AuthPage";
import WsolPage from "./pages/WsolPage";
import Web3AuthSolanaPage from "./pages/Web3AuthSolanaPage";
import EIP7702Page from "./pages/EIP7702Page";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import { base, bsc, mainnet, sepolia, hoodi } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";
import { initializeSubscribers } from "./utils/Suscribers";
import { toast, Toaster } from "sonner";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { login } from "./utils/ConnectWallet";
import { SupportChains } from "./common/ChainsConfig";

const HEADER_CHAIN_IDS = [1, 11155111, 560048, 56, 8453];
const headerChains = SupportChains.filter((c) =>
  HEADER_CHAIN_IDS.includes(parseInt(c.id, 10))
);

if (typeof window !== "undefined") {
  (window as Window).Buffer =
    (window as Window).Buffer ?? require("buffer").Buffer;
}

const storedChainId = localStorage.getItem("chainId") || DefaultChainId;

type AppKitNetwork =
  | typeof sepolia
  | typeof hoodi
  | typeof mainnet
  | typeof base
  | typeof bsc;

export const getDefaultNetwork = (chainId: string | number): AppKitNetwork => {
  const networkMap: Record<number, AppKitNetwork> = {
    [sepolia.id]: sepolia,
    [hoodi.id]: hoodi,
    [mainnet.id]: mainnet,
    [base.id]: base,
    [bsc.id]: bsc
  };
  return networkMap[Number(chainId)] ?? sepolia;
};

const projectId = projectId_walletconnect;

const metadata = {
  name: "Ethan Dapp Website",
  description: "My Website description",
  url: "https://ethan-dapp.vercel.app",
  icons: [""]
};

// 使用 data URI 作为链图标，避免从 CDN 拉取时出现 403
const FALLBACK_CHAIN_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const modal = createAppKit({
  adapters: [new Ethers5Adapter()],
  metadata,
  networks: [sepolia, hoodi, mainnet, base, bsc],
  defaultNetwork: getDefaultNetwork(storedChainId),
  projectId: projectId ?? "",
  chainImages: {
    [mainnet.id]: FALLBACK_CHAIN_ICON,
    [sepolia.id]: FALLBACK_CHAIN_ICON,
    [hoodi.id]: FALLBACK_CHAIN_ICON,
    [base.id]: FALLBACK_CHAIN_ICON,
    [bsc.id]: FALLBACK_CHAIN_ICON
  },
  features: {
    analytics: true
  }
});

initializeSubscribers(modal);

const THEME_KEY = "app-theme";
const getStoredTheme = (): "light" | "dark" => {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

function App() {
  const [, setCurrentAccount] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chainId, setChainId] = useState<string>(
    localStorage.getItem("chainId") || DefaultChainId
  );
  const [theme, setTheme] = useState<"light" | "dark">(getStoredTheme);

  const { address, isConnected } = useAppKitAccount();
  const { chainId: currentChainId } = useAppKitNetwork();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn("localStorage theme save failed", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
      setChainId(String(currentChainId));
      localStorage.setItem("chainId", String(currentChainId));
    }
  }, [isConnected, address, currentChainId]);

  const disconnect = async () => {
    const savedChainId = localStorage.getItem("chainId");
    localStorage.clear();
    if (savedChainId) localStorage.setItem("chainId", savedChainId);
    window.location.reload();
  };

  useEffect(() => {
    const loginType = localStorage.getItem("LoginType");
    const storedAccount = localStorage.getItem("userAddress");
    const storedConnect = localStorage.getItem("@appkit/connection_status");
    if (
      loginType === "reown" &&
      isConnected &&
      address &&
      address !== storedAccount
    ) {
      login().then((result) => {
        if (result) {
          localStorage.setItem("userAddress", address);
          toast.success("Success, BaBy is ready to use!");
        } else {
          disconnect();
        }
      });
    }

    if (
      loginType === "reown" &&
      storedConnect === "disconnected" &&
      storedAccount
    ) {
      disconnect();
    }
  }, [isConnected, address]);

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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleHeaderNetworkChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const nextId = e?.target?.value;
    if (!nextId) return;
    setChainId(nextId);
    localStorage.setItem("chainId", nextId);
    try {
      await modal.switchNetwork(getDefaultNetwork(parseInt(nextId, 10)));
    } catch (err) {
      console.error("Switch network failed:", err);
      toast.error("切换网络失败，请重试");
    }
  };

  const ethNavItems = [
    { title: "Login DApp", linkTo: "/" },
    { title: "Estimate TxFee", linkTo: "/estimateTxFee" },
    { title: "Create Transaction", linkTo: "/createTransaction" },
    { title: "Faucet Token", linkTo: "/faucet" },
    { title: "Burn Token", linkTo: "/burn" },
    { title: "ENS Service", linkTo: "/ens" },
    { title: "Mint NFT", linkTo: "/mintnft" },
    // { title: "Get Collection", linkTo: "/getCollection" },
    // { title: "YunGou Aggregators", linkTo: "/yunGouAggregators" },
    { title: "Sign EIP712", linkTo: "/signEIP712" },
    { title: "EIP7702", linkTo: "/eip7702" },
    // { title: "Get OpenSeaData", linkTo: "/getOpenSeaData" },
    // { title: "Buy OpenSea NFT", linkTo: "/buyNFT" },
    // { title: "Buy Blur NFT", linkTo: "/buyBlurNFT" },
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
              {headerChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
            <div className="w3-connect-wrap">{connectReownButton()}</div>
          </div>
        </header>

        <div className="app-body">
          <aside
            className={`app-sidebar ${isSidebarOpen ? "open" : "collapsed"}`}
          >
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
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/solanaUtils" element={<SolanaUtilsPage />} />
              <Route path="/ens" element={<ENSPage />} />
              <Route path="/mintnft" element={<MintNFTPage />} />
              <Route path="/getCollection" element={<GetCollectionPage />} />
              <Route
                path="/yunGouAggregators"
                element={<YunGouAggregatorsPage />}
              />
              <Route path="/signEIP712" element={<SignEIP712Page />} />
              <Route path="/getOpenSeaData" element={<GetOpenSeaDataPage />} />
              <Route path="/buyNFT" element={<BuyNFTPage />} />
              <Route path="/buyBlurNFT" element={<BuyBlurNFTPage />} />
              <Route path="/getIPFS" element={<GetIPFSPage />} />
              <Route path="/faucet" element={<FaucetTokenPage />} />
              <Route path="/burn" element={<BurnTokenPage />} />
              <Route
                path="/createTransaction"
                element={<CreateTransactionPage />}
              />
              <Route path="/utils" element={<UtilsPage />} />
              <Route path="/erc6551" element={<ERC6551Page />} />
              <Route path="/eip7702" element={<EIP7702Page />} />
              <Route path="/estimateTxFee" element={<EstimateTxFeePage />} />
              <Route path="/web3Auth" element={<Web3AuthPage />} />
              <Route path="/web3AuthSolana" element={<Web3AuthSolanaPage />} />
              <Route path="/wsolSolana" element={<WsolPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
