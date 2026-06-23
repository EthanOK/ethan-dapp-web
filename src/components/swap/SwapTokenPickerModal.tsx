import { formatUnits } from "ethers";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  addressesEqual,
  getTokenDisplayName,
  tokenBalanceKey,
  type TokenSide
} from "@/lib/swap/swapTokenRules";
import {
  resolveFavoriteTokenSides,
  SWAP_FAVORITE_MAX,
  toggleFavoriteTokenAddress
} from "@/lib/swap/swapFavoriteTokens";
import {
  calcTokenUsdValue,
  formatSwapTokenChange24h,
  formatSwapUsdValue,
  getSwapTokenPrice,
  type SwapTokenPriceMap
} from "@/lib/swap/swapTokenPrices";
import type { SwapChainDefinition } from "@/config/SwapChainConfig";
import { SwapTokenMarketInfoPanel } from "@/components/swap/SwapTokenMarketInfoPanel";
import "./SwapTokenPickerModal.css";

function formatListBalance(value: bigint, decimals: number): string {
  if (value > 0n && decimals >= 6) {
    const minUnits = 10n ** BigInt(decimals - 6);
    if (value < minUnits) return "<0.000001";
  }
  const raw = formatUnits(value, decimals);
  const [int, frac = ""] = raw.split(".");
  const frac6 = frac.padEnd(6, "0").slice(0, 6).replace(/0+$/, "");
  return frac6 ? `${int}.${frac6}` : int;
}

