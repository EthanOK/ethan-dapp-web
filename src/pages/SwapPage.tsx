import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ZeroAddress, formatUnits, parseUnits } from "ethers";
import { toast } from "sonner";
import {
  useEvmWallet,
  useOpenAppKitModal,
  useSwitchAppKitNetwork,
  useWalletChain
} from "@/hooks";
import { initBricSdk } from "@/config/BricConfig";
import { getDefaultSwapChain } from "@/config/SwapChainConfig";
import {
  ensureErc20Allowance,
  executeSwapExactInput,
  fetchSwapQuote,
  isExecutableSwapQuote,
  type SwapQuoteResult
} from "@/lib/swap/BricSwap";
import {
  fetchTokenBalancesMulticall,
  resolveTokenFromAddressMulticall
} from "@/lib/swap/swapTokenMulticall";
import {
  buildSwapTokenCatalog,
  findTokenByAddress,
  loadSavedSwapTokens,
  saveSwapToken
} from "@/lib/swap/savedSwapTokens";
import { loadLastSwapPair, saveLastSwapPair } from "@/lib/swap/swapLastPair";
import {
  calcTokenUsdValue,
  fetchSwapTokenPricesForSides,
  formatSwapUsdValue,
  getSwapTokenPrice,
  type SwapTokenPriceMap
} from "@/lib/swap/swapTokenPrices";
import {
  DEFAULT_SLIPPAGE,
  SLIPPAGE_PRESETS,
  addressesEqual,
  buildReceiveSelectOptions,
  coerceReceiveSide,
  customTokenSide,
  encodeTokenSelectKey,
  filterTokenSidesByQuery,
  isReceiveAllowed,
  isSameTokenSide,
  payTokenSide,
  resolveTokenSideFromSelectKey,
  sortTokenSidesByBalance,
  tokenBalanceKey,
  whitelistTokenSide,
  type TokenSide
} from "@/lib/swap/swapTokenRules";
import { getScanTxURL, isAddress } from "@/lib/shared/Utils";
import { getProvider, getSigner } from "@/lib/wallet/GetProvider";
import { truncateHash } from "@/lib/shared/Format";
import { SwapTokenPickerModal } from "@/components/swap/SwapTokenPickerModal";
import "./SwapPage.css";

/** Wait for user to finish typing before calling previewSwapExactInput. */
const QUOTE_AMOUNT_DEBOUNCE_MS = 1000;
/** Auto-refresh quote interval while inputs are valid. */
const QUOTE_AUTO_REFRESH_MS = 15_000;

const swapChain = getDefaultSwapChain();
const DEFAULT_PAY_KEY = encodeTokenSelectKey(
  payTokenSide(swapChain.payTokens[2], swapChain.chainId)
);
const DEFAULT_RECEIVE_KEY = encodeTokenSelectKey(
  whitelistTokenSide(swapChain.whitelist[2], swapChain.chainId)
);
const XAUT_FALLBACK = whitelistTokenSide(
  swapChain.whitelist[2],
  swapChain.chainId
);

function getInitialSwapPairKeys(): {
  paySelectKey: string;
  receiveSelectKey: string;
} {
  const last = loadLastSwapPair(swapChain.chainId);
  return {
    paySelectKey: last?.paySelectKey ?? DEFAULT_PAY_KEY,
    receiveSelectKey: last?.receiveSelectKey ?? DEFAULT_RECEIVE_KEY
  };
}

function mergeAddressLookupToken(
  tokens: TokenSide[],
  lookup: TokenSide | null
): TokenSide[] {
  if (!lookup) return tokens;
  if (tokens.some((t) => addressesEqual(t.tokenAddress, lookup.tokenAddress))) {
    return tokens;
  }
  return [lookup, ...tokens];
}

function formatTokenAmount(
  value: bigint,
  decimals: number,
  maxFrac = 6
): string {
  const raw = formatUnits(value, decimals);
  const [int, frac] = raw.split(".");
  if (!frac) return int;
  const trimmed = frac.slice(0, maxFrac).replace(/0+$/, "");
  return trimmed ? `${int}.${trimmed}` : int;
}

/** Full on-chain precision — for MAX fill and parseUnits round-trip. */
function formatTokenAmountExact(value: bigint, decimals: number): string {
  const raw = formatUnits(value, decimals);
  if (!raw.includes(".")) return raw;
  const trimmed = raw.replace(/0+$/, "").replace(/\.$/, "");
  return trimmed || "0";
}

