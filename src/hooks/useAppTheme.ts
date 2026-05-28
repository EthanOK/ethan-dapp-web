import { useCallback, useEffect, useState } from "react";

export const APP_THEME_KEY = "app-theme";
export type AppTheme = "light" | "dark";

export function getStoredAppTheme(): AppTheme {
  try {
    const t = localStorage.getItem(APP_THEME_KEY);
    return t === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Light/dark theme synced to `document.documentElement[data-theme]`. */
export function useAppTheme() {
  const [theme, setTheme] = useState<AppTheme>(getStoredAppTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(APP_THEME_KEY, theme);
    } catch (e) {
      console.warn("localStorage theme save failed", e);
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}
