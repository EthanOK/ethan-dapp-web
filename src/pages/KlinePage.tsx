import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  AreaSeries,
  HistogramSeries,
  createTextWatermark
} from "lightweight-charts";
import type { LineData, Time } from "lightweight-charts";
import {
  fetchMarketChart,
  type PricePoint,
  type CoinRouteState
} from "../utils/coinGeckoApi";
import "./KlinePage.css";

const TIME_RANGES = [
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 }
] as const;

function formatPrice(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
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

function formatVolume(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1000)
    return "$" + num.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return "$" + num.toFixed(0);
}

function isDarkMode(): boolean {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

function getChartColors() {
  const dark = isDarkMode();
  return {
    textColor: dark ? "#94a3b8" : "#64748b",
    gridColor: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.06)",
    bgColor: dark ? "#12121a" : "#ffffff",
    priceLineColor: dark ? "#22d3ee" : "#0e7490",
    volumeColor: dark ? "rgba(251,191,36,0.5)" : "rgba(217,119,6,0.4)"
  };
}

interface CachedData {
  prices: PricePoint[];
  marketCaps: PricePoint[];
  totalVolumes: PricePoint[];
  updatedAt: number;
}

const KlinePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const coinId = searchParams.get("coinId") ?? "";
  const routeState = (location.state as CoinRouteState | null) ?? null;
  const symbol = routeState?.symbol?.toUpperCase() ?? coinId;

  const [activeRange, setActiveRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null);
  const [hoveredVolume, setHoveredVolume] = useState<number | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const cacheRef = useRef<Record<string, CachedData>>({});
  const abortRef = useRef<AbortController | null>(null);

  const parsePrice = (priceStr: string): number | null => {
    const cleaned = priceStr.replace(/[$,]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const applySeriesData = useCallback(
    (data: CachedData) => {
      if (
        !priceSeriesRef.current ||
        !volumeSeriesRef.current ||
        !chartRef.current
      )
        return;

      // Append or update current price at the end of data
      const currentPrice = routeState?.price
        ? parsePrice(routeState.price)
        : null;
      const pricesData = [...data.prices];
      if (currentPrice != null && pricesData.length > 0) {
        const now = Math.floor(Date.now() / 1000);
        const lastPoint = pricesData[pricesData.length - 1];
        const timeDiff = now - lastPoint.time;
        // If within 2 hours, update last point; otherwise append new point
        if (timeDiff < 7200) {
          pricesData[pricesData.length - 1] = {
            time: lastPoint.time,
            value: currentPrice
          };
        } else {
          pricesData.push({ time: now, value: currentPrice });
        }
      }

      priceSeriesRef.current.setData(pricesData as LineData<Time>[]);
      volumeSeriesRef.current.setData(
        data.totalVolumes.map((p) => ({ time: p.time as Time, value: p.value }))
      );

      // Remove existing price lines and add current price line at last point
      priceSeriesRef.current.priceLines().forEach((line) => {
        priceSeriesRef.current!.removePriceLine(line);
      });

      if (currentPrice != null) {
        priceSeriesRef.current.createPriceLine({
          price: currentPrice,
          color: isDarkMode() ? "#22d3ee" : "#0e7490",
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: true,
          title: ""
        });
      }

      chartRef.current.timeScale().fitContent();

      const colors = getChartColors();
      priceSeriesRef.current.applyOptions({
        lineColor: colors.priceLineColor,
        topColor: isDarkMode()
          ? "rgba(34,211,238,0.28)"
          : "rgba(14,116,144,0.18)",
        bottomColor: isDarkMode() ? "rgba(34,211,238,0)" : "rgba(14,116,144,0)"
      });
      volumeSeriesRef.current.applyOptions({
        color: colors.volumeColor
      });
    },
    [routeState]
  );

  const buildChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
    }

    const colors = getChartColors();
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bgColor },
        textColor: colors.textColor,
        fontFamily:
          "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: 12,
        attributionLogo: false
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      },
      rightPriceScale: {
        borderColor: colors.gridColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.25
        }
      },
      timeScale: {
        borderColor: colors.gridColor,
        timeVisible: true,
        secondsVisible: false
      },
      localization: {
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
        }
      },
      crosshair: {
        mode: 0
      },
      handleScroll: { vertTouchDrag: false }
    });

    chartRef.current = chart;

    // Remove default watermark
    const pane = chart.panes()[0];
    if (pane) {
      createTextWatermark(pane, {
        visible: false
      });
    }

    // Volume series (right Y axis, behind price)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: colors.volumeColor,
      priceFormat: {
        type: "volume"
      },
      priceScaleId: "volume"
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      }
    });
    volumeSeriesRef.current = volumeSeries;

    // Price series (left Y axis, main)
    const priceSeries = chart.addSeries(AreaSeries, {
      lineColor: colors.priceLineColor,
      topColor: isDarkMode()
        ? "rgba(34,211,238,0.28)"
        : "rgba(14,116,144,0.18)",
      bottomColor: isDarkMode() ? "rgba(34,211,238,0)" : "rgba(14,116,144,0)",
      lineWidth: 2,
      lastValueVisible: false,
      priceLineVisible: false,
      priceLineColor: colors.priceLineColor,
      priceLineStyle: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => formatPrice(price)
      },
      priceScaleId: "right"
    });
    priceSeriesRef.current = priceSeries;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        setHoveredPrice(null);
        setHoveredVolume(null);
        return;
      }
      const priceData = param.seriesData.get(priceSeries);
      const volumeData = param.seriesData.get(volumeSeries);
      setHoveredPrice(
        priceData && "value" in priceData ? priceData.value : null
      );
      setHoveredVolume(
        volumeData && "value" in volumeData ? volumeData.value : null
      );
    });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    ro.observe(chartContainerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  const loadData = useCallback(
    async (days: number) => {
      if (!coinId) return;

      const cacheKey = `${coinId}-${days}`;
      const cached = cacheRef.current[cacheKey];
      if (cached && Date.now() - cached.updatedAt < 120_000) {
        applySeriesData(cached);
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchMarketChart(coinId, days, controller.signal);
        const cachedEntry: CachedData = {
          prices: data.prices,
          marketCaps: data.marketCaps,
          totalVolumes: data.totalVolumes,
          updatedAt: Date.now()
        };
        cacheRef.current[cacheKey] = cachedEntry;
        applySeriesData(cachedEntry);
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    },
    [coinId, applySeriesData]
  );

  useEffect(() => {
    const cleanup = buildChart();
    loadData(activeRange);
    return () => cleanup?.();
  }, [buildChart, loadData, activeRange]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!chartRef.current) return;
      const colors = getChartColors();
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: colors.bgColor },
          textColor: colors.textColor
        },
        grid: {
          vertLines: { color: colors.gridColor },
          horzLines: { color: colors.gridColor }
        },
        rightPriceScale: { borderColor: colors.gridColor },
        timeScale: { borderColor: colors.gridColor }
      });
      if (priceSeriesRef.current) {
        priceSeriesRef.current.applyOptions({
          lineColor: colors.priceLineColor,
          topColor: isDarkMode()
            ? "rgba(34,211,238,0.28)"
            : "rgba(14,116,144,0.18)",
          bottomColor: isDarkMode()
            ? "rgba(34,211,238,0)"
            : "rgba(14,116,144,0)"
        });
      }
      if (volumeSeriesRef.current) {
        volumeSeriesRef.current.applyOptions({
          color: colors.volumeColor
        });
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"]
    });
    return () => observer.disconnect();
  }, []);

  const handleRangeChange = (days: number) => {
    setActiveRange(days);
  };

  if (!coinId) {
    return (
      <div className="kline-page main-app">
        <div className="kline-error">Invalid coin ID</div>
      </div>
    );
  }

  return (
    <div className="kline-page main-app">
      <button
        type="button"
        className="kline-back"
        onClick={() => navigate("/")}
      >
        &larr; Market
      </button>

      <div className="kline-header">
        {routeState?.image && (
          <img
            src={routeState.image}
            alt=""
            className="kline-header-icon"
            width={40}
            height={40}
          />
        )}
        <div className="kline-header-info">
          <span className="kline-header-name">
            {routeState?.name ?? coinId}
          </span>
          <span className="kline-header-symbol">{symbol || coinId}</span>
        </div>
        {routeState?.price && (
          <div className="kline-header-right">
            <span className="kline-header-price">{routeState.price}</span>
            {routeState.change && (
              <span
                className={`kline-header-change ${routeState.isUp ? "up" : "down"}`}
              >
                {routeState.change} (24h)
              </span>
            )}
          </div>
        )}
      </div>

      <div className="kline-tabs">
        {TIME_RANGES.map(({ label, days }) => (
          <button
            key={label}
            type="button"
            className={`kline-tab ${activeRange === days ? "active" : ""}`}
            onClick={() => handleRangeChange(days)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="kline-chart-wrap">
        <div className="kline-legend">
          <span className="kline-legend-item">
            <span className="kline-legend-dot kline-legend-dot-price" />
            Price
            {hoveredPrice != null && (
              <span className="kline-legend-value">
                {formatPrice(hoveredPrice)}
              </span>
            )}
          </span>
          <span className="kline-legend-item">
            <span className="kline-legend-dot kline-legend-dot-volume" />
            Volume
            {hoveredVolume != null && (
              <span className="kline-legend-value">
                {formatVolume(hoveredVolume)}
              </span>
            )}
          </span>
        </div>
        {isLoading && (
          <div className="kline-loading">
            <div className="kline-spinner" />
          </div>
        )}
        {error && (
          <div className="kline-error">
            <p>{error}</p>
            <button
              type="button"
              className="kline-error-retry"
              onClick={() => loadData(activeRange)}
            >
              Retry
            </button>
          </div>
        )}
        <div ref={chartContainerRef} className="kline-chart-container" />
      </div>

      {routeState && (
        <div className="kline-stats">
          <div className="kline-stat-card">
            <div className="kline-stat-label">Current Price</div>
            <div className="kline-stat-value">{routeState.price}</div>
          </div>
          <div className="kline-stat-card">
            <div className="kline-stat-label">Market Cap</div>
            <div className="kline-stat-value">{routeState.marketCap}</div>
          </div>
          <div className="kline-stat-card">
            <div className="kline-stat-label">Symbol</div>
            <div className="kline-stat-value">{symbol || coinId}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KlinePage;
