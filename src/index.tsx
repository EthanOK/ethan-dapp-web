import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "@/app/App";
import { getStoredAppTheme } from "@/hooks/useAppTheme";

try {
  document.documentElement.setAttribute("data-theme", getStoredAppTheme());
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
      <App />
    </React.StrictMode>
  );
}

void bootstrap();
