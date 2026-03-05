import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./EthanDapp";
import reportWebVitals from "./reportWebVitals";

try {
  const saved = localStorage.getItem("app-theme");
  document.documentElement.setAttribute(
    "data-theme",
    saved === "light" ? "light" : "dark"
  );
} catch (_) {}

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
