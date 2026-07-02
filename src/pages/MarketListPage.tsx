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
import { useI18n, type TranslationKey } from "@/i18n";
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
  const { t, dateLocale } = useI18n();
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
    ? new Date(updatedAt).toLocaleString(dateLocale, {
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

  const sortOptions: { key: SortKey; labelKey: TranslationKey }[] = [
    { key: "cap", labelKey: "market.sortCap" },
    { key: "price", labelKey: "market.sortPrice" },
    { key: "change", labelKey: "market.sortChange" },
    { key: "volume", labelKey: "market.sortVolume" },
    { key: "name", labelKey: "market.sortName" }
  ];

  const renderRowActions = (item: MarketCoinItem) => (
    <div className="market-list-actions" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="market-list-action-btn"
        title={t("market.chart")}
        aria-label={t("market.chartFor", { symbol: item.symbol })}
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
              {t("market.backHome")}
            </Link>
            <h1>{t("market.title")}</h1>
            <p>{t("market.subtitle")}</p>
          </div>
          <div className="market-list-toolbar">
            <input
              type="text"
              className="market-list-search"
              placeholder={t("home.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t("home.searchCoins")}
            />
            {updatedLabel && (
              <span className="market-list-updated">
                {t("common.updatedAt", { time: updatedLabel })}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="market-list-mobile-only">
        <div
          className="market-list-sort-pills"
          role="toolbar"
          aria-label={t("market.sortBy")}
        >
          {sortOptions.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              className={`market-list-sort-pill ${sortKey === key ? "active" : ""}`}
              onClick={() => toggleSort(key)}
            >
              {t(labelKey)}
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
            {t("market.noResults")}
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
                      <span className="market-list-card-stat-label">
                        {t("market.sortPrice")}
                      </span>
                      <span className="market-list-card-stat-value">
                        {item.price}
                      </span>
                    </div>
                    <div className="market-list-card-stat">
                      <span className="market-list-card-stat-label">
                        {t("market.mcapShort")}
                      </span>
                      <span className="market-list-card-stat-value">
                        {item.marketCap}
                      </span>
                    </div>
                    <div className="market-list-card-stat">
                      <span className="market-list-card-stat-label">
                        {t("market.volShort")}
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
                    {t("market.colName")}
                    <SortIcon active={sortKey === "name"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-price">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("price")}
                  >
                    {t("market.colPrice")}
                    <SortIcon active={sortKey === "price"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-change">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("change")}
                  >
                    {t("market.colChange")}
                    <SortIcon active={sortKey === "change"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-volume">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("volume")}
                  >
                    {t("market.colVolume")}
                    <SortIcon active={sortKey === "volume"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-cap">
                  <button
                    type="button"
                    className="market-list-sort-btn"
                    onClick={() => toggleSort("cap")}
                  >
                    {t("market.colCap")}
                    <SortIcon active={sortKey === "cap"} dir={sortDir} />
                  </button>
                </th>
                <th className="col-actions">{t("market.colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="market-list-empty">
                    {t("market.noResults")}
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
