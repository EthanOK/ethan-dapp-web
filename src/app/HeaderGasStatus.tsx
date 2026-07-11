import { useEffect, useRef, useState } from "react";
import { useNetworkGas } from "@/hooks/useNetworkGas";
import { useI18n } from "@/i18n";

const MOBILE_GAS_MQ = "(max-width: 768px)";

function useMobileGasLayout() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_GAS_MQ).matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_GAS_MQ);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function GasPumpIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 20h12v-2H6v2zM8 18V8l4-3v13M16 18V6l-4 3v9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function gasLevelClass(gwei: string | null | undefined): string {
  const n = Number(gwei);
  if (!Number.isFinite(n)) return "";
  if (n < 5) return " is-low";
  if (n < 30) return " is-medium";
  return " is-high";
}

type GasTooltipRowProps = {
  label: string;
  value: string | null | undefined;
  accent?: "base" | "priority" | "maxbase" | "total";
};

function GasTooltipRow({ label, value, accent }: GasTooltipRowProps) {
  return (
    <div
      className={"app-header-gas-tooltip-row" + (accent ? ` is-${accent}` : "")}
    >
      <span className="app-header-gas-tooltip-label">{label}</span>
      <span className="app-header-gas-tooltip-value">
        {value ?? "—"}
        <span className="app-header-gas-tooltip-unit"> Gwei</span>
      </span>
    </div>
  );
}

type HeaderGasStatusProps = {
  chainId: string;
};

function HeaderGasStatus({ chainId }: HeaderGasStatusProps) {
  const { t } = useI18n();
  const isMobile = useMobileGasLayout();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const { snapshot, loading, error, isEvm } = useNetworkGas(chainId);

  useEffect(() => {
    if (!panelOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    const timerId = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [panelOpen]);

  useEffect(() => {
    setPanelOpen(false);
  }, [chainId]);

  if (!isEvm) return null;

  const primaryGwei = snapshot?.effectiveGasGwei;
  const levelClass = gasLevelClass(primaryGwei);

  const displayValue =
    loading && !snapshot
      ? t("gas.loading")
      : primaryGwei
        ? `${primaryGwei} Gwei`
        : error
          ? t("gas.unavailable")
          : "—";

  const handleBadgeClick = () => {
    if (isMobile) {
      setPanelOpen((open) => !open);
    }
  };

  const showTooltipPanel =
    Boolean(snapshot) || (isMobile && panelOpen && (loading || Boolean(error)));

  return (
    <div
      ref={wrapRef}
      className={
        "app-header-gas-wrap" +
        (panelOpen ? " is-open" : "") +
        (isMobile ? " is-mobile" : "")
      }
    >
      <button
        type="button"
        className={"app-header-gas-badge" + levelClass}
        onClick={handleBadgeClick}
        aria-label={
          primaryGwei
            ? `${t("gas.panelTitle")}: ${displayValue}`
            : t("gas.panelTitle")
        }
        aria-expanded={isMobile ? panelOpen : undefined}
        aria-haspopup={showTooltipPanel ? "dialog" : undefined}
      >
        <span className="app-header-gas-icon">
          <GasPumpIcon />
        </span>
        <span className="app-header-gas-label">{t("gas.label")}</span>
        <span className="app-header-gas-value">
          {loading && !snapshot ? (
            t("gas.loading")
          ) : primaryGwei ? (
            <>
              <span className="app-header-gas-value-num">{primaryGwei}</span>
              <span className="app-header-gas-value-unit"> Gwei</span>
            </>
          ) : error ? (
            t("gas.unavailable")
          ) : (
            "—"
          )}
        </span>
      </button>

      {showTooltipPanel ? (
        <div className="app-header-gas-tooltip" role="tooltip">
          <div className="app-header-gas-tooltip-body">
            {snapshot ? (
              snapshot.kind === "eip1559" ? (
                <>
                  <GasTooltipRow
                    label={t("gas.baseFee")}
                    value={snapshot.baseFeeGwei}
                    accent="base"
                  />
                  <GasTooltipRow
                    label={t("gas.priorityFee")}
                    value={snapshot.priorityFeeGwei}
                    accent="priority"
                  />
                  <GasTooltipRow
                    label={t("gas.maxBaseFee")}
                    value={snapshot.maxBaseFeeGwei}
                    accent="maxbase"
                  />
                  <GasTooltipRow
                    label={t("gas.effectiveFee")}
                    value={snapshot.effectiveGasGwei}
                    accent="total"
                  />
                </>
              ) : (
                <GasTooltipRow
                  label={t("gas.gasPrice")}
                  value={snapshot.effectiveGasGwei}
                  accent="total"
                />
              )
            ) : (
              <GasTooltipRow
                label={t("gas.panelTitle")}
                value={
                  loading
                    ? t("gas.loading")
                    : error
                      ? t("gas.unavailable")
                      : "—"
                }
              />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default HeaderGasStatus;
