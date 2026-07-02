import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fallbackMarketList,
  fetchMarketTickerList,
  formatPricePlain,
  getCachedMarketData,
  setCachedMarketData,
  toCoinRouteState,
  type MarketCoinItem
} from "@/lib/price/marketTicker";
import "./MarketListPage.css";

const ChartIcon = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M4 19V5M4 19h16M8 17V11M12 17V7M16 17v-4"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type SortKey = "name" | "price" | "change" | "volume" | "cap";
type SortDir = "asc" | "desc";

function compareNullableNum(
  a: number | null,
  b: number | null,
  dir: SortDir
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return dir === "asc" ? a - b : b - a;
}

function sortMarketList(
  items: MarketCoinItem[],
  key: SortKey,
  dir: SortDir
): MarketCoinItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (key) {
      case "name":
        return dir === "asc"
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      case "price":
        return compareNullableNum(a.priceNum, b.priceNum, dir);
      case "change":
        return compareNullableNum(a.changePct, b.changePct, dir);
      case "volume":
        return compareNullableNum(a.volume24hNum, b.volume24hNum, dir);
      case "cap":
        return compareNullableNum(a.marketCapNum, b.marketCapNum, dir);
      default:
        return 0;
    }
  });
  return sorted;
}

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span
    className={`market-list-sort-icon ${active ? "active" : ""}`}
    aria-hidden
  >
    {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
  </span>
);

