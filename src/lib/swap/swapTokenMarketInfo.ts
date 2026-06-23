export function formatMarketInfoUsd(value: number | undefined): string {
  if (value == null || !Number.isFinite(value) || value <= 0) return "--";
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toLocaleString(undefined, {
      maximumFractionDigits: 2
    })}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toLocaleString(undefined, {
      maximumFractionDigits: 2
    })}M`;
  }
  if (value >= 1_000) {
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
  if (value >= 0.01) {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  return `$${value.toFixed(6).replace(/\.?0+$/, "")}`;
}

export function formatMarketInfoLastUpdated(
  timestampSec: number | undefined
): string {
  if (timestampSec == null || !Number.isFinite(timestampSec)) return "--";
  return new Date(timestampSec * 1000).toLocaleString();
}
