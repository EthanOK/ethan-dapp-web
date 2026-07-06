import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fallbackMarketList,
  fetchMarketTickerList,
  formatChange,
  formatPricePlain,
  getCachedMarketData,
  getMarketChangePct,
  isMarketSparklineUp,
  MARKET_CHANGE_TIMEFRAMES,
  MARKET_LIST_PAGE_SIZE,
  setCachedMarketData,
  toCoinRouteState,
  type MarketChangeTimeframe,
  type MarketCoinItem
} from "@/lib/price/marketTicker";
import { useI18n, type TranslationKey } from "@/i18n";
import "./MarketListPage.css";

type SortKey = "rank" | "name" | "price" | "change" | "volume" | "cap";
type SortDir = "asc" | "desc";

/** Keep symbol + full name on one row; cap long names with "...". */
function formatTokenFullName(name: string, symbol: string): string {
  const maxNameLen = Math.max(14, 36 - symbol.length);
  const trimmed = name.trim();
  if (trimmed.length <= maxNameLen) return trimmed;
  return `${trimmed.slice(0, maxNameLen).trimEnd()}...`;
}

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
  dir: SortDir,
  changeTimeframe: MarketChangeTimeframe
): MarketCoinItem[] {
  const sorted = [...items];
  sorted.sort((a, b) => {
    switch (key) {
      case "rank":
        return compareNullableNum(a.marketCapRank, b.marketCapRank, dir);
      case "name":
        return dir === "asc"
          ? a.symbol.localeCompare(b.symbol)
          : b.symbol.localeCompare(a.symbol);
      case "price":
        return compareNullableNum(a.priceNum, b.priceNum, dir);
      case "change":
        return compareNullableNum(
          getMarketChangePct(a, changeTimeframe),
          getMarketChangePct(b, changeTimeframe),
          dir
        );
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

const SortHeader = ({
  label,
  column,
  sortKey,
  sortDir,
  onSort
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}) => (
  <button
    type="button"
    className={`market-list-sort-btn${sortKey === column ? " is-active" : ""}`}
    onClick={() => onSort(column)}
  >
    {label}
    <SortIcon active={sortKey === column} dir={sortDir} />
  </button>
);

const SortIcon = ({ active, dir }: { active: boolean; dir: SortDir }) => (
  <span
    className={`market-list-sort-icon ${active ? "active" : ""}`}
    aria-hidden
  >
    <span
      className={`market-list-sort-arrow up ${active && dir === "asc" ? "is-on" : ""}`}
    />
    <span
      className={`market-list-sort-arrow down ${active && dir === "desc" ? "is-on" : ""}`}
    />
  </span>
);

const SPARKLINE_W = 96;
const SPARKLINE_H = 32;

function MarketSparkline({
  data,
  isUp
}: {
  data: number[] | null;
  isUp: boolean;
}) {
  if (!data || data.length < 2) {
    return (
      <span className="market-list-sparkline market-list-sparkline--empty" />
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * SPARKLINE_W;
      const y = SPARKLINE_H - ((value - min) / range) * (SPARKLINE_H - 4) - 2;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      className={`market-list-sparkline ${isUp ? "up" : "down"}`}
      width={SPARKLINE_W}
      height={SPARKLINE_H}
      viewBox={`0 0 ${SPARKLINE_W} ${SPARKLINE_H}`}
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MarketChangeValue({
  item,
  timeframe
}: {
  item: MarketCoinItem;
  timeframe: MarketChangeTimeframe;
}) {
  const pct = getMarketChangePct(item, timeframe);
  const { text, isUp } = formatChange(pct);
  return (
    <span className={`market-list-change ${isUp ? "up" : "down"}`}>{text}</span>
  );
}

const CHANGE_TF_KEYS: Record<MarketChangeTimeframe, TranslationKey> = {
  "1h": "market.changeTf1h",
  "24h": "market.changeTf24h",
  "7d": "market.changeTf7d"
};

function ChangeTimeframeSelect({
  value,
  onChange,
  variant = "pill",
  highlighted = false
}: {
  value: MarketChangeTimeframe;
  onChange: (next: MarketChangeTimeframe) => void;
  variant?: "pill" | "plain";
  highlighted?: boolean;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      className={`market-list-tf-wrap${variant === "plain" ? " market-list-tf-wrap--plain" : ""}`}
      ref={wrapRef}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className={[
          "market-list-tf-trigger",
          variant === "plain" ? "market-list-tf-trigger--plain" : "",
          highlighted ? "is-active" : "",
          open ? "is-open" : ""
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("market.changeTfLabel")}
      >
        <span>{t(CHANGE_TF_KEYS[value])}</span>
        <svg
          className={`market-list-tf-chevron ${open ? "open" : ""}`}
          width={10}
          height={10}
          viewBox="0 0 10 10"
          fill="currentColor"
          aria-hidden
        >
          <path
            d="M2 3.5L5 6.5L8 3.5"
            stroke="currentColor"
            strokeWidth={1.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div
          className="market-list-tf-menu"
          role="listbox"
          aria-label={t("market.changeTfLabel")}
        >
          {MARKET_CHANGE_TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              type="button"
              role="option"
              aria-selected={value === tf}
              className={
                "market-list-tf-option" + (value === tf ? " is-active" : "")
              }
              onClick={() => {
                onChange(tf);
                setOpen(false);
              }}
            >
              {t(CHANGE_TF_KEYS[tf])}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MarketListPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useI18n();

  if (totalItems === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <nav
      className="market-list-pagination"
      aria-label={t("market.pageInfo", {
        from: String(from),
        to: String(to),
        total: String(totalItems)
      })}
    >
      <span className="market-list-pagination-info">
        {t("market.pageInfo", {
          from: String(from),
          to: String(to),
          total: String(totalItems)
        })}
      </span>
      {totalPages > 1 && (
        <div className="market-list-pagination-controls">
          <button
            type="button"
            className="market-list-pagination-btn"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            {t("market.pagePrev")}
          </button>
          <div className="market-list-pagination-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`market-list-pagination-page${n === page ? " is-active" : ""}`}
                aria-current={n === page ? "page" : undefined}
                onClick={() => onPageChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="market-list-pagination-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            {t("market.pageNext")}
          </button>
        </div>
      )}
    </nav>
  );
}

const MarketListPage = () => {
  const navigate = useNavigate();
  const { t, dateLocale } = useI18n();
  const [list, setList] = useState<MarketCoinItem[]>(fallbackMarketList);
  const [search, setSearch] = useState("");
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("cap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [changeTimeframe, setChangeTimeframe] =
    useState<MarketChangeTimeframe>("24h");
  const [page, setPage] = useState(1);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(key === "name" || key === "rank" ? "asc" : "desc");
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
    const interval = setInterval(loadList, 60000);
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
    return sortMarketList(filtered, sortKey, sortDir, changeTimeframe);
  }, [list, search, sortKey, sortDir, changeTimeframe]);

  const totalPages = Math.max(
    1,
    Math.ceil(rows.length / MARKET_LIST_PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir, changeTimeframe]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * MARKET_LIST_PAGE_SIZE;
    return rows.slice(start, start + MARKET_LIST_PAGE_SIZE);
  }, [rows, currentPage]);

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
    { key: "rank", labelKey: "market.sortRank" },
    { key: "cap", labelKey: "market.sortCap" },
    { key: "price", labelKey: "market.sortPrice" },
    { key: "change", labelKey: "market.sortChange" },
    { key: "volume", labelKey: "market.sortVolume" },
    { key: "name", labelKey: "market.sortName" }
  ];

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
          <ChangeTimeframeSelect
            value={changeTimeframe}
            onChange={setChangeTimeframe}
          />
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
            {pagedRows.map((item) => (
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
                    <span className="market-list-card-rank">
                      {item.marketCapRank ?? "—"}
                    </span>
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
                      <span className="market-list-fullname" title={item.name}>
                        {formatTokenFullName(item.name, item.symbol)}
                      </span>
                    </div>
                    <MarketChangeValue
                      item={item}
                      timeframe={changeTimeframe}
                    />
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
                  <div className="market-list-card-sparkline">
                    <MarketSparkline
                      data={item.sparkline}
                      isUp={isMarketSparklineUp(item)}
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
        <MarketListPagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={MARKET_LIST_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>

      <section className="market-list-panel market-list-desktop-only">
        <div className="market-list-grid">
          <div className="market-list-grid-head">
            <div className="market-list-grid-cell col-rank">
              <SortHeader
                label={t("market.colRank")}
                column="rank"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </div>
            <div className="market-list-grid-cell col-name">
              <SortHeader
                label={t("market.colName")}
                column="name"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </div>
            <div className="market-list-grid-cell col-price">
              <SortHeader
                label={t("market.colPrice")}
                column="price"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </div>
            <div className="market-list-grid-cell col-tf">
              <ChangeTimeframeSelect
                value={changeTimeframe}
                onChange={setChangeTimeframe}
                highlighted={sortKey === "change"}
              />
            </div>
            <div className="market-list-grid-cell col-change">
              <SortHeader
                label={t("market.colChange")}
                column="change"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </div>
            <div className="market-list-grid-cell col-volume">
              <SortHeader
                label={t("market.colVolume")}
                column="volume"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </div>
            <div className="market-list-grid-cell col-cap">
              <SortHeader
                label={t("market.colCap")}
                column="cap"
                sortKey={sortKey}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </div>
            <div className="market-list-grid-cell col-actions">
              {t("market.colLast7Days")}
            </div>
          </div>

          {rows.length === 0 ? (
            <p className="market-list-empty">{t("market.noResults")}</p>
          ) : (
            pagedRows.map((item) => (
              <div
                key={item.id || item.symbol}
                className="market-list-grid-row"
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
                <div className="market-list-grid-cell col-rank">
                  {item.marketCapRank ?? "—"}
                </div>
                <div className="market-list-grid-cell col-name">
                  <div className="market-list-name">
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        width={24}
                        height={24}
                        className="market-list-icon"
                      />
                    )}
                    <div className="market-list-name-text">
                      <span className="market-list-symbol">{item.symbol}</span>
                      <span className="market-list-fullname" title={item.name}>
                        {formatTokenFullName(item.name, item.symbol)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="market-list-grid-cell col-price">
                  <span className="market-list-price-main">
                    {formatPricePlain(item.priceNum)}
                  </span>
                </div>
                <div className="market-list-grid-cell col-tf" aria-hidden />
                <div className="market-list-grid-cell col-change">
                  <MarketChangeValue item={item} timeframe={changeTimeframe} />
                </div>
                <div className="market-list-grid-cell col-volume">
                  {item.volume24h}
                </div>
                <div className="market-list-grid-cell col-cap">
                  {item.marketCap}
                </div>
                <div className="market-list-grid-cell col-actions">
                  <MarketSparkline
                    data={item.sparkline}
                    isUp={isMarketSparklineUp(item)}
                  />
                </div>
              </div>
            ))
          )}
        </div>
        <MarketListPagination
          page={currentPage}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={MARKET_LIST_PAGE_SIZE}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
};

export default MarketListPage;
