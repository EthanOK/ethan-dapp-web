import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "@/app/App";
import { getStoredAppTheme } from "@/hooks/useAppTheme";
import { getStoredAppLocale, getDocumentLang, I18nProvider } from "@/i18n";

try {
  document.documentElement.setAttribute("data-theme", getStoredAppTheme());
  document.documentElement.lang = getDocumentLang(getStoredAppLocale());
} catch (_) {}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

async function bootstrap() {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.replace(/\/$/, "") === "/bricswap"
  ) {
    await import("@/pages/SwapPage");
  }

  root.render(
    <React.StrictMode>
      <I18nProvider>
        <App />
      </I18nProvider>
    </React.StrictMode>
  );
}

void bootstrap();
