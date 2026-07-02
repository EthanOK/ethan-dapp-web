export const COINGECKO_MARKETS_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h";

export const CG_HEADERS = {
  "x-cg-demo-api-key": "CG-3DZELwY5HdLhsJjNpyN6hFy6"
};

export const MARKET_CACHE_KEY = "home_market_cache";

export interface MarketCoinItem {
  id: string;
  name: string;
  symbol: string;
  price: string;
  priceNum: number | null;
  change: string;
  changePct: number | null;
  isUp: boolean;
  image: string | null;
  marketCap: string;
  marketCapNum: number | null;
  volume24h: string;
  volume24hNum: number | null;
  high24h: string;
  low24h: string;
}

const emptyCoin = (symbol: string): MarketCoinItem => ({
  id: "",
  name: "",
  symbol,
  price: "—",
  priceNum: null,
  change: "—",
  changePct: null,
  isUp: true,
  image: null,
  marketCap: "—",
  marketCapNum: null,
  volume24h: "—",
  volume24hNum: null,
  high24h: "—",
  low24h: "—"
});

export const fallbackMarketList: MarketCoinItem[] = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "solana", symbol: "SOL" },
  { id: "dogecoin", symbol: "DOGE" },
  { id: "binancecoin", symbol: "BNB" },
  { id: "ripple", symbol: "XRP" },
  { id: "cardano", symbol: "ADA" },
  { id: "hyperliquid", symbol: "HYPE" },
  { id: "chainlink", symbol: "LINK" },
  { id: "avalanche-2", symbol: "AVAX" },
  { id: "polkadot", symbol: "DOT" },
  { id: "matic-network", symbol: "MATIC" },
  { id: "tron", symbol: "TRX" },
  { id: "leo-token", symbol: "LEO" },
  { id: "bitcoin-cash", symbol: "BCH" },
  { id: "cosmos", symbol: "ATOM" }
].map(({ id, symbol }) => ({ ...emptyCoin(symbol), id }));

export function formatPrice(num: number | null | undefined): string {
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

export function formatPricePlain(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1000)
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (num >= 1)
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  if (num >= 0.01) return num.toFixed(4);
  if (num > 0) return num.toFixed(6);
  return "0";
}

export function formatChange(val: number | null | undefined): {
  text: string;
  isUp: boolean;
} {
  if (val == null || Number.isNaN(val)) return { text: "—", isUp: true };
  const isUp = val >= 0;
  return {
    text: (isUp ? "+" : "") + val.toFixed(2) + "%",
    isUp
  };
}

export function formatChangeWithLabel(val: number | null | undefined): {
  text: string;
  isUp: boolean;
} {
  const { text, isUp } = formatChange(val);
  if (text === "—") return { text: "— (24h)", isUp };
  return { text: text + " (24h)", isUp };
}

export function formatCompactUsd(num: number | null | undefined): string {
  if (num == null || Number.isNaN(num)) return "—";
  if (num >= 1e12) return "$" + (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9) return "$" + (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return "$" + (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return "$" + (num / 1e3).toFixed(2) + "K";
  return "$" + num.toFixed(0);
}

export function getCachedMarketData(): {
  tickerList: MarketCoinItem[];
  spotPrices: Record<string, string | null>;
  updatedAt: number;
} | null {
  try {
    const raw = localStorage.getItem(MARKET_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      tickerList?: MarketCoinItem[];
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

export function setCachedMarketData(
  tickerList: MarketCoinItem[],
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

export async function fetchMarketTickerList(): Promise<MarketCoinItem[]> {
  const res = await fetch(COINGECKO_MARKETS_URL, { headers: CG_HEADERS });
  if (!res.ok) throw new Error("CoinGecko request failed");
  const data = (await res.json()) as Array<{
    id?: string;
    name?: string;
    symbol?: string;
    current_price?: number;
    price_change_percentage_24h_in_currency?: number;
    price_change_percentage_24h?: number;
    image?: string;
    market_cap?: number;
    total_volume?: number;
    high_24h?: number;
    low_24h?: number;
  }>;
  return data.map((item) => {
    const changePct =
      item.price_change_percentage_24h_in_currency ??
      item.price_change_percentage_24h ??
      null;
    const { text, isUp } = formatChangeWithLabel(changePct);
    return {
      id: item.id ?? "",
      name: item.name ?? "",
      symbol: (item.symbol ?? "").toUpperCase(),
      price: formatPrice(item.current_price),
      priceNum: item.current_price ?? null,
      change: text,
      changePct,
      isUp,
      image: item.image ?? null,
      marketCap: formatCompactUsd(item.market_cap),
      marketCapNum: item.market_cap ?? null,
      volume24h: formatCompactUsd(item.total_volume),
      volume24hNum: item.total_volume ?? null,
      high24h: formatPrice(item.high_24h),
      low24h: formatPrice(item.low_24h)
    };
  });
}

export function toCoinRouteState(item: MarketCoinItem) {
  return {
    name: item.name,
    symbol: item.symbol,
    image: item.image,
    price: item.price,
    marketCap: item.marketCap,
    change: item.change,
    isUp: item.isUp
  };
}
