import { useNetworkGas } from "@/hooks/useNetworkGas";
import { useI18n } from "@/i18n";

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
  accent?: "base" | "priority" | "total";
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
  const { snapshot, loading, error, isEvm } = useNetworkGas(chainId);

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

  return (
    <div
      className="app-header-gas-wrap"
      tabIndex={0}
      aria-label={t("gas.panelTitle")}
    >
      <div className={"app-header-gas-badge" + levelClass}>
        <span className="app-header-gas-icon">
          <GasPumpIcon />
        </span>
        <span className="app-header-gas-label">{t("gas.label")}</span>
        <span className="app-header-gas-value">{displayValue}</span>
      </div>

      {snapshot ? (
        <div className="app-header-gas-tooltip" role="tooltip">
          <div className="app-header-gas-tooltip-head">
            {t("gas.panelTitle")}
          </div>
          <div className="app-header-gas-tooltip-body">
            {snapshot.kind === "eip1559" ? (
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default HeaderGasStatus;
