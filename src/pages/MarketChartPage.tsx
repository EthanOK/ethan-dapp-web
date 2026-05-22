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
  fetchCoinSpot,
  type PricePoint,
  type CoinRouteState
} from "../utils/coinGeckoApi";
import "./MarketChartPage.css";

const SPOT_POLL_MS = 30000;
const MOBILE_CHART_MAX_WIDTH = 600;

function getChartUi(width: number) {
  const mobile = width > 0 && width <= MOBILE_CHART_MAX_WIDTH;
  return {
    mobile,
    fontSize: mobile ? 10 : 12,
    rightOffset: MARKETCHART_RIGHT_OFFSET,
    rightPriceScale: {
      minimumWidth: 0,
      entireTextOnly: mobile,
      borderVisible: false
    },
    volumeScaleVisible: false,
    useCenteredPriceLabel: mobile
  };
}

const TIME_RANGES = [
  { label: "1W", days: 7 },
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

function formatChange(val: number | null | undefined): {
  text: string;
  isUp: boolean;
} {
  if (val == null || Number.isNaN(val)) return { text: "— (24h)", isUp: true };
  const isUp = val >= 0;
  return {
    text: (isUp ? "+" : "") + val.toFixed(2) + "% (24h)",
    isUp
  };
}

function formatMarketCap(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return "$" + num.toFixed(0);
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

function formatCrosshairTime(time: Time): string {
  let date: Date;
  if (typeof time === "number") {
    date = new Date(time * 1000);
  } else if (typeof time === "string") {
    date = new Date(time);
  } else {
    date = new Date(time.year, time.month - 1, time.day);
  }
  return date.toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  });
}

function isDarkMode(): boolean {
  return document.documentElement.getAttribute("data-theme") !== "light";
}

interface CrosshairTip {
  x: number;
  y: number;
  time: Time;
  price: number;
  volume: number | null;
  flipLeft: boolean;
}

const MARKETCHART_GREEN = "#3da35d";
const MARKETCHART_GREEN_LIGHT = "#2d8f4e";
const MARKETCHART_RIGHT_OFFSET = 5;

function getChartColors() {
  const dark = isDarkMode();
  const priceLineColor = dark ? MARKETCHART_GREEN : MARKETCHART_GREEN_LIGHT;
  return {
    textColor: dark ? "#94a3b8" : "#64748b",
    gridColor: dark ? "#1f2226" : "rgba(0,0,0,0.06)",
    bgColor: dark ? "#0b0e11" : "#ffffff",
    priceLineColor,
    topColor: dark ? "rgba(61, 163, 93, 0.22)" : "rgba(45, 143, 78, 0.15)",
    bottomColor: dark ? "rgba(61, 163, 93, 0)" : "rgba(45, 143, 78, 0)",
    volumeColor: dark ? "rgba(251,191,36,0.5)" : "rgba(217,119,6,0.4)"
  };
}

interface CachedData {
  prices: PricePoint[];
  marketCaps: PricePoint[];
  totalVolumes: PricePoint[];
  updatedAt: number;
}

const MarketChartPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const coinId = searchParams.get("coinId") ?? "";
  const routeState = (location.state as CoinRouteState | null) ?? null;
  const [quote, setQuote] = useState<CoinRouteState | null>(routeState);
  const symbol = quote?.symbol?.toUpperCase() ?? coinId;

  const [activeRange, setActiveRange] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [crosshairTip, setCrosshairTip] = useState<CrosshairTip | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const priceSeriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const blinkRef = useRef<HTMLDivElement>(null);
  const linePriceRef = useRef<HTMLDivElement>(null);
  const lastPricePointRef = useRef<{ time: Time; value: number } | null>(null);
  const cacheRef = useRef<Record<string, CachedData>>({});
  const abortRef = useRef<AbortController | null>(null);
  const quoteRef = useRef<CoinRouteState | null>(quote);
  quoteRef.current = quote;
  const spotAbortRef = useRef<AbortController | null>(null);
  const chartWidthRef = useRef(0);

  const parsePrice = (priceStr: string): number | null => {
    const cleaned = priceStr.replace(/[$,]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const updateChartOverlays = useCallback(() => {
    const point = lastPricePointRef.current;
    const dot = blinkRef.current;
    const linePrice = linePriceRef.current;
    const chart = chartRef.current;
    const series = priceSeriesRef.current;
    const ui = getChartUi(chartWidthRef.current);

    if (!point || !chart || !series) {
      if (dot) dot.style.display = "none";
      if (linePrice) linePrice.style.display = "none";
      return;
    }

    const timeCoord = chart.timeScale().timeToCoordinate(point.time);
    const priceCoord = series.priceToCoordinate(point.value);

    if (dot && timeCoord != null && priceCoord != null) {
      dot.style.left = `${timeCoord}px`;
      dot.style.top = `${priceCoord}px`;
      dot.style.display = "block";
    } else if (dot) {
      dot.style.display = "none";
    }

    if (
      linePrice &&
      priceCoord != null &&
      ui.useCenteredPriceLabel &&
      quoteRef.current?.price
    ) {
      linePrice.textContent = quoteRef.current.price;
      linePrice.style.top = `${priceCoord}px`;
      linePrice.style.display = "block";
    } else if (linePrice) {
      linePrice.style.display = "none";
    }
  }, []);

  const applySeriesData = useCallback(
    (data: CachedData) => {
      if (
        !priceSeriesRef.current ||
        !volumeSeriesRef.current ||
        !chartRef.current
      )
        return;

      // Append or update current price at the end of data
      const currentPrice = quoteRef.current?.price
        ? parsePrice(quoteRef.current.price)
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
        const lineColors = getChartColors();
        const ui = getChartUi(chartWidthRef.current);
        priceSeriesRef.current.createPriceLine({
          price: currentPrice,
          color: lineColors.priceLineColor,
          lineWidth: 1,
          lineStyle: 2,
          axisLabelVisible: !ui.useCenteredPriceLabel,
          axisLabelColor: lineColors.priceLineColor,
          axisLabelTextColor: isDarkMode() ? "#0b0e11" : "#ffffff",
          title: ""
        });
      }

      const timeScale = chartRef.current.timeScale();
      const ui = getChartUi(chartWidthRef.current);
      timeScale.applyOptions({ rightOffset: ui.rightOffset });
      timeScale.fitContent();

      const lastPoint = pricesData[pricesData.length - 1];
      lastPricePointRef.current = lastPoint
        ? { time: lastPoint.time as Time, value: lastPoint.value }
        : null;
      requestAnimationFrame(() => {
        requestAnimationFrame(updateChartOverlays);
      });

      const colors = getChartColors();
      priceSeriesRef.current.applyOptions({
        lineColor: colors.priceLineColor,
        topColor: colors.topColor,
        bottomColor: colors.bottomColor
      });
      volumeSeriesRef.current.applyOptions({
        color: colors.volumeColor
      });
    },
    [updateChartOverlays]
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
    const width = chartContainerRef.current.clientWidth;
    chartWidthRef.current = width;
    const ui = getChartUi(width);
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bgColor },
        textColor: colors.textColor,
        fontFamily:
          "'JetBrains Mono', 'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontSize: ui.fontSize,
        attributionLogo: false
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor }
      },
      rightPriceScale: {
        borderColor: colors.gridColor,
        minimumWidth: ui.rightPriceScale.minimumWidth,
        entireTextOnly: ui.rightPriceScale.entireTextOnly,
        borderVisible: ui.rightPriceScale.borderVisible,
        scaleMargins: {
          top: 0.1,
          bottom: 0.25
        }
      },
      timeScale: {
        borderColor: colors.gridColor,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: ui.rightOffset
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
        mode: 0,
        vertLine: {
          color: colors.priceLineColor,
          width: 1,
          style: 2,
          labelBackgroundColor: colors.bgColor
        },
        horzLine: {
          color: colors.priceLineColor,
          width: 1,
          style: 2,
          labelBackgroundColor: colors.bgColor
        }
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
      priceScaleId: "volume",
      lastValueVisible: false,
      priceLineVisible: false
    });
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0
      },
      visible: ui.volumeScaleVisible
    });
    volumeSeriesRef.current = volumeSeries;

    // Price series (left Y axis, main)
    const priceSeries = chart.addSeries(AreaSeries, {
      lineColor: colors.priceLineColor,
      topColor: colors.topColor,
      bottomColor: colors.bottomColor,
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

    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {
      updateChartOverlays();
    });

    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.point) {
        setCrosshairTip(null);
        return;
      }
      const priceData = param.seriesData.get(priceSeries);
      const volumeData = param.seriesData.get(volumeSeries);
      const price = priceData && "value" in priceData ? priceData.value : null;
      if (price == null) {
        setCrosshairTip(null);
        return;
      }
      const volume =
        volumeData && "value" in volumeData ? volumeData.value : null;
      const wrapWidth =
        chartContainerRef.current?.parentElement?.clientWidth ?? 0;
      setCrosshairTip({
        x: param.point.x,
        y: param.point.y,
        time: param.time,
        price,
        volume,
        flipLeft: param.point.x > wrapWidth * 0.5
      });
    });

    const applyChartUi = (w: number) => {
      chartWidthRef.current = w;
      const nextUi = getChartUi(w);
      const c = getChartColors();
      chart.applyOptions({
        layout: { fontSize: nextUi.fontSize },
        rightPriceScale: {
          borderColor: c.gridColor,
          minimumWidth: nextUi.rightPriceScale.minimumWidth,
          entireTextOnly: nextUi.rightPriceScale.entireTextOnly,
          borderVisible: nextUi.rightPriceScale.borderVisible
        },
        timeScale: {
          borderColor: c.gridColor,
          rightOffset: nextUi.rightOffset
        }
      });
      volumeSeriesRef.current?.priceScale().applyOptions({
        visible: nextUi.volumeScaleVisible
      });
    };

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
        applyChartUi(width);
        updateChartOverlays();
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
  }, [updateChartOverlays]);

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

  const refreshSpotPrice = useCallback(async () => {
    if (!coinId) return;
    if (spotAbortRef.current) {
      spotAbortRef.current.abort();
    }
    const controller = new AbortController();
    spotAbortRef.current = controller;
    try {
      const spot = await fetchCoinSpot(coinId, controller.signal);
      if (!spot) return;
      const { text: change, isUp } = formatChange(spot.changePct);
      const next: CoinRouteState = {
        name: quoteRef.current?.name ?? spot.name,
        symbol: spot.symbol,
        image: quoteRef.current?.image ?? spot.image,
        price: formatPrice(spot.currentPrice),
        marketCap: formatMarketCap(spot.marketCap),
        change,
        isUp
      };
      quoteRef.current = next;
      setQuote(next);
      const cacheKey = `${coinId}-${activeRange}`;
      const cached = cacheRef.current[cacheKey];
      if (cached) {
        applySeriesData(cached);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.warn("CoinGecko spot price refresh failed:", e);
    }
  }, [coinId, activeRange, applySeriesData]);

  useEffect(() => {
    const cleanup = buildChart();
    loadData(activeRange);
    return () => cleanup?.();
  }, [buildChart, loadData, activeRange]);

  useEffect(() => {
    if (!coinId) return;
    refreshSpotPrice();
    const interval = setInterval(refreshSpotPrice, SPOT_POLL_MS);
    return () => {
      clearInterval(interval);
      if (spotAbortRef.current) {
        spotAbortRef.current.abort();
        spotAbortRef.current = null;
      }
    };
  }, [coinId, refreshSpotPrice]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!chartRef.current) return;
      const colors = getChartColors();
      const ui = getChartUi(chartWidthRef.current);
      chartRef.current.applyOptions({
        layout: {
          background: { type: ColorType.Solid, color: colors.bgColor },
          textColor: colors.textColor,
          fontSize: ui.fontSize
        },
        grid: {
          vertLines: { color: colors.gridColor },
          horzLines: { color: colors.gridColor }
        },
        rightPriceScale: {
          borderColor: colors.gridColor,
          minimumWidth: ui.rightPriceScale.minimumWidth,
          entireTextOnly: ui.rightPriceScale.entireTextOnly,
          borderVisible: ui.rightPriceScale.borderVisible
        },
        timeScale: {
          borderColor: colors.gridColor,
          rightOffset: ui.rightOffset
        },
        crosshair: {
          vertLine: {
            color: colors.priceLineColor,
            labelBackgroundColor: colors.bgColor
          },
          horzLine: {
            color: colors.priceLineColor,
            labelBackgroundColor: colors.bgColor
          }
        }
      });
      if (priceSeriesRef.current) {
        priceSeriesRef.current.applyOptions({
          lineColor: colors.priceLineColor,
          topColor: colors.topColor,
          bottomColor: colors.bottomColor
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
      <div className="marketchart-page main-app">
        <div className="marketchart-error">Invalid coin ID</div>
      </div>
    );
  }

  return (
    <div className="marketchart-page main-app">
      <button
        type="button"
        className="marketchart-back"
        onClick={() => navigate("/")}
      >
        &larr; Market
      </button>

      <div className="marketchart-header">
        {quote?.image && (
          <img
            src={quote.image}
            alt=""
            className="marketchart-header-icon"
            width={40}
            height={40}
          />
        )}
        <div className="marketchart-header-info">
          <span className="marketchart-header-name">
            {quote?.name ?? coinId}
          </span>
          <span className="marketchart-header-symbol">{symbol || coinId}</span>
        </div>
        {quote?.price && (
          <div className="marketchart-header-right">
            <span className="marketchart-header-price">{quote.price}</span>
            {quote.change && (
              <span
                className={`marketchart-header-change ${quote.isUp ? "up" : "down"}`}
              >
                {quote.change}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="marketchart-tabs">
        {TIME_RANGES.map(({ label, days }) => (
          <button
            key={label}
            type="button"
            className={`marketchart-tab ${activeRange === days ? "active" : ""}`}
            onClick={() => handleRangeChange(days)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="marketchart-chart-wrap">
        {crosshairTip && (
          <div
            className={`marketchart-tooltip ${crosshairTip.flipLeft ? "marketchart-tooltip-left" : "marketchart-tooltip-right"}`}
            style={{ left: crosshairTip.x, top: crosshairTip.y }}
          >
            <div className="marketchart-tooltip-time">
              {formatCrosshairTime(crosshairTip.time)}
            </div>
            <div className="marketchart-tooltip-row">
              <span className="marketchart-tooltip-label">Price:</span>
              <span className="marketchart-tooltip-value">
                {formatPrice(crosshairTip.price)}
              </span>
            </div>
            <div className="marketchart-tooltip-row">
              <span className="marketchart-tooltip-label">Vol:</span>
              <span className="marketchart-tooltip-value">
                {formatVolume(crosshairTip.volume)}
              </span>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="marketchart-loading">
            <div className="marketchart-spinner" />
          </div>
        )}
        {error && (
          <div className="marketchart-error">
            <p>{error}</p>
            <button
              type="button"
              className="marketchart-error-retry"
              onClick={() => loadData(activeRange)}
            >
              Retry
            </button>
          </div>
        )}
        <div ref={chartContainerRef} className="marketchart-chart-container">
          <div ref={blinkRef} className="marketchart-blink-dot" />
          <div ref={linePriceRef} className="marketchart-line-price" />
        </div>
      </div>

      {quote && (
        <div className="marketchart-stats">
          <div className="marketchart-stat-card">
            <div className="marketchart-stat-label">Current Price</div>
            <div className="marketchart-stat-value">{quote.price}</div>
          </div>
          <div className="marketchart-stat-card">
            <div className="marketchart-stat-label">Market Cap</div>
            <div className="marketchart-stat-value">{quote.marketCap}</div>
          </div>
          <div className="marketchart-stat-card">
            <div className="marketchart-stat-label">Symbol</div>
            <div className="marketchart-stat-value">{symbol || coinId}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketChartPage;
