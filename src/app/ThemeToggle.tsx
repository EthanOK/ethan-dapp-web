import { useAppTheme } from "@/hooks/useAppTheme";
import { useI18n } from "@/i18n";
import { NavIcon } from "@/app/navIcons";

/**
 * One click flips dark ⇄ light. There are only two themes, so a menu would
 * just add a step — the icon shows the theme currently on, and the tooltip
 * names the one the click lands on.
 */
export default function ThemeToggle() {
  const { theme, setTheme } = useAppTheme();
  const { t } = useI18n();

  const isDark = theme === "dark";
  const labelKey = isDark ? "theme.switchToLight" : "theme.switchToDark";

  return (
    <button
      type="button"
      className="app-header-settings-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={t(labelKey)}
      aria-label={t(labelKey)}
    >
      <NavIcon name={isDark ? "moon" : "sun"} size={18} />
    </button>
  );
}
