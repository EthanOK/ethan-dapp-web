/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getChainIdAndBalanceETHAndTransactionCount } from "@/lib/wallet/GetProvider";
import { DefaultChainId, APP_VERSION } from "@/config/SystemConfiguration";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { useEvmWallet } from "@/hooks";
import { bitcoinTestnet } from "@reown/appkit/networks";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import { build as buildEthUrl, parse as parseEthUrl } from "eth-url-parser";
import AddressStyledQR, {
  prewarmAddressStyledQr,
  PREWARM_PLACEHOLDER
} from "@/components/AddressStyledQR";
import { getBitCoinBalance } from "@/lib/shared/BitcoinBalance";
import "./HomePage.css";

import {
  fallbackMarketList,
  fetchMarketTickerList,
  getCachedMarketData,
  setCachedMarketData,
  toCoinRouteState,
  type MarketCoinItem
} from "@/lib/price/marketTicker";
import { useI18n } from "@/i18n";

function middleEllipsis(
  input: string,
  head = 20,
  tail = 18,
  ellipsis = "…"
): string {
  const s = (input ?? "").trim();
  if (!s) return "";
  if (head <= 0 || tail <= 0) return s;
  const keep = head + tail + ellipsis.length;
  if (s.length <= keep) return s;
  return s.slice(0, head) + ellipsis + s.slice(-tail);
}

type CoinItem = MarketCoinItem;

function parsePositiveChainId(
  v: number | string | undefined | null
): number | undefined {
  if (v == null) return undefined;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const t = v.trim();
    if (/^\d+$/.test(t)) return Number(t);
    if (/^0x[0-9a-fA-F]+$/i.test(t)) return parseInt(t, 16);
  }
  return undefined;
}

/** QR payload: fixed prefix for Solana/Bitcoin; EVM uses EIP-681/831 ethereum URI. */
function walletPaymentUriForQr(
  address: string,
  chainNamespace: string | undefined,
  evmChainId: number | undefined,
  value?: string | undefined
): string {
  if (chainNamespace === "solana") return `solana:${address}`;
  if (chainNamespace === "bip122") return `bitcoin:${address}`;

  try {
    // e.g. ethereum:0xabc...@1 (chain_id optional)
    return buildEthUrl({
      scheme: "ethereum",
      target_address: address,
      chain_id: evmChainId != null ? String(evmChainId) : undefined,
      parameters: value != null ? { value } : undefined
    });
  } catch {
    return address;
  }
}

async function fetchTickerFromCoinGecko(): Promise<CoinItem[]> {
  return fetchMarketTickerList();
}

