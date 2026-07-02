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

/** Full `/coins/markets` payload for a single coin (vs USD). */
export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string | null;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number | null;
  fullyDilutedValuation: number | null;
  totalVolume: number;
  high24h: number | null;
  low24h: number | null;
  priceChange24h: number | null;
  priceChangePercentage24h: number | null;
  marketCapChange24h: number | null;
  marketCapChangePercentage24h: number | null;
  circulatingSupply: number | null;
  totalSupply: number | null;
  maxSupply: number | null;
  ath: number | null;
  athChangePercentage: number | null;
  athDate: string | null;
  atl: number | null;
  atlChangePercentage: number | null;
  atlDate: string | null;
  lastUpdated: string | null;
}

type CoinMarketsApiItem = {
  id?: string;
  symbol?: string;
  name?: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
  fully_diluted_valuation?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  price_change_24h?: number;
  price_change_percentage_24h?: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  circulating_supply?: number;
  total_supply?: number;
  max_supply?: number;
  ath?: number;
  ath_change_percentage?: number;
  ath_date?: string;
  atl?: number;
  atl_change_percentage?: number;
  atl_date?: string;
  last_updated?: string;
};

function parseCoinMarketItem(
  item: CoinMarketsApiItem,
  coinId: string
): CoinMarketData | null {
  if (item.current_price == null) return null;
  return {
    id: item.id ?? coinId,
    symbol: (item.symbol ?? coinId).toUpperCase(),
    name: item.name ?? coinId,
    image: item.image ?? null,
    currentPrice: item.current_price,
    marketCap: item.market_cap ?? 0,
    marketCapRank: item.market_cap_rank ?? null,
    fullyDilutedValuation: item.fully_diluted_valuation ?? null,
    totalVolume: item.total_volume ?? 0,
    high24h: item.high_24h ?? null,
    low24h: item.low_24h ?? null,
    priceChange24h: item.price_change_24h ?? null,
    priceChangePercentage24h: item.price_change_percentage_24h ?? null,
    marketCapChange24h: item.market_cap_change_24h ?? null,
    marketCapChangePercentage24h: item.market_cap_change_percentage_24h ?? null,
    circulatingSupply: item.circulating_supply ?? null,
    totalSupply: item.total_supply ?? null,
    maxSupply: item.max_supply ?? null,
    ath: item.ath ?? null,
    athChangePercentage: item.ath_change_percentage ?? null,
    athDate: item.ath_date ?? null,
    atl: item.atl ?? null,
    atlChangePercentage: item.atl_change_percentage ?? null,
    atlDate: item.atl_date ?? null,
    lastUpdated: item.last_updated ?? null
  };
}

export async function fetchCoinMarket(
  coinId: string,
  signal?: AbortSignal
): Promise<CoinMarketData | null> {
  const params = new URLSearchParams({
    vs_currency: "usd",
    ids: coinId
  });
  const res = await fetch(`${BASE_URL}/coins/markets?${params}`, {
    signal,
    headers: CG_HEADERS
  });
  if (!res.ok) return null;

  const data = (await res.json()) as CoinMarketsApiItem[];
  const item = data[0];
  if (!item) return null;
  return parseCoinMarketItem(item, coinId);
}

/** @deprecated Use fetchCoinMarket */
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
  const market = await fetchCoinMarket(coinId, signal);
  if (!market) return null;
  return {
    name: market.name,
    symbol: market.symbol,
    image: market.image,
    currentPrice: market.currentPrice,
    marketCap: market.marketCap,
    changePct: market.priceChangePercentage24h ?? 0
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
