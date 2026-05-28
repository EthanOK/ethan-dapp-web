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
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
