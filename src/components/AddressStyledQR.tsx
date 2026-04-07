import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

/**
 * 同步路径：中心 logo 直接内联为 data URL，避免首次打开时等待 fetch 导致的空白。
 * 内容来自 `public/qr-center-mark.svg`。
 */
const LOGO_DATA_URL =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" width="72" height="72"><rect width="72" height="72" rx="18" fill="#0a0a0a"/><text x="36" y="48" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif" font-weight="700" font-size="28" letter-spacing="0.04em" fill="#22d3ee">OX</text></svg>'
  );

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

export const PREWARM_PLACEHOLDER =
  "ethereum:0x000000b1cf3c8df89d748dcbea3c970e1bcf4039?value=0.01e18";

let singletonQr: QRCodeStyling | null = null;
let singletonHost: HTMLDivElement | null = null;

function getSingletonQr(): QRCodeStyling {
  if (!singletonQr) {
    singletonQr = buildQr(PREWARM_PLACEHOLDER, LOGO_DATA_URL);
  }
  return singletonQr;
}

export function prewarmAddressStyledQr(): void {
  // 仅初始化实例（不触发 DOM append），让首次打开弹窗更丝滑
  getSingletonQr();
}

type Props = {
  value: string;
  className?: string;
};

/**
 * 生成带中心 logo 的二维码（同步）。
 */
const AddressStyledQR = ({ value, className }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !value) return;

    const qr = getSingletonQr();
    qr.update({ data: value });

    // 只 append 一次；如果 host 变了（例如弹窗重新挂载），就把旧 host 清空再挂到新 host 上
    if (singletonHost !== host) {
      if (singletonHost) singletonHost.innerHTML = "";
      host.innerHTML = "";
      qr.append(host);
      singletonHost = host;
    }
  }, [value]);

  useEffect(() => {
    const host = hostRef.current;
    return () => {
      if (singletonHost === host) singletonHost = null;
      if (host) host.innerHTML = "";
    };
  }, []);

  return <div ref={hostRef} className={className} aria-hidden />;
};

export default AddressStyledQR;