function showSwapTxToast(title: string, txHash: string, duration = 8000) {
  void getScanTxURL(txHash).then((txUrl) => {
    toast.success(title, {
      description: truncateHash(txHash, 10, 8),
      action: {
        label: "View tx",
        onClick: () => window.open(txUrl, "_blank", "noopener,noreferrer")
      },
      duration
    });
  });
}

function formatRateNumber(rate: number): string {
  if (!Number.isFinite(rate) || rate <= 0) return "—";
  return rate >= 1
    ? rate.toLocaleString(undefined, { maximumFractionDigits: 6 })
    : rate.toPrecision(4);
}

function formatExchangeRate(
  amountIn: bigint,
  payDecimals: number,
  amountOut: bigint,
  receiveDecimals: number,
  paySymbol: string,
  receiveSymbol: string,
  inverted = false
): string | null {
  if (amountIn === 0n || amountOut === 0n) return null;
  const inNum = Number(formatUnits(amountIn, payDecimals));
  const outNum = Number(formatUnits(amountOut, receiveDecimals));
  if (inNum === 0 || !Number.isFinite(inNum) || !Number.isFinite(outNum)) {
    return null;
  }
  if (inverted) {
    const rate = inNum / outNum;
    return `1 ${receiveSymbol} ≈ ${formatRateNumber(rate)} ${paySymbol}`;
  }
  const rate = outNum / inNum;
  return `1 ${paySymbol} ≈ ${formatRateNumber(rate)} ${receiveSymbol}`;
}

