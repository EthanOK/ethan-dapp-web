export const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const CG_API_KEY = "CG-3DZELwY5HdLhsJjNpyN6hFy6";
export const COINGECKO_API_HEADERS = { "x-cg-demo-api-key": CG_API_KEY };

const BASE_URL = COINGECKO_API_BASE;
const CG_HEADERS = COINGECKO_API_HEADERS;

export interface PricePoint {
  time: number;
  value: number;
}

export interface MarketChartResponse {
  prices: PricePoint[];
  marketCaps: PricePoint[];
  totalVolumes: PricePoint[];
}

export interface CoinRouteState {
  name: string;
  symbol: string;
  image: string | null;
  price: string;
  marketCap: string;
  change: string;
  isUp: boolean;
}

export async function fetchCoinSpot(
  coinId: string,
  signal?: AbortSignal
): Promise<{
  name: string;
  symbol: string;
  image: string | null;
  currentPrice: number;
  marketCap: number;
  changePct: number;
} | null> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: coinId
  });
  const res = await fetch(`${BASE_URL}/coins/markets?${params}`, {
    signal,
    headers: CG_HEADERS
  });
  if (!res.ok) return null;

  const data = (await res.json()) as Array<{
    name?: string;
    symbol?: string;
    image?: string;
    current_price?: number;
    market_cap?: number;
    price_change_percentage_24h?: number;
  }>;
  const item = data[0];
  if (!item || item.current_price == null) return null;

  return {
    name: item.name ?? coinId,
    symbol: (item.symbol ?? coinId).toUpperCase(),
    image: item.image ?? null,
    currentPrice: item.current_price,
    marketCap: item.market_cap ?? 0,
    changePct: item.price_change_percentage_24h ?? 0
  };
}

export async function fetchMarketChart(
  coinId: string,
  days: number,
  signal?: AbortSignal
): Promise<MarketChartResponse> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: String(days)
  });
  if (days >= 90) {
    params.set("interval", "daily");
  }

  const res = await fetch(
    `${BASE_URL}/coins/${encodeURIComponent(coinId)}/market_chart?${params}`,
    { signal, headers: CG_HEADERS }
  );
  if (!res.ok) throw new Error(`CoinGecko market_chart failed: ${res.status}`);

  const data = (await res.json()) as {
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  };

  const toPoints = (arr: [number, number][]) =>
    arr.map(([timestamp, value]) => ({
      time: Math.floor(timestamp / 1000),
      value
    }));

  return {
    prices: toPoints(data.prices),
    marketCaps: toPoints(data.market_caps),
    totalVolumes: toPoints(data.total_volumes)
  };
}

export interface OHLCPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function fetchOHLC(
  coinId: string,
  days: number,
  signal?: AbortSignal
): Promise<OHLCPoint[]> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    days: String(days)
  });

  const res = await fetch(
    `${BASE_URL}/coins/${encodeURIComponent(coinId)}/ohlc?${params}`,
    { signal, headers: CG_HEADERS }
  );
  if (!res.ok) throw new Error(`CoinGecko ohlc failed: ${res.status}`);

  const data = (await res.json()) as [number, number, number, number, number][];

  return data.map(([timestamp, open, high, low, close]) => ({
    time: Math.floor(timestamp / 1000),
    open,
    high,
    low,
    close
  }));
}
