import { useState } from "react";
import { useOutsideDismiss } from "@/hooks/useOutsideDismiss";
import { useI18n, APP_LOCALES, getLocaleLabelKey } from "@/i18n";
import { NavIcon } from "@/app/navIcons";

/**
 * Locale picker. Unlike the theme this does need a menu — three locales is
 * more than a toggle can express. Picking one closes the menu.
 */
export default function LanguageMenu() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const menuRef = useOutsideDismiss(open, () => setOpen(false));

  return (
    <div className="app-header-settings-wrap" ref={menuRef}>
      <button
        type="button"
        className={"app-header-settings-toggle" + (open ? " is-open" : "")}
        onClick={() => setOpen((value) => !value)}
        title={t("settings.language")}
        aria-label={t("settings.language")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <NavIcon name="language" size={18} />
      </button>

      {open && (
        <div
          className="app-header-settings-menu"
          role="dialog"
          aria-label={t("settings.language")}
        >
          <div className="settings-block">
            {APP_LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                role="radio"
                aria-checked={locale === code}
                className={
                  "settings-option" + (locale === code ? " is-active" : "")
                }
                onClick={() => {
                  setLocale(code);
                  setOpen(false);
                }}
              >
                <span className="settings-option-label">
                  {t(getLocaleLabelKey(code))}
                </span>
                {locale === code && (
                  <span className="settings-option-check" aria-hidden>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
