const BASE_URL = "https://api.coingecko.com/api/v3";
const CG_API_KEY = "CG-3DZELwY5HdLhsJjNpyN6hFy6";
const CG_HEADERS = { "x-cg-demo-api-key": CG_API_KEY };

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
