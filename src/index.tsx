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

  // Warm up AppKit as early as possible. `createAppKit` (in `@/app/Wallet`)
  // starts the async session rehydration — the part that takes seconds on a
  // page refresh. Starting it here, in parallel with first render, means by
  // the time the header's lazy `WalletControls` mounts, AppKit is usually
  // already connected and `<appkit-button>` can render the address + balance
  // immediately instead of making the user wait for the whole chain
  // (chunk download → createAppKit → rehydrate).
  if (typeof window !== "undefined") {
    void import("@/app/Wallet");
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
