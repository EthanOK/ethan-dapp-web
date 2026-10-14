/**
 * 404 fallback, matched by the catch-all `<Route path="*" />` in `App.tsx`.
 *
 * Deliberately a page and not a redirect: retired routes (`/burn`,
 * `/estimateTxFee`) and typo'd URLs should say what happened instead of
 * dropping the user into a blank content area with no way to tell whether the
 * app broke.
 *
 * Visual language mirrors the home hero: gradient numerals, glass panel with
 * corner brackets, and the brand hexagon as a ghost mark behind the digits.
 */
import { Link, useLocation } from "react-router-dom";
import { useI18n } from "@/i18n";
import "./NotFoundPage.css";

/* Same hexagon / slashed-zero artwork as `public/favicon.svg` and the header
 * LogoMarkIcon, drawn in a single stroke colour so it can sit behind the
 * numerals as a ghost at low opacity. */
function GhostMark() {
  return (
    <svg className="not-found-ghost" viewBox="0 0 32 32" aria-hidden>
      <path
        d="M16 2.5 L27.7 9 V23 L16 29.5 L4.3 23 V9 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="16"
        r="5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M9.45 18.55 L14.55 13.45"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path
        d="M17.5 12 L22 20 M22 12 L17.5 20"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

const NotFoundPage = () => {
  const { t } = useI18n();
  const { pathname, search } = useLocation();

  return (
    <div className="not-found-page">
      <div className="not-found-panel">
        <GhostMark />
        <p className="not-found-eyebrow">HTTP 404</p>
        <h1 className="not-found-code">404</h1>
        <p className="not-found-title">{t("notFound.title")}</p>
        <p className="not-found-desc">{t("notFound.desc")}</p>
        <p className="not-found-path">
          <span className="not-found-path-label">
            {t("notFound.requestedPath")}
          </span>
          <code>
            {pathname}
            {search}
          </code>
        </p>
        <Link className="not-found-home" to="/">
          {t("notFound.backHome")}
          <span className="not-found-home-arrow" aria-hidden>
            →
          </span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
