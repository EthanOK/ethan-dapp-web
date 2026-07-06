import { parseUnits } from "ethers";
import { toast } from "sonner";
import { getScanTxURL } from "@/lib/shared/Utils";
import { IS_DEVELOPMENT } from "@/config/SystemConfiguration";
import { useI18n } from "@/i18n";
import "./SwapTxToast.css";

const TOAST_AMOUNT_MAX_FRAC = 6;

function formatScaledToMaxDecimals(scaled: bigint, maxFrac: number): string {
  const factor = 10n ** BigInt(maxFrac);
  const intPart = scaled / factor;
  const fracPart = scaled % factor;
  if (fracPart === 0n) return intPart.toString();
  // padStart keeps leading zeros; only strip meaningless trailing zeros.
  const fracStr = fracPart.toString().padStart(maxFrac, "0").replace(/0+$/, "");
  return `${intPart}.${fracStr}`;
}

/** Truncate token amounts to 6 decimal places for toast display. */
export function formatToastTokenAmount(
  amount: bigint | string,
  decimals?: number,
  maxFrac = TOAST_AMOUNT_MAX_FRAC
): string {
  if (typeof amount === "string") {
    const trimmed = amount.trim();
    if (!trimmed || trimmed === "—" || trimmed.startsWith("<")) return trimmed;
    if (decimals == null) return trimmed;
    try {
      amount = trimmed.includes(".")
        ? parseUnits(trimmed, decimals)
        : BigInt(trimmed);
    } catch {
      return trimmed;
    }
  }

  if (decimals == null) {
    return amount.toString();
  }

  if (amount === 0n) return "0";

  if (amount > 0n && decimals > maxFrac) {
    const minUnits = 10n ** BigInt(decimals - maxFrac);
    if (amount < minUnits) {
      return `<0.${"0".repeat(maxFrac - 1)}1`;
    }
  }

  const factor = 10n ** BigInt(maxFrac);
  const divisor = 10n ** BigInt(decimals);
  const scaled = (amount * factor) / divisor;
  return formatScaledToMaxDecimals(scaled, maxFrac);
}

export type SwapTxToastLeg = {
  amount: bigint | string;
  symbol: string;
  decimals?: number;
};

type SwapTxToastProps = {
  title: string;
  detail?: string;
  swap?: { from: SwapTxToastLeg; to: SwapTxToastLeg };
  txUrl: string;
  onDismiss: () => void;
};

function tokenInitials(symbol: string): string {
  return symbol.slice(0, 2).toUpperCase();
}

function SwapLeg({ amount, symbol, decimals }: SwapTxToastLeg) {
  const displayAmount = formatToastTokenAmount(amount, decimals);

  return (
    <div className="swap-tx-toast-leg">
      <span className="swap-tx-toast-leg-avatar" aria-hidden>
        {tokenInitials(symbol)}
      </span>
      <div className="swap-tx-toast-leg-copy">
        <span className="swap-tx-toast-leg-amount">{displayAmount}</span>
        <span className="swap-tx-toast-leg-symbol">{symbol}</span>
      </div>
    </div>
  );
}

function SwapTxToast({
  title,
  detail,
  swap,
  txUrl,
  onDismiss
}: SwapTxToastProps) {
  const { t } = useI18n();
  return (
    <div className="swap-tx-toast" role="status" aria-live="polite">
      <div className="swap-tx-toast-accent" aria-hidden />
      <div className="swap-tx-toast-body">
        <div className="swap-tx-toast-header">
          <div className="swap-tx-toast-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.25}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="swap-tx-toast-heading">
            <p className="swap-tx-toast-title">{title}</p>
            <p className="swap-tx-toast-subtitle">{t("swap.txConfirmed")}</p>
          </div>
          <button
            type="button"
            className="swap-tx-toast-close"
            onClick={onDismiss}
            aria-label={t("common.close")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {swap ? (
          <div className="swap-tx-toast-route" aria-label={detail}>
            <SwapLeg
              amount={swap.from.amount}
              symbol={swap.from.symbol}
              decimals={swap.from.decimals}
            />
            <span className="swap-tx-toast-arrow" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <SwapLeg
              amount={swap.to.amount}
              symbol={swap.to.symbol}
              decimals={swap.to.decimals}
            />
          </div>
        ) : detail ? (
          <p className="swap-tx-toast-detail">{detail}</p>
        ) : null}

        <a
          className="swap-tx-toast-action"
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onDismiss}
        >
          {t("swap.viewTransaction")}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17L17 7M17 7H9M17 7v8"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}

export type SwapTxToastOptions = {
  /** Plain second line for approve / reset toasts. */
  detail?: string;
  swap?: { from: SwapTxToastLeg; to: SwapTxToastLeg };
  duration?: number;
};

export function showSwapTxToast(
  title: string,
  txHash: string,
  options?: SwapTxToastOptions
): void {
  const duration = options?.duration ?? 8000;
  const detail =
    options?.detail ??
    (options?.swap
      ? `${formatToastTokenAmount(options.swap.from.amount, options.swap.from.decimals)} ${options.swap.from.symbol} → ${formatToastTokenAmount(options.swap.to.amount, options.swap.to.decimals)} ${options.swap.to.symbol}`
      : undefined);

  void getScanTxURL(txHash).then((txUrl) => {
    toast.custom(
      (id) => (
        <SwapTxToast
          title={title}
          detail={detail}
          swap={options?.swap}
          txUrl={txUrl}
          onDismiss={() => toast.dismiss(id)}
        />
      ),
      { duration, unstyled: true }
    );
  });
}

/** Dev-only: preview toast from browser console without sending a transaction. */
const DEV_PREVIEW_TX_HASH =
  "0x88e1457a8f1234567890abcdef011e988f0123456789abcdef011e988f";

declare global {
  interface Window {
    __previewSwapToast?: (variant?: "swap" | "approve" | "reset") => void;
  }
}

if (IS_DEVELOPMENT) {
  window.__previewSwapToast = (variant = "swap") => {
    const previews = {
      swap: {
        title: "Swap successful",
        swap: {
          from: {
            amount: 106408353830000000n,
            symbol: "DRAMon",
            decimals: 18
          },
          to: {
            amount: 8209216n,
            symbol: "USDC",
            decimals: 6
          }
        }
      },
      approve: {
        title: "Approve confirmed",
        detail: "Approved USDC"
      },
      reset: {
        title: "Allowance reset confirmed",
        detail: "Reset USDC allowance"
      }
    } as const;
    const preview = previews[variant];
    showSwapTxToast(preview.title, DEV_PREVIEW_TX_HASH, preview);
  };
}
