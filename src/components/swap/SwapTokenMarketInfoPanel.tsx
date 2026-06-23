import { type MouseEvent, useMemo } from "react";
import { ZeroAddress, getAddress, isAddress } from "ethers";
import { toast } from "sonner";
import { truncateHash } from "@/lib/shared/Format";
import { getScanAddressURL } from "@/lib/shared/Utils";
import {
  formatMarketInfoLastUpdated,
  formatMarketInfoUsd
} from "@/lib/swap/swapTokenMarketInfo";
import {
  formatSwapTokenChange24h,
  type SwapTokenPriceInfo
} from "@/lib/swap/swapTokenPrices";
import { getTokenDisplayName, type TokenSide } from "@/lib/swap/swapTokenRules";
import "./SwapTokenMarketInfoPanel.css";

type SwapTokenMarketInfoPanelProps = {
  side: TokenSide;
  chainId: number;
  priceInfo?: SwapTokenPriceInfo;
  chainAvatarBadge: string;
  chainAvatarColor: string;
  onClose: () => void;
};

function tokenAvatarHue(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function formatChecksumAddress(address: string): string {
  if (!isAddress(address)) return address;
  return getAddress(address.toLowerCase());
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="swap-market-info-stat">
      <span className="swap-market-info-stat-label">{label}</span>
      <span className="swap-market-info-stat-value">{value}</span>
    </div>
  );
}

export function SwapTokenMarketInfoPanel({
  side,
  chainId,
  priceInfo,
  chainAvatarBadge,
  chainAvatarColor,
  onClose
}: SwapTokenMarketInfoPanelProps) {
  const change24h = formatSwapTokenChange24h(priceInfo?.change24hPct);
  const contractAddress = side.tokenAddress;
  const isNative = contractAddress.toLowerCase() === ZeroAddress.toLowerCase();
  const checksumAddress = useMemo(
    () => (isNative ? "" : formatChecksumAddress(contractAddress)),
    [contractAddress, isNative]
  );
  const contractAddressLabel = truncateHash(checksumAddress, 8, 8);
  const contractExplorerUrl = isNative
    ? ""
    : getScanAddressURL(side.chainId ?? chainId, checksumAddress);
  const initials = side.symbol.slice(0, 2).toUpperCase();

  const handleCopyAddress = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isNative) return;
    try {
      await navigator.clipboard.writeText(checksumAddress);
      toast.success("Contract address copied");
    } catch {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="swap-market-info-panel" role="dialog" aria-modal="true">
      <header className="swap-market-info-header">
        <button
          type="button"
          className="swap-market-info-back"
          onClick={onClose}
          aria-label="Back to token list"
        >
          ←
        </button>
        <h4>Market Info</h4>
        <button
          type="button"
          className="swap-market-info-close"
          onClick={onClose}
          aria-label="Close market info"
        >
          ×
        </button>
      </header>

      <section className="swap-market-info-hero">
        <span
          className="swap-market-info-avatar"
          style={{
            background: `hsl(${tokenAvatarHue(side.symbol)} 42% 32%)`
          }}
          aria-hidden
        >
          {initials}
          <span
            className="swap-market-info-avatar-chain"
            style={{ background: chainAvatarColor }}
          >
            {chainAvatarBadge}
          </span>
        </span>

        <div className="swap-market-info-hero-copy">
          <div className="swap-market-info-token-line">
            <span className="swap-market-info-symbol">{side.symbol}</span>
            <span className="swap-market-info-name">
              {getTokenDisplayName(side)}
            </span>
          </div>
          <div className="swap-market-info-price-line">
            <span className="swap-market-info-price">
              {formatMarketInfoUsd(priceInfo?.priceUsd)}
            </span>
            {change24h ? (
              <span
                className={`swap-market-info-change-pill${change24h.isUp ? " up" : " down"}`}
              >
                {change24h.text}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="swap-market-info-stats">
        <StatCard
          label="24H Volume"
          value={formatMarketInfoUsd(priceInfo?.volume24hUsd)}
        />
        <StatCard
          label="Market Cap"
          value={formatMarketInfoUsd(priceInfo?.marketCapUsd)}
        />
      </div>

      <footer className="swap-market-info-footer">
        <div className="swap-market-info-meta-row">
          <span className="swap-market-info-meta-label">Last Updated</span>
          <span className="swap-market-info-meta-value">
            {formatMarketInfoLastUpdated(priceInfo?.lastUpdatedAt)}
          </span>
        </div>

        <div className="swap-market-info-meta-row">
          <span className="swap-market-info-meta-label">Contract</span>
          {isNative ? (
            <span className="swap-market-info-meta-value">Native</span>
          ) : (
            <div className="swap-market-info-contract-chip">
              {contractExplorerUrl ? (
                <a
                  href={contractExplorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="swap-market-info-contract-link"
                >
                  {contractAddressLabel}
                </a>
              ) : (
                <span className="swap-market-info-contract-link">
                  {contractAddressLabel}
                </span>
              )}
              <button
                type="button"
                className="swap-market-info-contract-copy-btn"
                onClick={handleCopyAddress}
                aria-label="Copy contract address"
              >
                <span className="swap-market-info-contract-copy" aria-hidden>
                  ⧉
                </span>
              </button>
            </div>
          )}
        </div>

        <p className="swap-market-info-powered">
          Powered by <strong>CoinGecko</strong>
        </p>
      </footer>
    </div>
  );
}
