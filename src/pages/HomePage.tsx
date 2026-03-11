/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import { getChainIdAndBalanceETHAndTransactionCount } from "../utils/GetProvider";
import { DefaultChainId } from "../common/SystemConfiguration";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import "./HomePage.css";

const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h";

const MARKET_CACHE_KEY = "home_market_cache";

interface CoinItem {
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
  image: string | null;
  marketCap: string;
  high24h: string;
  low24h: string;
}

function getCachedMarketData(): {
  tickerList: CoinItem[];
  spotPrices: Record<string, string | null>;
  updatedAt: number;
} | null {
  try {
    const raw = localStorage.getItem(MARKET_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      tickerList?: CoinItem[];
      spotPrices?: Record<string, string | null>;
      updatedAt?: number;
    };
    if (!data?.tickerList?.length || !data?.updatedAt) return null;
    return {
      tickerList: data.tickerList,
      spotPrices: data.spotPrices ?? {},
      updatedAt: data.updatedAt
    };
  } catch {
    return null;
  }
}

function setCachedMarketData(
  tickerList: CoinItem[],
  spotPrices: Record<string, string | null>
): void {
  try {
    localStorage.setItem(
      MARKET_CACHE_KEY,
      JSON.stringify({ tickerList, spotPrices, updatedAt: Date.now() })
    );
  } catch (e) {
    console.warn("Market cache write failed:", e);
  }
}

const emptyCoin = (symbol: string): CoinItem => ({
  symbol,
  price: "—",
  change: "—",
  isUp: true,
  image: null,
  marketCap: "—",
  high24h: "—",
  low24h: "—"
});

const fallbackTickerList: CoinItem[] = [
  "BTC",
  "ETH",
  "SOL",
  "DOGE",
  "BNB",
  "XRP",
  "ADA",
  "HYPE",
  "LINK",
  "AVAX",
  "DOT",
  "MATIC",
  "TRX",
  "LEO",
  "BCH",
  "ATOM"
].map(emptyCoin);

function formatPrice(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1000)
    return "$" + num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (num >= 1)
    return (
      "$" +
      num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
      })
    );
  if (num >= 0.01) return "$" + num.toFixed(4);
  if (num > 0) return "$" + num.toFixed(6);
  return "$0";
}

function formatChange(val: number | null | undefined): {
  text: string;
  isUp: boolean;
} {
  if (val == null || Number.isNaN(val)) return { text: "—", isUp: true };
  const isUp = val >= 0;
  return { text: (isUp ? "+" : "") + val.toFixed(2) + "%", isUp };
}

function formatMarketCap(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return "$" + num.toFixed(0);
}

async function fetchTickerFromCoinGecko(): Promise<CoinItem[]> {
  const res = await fetch(COINGECKO_MARKETS_URL);
  if (!res.ok) throw new Error("CoinGecko request failed");
  const data = (await res.json()) as Array<{
    symbol?: string;
    current_price?: number;
    price_change_percentage_24h_in_currency?: number;
    price_change_percentage_24h?: number;
    image?: string;
    market_cap?: number;
    high_24h?: number;
    low_24h?: number;
  }>;
  return data.map((item) => {
    const { text, isUp } = formatChange(
      item.price_change_percentage_24h_in_currency ??
        item.price_change_percentage_24h
    );
    return {
      symbol: (item.symbol ?? "").toUpperCase(),
      price: formatPrice(item.current_price),
      change: text,
      isUp,
      image: item.image ?? null,
      marketCap: formatMarketCap(item.market_cap),
      high24h: formatPrice(item.high_24h),
      low24h: formatPrice(item.low_24h)
    };
  });
}