function tokenAvatarHue(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function rowKey(side: TokenSide): string {
  return tokenBalanceKey(side.tokenAddress);
}

type ListFilter = "all" | "imported";

export type SwapTokenPickerModalProps = {
  open: boolean;
  title: string;
  chainId: number;
  /** Full token catalog for resolving favorite shortcuts. */
  catalog: TokenSide[];
  favoriteAddressKeys: ReadonlySet<string>;
  availableChains: SwapChainDefinition[];
  activeChainId: number;
  isSwitchingChain?: boolean;
  chainAvatarBadge: string;
  chainAvatarColor: string;
  tokens: TokenSide[];
  balances: Record<string, bigint>;
  prices?: SwapTokenPriceMap;
  selectedTokenAddress?: string | null;
  showBalances: boolean;
  search: string;
  addressLookupLoading?: boolean;
  addressLookupError?: string | null;
  onSearchChange: (value: string) => void;
  onSelectSide: (side: TokenSide) => void;
  onSelectChain?: (chainId: number) => void;
  onFavoritesChange?: () => void;
  onClose: () => void;
};

export function SwapTokenPickerModal({
  open,
  title,
  chainId,
  catalog,
  favoriteAddressKeys,
  availableChains,
  activeChainId,
  isSwitchingChain = false,
  chainAvatarBadge,
  chainAvatarColor,
  tokens,
  balances,
  prices = {},
  selectedTokenAddress,
  showBalances,
  search,
  addressLookupLoading = false,
  addressLookupError = null,
  onSearchChange,
  onSelectSide,
  onSelectChain,
  onFavoritesChange,
  onClose
}: SwapTokenPickerModalProps) {
  const [listFilter, setListFilter] = useState<ListFilter>("all");
  const [marketInfoSide, setMarketInfoSide] = useState<TokenSide | null>(null);

  useEffect(() => {
    if (!open) {
      setMarketInfoSide(null);
      return;
    }
    setListFilter("all");
  }, [open, chainId]);

  const favoriteTokens = useMemo(
    () => resolveFavoriteTokenSides(chainId, catalog),
    [chainId, catalog, favoriteAddressKeys]
  );

  const handleToggleFavorite = (side: TokenSide) => {
    const result = toggleFavoriteTokenAddress(chainId, side.tokenAddress);
    if (result.limitReached) {
      toast.error(`You can favorite up to ${SWAP_FAVORITE_MAX} tokens`);
      return;
    }
    onFavoritesChange?.();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filteredTokens = useMemo(() => {
    if (listFilter === "imported") {
      return tokens.filter((side) => side.kind === "custom");
    }
    return tokens;
  }, [tokens, listFilter]);

  const rows = useMemo(
    () =>
      filteredTokens.map((side) => {
        const priceInfo = getSwapTokenPrice(prices, side.tokenAddress);
        const balance = balances[tokenBalanceKey(side.tokenAddress)] ?? 0n;
        const priceUsd = priceInfo?.priceUsd ?? 0;
        const unitPriceLabel = priceUsd > 0 ? formatSwapUsdValue(priceUsd) : "";
        const change24h = formatSwapTokenChange24h(priceInfo?.change24hPct);
        let usdLabel = "";
        if (priceUsd > 0) {
          usdLabel =
            balance > 0n
              ? formatSwapUsdValue(
                  calcTokenUsdValue(balance, side.decimals, priceUsd)
                )
              : formatSwapUsdValue(priceUsd);
        }
        return {
          side,
          key: rowKey(side),
          balance,
          usdLabel,
          unitPriceLabel,
          change24h
        };
      }),
    [filteredTokens, balances, prices]
  );

  const emptyListMessage = useMemo(() => {
    if (listFilter === "imported") return "No imported tokens";
    return "No tokens match your search";
  }, [listFilter]);

  if (!open) return null;

  return (
    <div className="swap-picker-overlay" onClick={onClose} role="presentation">
      <div
        className="swap-picker-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="swap-picker-title"
      >
        <div className="swap-picker-header">
          <h3 id="swap-picker-title">{title}</h3>
          <button
            type="button"
            className="swap-picker-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="swap-picker-search-wrap">
          <span className="swap-picker-search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            className="swap-picker-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search symbol, name or contract address"
            autoFocus
          />
        </div>

        {favoriteTokens.length > 0 ? (
          <div className="swap-picker-favorites">
            {favoriteTokens.map((side) => (
              <div
                key={rowKey(side)}
                className="swap-picker-favorite-chip-wrap"
              >
                <button
                  type="button"
                  className="swap-picker-favorite-chip"
                  onClick={() => {
                    onSelectSide(side);
                    onClose();
                  }}
                >
                  <span
                    className="swap-picker-favorite-chip-avatar"
                    style={{
                      background: `hsl(${tokenAvatarHue(side.symbol)} 42% 32%)`
                    }}
                    aria-hidden
                  >
                    {side.symbol.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="swap-picker-favorite-chip-symbol">
                    {side.symbol}
                  </span>
                </button>
                <button
                  type="button"
                  className="swap-picker-favorite-chip-remove"
                  aria-label={`Remove ${side.symbol} from favorites`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleFavoriteTokenAddress(chainId, side.tokenAddress);
                    onFavoritesChange?.();
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="swap-picker-network">
          <span className="swap-picker-network-label">Network</span>
          <div
            className="swap-picker-network-chains"
            role="group"
            aria-label="Swap networks"
          >
            {availableChains.map((chain) => {
              const isActive = chain.chainId === activeChainId;
              return (
                <button
                  key={chain.chainId}
                  type="button"
                  className={`swap-picker-network-badge${isActive ? " is-active" : ""}`}
                  aria-pressed={isActive}
                  disabled={isSwitchingChain}
                  onClick={() => {
                    if (!isActive) onSelectChain?.(chain.chainId);
                  }}
                >
                  <span
                    className="swap-picker-network-avatar"
                    style={{ background: chain.chainAvatarColor }}
                    aria-hidden
                  >
                    {chain.chainAvatarBadge}
                  </span>
                  {chain.networkBadge}
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="swap-picker-tabs"
          role="tablist"
          aria-label="Token list filter"
        >
          <button
            type="button"
            role="tab"
            className={`swap-picker-tab${listFilter === "all" ? " is-active" : ""}`}
            aria-selected={listFilter === "all"}
            onClick={() => setListFilter("all")}
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            className={`swap-picker-tab${listFilter === "imported" ? " is-active" : ""}`}
            aria-selected={listFilter === "imported"}
            onClick={() => setListFilter("imported")}
          >
            Imported
          </button>
        </div>

        <div className="swap-picker-table-head">
          <span>Token</span>
          <span>{showBalances ? "Balance" : "Price"}</span>
        </div>

        <ul className="swap-picker-list">
          {addressLookupLoading && (
            <li className="swap-picker-empty swap-picker-loading">
              Loading token from chain…
            </li>
          )}

          {!addressLookupLoading &&
            rows.map(
              ({ side, key, balance, usdLabel, unitPriceLabel, change24h }) => {
                const selected =
                  selectedTokenAddress != null &&
                  addressesEqual(side.tokenAddress, selectedTokenAddress);
                const initials = side.symbol.slice(0, 2).toUpperCase();
                const showUnitMeta = Boolean(unitPriceLabel || change24h);
                const isFavorite = favoriteAddressKeys.has(
                  tokenBalanceKey(side.tokenAddress)
                );
                return (
                  <li key={key}>
                    <div
                      className={`swap-picker-row${selected ? " is-selected" : ""}`}
                    >
                      <button
                        type="button"
                        className={`swap-picker-favorite${isFavorite ? " is-active" : ""}`}
                        aria-label={
                          isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"
                        }
                        aria-pressed={isFavorite}
                        onClick={() => handleToggleFavorite(side)}
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        className="swap-picker-row-main"
                        onClick={() => {
                          onSelectSide(side);
                          onClose();
                        }}
                      >
                        <span
                          className="swap-picker-avatar"
                          style={{
                            background: `hsl(${tokenAvatarHue(side.symbol)} 42% 32%)`
                          }}
                        >
                          {initials}
                          <span
                            className="swap-picker-avatar-chain"
                            style={{ background: chainAvatarColor }}
                            aria-hidden
                          >
                            {chainAvatarBadge}
                          </span>
                        </span>
                        <span className="swap-picker-token-info">
                          <span className="swap-picker-symbol">
                            {side.symbol}
                          </span>
                          {showUnitMeta ? (
                            <span
                              className={`swap-picker-meta${change24h ? (change24h.isUp ? " up" : " down") : ""}`}
                            >
                              {unitPriceLabel ? (
                                <span className="swap-picker-unit-price">
                                  {unitPriceLabel}
                                </span>
                              ) : null}
                              {change24h ? (
                                <span className="swap-picker-change">
                                  {change24h.text}
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            <span className="swap-picker-name">
                              {getTokenDisplayName(side)}
                            </span>
                          )}
                        </span>
                        <span className="swap-picker-balance-col">
                          <span className="swap-picker-value-stack">
                            {showBalances ? (
                              <span className="swap-picker-balance">
                                {formatListBalance(balance, side.decimals)}
                              </span>
                            ) : usdLabel ? (
                              <span className="swap-picker-balance">
                                {usdLabel}
                              </span>
                            ) : null}
                            {usdLabel && showBalances ? (
                              <span className="swap-picker-usd">
                                {usdLabel}
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </button>
                      <button
                        type="button"
                        className="swap-picker-info"
                        aria-label={`Market info for ${side.symbol}`}
                        onClick={() => setMarketInfoSide(side)}
                      >
                        i
                      </button>
                      {selected ? (
                        <span
                          className="swap-picker-check is-visible"
                          aria-hidden
                        >
                          ✓
                        </span>
                      ) : (
                        <span
                          className="swap-picker-check-spacer"
                          aria-hidden
                        />
                      )}
                    </div>
                  </li>
                );
              }
            )}

          {!addressLookupLoading &&
            rows.length === 0 &&
            !addressLookupError && (
              <li className="swap-picker-empty">{emptyListMessage}</li>
            )}

          {!addressLookupLoading && addressLookupError && rows.length === 0 && (
            <li className="swap-picker-empty swap-picker-error">
              {addressLookupError}
            </li>
          )}
        </ul>

        {marketInfoSide ? (
          <SwapTokenMarketInfoPanel
            side={marketInfoSide}
            priceInfo={getSwapTokenPrice(prices, marketInfoSide.tokenAddress)}
            chainAvatarBadge={chainAvatarBadge}
            chainAvatarColor={chainAvatarColor}
            onClose={() => setMarketInfoSide(null)}
          />
        ) : null}
      </div>
    </div>
  );
}