const CoinCard = ({
  item,
  onClick
}: {
  item: CoinItem;
  onClick?: () => void;
}) => {
  const { t } = useI18n();
  return (
    <div
      className="home-coin-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="home-coin-card-head">
        {item.image && (
          <img
            src={item.image}
            alt=""
            className="home-coin-card-icon"
            width={28}
            height={28}
          />
        )}
        <div className="home-coin-card-title">
          <span className="home-coin-card-symbol">{item.symbol}</span>
          <span
            className={`home-coin-card-change ${item.isUp ? "up" : "down"}`}
          >
            {item.change}
          </span>
        </div>
      </div>
      <div className="home-coin-card-price">{item.price}</div>
      <div className="home-coin-card-meta">
        <div className="home-coin-card-meta-row">
          <span className="home-coin-card-meta-label">
            {t("home.marketCap")}
          </span>
          <span className="home-coin-card-meta-value">{item.marketCap}</span>
        </div>
        <div className="home-coin-card-meta-row">
          <span className="home-coin-card-meta-label">{t("home.high24h")}</span>
          <span className="home-coin-card-meta-value">{item.high24h}</span>
        </div>
        <div className="home-coin-card-meta-row">
          <span className="home-coin-card-meta-label">{t("home.low24h")}</span>
          <span className="home-coin-card-meta-value">{item.low24h}</span>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { t, dateLocale } = useI18n();
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [currentAccountBalance, setCurrentAccountBalance] = useState<
    string | null
  >(null);
  const [currentAccountNonce, setCurrentAccountNonce] = useState<number | null>(
    null
  );
  const [chainId, setChainId] = useState(
    localStorage.getItem("chainId") || DefaultChainId
  );
  const [tickerList, setTickerList] = useState<CoinItem[]>(fallbackMarketList);
  const [spotPrices, setSpotPrices] = useState<Record<string, string | null>>({
    btc: null,
    eth: null,
    sol: null,
    bnb: null,
    okb: null
  });
  const [marketUpdatedAt, setMarketUpdatedAt] = useState<number | null>(null);
  const [marketSearch, setMarketSearch] = useState("");
  const [addressQrOpen, setAddressQrOpen] = useState(false);
  const [donateQrOpen, setDonateQrOpen] = useState(false);

  // Donation addresses (Donate modal + footer)
  const {
    target_address: donateAddress,
    parameters: { value: donateValue },
    scheme
  } = parseEthUrl(PREWARM_PLACEHOLDER);

  const marketFilteredList = useMemo(() => {
    const q = marketSearch.trim().toLowerCase();
    if (!q) return tickerList;
    return tickerList.filter((c) => c.symbol.toLowerCase().includes(q));
  }, [tickerList, marketSearch]);

  const { chainId: currentChainId, caipNetwork } = useAppKitNetwork();
  const { address, isConnected } = useEvmWallet();
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const bitcoinAccount = useAppKitAccount({ namespace: "bip122" });
  const { connection: solanaConnection } = useAppKitConnection();
  const isSolanaNetwork = caipNetwork?.chainNamespace === "solana";
  const isBitcoinNetwork = caipNetwork?.chainNamespace === "bip122";
  const balanceSymbol =
    caipNetwork?.nativeCurrency?.symbol ??
    (isSolanaNetwork ? "SOL" : isBitcoinNetwork ? "BTC" : "ETH");

  const evmChainIdForQr = useMemo(() => {
    return (
      parsePositiveChainId(caipNetwork?.id) ??
      parsePositiveChainId(currentChainId as string | number | undefined)
    );
  }, [caipNetwork?.id, currentChainId]);

  const donateQrPayload = useMemo(() => {
    // Default Donate QR: EVM ethereum:...@chainId format
    return walletPaymentUriForQr(
      donateAddress,
      undefined,
      undefined,
      donateValue
    );
  }, [donateAddress]);

  const addressQrPayload = useMemo(() => {
    if (!currentAccount) return "";
    return walletPaymentUriForQr(
      currentAccount,
      caipNetwork?.chainNamespace,
      evmChainIdForQr
    );
  }, [currentAccount, caipNetwork?.chainNamespace, evmChainIdForQr]);

  const loadTicker = useCallback(async () => {
    const cached = getCachedMarketData();
    if (cached) {
      setTickerList(cached.tickerList);
      setSpotPrices(cached.spotPrices);
      setMarketUpdatedAt(cached.updatedAt);
    }
    try {
      const list = await fetchTickerFromCoinGecko();
      const bySymbol = Object.fromEntries(list.map((x) => [x.symbol, x]));
      const spots: Record<string, string | null> = {
        btc: bySymbol.BTC?.price ?? null,
        eth: bySymbol.ETH?.price ?? null,
        sol: bySymbol.SOL?.price ?? null,
        bnb: bySymbol.BNB?.price ?? null,
        okb: bySymbol.OKB?.price ?? null
      };
      setTickerList(list);
      setSpotPrices(spots);
      setMarketUpdatedAt(Date.now());
      setCachedMarketData(list, spots);
    } catch (e) {
      console.warn("CoinGecko ticker load failed:", e);
    }
  }, []);

  useEffect(() => {
    // Pre-warm QR instance to avoid flash/blank on first modal open
    prewarmAddressStyledQr();
    loadTicker();
    const interval = setInterval(loadTicker, 30000);
    return () => clearInterval(interval);
  }, [loadTicker]);

  const marketUpdatedLabel = marketUpdatedAt
    ? new Date(marketUpdatedAt).toLocaleString(dateLocale, {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      })
    : null;

  useEffect(() => {
    if (isSolanaNetwork || isBitcoinNetwork) return;
    if (isConnected && address) {
      setCurrentAccount(address);
      setChainId(String(currentChainId ?? ""));
      getChainIdAndBalanceETHAndTransactionCount(address).then((res) => {
        setCurrentAccountBalance(res?.balance ?? null);
        setCurrentAccountNonce(res?.nonce ?? null);
      });
    }
  }, [isConnected, address, currentChainId, isSolanaNetwork, isBitcoinNetwork]);

  useEffect(() => {
    if (!isBitcoinNetwork) return;
    // Match AppKit: prefer accountState; some wallets expose address in allAccounts before balance loads
    const fromAll = bitcoinAccount?.allAccounts?.[0]?.caipAddress;
    const btcAddress =
      bitcoinAccount?.address ??
      (fromAll ? fromAll.split(":").slice(2).join(":") : undefined) ??
      address;
    if (!btcAddress) {
      setCurrentAccount(null);
      setCurrentAccountBalance(null);
      setCurrentAccountNonce(null);
      return;
    }
    // Show address first, then fetch balance async (mempool.space UTXO)
    setCurrentAccount(btcAddress);
    setChainId(String(currentChainId ?? ""));
    setCurrentAccountNonce(null);

    const btcTestnet =
      caipNetwork?.caipNetworkId === bitcoinTestnet.caipNetworkId;

    let isActive = true;
    const refreshBitcoinStats = async () => {
      try {
        const sats = await getBitCoinBalance(btcAddress, {
          // testnet: btcTestnet
        });
        if (!isActive) return;
        setCurrentAccountBalance(String(sats / 1e8));
      } catch (error) {
        if (!isActive) return;
        console.warn("Load Bitcoin balance failed:", error);
        setCurrentAccountBalance(null);
      }
    };
    refreshBitcoinStats();
    const timerId = setInterval(refreshBitcoinStats, 15000);
    return () => {
      isActive = false;
      clearInterval(timerId);
    };
  }, [
    isBitcoinNetwork,
    bitcoinAccount?.address,
    bitcoinAccount?.allAccounts?.[0]?.caipAddress,
    address,
    currentChainId,
    caipNetwork?.caipNetworkId
  ]);

  useEffect(() => {
    if (!isSolanaNetwork) return;
    const solAddress = solanaAccount?.address;
    if (!solanaConnection || !solAddress) {
      setCurrentAccount(solAddress ?? null);
      setCurrentAccountBalance(null);
      setCurrentAccountNonce(null);
      return;
    }
    let isActive = true;
    const refreshSolanaStats = async () => {
      try {
        const lamports = await solanaConnection.getBalance(
          new PublicKey(solAddress)
        );
        if (!isActive) return;
        setCurrentAccount(solAddress);
        setChainId(String(currentChainId ?? ""));
        setCurrentAccountBalance(String(lamports / LAMPORTS_PER_SOL));
        setCurrentAccountNonce(null);
      } catch (error) {
        if (!isActive) return;
        console.warn("Load Solana balance failed:", error);
      }
    };
    refreshSolanaStats();
    const timerId = setInterval(refreshSolanaStats, 5000);
    return () => {
      isActive = false;
      clearInterval(timerId);
    };
  }, [
    isSolanaNetwork,
    solanaAccount?.address,
    solanaConnection,
    currentChainId
  ]);

  useEffect(() => {
    const onNetworkChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ chainId: string }>).detail;
      if (detail?.chainId != null) setChainId(String(detail.chainId));
    };
    window.addEventListener("app-network-changed", onNetworkChanged);
    return () =>
      window.removeEventListener("app-network-changed", onNetworkChanged);
  }, []);

  useEffect(() => {
    if (!addressQrOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAddressQrOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [addressQrOpen]);

  useEffect(() => {
    if (!donateQrOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDonateQrOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [donateQrOpen]);

  useEffect(() => {
    if (!currentAccount) setAddressQrOpen(false);
  }, [currentAccount]);

  return (
    <div className="home-page main-app">
      <section className="home-hero">
        <h1>
          {t("home.welcome")} <span className="hero-accent">0xEthan DApp</span>
        </h1>
        <p>{t("home.tagline")}</p>
      </section>
      <div className="home-cards home-cards-stats">
        <div className="home-card">
          <div className="home-card-label">{t("home.chainId")}</div>
          <div className="home-card-value accent">{chainId || "—"}</div>
        </div>
        <div className="home-card">
          <div className="home-card-label">{t("home.account")}</div>
          {currentAccount ? (
            <button
              type="button"
              className="home-card-value home-card-address-trigger"
              title={t("home.accountQrTitle", { address: currentAccount })}
              onClick={() => setAddressQrOpen(true)}
            >
              {`${currentAccount.slice(0, 6)}…${currentAccount.slice(-4)}`}
            </button>
          ) : (
            <div className="home-card-value">—</div>
          )}
        </div>
        <div className="home-card">
          <div className="home-card-label">{t("home.balance")}</div>
          <div className="home-card-value">
            {currentAccountBalance != null
              ? `${Number(currentAccountBalance).toFixed(8)} ${balanceSymbol}`
              : "—"}
          </div>
        </div>
        <div className="home-card">
          <div className="home-card-label">{t("home.nonce")}</div>
          <div className="home-card-value">{currentAccountNonce ?? "—"}</div>
        </div>
      </div>
      <div className="home-spot-row">
        {(() => {
          const bySymbol = Object.fromEntries(
            tickerList.map((x) => [x.symbol, x])
          );
          return (
            [
              { key: "btc", label: "BTC" },
              { key: "eth", label: "ETH" },
              { key: "bnb", label: "BNB" },
              { key: "sol", label: "SOL" },
              { key: "okb", label: "OKB" }
            ] as const
          ).map(({ key, label }) => {
            const spot = spotPrices[key];
            const item = bySymbol[label];
            const change = item?.change ?? "—";
            const isUp = item?.isUp ?? true;
            return (
              <div key={key} className="home-spot-card">
                <div className="home-spot-card-top">
                  <span className="home-spot-card-symbol">{label}</span>
                  <span
                    className={`home-spot-card-badge ${isUp ? "up" : "down"}`}
                  >
                    {change}
                  </span>
                </div>
                <div className="home-spot-card-price">{spot ?? "—"}</div>
              </div>
            );
          });
        })()}
      </div>
      <section className="home-market-wrap">
        <div className="home-market-header">
          <div className="home-market-title-row">
            <h2 className="home-market-title">{t("home.market")}</h2>
            <Link to="/markets" className="home-market-more">
              {t("home.marketMore")}
            </Link>
          </div>
          <div className="home-market-toolbar">
            <input
              type="text"
              className="home-market-search"
              placeholder={t("home.searchPlaceholder")}
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
              aria-label={t("home.searchCoins")}
            />
            {marketUpdatedLabel && (
              <span
                className="home-market-updated"
                title={t("common.dataLastUpdated")}
              >
                {t("common.updatedAt", { time: marketUpdatedLabel })}
              </span>
            )}
          </div>
        </div>
        {marketSearch.trim() ? (
          <div className="home-market-grid-wrap">
            {marketFilteredList.length > 0 ? (
              <div className="home-market-grid">
                {marketFilteredList.map((item) => (
                  <CoinCard
                    key={item.symbol}
                    item={item}
                    onClick={
                      item.id
                        ? () =>
                            navigate(`/market?coinId=${item.id}`, {
                              state: toCoinRouteState(item)
                            })
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="home-market-empty">{t("home.noMatchingCoins")}</p>
            )}
          </div>
        ) : (
          <>
            <div className="home-market-scroll-row">
              <div className="home-market-track">
                {(() => {
                  const row1 = tickerList.slice(
                    0,
                    Math.ceil(tickerList.length / 2)
                  );
                  return [...row1, ...row1].map((item, i) => (
                    <CoinCard
                      key={`r1-${item.symbol}-${i}`}
                      item={item}
                      onClick={
                        item.id
                          ? () =>
                              navigate(`/market?coinId=${item.id}`, {
                                state: toCoinRouteState(item)
                              })
                          : undefined
                      }
                    />
                  ));
                })()}
              </div>
            </div>
            <div className="home-market-scroll-row">
              <div className="home-market-track home-market-track-reverse">
                {(() => {
                  const row2 = tickerList.slice(
                    Math.ceil(tickerList.length / 2)
                  );
                  return [...row2, ...row2].map((item, i) => (
                    <CoinCard
                      key={`r2-${item.symbol}-${i}`}
                      item={item}
                      onClick={
                        item.id
                          ? () =>
                              navigate(`/market?coinId=${item.id}`, {
                                state: toCoinRouteState(item)
                              })
                          : undefined
                      }
                    />
                  ));
                })()}
              </div>
            </div>
          </>
        )}
      </section>

      {addressQrOpen && currentAccount && (
        <div
          className="home-qr-overlay"
          onClick={() => setAddressQrOpen(false)}
          role="presentation"
        >
          <div
            className="home-qr-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-qr-heading"
          >
            <button
              type="button"
              className="home-qr-close"
              onClick={() => setAddressQrOpen(false)}
              aria-label={t("common.close")}
            >
              ×
            </button>
            <div className="home-qr-code-box">
              <AddressStyledQR
                value={addressQrPayload}
                className="home-qr-styled-root"
              />
            </div>
            <p id="home-qr-heading" className="home-qr-hint">
              {t("home.addressQrHint")}
            </p>
            <div className="home-qr-address" title={currentAccount}>
              <span className="home-qr-address-text">
                {middleEllipsis(currentAccount)}
              </span>
            </div>
            <button
              type="button"
              className="home-qr-copy"
              onClick={() => {
                navigator.clipboard.writeText(currentAccount).then(
                  () => toast.success(t("common.addressCopied")),
                  () => toast.error(t("common.copyFailed"))
                );
              }}
            >
              <svg
                className="home-qr-copy-icon"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t("common.copyAddress")}
            </button>
          </div>
        </div>
      )}

      {donateQrOpen && (
        <div
          className="home-qr-overlay"
          onClick={() => setDonateQrOpen(false)}
          role="presentation"
        >
          <div
            className="home-qr-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-donate-qr-heading"
          >
            <button
              type="button"
              className="home-qr-close"
              onClick={() => setDonateQrOpen(false)}
              aria-label={t("common.close")}
            >
              ×
            </button>
            <div className="home-qr-code-box">
              <AddressStyledQR
                value={donateQrPayload}
                className="home-qr-styled-root"
              />
            </div>
            <p id="home-donate-qr-heading" className="home-qr-hint">
              {t("home.donateQrHint")}
            </p>
            <div className="home-qr-address" title={donateAddress}>
              <span className="home-qr-address-text">
                {middleEllipsis(donateAddress)}
              </span>
            </div>
            <button
              type="button"
              className="home-qr-copy"
              onClick={() => {
                navigator.clipboard.writeText(donateAddress).then(
                  () => toast.success(t("common.addressCopied")),
                  () => toast.error(t("common.copyFailed"))
                );
              }}
            >
              <svg
                className="home-qr-copy-icon"
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {t("common.copyAddress")}
            </button>
          </div>
        </div>
      )}

      <footer className="home-footer" aria-label={t("home.footerSiteLinks")}>
        <div className="home-footer-inner">
          <nav
            className="home-footer-links"
            aria-label={t("home.footerExternalLinks")}
          >
            <button
              type="button"
              className="home-footer-link home-footer-version"
              data-tooltip={`v${APP_VERSION}`}
              aria-label={t("home.footerVersion")}
            >
              <svg
                className="home-footer-icon"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 2a7 7 0 0 1 7 7c0 3.87-3.13 7-7 7a7 7 0 0 1-7-7c0-3.87 3.13-7 7-7Zm0 2a5 5 0 1 0 0 10a5 5 0 0 0 0-10Zm0 13c4.08 0 7.53 2.08 9 5.25a1 1 0 0 1-.92 1.35H3.92A1 1 0 0 1 3 22.25C4.47 19.08 7.92 17 12 17Z"
                />
              </svg>
              <span className="home-footer-link-text home-footer-version-text">
                {t("home.footerVersion")}
              </span>
            </button>
            <a
              className="home-footer-link"
              href="https://github.com/EthanOK/ethan-dapp-web"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="home-footer-icon"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.45-1.15-1.11-1.46-1.11-1.46-.9-.62.07-.61.07-.61 1 .07 1.52 1.03 1.52 1.03.89 1.52 2.33 1.08 2.9.82.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.6 9.6 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.93.68 1.88v2.78c0 .26.18.57.69.48A10 10 0 0 0 12 2Z"
                />
              </svg>
              <span className="home-footer-link-text">GitHub</span>
            </a>
            <a
              className="home-footer-link"
              href="https://github.com/EthanOK/ethan-dapp-web/releases"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="home-footer-icon"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm0 10H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1Zm10-10h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1Zm0 10h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1Z"
                />
              </svg>
              <span className="home-footer-link-text">Releases</span>
            </a>
            <a
              className="home-footer-link"
              href="https://x.com/0xEthanHub"
              target="_blank"
              rel="noreferrer"
            >
              <svg
                className="home-footer-icon"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.4L1 2h6.5l4.4 5.8L18.9 2Zm-1.1 18h1.7L6.6 3.9H4.8L17.8 20Z"
                />
              </svg>
              <span className="home-footer-link-text">X</span>
            </a>
            <a
              className="home-footer-link"
              href="mailto:ethanzhang.web3@gmail.com"
            >
              <svg
                className="home-footer-icon"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                />
              </svg>
              <span className="home-footer-link-text">Email</span>
            </a>
            <button
              type="button"
              className="home-footer-link home-footer-link-accent"
              onClick={() => setDonateQrOpen(true)}
            >
              <svg
                className="home-footer-icon"
                viewBox="0 0 24 24"
                width={16}
                height={16}
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M12 21s-7.05-4.37-9.5-8.28C.53 9.61 2.02 6.5 5.5 6.5c1.74 0 3.05.96 3.78 2.03.72-1.07 2.04-2.03 3.72-2.03 3.48 0 4.97 3.11 3 6.22C19.05 16.63 12 21 12 21Z"
                />
              </svg>
              <span className="home-footer-link-text">
                {t("home.footerDonate")}{" "}
                <span className="home-footer-address">{scheme}</span>
              </span>
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
