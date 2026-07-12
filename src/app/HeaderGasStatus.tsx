import { useEffect, useRef, useState } from "react";
import { useGasSpeed } from "@/hooks/useGasSpeed";
import { useNetworkGas } from "@/hooks/useNetworkGas";
import { useI18n } from "@/i18n";
import type { GasSpeed } from "@/lib/evm/GasStrategy";

const MOBILE_GAS_MQ = "(max-width: 768px)";
const GAS_SPEEDS: GasSpeed[] = ["low", "medium", "high"];

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

type GasSpeedOptionProps = {
  label: string;
  value: string | null | undefined;
  speed: GasSpeed;
  selected: boolean;
  onSelect: (speed: GasSpeed) => void;
};

function GasSpeedOption({
  label,
  value,
  speed,
  selected,
  onSelect
}: GasSpeedOptionProps) {
  return (
    <button
      type="button"
      className={
        "app-header-gas-speed-option is-" +
        speed +
        (selected ? " is-selected" : "")
      }
      onClick={() => onSelect(speed)}
      aria-pressed={selected}
    >
      <span className="app-header-gas-speed-label">{label}</span>
      <span className="app-header-gas-speed-value">
        {value ?? "—"}
        <span className="app-header-gas-speed-unit"> Gwei</span>
      </span>
    </button>
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
  const { speed, setSpeed } = useGasSpeed();
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

  const primaryGwei = snapshot?.tierGwei?.[speed] ?? snapshot?.effectiveGasGwei;

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

  const handleSpeedSelect = (next: GasSpeed) => {
    setSpeed(next);
    if (isMobile) {
      setPanelOpen(false);
    }
  };

  const showTooltipPanel = isMobile
    ? panelOpen
    : Boolean(snapshot) || loading || Boolean(error);

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
        className={"app-header-gas-badge is-" + speed}
        onClick={handleBadgeClick}
        aria-label={
          primaryGwei
            ? `${t("gas.panelTitle")} ${t(`gas.speed.${speed}`)}: ${displayValue}`
            : t("gas.panelTitle")
        }
        aria-expanded={isMobile ? panelOpen : undefined}
        aria-haspopup={showTooltipPanel ? "dialog" : undefined}
      >
        <span className="app-header-gas-icon">
          <GasPumpIcon />
        </span>
        <span className="app-header-gas-tier">{t(`gas.speed.${speed}`)}</span>
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
              GAS_SPEEDS.map((tier) => (
                <GasSpeedOption
                  key={tier}
                  label={t(`gas.speed.${tier}`)}
                  value={snapshot.tierGwei?.[tier]}
                  speed={tier}
                  selected={speed === tier}
                  onSelect={handleSpeedSelect}
                />
              ))
            ) : (
              <div className="app-header-gas-speed-empty">
                {loading
                  ? t("gas.loading")
                  : error
                    ? t("gas.unavailable")
                    : "—"}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default HeaderGasStatus;