const MarketListPage = () => {
  const navigate = useNavigate();
  const [list, setList] = useState<MarketCoinItem[]>(fallbackMarketList);
  const [search, setSearch] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("cap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" ? "asc" : "desc");
  };

  const loadList = useCallback(async () => {
    const cached = getCachedMarketData();
    if (cached) {
      setList(cached.tickerList);
      setUpdatedAt(cached.updatedAt);
    }
    try {
      const tickerList = await fetchMarketTickerList();
      const bySymbol = Object.fromEntries(
        tickerList.map((x) => [x.symbol, x.price])
      );
      const spots: Record<string, string | null> = {
        btc: bySymbol.BTC ?? null,
        eth: bySymbol.ETH ?? null,
        sol: bySymbol.SOL ?? null,
        bnb: bySymbol.BNB ?? null,
        okb: bySymbol.OKB ?? null
      };
      setList(tickerList);
      setUpdatedAt(Date.now());
      setCachedMarketData(tickerList, spots);
    } catch (e) {
      console.warn("Market list load failed:", e);
    }
  }, []);

  useEffect(() => {
    void loadList();
    const interval = setInterval(loadList, 30000);
    return () => clearInterval(interval);
  }, [loadList]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (item) =>
            item.symbol.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q)
        )
      : list;
    return sortMarketList(filtered, sortKey, sortDir);
  }, [list, search, sortKey, sortDir]);

  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    : null;

  const openChart = (item: MarketCoinItem) => {
    if (!item.id) return;
    navigate(`/market?coinId=${item.id}`, { state: toCoinRouteState(item) });
  };

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "cap", label: "Cap" },
    { key: "price", label: "Price" },
    { key: "change", label: "24h" },
    { key: "volume", label: "Vol" },
    { key: "name", label: "Name" }
  ];

  const renderRowActions = (item: MarketCoinItem) => (
    <div className="market-list-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="market-list-action-btn"
        title="Chart"
        aria-label={`Chart ${item.symbol}`}
        onClick={() => openChart(item)}
      >
        <ChartIcon />
      </button>
    </div>
  );

  return (
    <div className="market-list-page main-app">
      <section className="market-list-hero">
        <div className="market-list-hero-top">
          <div>
            <Link to="/" className="market-list-back">
              ← Home
            </Link>
            <h1>Market</h1>
            <p>Top 100 coins by market cap · CoinGecko</p>
          </div>
          <div className="market-list-toolbar">
            <input
              type="text"
              className="market-list-search"
              placeholder="Symbol (e.g. BTC, ETH)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search coins"
            />
            {updatedLabel && (
              <span className="market-list-updated">
                Updated at {updatedLabel}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="market-list-mobile-only">
        <div
          className="market-list-sort-pills"
          role="toolbar"
          aria-label="Sort by"
        >
          {sortOptions.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`market-list-sort-pill ${sortKey === key ? "active" : ""}`}
              onClick={() => toggleSort(key)}
            >
              {label}
              {sortKey === key && (
                <span className="market-list-sort-pill-dir" aria-hidden>
                  {sortDir === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <p className="market-list-empty market-list-empty-mobile">
            No matching coins found
          </p>
        ) : (
          <ul className="market-list-cards">
            {rows.map((item, index) => (
              <li key={item.id || item.symbol}>
                <article
                  className="market-list-card"
                  onClick={() => openChart(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openChart(item);
                    }
                  }}
                >
                  <div className="market-list-card-top">
                    <span className="market-list-card-rank">{index + 1}</span>
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        width={32}
                        height={32}
                        className="market-list-icon"
                      />
                    )}
                    <div className="market-list-name-text">
                      <span className="market-list-symbol">{item.symbol}</span>
                      <span className="market-list-fullname">{item.name}</span>
                    </div>
                    <span
                      className={`market-list-change market-list-card-change ${item.isUp ? "up" : "down"}`}
                    >
                      {item.change.replace(" (24h)", "")}
                    </span>
                  </div>
                  <div className="market-list-card-stats">
                    <div className="market-list-card-stat">
                      <span className="market-list-card-stat-label">Price</span>
                      <span className="market-list-card-stat-value">
                        {item.price}
                      </span>
                    </div>
                    <div className="market-list-card-stat">
                      <span className="market-list-card-stat-label">M.Cap</span>
                      <span className="market-list-card-stat-value">
                        {item.marketCap}
                      </span>
                    </div>
                    <div className="market-list-card-stat">
                      <span className="market-list-card-stat-label">
                        24h Vol
                      </span>
                      <span className="market-list-card-stat-value">
                        {item.volume24h}
                      </span>
                    </div>
                  </div>
                  {renderRowActions(item)}
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="market-list-panel market-list-desktop-only">
        <div className="market-list-table-wrap">
          <table className="market-list-table">
            <thead>
              <tr>
                <th className="col-rank">#</th>
                <th className="col-name">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("name")}
                  >
                    Name
                    <SortIcon active={sortKey === "name"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-price">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("price")}
                  >
                    Price
                    <SortIcon active={sortKey === "price"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-change">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("change")}
                  >
                    Change
                    <SortIcon active={sortKey === "change"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-volume">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("volume")}
                  >
                    24h Volume
                    <SortIcon active={sortKey === "volume"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-cap">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("cap")}
                  >
                    Market Cap
                    <SortIcon active={sortKey === "cap"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="market-list-empty">
                    No matching coins found
                  </td>
                </tr>
              ) : (
                rows.map((item, index) => (
                  <tr
                    key={item.id || item.symbol}
                    className="market-list-row"
                    onClick={() => openChart(item)}
                  >
                    <td className="col-rank">{index + 1}</td>
                    <td className="col-name">
                      <div className="market-list-name">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            width={28}
                            height={28}
                            className="market-list-icon"
                          />
                        )}
                        <div className="market-list-name-text">
                          <span className="market-list-symbol">
                            {item.symbol}
                          </span>
                          <span className="market-list-fullname">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="col-price">
                      <div className="market-list-price-main">
                        {formatPricePlain(item.priceNum)}
                      </div>
                      <div className="market-list-price-sub">{item.price}</div>
                    </td>
                    <td className="col-change">
                      <span
                        className={`market-list-change ${item.isUp ? "up" : "down"}`}
                      >
                        {item.change.replace(" (24h)", "")}
                      </span>
                    </td>
                    <td className="col-volume">{item.volume24h}</td>
                    <td className="col-cap">{item.marketCap}</td>
                    <td className="col-actions">{renderRowActions(item)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default MarketListPage;
