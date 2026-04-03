import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const publicUrl = process.env.PUBLIC_URL ?? "";

/** fetch 失败时的兜底（避免整图空白） */
const FALLBACK_LOGO_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#0b0b0b"/></svg>'
  );

async function loadLogoAsDataUrl(): Promise<string> {
  try {
    const res = await fetch(`${publicUrl}/qr-center-mark.svg`, {
      cache: "no-store"
    });
    if (!res.ok) throw new Error(String(res.status));
    const text = await res.text();
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(text);
  } catch {
    return FALLBACK_LOGO_DATA_URL;
  }
}

let logoDataUrlPromise: Promise<string> | null = null;

function getLogoDataUrl(): Promise<string> {
  if (!logoDataUrlPromise) {
    logoDataUrlPromise = loadLogoAsDataUrl();
  }
  return logoDataUrlPromise;
}

function buildQr(data: string, imageDataUrl: string): QRCodeStyling {
  return new QRCodeStyling({
    width: 320,
    height: 320,
    type: "svg",
    data,
    margin: 10,
    qrOptions: { errorCorrectionLevel: "Q" },
    image: imageDataUrl,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.32,
      margin: 6
    },
    dotsOptions: { type: "rounded", color: "#0b0b0b" },
    cornersSquareOptions: { type: "dot", color: "#0b0b0b" },
    cornersDotOptions: { type: "dot", color: "#0b0b0b" },
    backgroundOptions: { color: "#ffffff" }
  });
}

type Props = {
  value: string;
  className?: string;
};

/**
 * 与本地 styled-preview 一致：logo 先 fetch 再转 data URL，配置同 buildQr。
 * 中心图：`public/qr-center-mark.svg`（对应预览里的 logo.svg）。
 */
const AddressStyledQR = ({ value, className }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !value) return;

    let cancelled = false;

    void (async () => {
      const imageDataUrl = await getLogoDataUrl();
      if (cancelled) return;
      const el = hostRef.current;
      if (!el) return;

      const qr = buildQr(value, imageDataUrl);
      el.innerHTML = "";
      qr.append(el);
    })();

    return () => {
      cancelled = true;
      host.innerHTML = "";
    };
  }, [value]);

  return <div ref={hostRef} className={className} aria-hidden />;
};

export default AddressStyledQR;
