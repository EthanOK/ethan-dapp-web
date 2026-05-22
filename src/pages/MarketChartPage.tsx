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

async function lockScreenLandscape(): Promise<void> {
  const orientation = window.screen.orientation as ScreenOrientation & {
    lock?: (orientation: "landscape" | "portrait") => Promise<void>;
  };
  if (typeof orientation.lock !== "function") return;
  try {
    await orientation.lock("landscape");
  } catch {
    /* requires fullscreen + supported browser */
  }
}

function unlockScreenOrientation(): void {
  try {
    window.screen.orientation.unlock();
  } catch {
    /* optional */
  }
}

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

const ChartExpandIcon = () => (
  <svg
    className="marketchart-landscape-icon"
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const ChartShrinkIcon = () => (
  <svg
    className="marketchart-landscape-icon"
    width={18}
    height={18}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

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
  const [landscapeOpen, setLandscapeOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(
    () =>
      typeof window !== "undefined" &&
      window.innerWidth <= MOBILE_CHART_MAX_WIDTH
  );

  const chartWrapRef = useRef<HTMLDivElement>(null);
  const landscapeOpenRef = useRef(landscapeOpen);
  const exitingLandscapeRef = useRef(false);
  landscapeOpenRef.current = landscapeOpen;
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
    (data: CachedData, options?: { fitContent?: boolean }) => {
      if (
        !priceSeriesRef.current ||
        !volumeSeriesRef.current ||
        !chartRef.current
      )
        return;

      const shouldFitContent = options?.fitContent !== false;
      const timeScale = chartRef.current.timeScale();
      const visibleRange = shouldFitContent
        ? null
        : timeScale.getVisibleLogicalRange();

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

      const ui = getChartUi(chartWidthRef.current);
      timeScale.applyOptions({ rightOffset: ui.rightOffset });
      if (shouldFitContent) {
        timeScale.fitContent();
      } else if (visibleRange) {
        timeScale.setVisibleLogicalRange(visibleRange);
      }

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

  const syncChartLayout = useCallback(() => {
    const container = chartContainerRef.current;
    const chart = chartRef.current;
    const wrap = chartWrapRef.current;
    if (!container || !chart) return;

    const portraitRotated =
      landscapeOpenRef.current &&
      wrap?.classList.contains("marketchart-chart-wrap--landscape") &&
      window.matchMedia("(orientation: portrait)").matches;

    let w: number;
    let h: number;
    if (portraitRotated) {
      // Container is CSS-rotated 90°. Use its layout dimensions (portrait)
      // for the chart; the CSS rotation displays them as landscape.
      w = Math.max(1, Math.round(container.clientWidth));
      h = Math.max(1, Math.round(container.clientHeight));
    } else {
      const rect = container.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
    }

    chartWidthRef.current = w;
    chart.resize(w, h);

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
    chart.timeScale().fitContent();
    updateChartOverlays();
  }, [updateChartOverlays]);

  const scheduleChartLayoutSync = useCallback(() => {
    syncChartLayout();
    requestAnimationFrame(() => {
      syncChartLayout();
      requestAnimationFrame(syncChartLayout);
    });
    [50, 150, 350, 600].forEach((ms) => {
      window.setTimeout(syncChartLayout, ms);
    });
  }, [syncChartLayout]);

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
        chartContainerRef.current?.parentElement?.getBoundingClientRect()
          .width ?? 0;
      setCrosshairTip({
        x: param.point.x,
        y: param.point.y,
        time: param.time,
        price,
        volume,
        flipLeft: param.point.x > wrapWidth * 0.5
      });
    });

    const ro = new ResizeObserver(() => {
      syncChartLayout();
    });
    ro.observe(chartContainerRef.current);

    // Fix crosshair coordinates when the container is CSS-rotated (portrait →
    // landscape). lightweight-charts v5 computes pointer position as:
    //   localX = clientX − canvas.getBoundingClientRect().left
    // getBoundingClientRect() returns the VISUAL (rotated) rect, but the
    // canvas bitmap is in the UN-ROTATED layout space. We intercept both
    // addEventListener and removeEventListener on the canvas: for pointer
    // handlers, we wrap them so a synthetic PointerEvent with corrected
    // clientX/clientY is passed to the original handler. The original→wrapped
    // mapping ensures removeEventListener works correctly.
    //
    // Coordinate transform (90° CW rotation, W = un-rotated canvas width):
    //   clientX' = vRect.left + vRect.top + W − origY
    //   clientY' = origX − vRect.left + vRect.top
    const container = chartContainerRef.current;
    const canvas = container.querySelector("canvas");
    const origAdd = canvas?.addEventListener.bind(canvas);
    const origRemove = canvas?.removeEventListener.bind(canvas);
    // Map: original handler → wrapped handler (for addEventListener/removeEventListener matching)
    const forwardMap = new Map<EventListener, EventListener>();
    // Map: wrapped handler → original handler (for removeEventListener with wrapped ref)
    const reverseMap = new Map<EventListener, EventListener>();
    const POINTER_TYPES = new Set(["pointerdown", "pointermove", "pointerup"]);
    if (canvas && origAdd && origRemove) {
      const needsTransform = () =>
        landscapeOpenRef.current &&
        !window.matchMedia("(orientation: landscape)").matches;
      const makeWrapper = (raw: EventListener): EventListener => {
        const wrapped: EventListener = (e: Event) => {
          if (!needsTransform()) {
            raw.call(canvas, e);
            return;
          }
          const pe = e as PointerEvent;
          const el = chartContainerRef.current;
          if (!el) {
            raw.call(canvas, e);
            return;
          }
          const vRect = el.getBoundingClientRect();
          const W = chartWidthRef.current;
          const synthetic = new PointerEvent(pe.type, {
            clientX: vRect.left + vRect.top + W - pe.clientY,
            clientY: pe.clientX - vRect.left + vRect.top,
            screenX: pe.screenX,
            screenY: pe.screenY,
            pointerId: pe.pointerId,
            pointerType: pe.pointerType,
            isPrimary: pe.isPrimary,
            button: pe.button,
            buttons: pe.buttons,
            pressure: pe.pressure,
            width: pe.width,
            height: pe.height,
            tiltX: pe.tiltX,
            tiltY: pe.tiltY,
            twist: pe.twist,
            bubbles: true,
            cancelable: true,
            composed: true
          });
          // The library also reads pageX/pageY via getPosition()
          Object.defineProperty(synthetic, "pageX", {
            value: pe.pageX,
            configurable: true
          });
          Object.defineProperty(synthetic, "pageY", {
            value: pe.pageY,
            configurable: true
          });
          raw.call(canvas, synthetic);
        };
        forwardMap.set(raw, wrapped);
        reverseMap.set(wrapped, raw);
        return wrapped;
      };
      canvas.addEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
      ) {
        if (POINTER_TYPES.has(type)) {
          const raw =
            typeof listener === "function" ? listener : listener.handleEvent;
          if (typeof raw === "function") {
            // Return existing wrapped version if already wrapped
            const existing = forwardMap.get(raw);
            if (existing) {
              return origAdd(type, existing, options);
            }
            return origAdd(type, makeWrapper(raw), options);
          }
        }
        return origAdd(type, listener, options);
      };
      canvas.removeEventListener = function (
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions
      ) {
        if (POINTER_TYPES.has(type)) {
          const raw =
            typeof listener === "function" ? listener : listener.handleEvent;
          if (typeof raw === "function") {
            // If raw is an original handler, find its wrapper
            const wrapped = forwardMap.get(raw);
            if (wrapped) return origRemove(type, wrapped, options);
            // If raw IS a wrapped handler, find the original then its wrapper
            const original = reverseMap.get(raw);
            if (original) {
              const w = forwardMap.get(original);
              if (w) return origRemove(type, w, options);
            }
          }
        }
        return origRemove(type, listener, options);
      };
    }

    return () => {
      if (canvas && origAdd && origRemove) {
        canvas.addEventListener = origAdd;
        canvas.removeEventListener = origRemove;
      }
      forwardMap.clear();
      reverseMap.clear();
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      priceSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [updateChartOverlays, syncChartLayout]);

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
        applySeriesData(cached, { fitContent: false });
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

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_CHART_MAX_WIDTH}px)`);
    const sync = () => setIsMobileViewport(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const exitLandscapeMode = useCallback(
    async (exitFullscreen = true) => {
      if (
        !landscapeOpenRef.current &&
        !document.body.classList.contains("marketchart-landscape-active")
      ) {
        return;
      }
      exitingLandscapeRef.current = true;
      setLandscapeOpen(false);
      document.body.classList.remove("marketchart-landscape-active");
      unlockScreenOrientation();
      if (exitFullscreen && document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          /* optional */
        }
      }
      exitingLandscapeRef.current = false;
      scheduleChartLayoutSync();
    },
    [scheduleChartLayoutSync]
  );

  const closeLandscape = useCallback(() => {
    void exitLandscapeMode(true);
  }, [exitLandscapeMode]);

  const openLandscape = useCallback(async () => {
    if (landscapeOpenRef.current) return;
    setLandscapeOpen(true);
    document.body.classList.add("marketchart-landscape-active");
    try {
      await document.documentElement.requestFullscreen();
    } catch {
      /* optional on iOS / in-app browsers */
    }
    await lockScreenLandscape();
    scheduleChartLayoutSync();
  }, [scheduleChartLayoutSync]);

  useEffect(() => {
    if (!landscapeOpen) return;
    const onFullscreenChange = () => {
      if (exitingLandscapeRef.current) return;
      if (!document.fullscreenElement) {
        void exitLandscapeMode(false);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [landscapeOpen, exitLandscapeMode]);

  useEffect(() => {
    if (!landscapeOpen) return;
    scheduleChartLayoutSync();
    const onLayoutChange = () => scheduleChartLayoutSync();
    window.addEventListener("orientationchange", onLayoutChange);
    window.addEventListener("resize", onLayoutChange);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onLayoutChange);
    vv?.addEventListener("scroll", onLayoutChange);
    return () => {
      window.removeEventListener("orientationchange", onLayoutChange);
      window.removeEventListener("resize", onLayoutChange);
      vv?.removeEventListener("resize", onLayoutChange);
      vv?.removeEventListener("scroll", onLayoutChange);
    };
  }, [landscapeOpen, scheduleChartLayoutSync]);

  useEffect(() => {
    if (!landscapeOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        void closeLandscape();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [landscapeOpen, closeLandscape]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("marketchart-landscape-active");
      unlockScreenOrientation();
    };
  }, []);

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
        {(quote?.marketCap || quote?.price) && (
          <div className="marketchart-header-right">
            {quote?.marketCap && (
              <div className="marketchart-header-mcap">
                <span className="marketchart-header-mcap-label">
                  Market Cap
                </span>
                <span className="marketchart-header-mcap-value">
                  {quote.marketCap}
                </span>
              </div>
            )}
            {quote?.price && (
              <div className="marketchart-header-price-block">
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
        )}
      </div>

      <div
        className={`marketchart-tabs ${landscapeOpen ? "marketchart-tabs--hidden" : ""}`}
      >
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

      <div
        ref={chartWrapRef}
        className={`marketchart-chart-wrap ${landscapeOpen ? "marketchart-chart-wrap--landscape" : ""}`}
      >
        {landscapeOpen && (
          <div className="marketchart-landscape-bar">
            <div className="marketchart-landscape-meta">
              <span className="marketchart-landscape-name">
                {quote?.name ?? coinId}
              </span>
              {quote?.price && (
                <span className="marketchart-landscape-price">
                  {quote.price}
                </span>
              )}
            </div>
            <div className="marketchart-landscape-tabs">
              {TIME_RANGES.map(({ label, days }) => (
                <button
                  key={label}
                  type="button"
                  className={`marketchart-tab marketchart-tab--compact ${activeRange === days ? "active" : ""}`}
                  onClick={() => handleRangeChange(days)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="marketchart-landscape-exit"
              onClick={closeLandscape}
              aria-label="缩小退出横屏"
            >
              <ChartShrinkIcon />
            </button>
          </div>
        )}
        {isMobileViewport && !landscapeOpen && (
          <button
            type="button"
            className="marketchart-landscape-enter"
            onClick={() => void openLandscape()}
            aria-label="放大横屏查看"
          >
            <ChartExpandIcon />
          </button>
        )}
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
    </div>
  );
};

export default MarketChartPage;
