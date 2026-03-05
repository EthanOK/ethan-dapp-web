import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
// TODO: Change start page
import App from "./EthanDapp";
import reportWebVitals from "./reportWebVitals";

// 首屏即应用上次选择的主题，避免闪烁
try {
  const saved = localStorage.getItem("app-theme");
  document.documentElement.setAttribute(
    "data-theme",
    saved === "light" ? "light" : "dark"
  );
} catch (_) {}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
