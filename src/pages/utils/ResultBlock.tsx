import type { CSSProperties } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

/**
 * The single result frame shared by every tool page: a "Result" heading with a
 * copy button, then the value in a monospace block. It lives in one place so
 * the tools cannot drift apart visually the way they did when each page rolled
 * its own paragraph or textarea.
 */
const RESULT_PRE: CSSProperties = {
  margin: 0,
  padding: 16,
  background: "var(--w3-bg-elevated)",
  border: "1px solid var(--w3-border)",
  borderRadius: "var(--w3-radius-sm)",
  fontSize: "0.8rem",
  overflow: "auto",
  maxHeight: 320,
  fontFamily: "var(--w3-font-mono)",
  lineHeight: 1.35
};

export default function ResultBlock({
  value,
  sub,
  emphasis = false,
  onToggle,
  toggleTitle
}: {
  value: string;
  sub?: string;
  emphasis?: boolean;
  /**
   * Swap the value for its counterpart where one exists — an inverse rate, a
   * different unit. Rendered as an extra action next to Copy, on the
   * emphasised frame only.
   */
  onToggle?: () => void;
  toggleTitle?: string;
}) {
  const { t } = useI18n();
  // Tools start with no result; the block appears once there is one.
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(t("common.copiedToClipboard"));
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = value;
        el.setAttribute("readonly", "true");
        el.style.position = "fixed";
        el.style.top = "-1000px";
        el.style.left = "-1000px";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        toast.success(t("common.copiedToClipboard"));
      } catch {
        toast.error(t("common.copyManual"));
      }
    }
  };

  // Calculator tools show a number, not a payload: it gets its own frame
  // where the value outranks everything else on the page.
  if (emphasis) {
    return (
      <div className="result-emphasis">
        <div className="result-emphasis-body">
          <div className="result-emphasis-value">{value}</div>
          {sub ? <div className="result-emphasis-sub">{sub}</div> : null}
        </div>
        <div className="result-emphasis-actions">
          {onToggle ? (
            <button
              type="button"
              onClick={onToggle}
              className="mini-action-button"
              title={toggleTitle}
              aria-label={toggleTitle}
            >
              ⇄
            </button>
          ) : null}
          <button
            type="button"
            onClick={copy}
            className="mini-action-button"
            title={t("common.copyResult")}
          >
            {t("common.copy")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="feature-panel-header" style={{ marginTop: 16 }}>
        <h3>{t("common.result")}</h3>
        <button
          type="button"
          onClick={copy}
          className="mini-action-button"
          title={t("common.copyResult")}
        >
          {t("common.copy")}
        </button>
      </div>
      <pre style={RESULT_PRE}>{value}</pre>
      {sub ? <div className="result-sub">{sub}</div> : null}
    </>
  );
}