const CoinCard = ({ item }: { item: CoinItem }) => (
  <div className="home-coin-card">
    <div className="home-coin-card-head">
      {item.image && (
        <img
          src={item.image}
          alt=""
          className="home-coin-card-icon"
          width={28}
          height={28}
        />
      )}
      <div className="home-coin-card-title">
        <span className="home-coin-card-symbol">{item.symbol}</span>
        <span className={`home-coin-card-change ${item.isUp ? "up" : "down"}`}>
          {item.change}
        </span>
      </div>
    </div>
    <div className="home-coin-card-price">{item.price}</div>
    <div className="home-coin-card-meta">
      <div className="home-coin-card-meta-row">
        <span className="home-coin-card-meta-label">Market Cap</span>
        <span className="home-coin-card-meta-value">{item.marketCap}</span>
      </div>
      <div className="home-coin-card-meta-row">
        <span className="home-coin-card-meta-label">24h High</span>
        <span className="home-coin-card-meta-value">{item.high24h}</span>
      </div>
      <div className="home-coin-card-meta-row">
        <span className="home-coin-card-meta-label">24h Low</span>
        <span className="home-coin-card-meta-value">{item.low24h}</span>
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentAccountBalance, setCurrentAccountBalance] = useState<
    string | null
  >(null);
  const [currentAccountNonce, setCurrentAccountNonce] = useState<number | null>(
    null
  );
  const [chainId, setChainId] = useState(
    localStorage.getItem("chainId") || DefaultChainId
  );
  const [tickerList, setTickerList] = useState<CoinItem[]>(fallbackTickerList);
  const [spotPrices, setSpotPrices] = useState<Record<string, string | null>>({
    btc: null,
    eth: null,
    sol: null,
    bnb: null,
    okb: null
  });
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<number | null>(null);
  const [marketSearch, setMarketSearch] = useState("");

  const marketFilteredList = useMemo(() => {
    const q = marketSearch.trim().toLowerCase();
    if (!q) return tickerList;
    return tickerList.filter((c) => c.symbol.toLowerCase().includes(q));
  }, [tickerList, marketSearch]);

  const { chainId: currentChainId, caipNetwork } = useAppKitNetwork();
  const { address, isConnected } = useAppKitAccount();
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const { connection: solanaConnection } = useAppKitConnection();
  const isSolanaNetwork = caipNetwork?.chainNamespace === "solana";
  const balanceSymbol =
    caipNetwork?.nativeCurrency?.symbol ?? (isSolanaNetwork ? "SOL" : "ETH");

  const loadTicker = useCallback(async () => {
    const cached = getCachedMarketData();
    if (cached) {
      setTickerList(cached.tickerList);
      setSpotPrices(cached.spotPrices);
      setMarketUpdatedAt(cached.updatedAt);
    }
    try {
      const list = await fetchTickerFromCoinGecko();
      const bySymbol = Object.fromEntries(list.map((x) => [x.symbol, x]));
      const spots: Record<string, string | null> = {
        btc: bySymbol.BTC?.price ?? null,
        eth: bySymbol.ETH?.price ?? null,
        sol: bySymbol.SOL?.price ?? null,
        bnb: bySymbol.BNB?.price ?? null,
        okb: bySymbol.OKB?.price ?? null
      };
      setTickerList(list);
      setSpotPrices(spots);
      setMarketUpdatedAt(Date.now());
      setCachedMarketData(list, spots);
    } catch (e) {
      console.warn("CoinGecko ticker load failed:", e);
    }
  }, []);

  useEffect(() => {
    loadTicker();
    const interval = setInterval(loadTicker, 60000);
    return () => clearInterval(interval);
  }, [loadTicker]);

  const marketUpdatedLabel = marketUpdatedAt
    ? new Date(marketUpdatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    : null;

  useEffect(() => {
    if (isSolanaNetwork) return;
    if (isConnected && address) {
      setCurrentAccount(address);
      setChainId(String(currentChainId ?? ""));
      getChainIdAndBalanceETHAndTransactionCount(address).then((res) => {
        setCurrentAccountBalance(res?.balance ?? null);
        setCurrentAccountNonce(res?.nonce ?? null);
      });
    }
  }, [isConnected, address, currentChainId, isSolanaNetwork]);

  useEffect(() => {
    if (!isSolanaNetwork) return;
    const solAddress = solanaAccount?.address;
    if (!solanaConnection || !solAddress) {
      setCurrentAccount(solAddress ?? null);
      setCurrentAccountBalance(null);
      setCurrentAccountNonce(null);
      return;
    }
    let isActive = true;
    const refreshSolanaStats = async () => {
      try {
        const lamports = await solanaConnection.getBalance(
          new PublicKey(solAddress)
        );
        if (!isActive) return;
        setCurrentAccount(solAddress);
        setChainId(String(currentChainId ?? ""));
        setCurrentAccountBalance(String(lamports / LAMPORTS_PER_SOL));
        setCurrentAccountNonce(null);
      } catch (error) {
        if (!isActive) return;
        console.warn("Load Solana balance failed:", error);
      }
    };
    refreshSolanaStats();
    const timerId = setInterval(refreshSolanaStats, 5000);
    return () => {
      isActive = false;
      clearInterval(timerId);
    };
  }, [
    isSolanaNetwork,
    solanaAccount?.address,
    solanaConnection,
    currentChainId
  ]);

  useEffect(() => {
    const onNetworkChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ chainId: string }>).detail;
      if (detail?.chainId != null) setChainId(String(detail.chainId));
    };
    window.addEventListener("app-network-changed", onNetworkChanged);
    return () =>
      window.removeEventListener("app-network-changed", onNetworkChanged);
  }, []);

  return (
    <div className="home-page main-app">
      <section className="home-hero">
        <h1>
          Welcome to <span className="hero-accent">0xEthan DApp</span>
        </h1>
        <p>Connect wallet · Multi-chain · NFT & DeFi tools</p>
      </section>
      <div className="home-cards home-cards-stats">
        <div className="home-card">
          <div className="home-card-label">Chain ID</div>
          <div className="home-card-value accent">{chainId || "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">Account</div>
          <div className="home-card-value" title={currentAccount ?? ""}>
            {currentAccount
              ? `${currentAccount.slice(0, 6)}…${currentAccount.slice(-4)}`
              : "—"}
          </div>
        </div>
        <div className="home-card">
          <div className="home-card-label">Balance</div>
          <div className="home-card-value">
            {currentAccountBalance != null
              ? `${Number(currentAccountBalance).toFixed(8)} ${balanceSymbol}`
              : "—"}
          </div>
        </div>
        <div className="home-card">
          <div className="home-card-label">Nonce</div>
          <div className="home-card-value">{currentAccountNonce ?? "—"}</div>
        </div>
      </div>
      <div className="home-spot-row">
        {(() => {
          const bySymbol = Object.fromEntries(
            tickerList.map((x) => [x.symbol, x])
          );
          return (
            [
              { key: "btc", label: "BTC" },
              { key: "eth", label: "ETH" },
              { key: "bnb", label: "BNB" },
              { key: "sol", label: "SOL" },
              { key: "okb", label: "OKB" }
            ] as const
          ).map(({ key, label }) => {
            const spot = spotPrices[key];
            const item = bySymbol[label];
            const change = item?.change ?? "—";
            const isUp = item?.isUp ?? true;
            return (
              <div key={key} className="home-spot-card">
                <div className="home-spot-card-top">
                  <span className="home-spot-card-symbol">{label}</span>
                  <span
                    className={`home-spot-card-badge ${isUp ? "up" : "down"}`}
                    title="24h"
                  >
                    {change}
                  </span>
                </div>
                <div className="home-spot-card-price">{spot ?? "—"}</div>
              </div>
            );
          });
        })()}
      </div>
      <section className="home-market-wrap">
        <div className="home-market-header">
          <h2 className="home-market-title">Market</h2>
          <div className="home-market-toolbar">
            <input
              type="text"
              className="home-market-search"
              placeholder="Symbol (e.g. BTC, ETH)"
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
              aria-label="Search coins"
            />
            {marketUpdatedLabel && (
              <span className="home-market-updated" title="Data last updated">
                Updated at {marketUpdatedLabel}
              </span>
            )}
          </div>
        </div>
        {marketSearch.trim() ? (
          <div className="home-market-grid-wrap">
            {marketFilteredList.length > 0 ? (
              <div className="home-market-grid">
                {marketFilteredList.map((item) => (
                  <CoinCard key={item.symbol} item={item} />
                ))}
              </div>
            ) : (
              <p className="home-market-empty">在 100 条数据中未找到匹配币种</p>
            )}
          </div>
        ) : (
          <>
            <div className="home-market-scroll-row">
              <div className="home-market-track">
                {(() => {
                  const row1 = tickerList.slice(
                    0,
                    Math.ceil(tickerList.length / 2)
                  );
                  return [...row1, ...row1].map((item, i) => (
                    <CoinCard key={`r1-${item.symbol}-${i}`} item={item} />
                  ));
                })()}
              </div>
            </div>
            <div className="home-market-scroll-row">
              <div className="home-market-track home-market-track-reverse">
                {(() => {
                  const row2 = tickerList.slice(
                    Math.ceil(tickerList.length / 2)
                  );
                  return [...row2, ...row2].map((item, i) => (
                    <CoinCard key={`r2-${item.symbol}-${i}`} item={item} />
                  ));
                })()}
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default HomePage;
