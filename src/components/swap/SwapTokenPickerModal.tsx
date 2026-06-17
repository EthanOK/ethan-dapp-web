import { formatUnits } from "ethers";
import { useEffect, useMemo } from "react";
import {
  addressesEqual,
  getTokenDisplayName,
  tokenBalanceKey,
  type TokenSide
} from "@/lib/swap/swapTokenRules";
import "./SwapTokenPickerModal.css";

function formatListBalance(value: bigint, decimals: number): string {
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

export type SwapTokenPickerModalProps = {
  open: boolean;
  title: string;
  networkBadge: string;
  tokens: TokenSide[];
  balances: Record<string, bigint>;
  selectedTokenAddress?: string | null;
  showBalances: boolean;
  search: string;
  addressLookupLoading?: boolean;
  addressLookupError?: string | null;
  onSearchChange: (value: string) => void;
  onSelectSide: (side: TokenSide) => void;
  onClose: () => void;
};

export function SwapTokenPickerModal({
  open,
  title,
  networkBadge,
  tokens,
  balances,
  selectedTokenAddress,
  showBalances,
  search,
  addressLookupLoading = false,
  addressLookupError = null,
  onSearchChange,
  onSelectSide,
  onClose
}: SwapTokenPickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const rows = useMemo(
    () =>
      tokens.map((side) => ({
        side,
        key: rowKey(side),
        balance: balances[tokenBalanceKey(side.tokenAddress)] ?? 0n
      })),
    [tokens, balances]
  );

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

        <div className="swap-picker-network">
          <span className="swap-picker-network-label">Network</span>
          <span className="swap-picker-network-badge">{networkBadge}</span>
        </div>

        <div className="swap-picker-table-head">
          <span>Token</span>
          <span>{showBalances ? "Balance" : ""}</span>
        </div>

        <ul className="swap-picker-list">
          {addressLookupLoading && (
            <li className="swap-picker-empty swap-picker-loading">
              Loading token from chain…
            </li>
          )}

          {!addressLookupLoading &&
            rows.map(({ side, key, balance }) => {
              const selected =
                selectedTokenAddress != null &&
                addressesEqual(side.tokenAddress, selectedTokenAddress);
              const initials = side.symbol.slice(0, 2).toUpperCase();
              return (
                <li key={key}>
                  <button
                    type="button"
                    className={`swap-picker-row${selected ? " is-selected" : ""}`}
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
                      <span className="swap-picker-avatar-chain" aria-hidden>
                        Ξ
                      </span>
                    </span>
                    <span className="swap-picker-token-info">
                      <span className="swap-picker-symbol">{side.symbol}</span>
                      <span className="swap-picker-name">
                        {getTokenDisplayName(side)}
                      </span>
                    </span>
                    <span className="swap-picker-balance-col">
                      {showBalances ? (
                        <span className="swap-picker-balance">
                          {formatListBalance(balance, side.decimals)}
                        </span>
                      ) : (
                        selected && (
                          <span className="swap-picker-check" aria-hidden>
                            ✓
                          </span>
                        )
                      )}
                      {showBalances && selected && (
                        <span className="swap-picker-check" aria-hidden>
                          ✓
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}

          {!addressLookupLoading &&
            rows.length === 0 &&
            !addressLookupError && (
              <li className="swap-picker-empty">No tokens match your search</li>
            )}

          {!addressLookupLoading && addressLookupError && rows.length === 0 && (
            <li className="swap-picker-empty swap-picker-error">
              {addressLookupError}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