const SwapPage = () => {
  const { address, isConnected } = useEvmWallet();
  const { chainIdCurrent } = useWalletChain();
  const { openConnectModal, isConnecting } = useOpenAppKitModal();
  const { isSwitching, switchToChainAndWait } = useSwitchAppKitNetwork();

  const initialPairKeysRef = useRef(getInitialSwapPairKeys());
  const [paySelectKey, setPaySelectKey] = useState(
    () => initialPairKeysRef.current.paySelectKey
  );
  const [receiveSelectKey, setReceiveSelectKey] = useState(
    () => initialPairKeysRef.current.receiveSelectKey
  );
  const pairValidatedRef = useRef(false);
  const quoteRefreshSilentRef = useRef(false);
  const [savedTokens, setSavedTokens] = useState<TokenSide[]>(() =>
    loadSavedSwapTokens(swapChain.chainId)
  );
  const [amount, setAmount] = useState("");
  const [debouncedAmountIn, setDebouncedAmountIn] = useState<bigint | null>(
    null
  );
  const [slippageIndex, setSlippageIndex] = useState(1);
  const [pickerOpen, setPickerOpen] = useState<"pay" | "receive" | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [tokenBalances, setTokenBalances] = useState<Record<string, bigint>>(
    {}
  );
  const [tokenPrices, setTokenPrices] = useState<SwapTokenPriceMap>({});
  const [quote, setQuote] = useState<SwapQuoteResult | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteRefreshKey, setQuoteRefreshKey] = useState(0);
  const [rateInverted, setRateInverted] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addressLookup, setAddressLookup] = useState<{
    side: TokenSide | null;
    loading: boolean;
    error: string | null;
  }>({ side: null, loading: false, error: null });

  const chainIdNum = chainIdCurrent != null ? Number(chainIdCurrent) : null;
  const isOnSwapChain = chainIdNum != null && chainIdNum === swapChain.chainId;

  useEffect(() => {
    initBricSdk();
  }, []);

  useEffect(() => {
    setRateInverted(false);
  }, [paySelectKey, receiveSelectKey]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSettingsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen]);

  const tokenCatalog = useMemo(
    () => buildSwapTokenCatalog(swapChain, savedTokens),
    [savedTokens]
  );

  const paySide = useMemo(
    () =>
      resolveTokenSideFromSelectKey(
        paySelectKey,
        "",
        null,
        tokenCatalog,
        swapChain
      ),
    [paySelectKey, tokenCatalog]
  );

  const receiveSide = useMemo(
    () =>
      resolveTokenSideFromSelectKey(
        receiveSelectKey,
        "",
        null,
        tokenCatalog,
        swapChain
      ),
    [receiveSelectKey, tokenCatalog]
  );

  const payPickerTokens = useMemo(() => {
    const filtered = filterTokenSidesByQuery(
      tokenCatalog,
      pickerSearch,
      swapChain
    );
    const merged = mergeAddressLookupToken(filtered, addressLookup.side);
    return sortTokenSidesByBalance(merged, tokenBalances, swapChain);
  }, [tokenCatalog, pickerSearch, tokenBalances, addressLookup.side]);

  const receivePickerTokens = useMemo(() => {
    if (!paySide) return [];
    let options = buildReceiveSelectOptions(paySide, tokenCatalog);
    options = filterTokenSidesByQuery(options, pickerSearch, swapChain);
    if (addressLookup.side && !isSameTokenSide(paySide, addressLookup.side)) {
      options = mergeAddressLookupToken(options, addressLookup.side);
    }
    return sortTokenSidesByBalance(options, tokenBalances, swapChain);
  }, [paySide, tokenCatalog, pickerSearch, tokenBalances, addressLookup.side]);

  const slippage = SLIPPAGE_PRESETS[slippageIndex] ?? DEFAULT_SLIPPAGE;

  const payBalance =
    paySide != null
      ? (tokenBalances[tokenBalanceKey(paySide.tokenAddress)] ?? 0n)
      : 0n;

  const receiveBalance =
    receiveSide != null
      ? (tokenBalances[tokenBalanceKey(receiveSide.tokenAddress)] ?? 0n)
      : 0n;

  const sameToken =
    paySide && receiveSide ? isSameTokenSide(paySide, receiveSide) : false;

  const amountIn = useMemo(() => {
    if (!paySide || !amount.trim()) return null;
    try {
      const parsed = parseUnits(amount.trim(), paySide.decimals);
      return parsed > 0n ? parsed : null;
    } catch {
      return null;
    }
  }, [amount, paySide]);

  useEffect(() => {
    if (amountIn == null) {
      setDebouncedAmountIn(null);
      return;
    }
    const timer = window.setTimeout(() => {
      setDebouncedAmountIn(amountIn);
    }, QUOTE_AMOUNT_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [amountIn]);

  useEffect(() => {
    if (amountIn === debouncedAmountIn) return;
    setQuote(null);
    setQuoteError(null);
    setIsQuoting(false);
  }, [amountIn, debouncedAmountIn]);

  const loadAllBalances = useCallback(async () => {
    if (!address || !isOnSwapChain) {
      setTokenBalances({});
      return;
    }
    try {
      const balances = await fetchTokenBalancesMulticall(address, tokenCatalog);
      setTokenBalances(balances);
    } catch {
      setTokenBalances({});
    }
  }, [address, isOnSwapChain, tokenCatalog]);

  useEffect(() => {
    loadAllBalances();
  }, [loadAllBalances]);

  const loadTokenPrices = useCallback(async () => {
    try {
      const prices = await fetchSwapTokenPricesForSides(
        swapChain.chainId,
        tokenCatalog
      );
      setTokenPrices(prices);
    } catch (error) {
      console.warn(
        "[BricSwap] token price fetch failed:",
        error instanceof Error ? error.message : error
      );
      setTokenPrices({});
    }
  }, [tokenCatalog]);

  useEffect(() => {
    loadTokenPrices();
  }, [loadTokenPrices]);

  useEffect(() => {
    if (!pickerOpen) {
      setAddressLookup({ side: null, loading: false, error: null });
      return;
    }
    const trimmed = pickerSearch.trim();
    if (!isAddress(trimmed)) {
      setAddressLookup({ side: null, loading: false, error: null });
      return;
    }
    if (findTokenByAddress(tokenCatalog, trimmed)) {
      setAddressLookup({ side: null, loading: false, error: null });
      return;
    }

    let cancelled = false;
    setAddressLookup({ side: null, loading: true, error: null });
    const timer = window.setTimeout(async () => {
      try {
        const result = await resolveTokenFromAddressMulticall(
          trimmed,
          address && isOnSwapChain ? address : undefined
        );
        if (cancelled) return;
        if (!result) {
          setAddressLookup({
            side: null,
            loading: false,
            error: "Token not found at this address"
          });
          return;
        }
        const side = customTokenSide(
          trimmed,
          result.meta.symbol,
          result.meta.decimals,
          result.meta.name,
          swapChain.chainId
        );
        setAddressLookup({ side, loading: false, error: null });
        if (address && isOnSwapChain) {
          setTokenBalances((prev) => ({
            ...prev,
            [tokenBalanceKey(trimmed)]: result.balance
          }));
        }
      } catch {
        if (!cancelled) {
          setAddressLookup({
            side: null,
            loading: false,
            error: "Failed to load token from chain"
          });
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pickerOpen, pickerSearch, address, isOnSwapChain, tokenCatalog]);

  useEffect(() => {
    if (pairValidatedRef.current) return;
    pairValidatedRef.current = true;

    const { paySelectKey: savedPayKey, receiveSelectKey: savedReceiveKey } =
      initialPairKeysRef.current;
    const pay = resolveTokenSideFromSelectKey(
      savedPayKey,
      "",
      null,
      tokenCatalog,
      swapChain
    );
    if (!pay) {
      setPaySelectKey(DEFAULT_PAY_KEY);
      setReceiveSelectKey(DEFAULT_RECEIVE_KEY);
      return;
    }

    const receive = resolveTokenSideFromSelectKey(
      savedReceiveKey,
      "",
      null,
      tokenCatalog,
      swapChain
    );
    if (receive && isReceiveAllowed(pay, receive)) return;

    const coerced = coerceReceiveSide(
      pay,
      receive ?? XAUT_FALLBACK,
      XAUT_FALLBACK,
      tokenCatalog
    );
    setReceiveSelectKey(encodeTokenSelectKey(coerced));
  }, [tokenCatalog]);

  useEffect(() => {
    if (!paySide || !receiveSide || !isReceiveAllowed(paySide, receiveSide)) {
      return;
    }
    saveLastSwapPair(swapChain.chainId, paySelectKey, receiveSelectKey);
  }, [paySelectKey, receiveSelectKey, paySide, receiveSide]);

  useEffect(() => {
    if (!paySide || !receiveSide) return;
    if (isSameTokenSide(paySide, receiveSide)) return;
    const coerced = coerceReceiveSide(
      paySide,
      receiveSide,
      XAUT_FALLBACK,
      tokenCatalog
    );
    setReceiveSelectKey(encodeTokenSelectKey(coerced));
  }, [paySide, receiveSide]);

  useEffect(() => {
    if (!paySide || !receiveSide || !debouncedAmountIn || sameToken) {
      setQuote(null);
      setQuoteError(null);
      setIsQuoting(false);
      return;
    }

    let cancelled = false;
    const silentRefresh = quoteRefreshSilentRef.current;
    quoteRefreshSilentRef.current = false;
    if (!silentRefresh) {
      setIsQuoting(true);
    }
    setQuoteError(null);

    void (async () => {
      try {
        const canUseWalletQuote = isConnected && isOnSwapChain && !!address;
        const signer = canUseWalletQuote ? await getSigner() : null;
        const result = await fetchSwapQuote({
          signer,
          tokenIn: paySide.tokenAddress,
          tokenOut: receiveSide.tokenAddress,
          amountIn: debouncedAmountIn,
          slippageDecimal: slippage.decimal,
          from: canUseWalletQuote && signer ? address : undefined,
          checkBalance: canUseWalletQuote && !!signer
        });
        if (!cancelled) {
          setQuote(result);
        }
      } catch (err) {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(
            err instanceof Error ? err.message : "Failed to fetch quote"
          );
        }
      } finally {
        if (!cancelled && !silentRefresh) setIsQuoting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isConnected,
    isOnSwapChain,
    address,
    paySide,
    receiveSide,
    debouncedAmountIn,
    slippage.decimal,
    sameToken,
    quoteRefreshKey
  ]);

  useEffect(() => {
    if (
      !paySide ||
      !receiveSide ||
      !debouncedAmountIn ||
      sameToken ||
      isSwapping
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      quoteRefreshSilentRef.current = true;
      setQuoteRefreshKey((k) => k + 1);
    }, QUOTE_AUTO_REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [paySide, receiveSide, debouncedAmountIn, sameToken, isSwapping]);

  const handleFlip = () => {
    if (!paySide || !receiveSide) return;
    const newPay = receiveSide;
    const newReceive = coerceReceiveSide(
      newPay,
      paySide,
      XAUT_FALLBACK,
      tokenCatalog
    );
    setPaySelectKey(encodeTokenSelectKey(newPay));
    setReceiveSelectKey(encodeTokenSelectKey(newReceive));
    let nextSaved = savedTokens;
    if (newPay.kind === "custom")
      nextSaved = saveSwapToken(swapChain.chainId, newPay);
    if (newReceive.kind === "custom")
      nextSaved = saveSwapToken(swapChain.chainId, newReceive);
    setSavedTokens(nextSaved);
    setAmount("");
    setQuote(null);
  };

  const handleMax = () => {
    if (!paySide || payBalance === 0n) return;
    if (paySide.tokenAddress === ZeroAddress && payBalance > 0n) {
      const gasReserve = parseUnits("0.001", 18);
      const max =
        payBalance > gasReserve ? payBalance - gasReserve : payBalance;
      setAmount(formatTokenAmountExact(max, paySide.decimals));
      return;
    }
    setAmount(formatTokenAmountExact(payBalance, paySide.decimals));
  };

  const handleSwitchSwapChain = async () => {
    await switchToChainAndWait(swapChain.chainId, {
      onMismatchMessage: `Switch to ${swapChain.name}`
    });
  };

  const handleRefreshQuote = () => {
    if (amountIn == null) return;
    setDebouncedAmountIn(amountIn);
    setQuoteRefreshKey((k) => k + 1);
  };

  const handleSwap = async () => {
    if (
      !address ||
      !paySide ||
      !receiveSide ||
      !amountIn ||
      !quote ||
      !isExecutableSwapQuote(quote) ||
      !isOnSwapChain
    ) {
      return;
    }

    setIsSwapping(true);
    try {
      const signer = await getSigner();
      if (!signer) {
        toast.error("请先连接钱包");
        return;
      }

      const allowanceResult = await ensureErc20Allowance({
        signer,
        token: paySide.tokenAddress,
        owner: address,
        amount: amountIn
      });
      if (allowanceResult?.reset?.txHash) {
        showSwapTxToast(
          "Allowance reset confirmed",
          allowanceResult.reset.txHash,
          5000
        );
      }
      if (allowanceResult?.approve.txHash) {
        showSwapTxToast(
          "Approve confirmed",
          allowanceResult.approve.txHash,
          5000
        );
      }

      const result = await executeSwapExactInput({
        signer,
        tokenIn: paySide.tokenAddress,
        amountIn,
        tokenOut: receiveSide.tokenAddress,
        quote,
        receiver: address
      });

      showSwapTxToast("Swap successful", result.txHash);
      setAmount("");
      setQuote(null);
      await loadAllBalances();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      if (msg.toLowerCase().includes("user rejected") || msg.includes("4001")) {
        toast.error("Transaction cancelled");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsSwapping(false);
    }
  };

  const swapDisabled =
    !isConnected ||
    !isOnSwapChain ||
    !paySide ||
    !receiveSide ||
    !amountIn ||
    !quote ||
    !isExecutableSwapQuote(quote) ||
    sameToken ||
    isQuoting ||
    isSwapping;

  const estimatedOut =
    quote && receiveSide
      ? formatTokenAmount(BigInt(quote.amountOut), receiveSide.decimals)
      : null;

  const payUsdLabel = useMemo(() => {
    if (!paySide || amountIn == null || amountIn === 0n) return "";
    const priceUsd = getSwapTokenPrice(
      tokenPrices,
      paySide.tokenAddress
    )?.priceUsd;
    if (!priceUsd) return "";
    return formatSwapUsdValue(
      calcTokenUsdValue(amountIn, paySide.decimals, priceUsd)
    );
  }, [amountIn, paySide, tokenPrices]);

  const receiveUsdLabel = useMemo(() => {
    if (
      !receiveSide ||
      !quote?.amountOut ||
      isQuoting ||
      (amountIn != null && amountIn !== debouncedAmountIn)
    ) {
      return "";
    }
    try {
      const out = BigInt(quote.amountOut);
      if (out === 0n) return "";
      const priceUsd = getSwapTokenPrice(
        tokenPrices,
        receiveSide.tokenAddress
      )?.priceUsd;
      if (!priceUsd) return "";
      return formatSwapUsdValue(
        calcTokenUsdValue(out, receiveSide.decimals, priceUsd)
      );
    } catch {
      return "";
    }
  }, [receiveSide, quote, tokenPrices, isQuoting, amountIn, debouncedAmountIn]);

  const minReceived =
    quote && receiveSide && quote.minReceived > 0n
      ? formatTokenAmount(quote.minReceived, receiveSide.decimals)
      : null;

  const exchangeRate =
    quote && paySide && receiveSide && debouncedAmountIn
      ? formatExchangeRate(
          debouncedAmountIn,
          paySide.decimals,
          BigInt(quote.amountOut),
          receiveSide.decimals,
          paySide.symbol,
          receiveSide.symbol,
          rateInverted
        )
      : null;

  const swapFeeDisplay =
    quote?.swapFee != null && quote.swapFee > 0n && paySide
      ? `${formatTokenAmount(quote.swapFee, paySide.decimals)} ${paySide.symbol}`
      : null;

  const maxPayDisplay =
    quote?.maxSpendAmount != null && paySide && !isExecutableSwapQuote(quote)
      ? formatTokenAmount(BigInt(quote.maxSpendAmount), paySide.decimals)
      : null;

  const quoteDetailValue = (value: string | null | undefined) => {
    if (isQuoting) return "…";
    return value ?? "—";
  };

  const canRefreshQuote =
    !!amountIn && !!paySide && !!receiveSide && !sameToken;

  const primaryButtonLabel = (() => {
    if (!isConnected) return "Connect Wallet";
    if (isSwapping) return "Swapping…";
    if (isQuoting) return "Fetching quote…";
    if (amountIn != null && amountIn !== debouncedAmountIn) {
      return "Enter amount";
    }
    if (quote && !isExecutableSwapQuote(quote)) {
      return quote.error ?? "Insufficient balance";
    }
    if (sameToken) return "Tokens must differ";
    if (!amountIn) return "Enter amount";
    if (quoteError) return "Quote unavailable";
    return "Swap";
  })();

  const showTokenBalances = isConnected && isOnSwapChain;

  const rememberCustomToken = (side: TokenSide) => {
    if (side.kind === "custom") {
      setSavedTokens(saveSwapToken(swapChain.chainId, side));
    }
  };

  const applyPayToken = (side: TokenSide) => {
    rememberCustomToken(side);
    setPaySelectKey(encodeTokenSelectKey(side));
  };

  const applyReceiveToken = (side: TokenSide) => {
    if (paySide && isSameTokenSide(paySide, side)) {
      toast.error("Pay and receive must be different tokens");
      return;
    }
    rememberCustomToken(side);
    setReceiveSelectKey(encodeTokenSelectKey(side));
  };

  const paySymbolLabel = paySide?.symbol ?? "Token";
  const receiveSymbolLabel = receiveSide?.symbol ?? "Token";

  return (
    <div className="swap-page">
      <div className="swap-hero">
        <h2>BricSwap</h2>
        <p className="swap-hero-sub">{swapChain.name}</p>
      </div>

      <div className="swap-card">
        {!isOnSwapChain && isConnected && (
          <div className="swap-chain-banner">
            <p className="swap-chain-banner-text">Switch to {swapChain.name}</p>
            <button
              type="button"
              className="swap-chain-banner-btn"
              onClick={handleSwitchSwapChain}
              disabled={isSwitching}
            >
              {isSwitching ? "Switching…" : "Switch network"}
            </button>
          </div>
        )}

        <div className="swap-card-header">
          <div className="swap-settings-anchor">
            <button
              type="button"
              className={`swap-slippage-trigger${settingsOpen ? " is-active" : ""}`}
              onClick={() => setSettingsOpen((open) => !open)}
              aria-expanded={settingsOpen}
              aria-controls="swap-settings-panel"
              aria-label={`Slippage ${slippage.label}, open settings`}
            >
              <span className="swap-slippage-trigger-icon" aria-hidden>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 3.5h1.6M10.4 3.5H12M4.2 3.5a1.1 1.1 0 1 0 2.2 0 1.1 1.1 0 0 0-2.2 0ZM8 10.5H12M2 10.5h1.6M7.8 10.5a1.1 1.1 0 1 0 2.2 0 1.1 1.1 0 0 0-2.2 0Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span>{slippage.label}</span>
            </button>

            {settingsOpen && (
              <>
                <button
                  type="button"
                  className="swap-settings-backdrop"
                  aria-label="Close settings"
                  onClick={() => setSettingsOpen(false)}
                />
                <div
                  id="swap-settings-panel"
                  className="swap-settings-panel"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="swap-settings-title"
                >
                  <div className="swap-settings-panel-head">
                    <button
                      type="button"
                      className="swap-settings-back"
                      onClick={() => setSettingsOpen(false)}
                      aria-label="Close settings"
                    >
                      ←
                    </button>
                    <h4 id="swap-settings-title">Settings</h4>
                    <span className="swap-settings-head-spacer" aria-hidden />
                  </div>

                  <div className="swap-settings-panel-body">
                    <section className="swap-settings-section">
                      <h5 className="swap-settings-section-title">
                        Advanced Settings
                      </h5>

                      <div className="swap-settings-row">
                        <span className="swap-settings-label">
                          Max Slippage
                        </span>
                        <span className="swap-settings-current">
                          {slippage.label}
                        </span>
                      </div>

                      <div className="swap-slippage-pills">
                        {SLIPPAGE_PRESETS.map((preset, idx) => (
                          <button
                            key={preset.label}
                            type="button"
                            className={`swap-slippage-pill${slippageIndex === idx ? " is-active" : ""}`}
                            onClick={() => setSlippageIndex(idx)}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      <p className="swap-settings-hint">
                        Your transaction will revert if the price changes more
                        than the slippage tolerance.
                      </p>
                    </section>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="swap-fields">
          <div className="swap-field">
            <div className="swap-field-top">
              <span className="swap-field-label">You pay</span>
              <span className="swap-field-balance">
                {paySide && address && isOnSwapChain
                  ? `${formatTokenAmount(payBalance, paySide.decimals)} ${paySide.symbol}`
                  : "—"}
              </span>
            </div>
            <div className="swap-field-main">
              <div className="swap-field-amount-col">
                <input
                  id="swap-amount"
                  className="swap-amount-input"
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                />
                {payUsdLabel ? (
                  <span className="swap-usd-value">{payUsdLabel}</span>
                ) : null}
              </div>
              <button
                type="button"
                className="swap-token-chip"
                onClick={() => {
                  setPickerSearch("");
                  setPickerOpen("pay");
                }}
              >
                <span className="swap-token-chip-avatar" aria-hidden>
                  {paySymbolLabel.slice(0, 2).toUpperCase()}
                </span>
                <span className="swap-token-chip-label">{paySymbolLabel}</span>
                <span className="swap-token-chip-chevron" aria-hidden />
              </button>
            </div>

            <div className="swap-field-foot">
              <button
                type="button"
                className="swap-max-btn"
                onClick={handleMax}
                disabled={!paySide || payBalance === 0n || !isOnSwapChain}
              >
                MAX
              </button>
            </div>
          </div>

          <div className="swap-divider">
            <button
              type="button"
              className="swap-flip-btn"
              onClick={handleFlip}
              title="Flip direction"
              aria-label="Flip pay and receive tokens"
            >
              ↕
            </button>
          </div>

          <div className="swap-field">
            <div className="swap-field-top">
              <span className="swap-field-label">You receive</span>
              <span className="swap-field-balance">
                {receiveSide && address && isOnSwapChain
                  ? `${formatTokenAmount(receiveBalance, receiveSide.decimals)} ${receiveSide.symbol}`
                  : receiveSide
                    ? receiveSide.symbol
                    : "—"}
              </span>
            </div>
            <div className="swap-field-main">
              <div className="swap-field-amount-col">
                <div
                  className={`swap-receive-amount${isQuoting ? " is-loading" : ""}`}
                  aria-live="polite"
                >
                  {isQuoting
                    ? "Fetching quote…"
                    : amountIn != null && amountIn !== debouncedAmountIn
                      ? "—"
                      : (estimatedOut ?? (amountIn ? "—" : "0"))}
                </div>
                {receiveUsdLabel ? (
                  <span className="swap-usd-value">{receiveUsdLabel}</span>
                ) : null}
              </div>
              <button
                type="button"
                className={`swap-token-chip${!paySide ? " is-disabled" : ""}`}
                disabled={!paySide}
                onClick={() => {
                  if (!paySide) return;
                  setPickerSearch("");
                  setPickerOpen("receive");
                }}
              >
                <span className="swap-token-chip-avatar" aria-hidden>
                  {receiveSymbolLabel.slice(0, 2).toUpperCase()}
                </span>
                <span className="swap-token-chip-label">
                  {receiveSymbolLabel}
                </span>
                <span className="swap-token-chip-chevron" aria-hidden />
              </button>
            </div>
          </div>
        </div>

        <div className="swap-details">
          <button
            type="button"
            className="swap-quote-row swap-rate-toggle highlight"
            onClick={() => setRateInverted((v) => !v)}
            disabled={!exchangeRate || isQuoting}
            title="Toggle rate direction"
            aria-label="Toggle exchange rate direction"
          >
            <span>Rate</span>
            <span className="swap-rate-value">
              {quoteDetailValue(exchangeRate)}
            </span>
          </button>
          <div className="swap-quote-row">
            <span>Min received ({slippage.label})</span>
            <span>
              {quoteDetailValue(
                minReceived && receiveSide
                  ? `${minReceived} ${receiveSide.symbol}`
                  : null
              )}
            </span>
          </div>
          {maxPayDisplay && (
            <div className="swap-quote-row">
              <span>Max pay</span>
              <span>
                {quoteDetailValue(
                  paySide ? `${maxPayDisplay} ${paySide.symbol}` : null
                )}
              </span>
            </div>
          )}
          <div className="swap-quote-row">
            <span>Price impact</span>
            <span>{quoteDetailValue(quote?.priceImpact ?? null)}</span>
          </div>
          {swapFeeDisplay && (
            <div className="swap-quote-row">
              <span>Swap fee</span>
              <span>{quoteDetailValue(swapFeeDisplay)}</span>
            </div>
          )}
          <div className="swap-quote-row">
            <span>Route</span>
            <span>{quoteDetailValue(quote?.name ?? null)}</span>
          </div>
          <div className="swap-quote-row">
            <span>Quote</span>
            <button
              type="button"
              className="swap-refresh-btn"
              onClick={handleRefreshQuote}
              disabled={!canRefreshQuote || isQuoting || isSwapping}
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {quote?.error &&
          !isQuoting &&
          quote &&
          !isExecutableSwapQuote(quote) && (
            <p className="swap-inline-error">{quote.error}</p>
          )}
        {quoteError && !isQuoting && amountIn != null && (
          <p className="swap-inline-error">{quoteError}</p>
        )}
        {sameToken && (
          <p className="swap-inline-error">Pay and receive token must differ</p>
        )}

        <div className="swap-actions">
          {!isConnected ? (
            <button
              type="button"
              className="cta-button mint-nft-button swap-primary-btn"
              onClick={openConnectModal}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting…" : primaryButtonLabel}
            </button>
          ) : (
            <button
              type="button"
              className="cta-button mint-nft-button swap-primary-btn"
              onClick={handleSwap}
              disabled={swapDisabled}
            >
              {primaryButtonLabel}
            </button>
          )}
        </div>

        <p className="swap-hint">
          Quote updates 1s after typing · auto refresh every 15s
        </p>
      </div>

      <SwapTokenPickerModal
        open={pickerOpen === "pay"}
        title="Select pay token"
        networkBadge={swapChain.networkBadge}
        tokens={payPickerTokens}
        balances={tokenBalances}
        prices={tokenPrices}
        selectedTokenAddress={paySide?.tokenAddress ?? null}
        showBalances={showTokenBalances}
        search={pickerSearch}
        addressLookupLoading={addressLookup.loading}
        addressLookupError={addressLookup.error}
        onSearchChange={setPickerSearch}
        onSelectSide={applyPayToken}
        onClose={() => setPickerOpen(null)}
      />

      <SwapTokenPickerModal
        open={pickerOpen === "receive"}
        title="Select receive token"
        networkBadge={swapChain.networkBadge}
        tokens={receivePickerTokens}
        balances={tokenBalances}
        prices={tokenPrices}
        selectedTokenAddress={receiveSide?.tokenAddress ?? null}
        showBalances={showTokenBalances}
        search={pickerSearch}
        addressLookupLoading={addressLookup.loading}
        addressLookupError={
          addressLookup.side &&
          paySide &&
          isSameTokenSide(paySide, addressLookup.side)
            ? "Cannot receive the same token as pay"
            : addressLookup.error
        }
        onSearchChange={setPickerSearch}
        onSelectSide={applyReceiveToken}
        onClose={() => setPickerOpen(null)}
      />
    </div>
  );
};

export default SwapPage;
