/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback } from "react";
import { getChainIdAndBalanceETHAndTransactionCount } from "../utils/GetProvider.js";
import { DefaultChainId } from "../common/SystemConfiguration.js";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import "./HomePage.css";

const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=30&page=1&sparkline=false&price_change_percentage=24h";

const MARKET_CACHE_KEY = "home_market_cache";

function getCachedMarketData() {
  try {
    const raw = localStorage.getItem(MARKET_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.tickerList?.length || !data?.updatedAt) return null;
    return {
      tickerList: data.tickerList,
      spotPrices: data.spotPrices || {},
      updatedAt: data.updatedAt
    };
  } catch {
    return null;
  }
}

function setCachedMarketData(tickerList, spotPrices) {
  try {
    localStorage.setItem(
      MARKET_CACHE_KEY,
      JSON.stringify({
        tickerList,
        spotPrices,
        updatedAt: Date.now()
      })
    );
  } catch (e) {
    console.warn("Market cache write failed:", e);
  }
}

const emptyCoin = (symbol) => ({
  symbol,
  price: "—",
  change: "—",
  isUp: true,
  image: null,
  marketCap: "—",
  high24h: "—",
  low24h: "—"
});

const fallbackTickerList = [
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

function formatPrice(num) {
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

function formatChange(val) {
  if (val == null || Number.isNaN(val)) return { text: "—", isUp: true };
  const isUp = val >= 0;
  const text = (isUp ? "+" : "") + val.toFixed(2) + "%";
  return { text, isUp };
}

function formatMarketCap(num) {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return "$" + num.toFixed(0);
}

async function fetchTickerFromCoinGecko() {
  const res = await fetch(COINGECKO_MARKETS_URL);
  if (!res.ok) throw new Error("CoinGecko request failed");
  const data = await res.json();
  return data.map((item) => {
    const { text, isUp } = formatChange(
      item.price_change_percentage_24h_in_currency ??
        item.price_change_percentage_24h
    );
    return {
      symbol: (item.symbol || "").toUpperCase(),
      price: formatPrice(item.current_price),
      change: text,
      isUp,
      image: item.image || null,
      marketCap: formatMarketCap(item.market_cap),
      high24h: formatPrice(item.high_24h),
      low24h: formatPrice(item.low_24h)
    };
  });
}

const CoinCard = ({ item }) => (
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
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentAccountBalance, setCurrentAccountBalance] = useState(null);
  const [currentAccountNonce, setCurrentAccountNonce] = useState(null);
  const [chainId, setChainId] = useState(
    localStorage.getItem("chainId") || DefaultChainId
  );
  const [tickerList, setTickerList] = useState(fallbackTickerList);
  const [spotPrices, setSpotPrices] = useState({
    btc: null,
    eth: null,
    sol: null,
    bnb: null
  });
  const [marketUpdatedAt, setMarketUpdatedAt] = useState(null);

  const { chainId: currentChainId } = useAppKitNetwork();
  const { address, isConnected } = useAppKitAccount();

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
      const spots = {
        btc: bySymbol.BTC?.price ?? null,
        eth: bySymbol.ETH?.price ?? null,
        sol: bySymbol.SOL?.price ?? null,
        bnb: bySymbol.BNB?.price ?? null
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
    if (isConnected && address) {
      setCurrentAccount(address);
      setChainId(currentChainId);
      getChainIdAndBalanceETHAndTransactionCount(address).then((res) => {
        setCurrentAccountBalance(res?.balance);
        setCurrentAccountNonce(res?.nonce);
      });
    }
  }, [isConnected, address, currentChainId]);

  return (
    <div className="home-page main-app">
      <section className="home-hero">
        <h1>
          Welcome to <span className="hero-accent">0xEthan DApp</span>
        </h1>
        <p>Connect wallet · Multi-chain · NFT & DeFi tools</p>
      </section>

      <div className="home-cards">
        <div className="home-card">
          <div className="home-card-label">Chain ID</div>
          <div className="home-card-value accent">{chainId || "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">Account</div>
          <div className="home-card-value" title={currentAccount || ""}>
            {currentAccount
              ? `${currentAccount.slice(0, 6)}…${currentAccount.slice(-4)}`
              : "—"}
          </div>
        </div>
        <div className="home-card">
          <div className="home-card-label">Balance</div>
          <div className="home-card-value">
            {currentAccountBalance != null
              ? Number(currentAccountBalance).toFixed(8)
              : "—"}
          </div>
        </div>
        <div className="home-card">
          <div className="home-card-label">Nonce</div>
          <div className="home-card-value">{currentAccountNonce ?? "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">BTC</div>
          <div className="home-card-value accent">{spotPrices.btc ?? "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">ETH</div>
          <div className="home-card-value accent">{spotPrices.eth ?? "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">BNB</div>
          <div className="home-card-value accent">{spotPrices.bnb ?? "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">SOL</div>
          <div className="home-card-value accent">{spotPrices.sol ?? "—"}</div>
        </div>
      </div>

      <section className="home-market-wrap">
        <div className="home-market-header">
          <h2 className="home-market-title">Market</h2>
          {marketUpdatedLabel && (
            <span className="home-market-updated" title="Data last updated">
              Updated at {marketUpdatedLabel}
            </span>
          )}
        </div>
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
              const row2 = tickerList.slice(Math.ceil(tickerList.length / 2));
              return [...row2, ...row2].map((item, i) => (
                <CoinCard key={`r2-${item.symbol}-${i}`} item={item} />
              ));
            })()}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
