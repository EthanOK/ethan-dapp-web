import { useEffect, useRef, useState } from "react";
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
import ERC20AllowancePage from "./pages/ERC20AllowancePage";
import { Ethers5Adapter } from "@reown/appkit-adapter-ethers5";
import {
  base,
  bsc,
  mainnet,
  sepolia,
  hoodi,
  solanaDevnet,
  solana,
  bitcoin,
  bitcoinTestnet
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";
import { initializeSubscribers } from "./utils/Suscribers";
import { toast, Toaster } from "sonner";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { login } from "./utils/ConnectWallet";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin";

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
  | typeof bsc
  | typeof solanaDevnet
  | typeof solana
  | typeof bitcoin
  | typeof bitcoinTestnet;

export const getDefaultNetwork = (chainId: string | number): AppKitNetwork => {
  const all: AppKitNetwork[] = [
    sepolia,
    hoodi,
    mainnet,
    base,
    bsc,
    solanaDevnet,
    solana,
    bitcoin,
    bitcoinTestnet
  ];
  const asString = String(chainId);

  // Prefer CAIP network id match (e.g. "solana:..."/"eip155:...") when present.
  const byCaip = all.find((n) => (n as any).caipNetworkId === asString);
  if (byCaip) return byCaip;

  // Fall back to numeric chain id match for EVM networks.
  const asNumber =
    typeof chainId === "number"
      ? chainId
      : /^\d+$/.test(asString)
        ? Number(asString)
        : undefined;
  if (typeof asNumber === "number") {
    const byId = all.find((n) => (n as any).id === asNumber);
    if (byId) return byId;
  }

  // Solana's `id` is a string (not CAIP).
  const bySolanaId = all.find((n) => (n as any).id === asString);
  if (bySolanaId) return bySolanaId;

  return sepolia;
};

// 头部下拉：用 CAIP network id 做 value，确保 Solana/EVM 都能正确显示与切换
const headerNetworksAll: AppKitNetwork[] = [
  mainnet,
  sepolia,
  hoodi,
  bsc,
  base,
  solana,
  solanaDevnet,
  bitcoin,
  bitcoinTestnet
];

const projectId = projectId_walletconnect;

const metadata = {
  name: "Ethan Dapp Website",
  description: "Ethan Dapp Website",
  url: "https://ethan-dapp.vercel.app",
  icons: ["https://ethan-dapp.vercel.app/favicon.ico"]
};

// 使用 data URI 作为链图标，避免从 CDN 拉取时出现 403
const FALLBACK_CHAIN_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const modal = createAppKit({
  adapters: [new Ethers5Adapter(), new SolanaAdapter(), new BitcoinAdapter()],
  metadata,
  networks: [
    sepolia,
    hoodi,
    mainnet,
    base,
    bsc,
    solana,
    solanaDevnet,
    bitcoin,
    bitcoinTestnet
  ],
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
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const bitcoinAccount = useAppKitAccount({ namespace: "bip122" });
  const { chainId: currentChainId, caipNetwork } = useAppKitNetwork();
  const [isConnecting, setIsConnecting] = useState(false);
  const prevIsConnectedRef = useRef(false);

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
      if (currentChainId === undefined || currentChainId === null) return;
      setCurrentAccount(address);
      const active = getDefaultNetwork(currentChainId);
      const activeValue = String(
        (active as any).caipNetworkId ?? (active as any).id
      );
      setChainId(activeValue);
      localStorage.setItem("chainId", activeValue);
    }
  }, [isConnected, address, currentChainId]);

  // 仅连接 Bitcoin 时同步头部网络值（默认 account hook 可能无 EVM address）
  useEffect(() => {
    if (caipNetwork?.chainNamespace !== "bip122") return;
    if (!bitcoinAccount?.isConnected || !bitcoinAccount?.address) return;
    if (currentChainId === undefined || currentChainId === null) return;
    const active = getDefaultNetwork(currentChainId);
    const activeValue = String(
      (active as any).caipNetworkId ?? (active as any).id
    );
    setChainId(activeValue);
    localStorage.setItem("chainId", activeValue);
  }, [
    caipNetwork?.chainNamespace,
    bitcoinAccount?.isConnected,
    bitcoinAccount?.address,
    currentChainId
  ]);

  // Solana 网络切换后，主动刷新一次 native balance，避免 AppKit 按钮停留在旧余额/0
  useEffect(() => {
    const isSolana = caipNetwork?.chainNamespace === "solana";
    const solAddress = solanaAccount?.address;
    if (!isSolana || !solanaAccount?.isConnected || !solAddress) return;
    if (currentChainId === undefined || currentChainId === null) return;

    try {
      // fire-and-forget
      modal?.updateNativeBalance(solAddress, currentChainId as any, "solana");
    } catch (e) {
      console.warn("updateNativeBalance (solana) failed", e);
    }
  }, [
    caipNetwork?.chainNamespace,
    solanaAccount?.isConnected,
    solanaAccount?.address,
    currentChainId
  ]);

  // Bitcoin 网络切换后刷新 native balance（与 Solana 一致）
  useEffect(() => {
    const isBitcoin = caipNetwork?.chainNamespace === "bip122";
    const btcAddress = bitcoinAccount?.address;
    if (!isBitcoin || !bitcoinAccount?.isConnected || !btcAddress) return;
    if (currentChainId === undefined || currentChainId === null) return;

    try {
      modal?.updateNativeBalance(btcAddress, currentChainId as any, "bip122");
    } catch (e) {
      console.warn("updateNativeBalance (bip122) failed", e);
    }
  }, [
    caipNetwork?.chainNamespace,
    bitcoinAccount?.isConnected,
    bitcoinAccount?.address,
    currentChainId
  ]);

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
    const justConnected = !prevIsConnectedRef.current && isConnected;
    prevIsConnectedRef.current = isConnected;

    if (
      loginType === "reown" &&
      justConnected &&
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
    window.dispatchEvent(
      new CustomEvent("app-network-changed", { detail: { chainId: nextId } })
    );
    try {
      const nextNetwork = getDefaultNetwork(nextId);
      await modal.switchNetwork(nextNetwork);
    } catch (err) {
      console.error("Switch network failed:", err);
      toast.error("切换网络失败，请重试");
    }
  };

  const ethNavItems = [
    { title: "0xEthan DApp", linkTo: "/" },
    { title: "Estimate TxFee", linkTo: "/estimateTxFee" },
    { title: "Create Transaction", linkTo: "/createTransaction" },
    { title: "ERC20 Allowance", linkTo: "/erc20Allowance" },
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
            <button
              type="button"
              className="app-header-menu-btn"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? "关闭菜单" : "打开菜单"}
              title={isSidebarOpen ? "关闭菜单" : "打开菜单"}
            >
              <span className="app-header-menu-icon" aria-hidden>
                {isSidebarOpen ? "✕" : "☰"}
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
                  (network as any).caipNetworkId ?? (network as any).id
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
          className={`app-body ${isSidebarOpen ? "sidebar-open" : "sidebar-collapsed"}`}
        >
          <div
            className={`app-sidebar-overlay ${isSidebarOpen ? "visible" : ""}`}
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden
          />
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
                    onClick={() => {
                      if (window.matchMedia("(max-width: 768px)").matches) {
                        setIsSidebarOpen(false);
                      }
                    }}
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
                    onClick={() => {
                      if (window.matchMedia("(max-width: 768px)").matches) {
                        setIsSidebarOpen(false);
                      }
                    }}
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
              <Route path="/erc20Allowance" element={<ERC20AllowancePage />} />
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
