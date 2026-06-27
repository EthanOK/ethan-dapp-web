import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatUnits, parseUnits } from "ethers";
import { toast } from "sonner";
import {
  useEvmWallet,
  useOpenAppKitModal,
  useSwitchAppKitNetwork,
  useWalletChain
} from "@/hooks";
import { initBricSdk } from "@/config/BricConfig";
import {
  getDefaultSwapChain,
  getEnabledSwapChains,
  getSwapChainConfig,
  isBricSwapAddressConfigured
} from "@/config/SwapChainConfig";
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
import { readSwapTokenBalanceCache } from "@/lib/swap/swapTokenBalanceCache";
import {
  buildSwapTokenCatalog,
  findTokenByAddress,
  loadSavedSwapTokens,
  saveSwapToken
} from "@/lib/swap/savedSwapTokens";
import {
  loadLastSwapPair,
  saveLastSwapPair,
  loadLastSwapPayAmount,
  saveLastSwapPayAmount
} from "@/lib/swap/swapLastPair";
import { loadFavoriteTokenAddresses } from "@/lib/swap/swapFavoriteTokens";
import {
  calcTokenUsdValue,
  fetchSwapTokenPricesForSides,
  formatSwapUsdValue,
  getSwapTokenPrice,
  readSwapTokenPriceCache,
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
  resolveTokenSideFromSelectKey,
  sortTokenSidesByBalance,
  tokenBalanceKey,
  whitelistTokenSide,
  type TokenSide
} from "@/lib/swap/swapTokenRules";
import { isAddress } from "@/lib/shared/Utils";
import { getProvider, getSigner } from "@/lib/wallet/GetProvider";
import { SwapTokenPickerModal } from "@/components/swap/SwapTokenPickerModal";
import { showSwapTxToast } from "@/components/swap/SwapTxToast";
import "./SwapPage.css";

const BRIC_SWAP_TAGLINE =
  "Swap ETH, stablecoins and RWA tokens via Bric DEX aggregation.";

/** Wait for user to finish typing before calling previewSwapExactInput. */
const QUOTE_AMOUNT_DEBOUNCE_MS = 1000;
/** Default "You pay" input when opening swap or resetting after chain change. */
const DEFAULT_PAY_AMOUNT = "1";
/** Auto-refresh quote interval while inputs are valid. */
const QUOTE_AUTO_REFRESH_MS = 15_000;
/** Auto-refresh token prices on the swap page. */
const TOKEN_PRICE_AUTO_REFRESH_MS = 30_000;

function buildDefaultsForChain(chainId: number) {
  const swapChain = getSwapChainConfig(chainId) ?? getDefaultSwapChain();
  const pick = (sym: string) =>
    swapChain.tokens.find((t) => t.symbol.toLowerCase() === sym.toLowerCase());
  const payToken =
    pick("USDC") ??
    pick("USDT") ??
    pick(swapChain.nativeSymbol) ??
    swapChain.tokens[0];
  const receiveToken =
    pick("SPCXon") ??
    pick("XAUT") ??
    swapChain.tokens.find((t) => t.symbol !== payToken.symbol) ??
    swapChain.tokens[0];

  const fallbackPay = whitelistTokenSide(payToken, chainId);
  const fallbackReceive = whitelistTokenSide(receiveToken, chainId);
  return {
    defaultPayKey: encodeTokenSelectKey(fallbackPay),
    defaultReceiveKey: encodeTokenSelectKey(fallbackReceive),
    xautFallback: fallbackReceive
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
  if (value > 0n && decimals >= 6) {
    const minUnits = 10n ** BigInt(decimals - 6);
    if (value < minUnits) return "<0.000001";
  }
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

/** Strip non-numeric characters; keep at most one decimal point. */
function sanitizePayAmountInput(value: string, maxDecimals?: number): string {
  const cleaned = value.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) return cleaned;

  const intPart = cleaned.slice(0, dotIndex);
  let fracPart = cleaned.slice(dotIndex + 1).replace(/\./g, "");
  if (maxDecimals != null && maxDecimals >= 0) {
    fracPart = fracPart.slice(0, maxDecimals);
  }

  const endsWithDot = value.endsWith(".");
  if (fracPart.length === 0) {
    return endsWithDot ? `${intPart}.` : intPart;
  }
  return `${intPart}.${fracPart}`;
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
  const chainIdNum = chainIdCurrent != null ? Number(chainIdCurrent) : null;
  const swapChain = useMemo(() => {
    if (chainIdNum != null) {
      const match = getSwapChainConfig(chainIdNum);
      if (match) return match;
    }
    return getDefaultSwapChain();
  }, [chainIdNum]);
  const enabledSwapChains = useMemo(() => getEnabledSwapChains(), []);
  const { defaultPayKey, defaultReceiveKey, xautFallback } = useMemo(
    () => buildDefaultsForChain(swapChain.chainId),
    [swapChain.chainId]
  );
  const initialPairKeys = useMemo(() => {
    const last = loadLastSwapPair(swapChain.chainId);
    return {
      paySelectKey: last?.paySelectKey ?? defaultPayKey,
      receiveSelectKey: last?.receiveSelectKey ?? defaultReceiveKey
    };
  }, [swapChain.chainId, defaultPayKey, defaultReceiveKey]);

  const [paySelectKey, setPaySelectKey] = useState(
    () => initialPairKeys.paySelectKey
  );
  const [receiveSelectKey, setReceiveSelectKey] = useState(
    () => initialPairKeys.receiveSelectKey
  );
  const pairValidatedRef = useRef(false);
  const quoteRefreshSilentRef = useRef(false);
  const [savedTokensRevision, setSavedTokensRevision] = useState(0);
  const savedTokens = useMemo(
    () => loadSavedSwapTokens(swapChain.chainId),
    [swapChain.chainId, savedTokensRevision]
  );
  const [amount, setAmount] = useState(DEFAULT_PAY_AMOUNT);
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
  const [favoriteRevision, setFavoriteRevision] = useState(0);

  const isOnSwapChain = chainIdNum != null && chainIdNum === swapChain.chainId;
  const isSwapAvailable = isBricSwapAddressConfigured(swapChain);

  // When the active swap chain changes (e.g. user switches wallet network),
  // reload saved tokens and restore the last pair for that chain.
  useEffect(() => {
    pairValidatedRef.current = false;
    quoteRefreshSilentRef.current = false;
    const last = loadLastSwapPair(swapChain.chainId);
    setPaySelectKey(last?.paySelectKey ?? defaultPayKey);
    setReceiveSelectKey(last?.receiveSelectKey ?? defaultReceiveKey);
    setPickerSearch("");
    setAddressLookup({ side: null, loading: false, error: null });
    setAmount(loadLastSwapPayAmount(swapChain.chainId) ?? DEFAULT_PAY_AMOUNT);
    setDebouncedAmountIn(null);
    setTokenBalances(
      address ? readSwapTokenBalanceCache(swapChain.chainId, address) : {}
    );
    setTokenPrices(readSwapTokenPriceCache(swapChain.chainId));
    setQuote(null);
    setQuoteError(null);
    setIsQuoting(false);
    setRateInverted(false);
  }, [swapChain.chainId, defaultPayKey, defaultReceiveKey, address]);

  useEffect(() => {
    if (!amount.trim()) return;
    const timer = window.setTimeout(() => {
      saveLastSwapPayAmount(swapChain.chainId, amount);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [amount, swapChain.chainId]);

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
    [swapChain, savedTokens]
  );

  const tokenCatalogPriceKey = useMemo(
    () =>
      [
        swapChain.chainId,
        ...tokenCatalog
          .map((t) => t.tokenAddress.toLowerCase())
          .sort((a, b) => a.localeCompare(b))
      ].join("|"),
    [swapChain.chainId, tokenCatalog]
  );
  const tokenCatalogRef = useRef(tokenCatalog);
  tokenCatalogRef.current = tokenCatalog;

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

  const favoriteAddressKeys = useMemo(
    () => new Set(loadFavoriteTokenAddresses(swapChain.chainId)),
    [swapChain.chainId, favoriteRevision]
  );

  const payPickerTokens = useMemo(() => {
    const filtered = filterTokenSidesByQuery(
      tokenCatalog,
      pickerSearch,
      swapChain
    );
    const merged = mergeAddressLookupToken(filtered, addressLookup.side);
    return sortTokenSidesByBalance(
      merged,
      tokenBalances,
      swapChain,
      favoriteAddressKeys
    );
  }, [
    tokenCatalog,
    pickerSearch,
    tokenBalances,
    addressLookup.side,
    swapChain,
    favoriteAddressKeys
  ]);

  const receivePickerTokens = useMemo(() => {
    if (!paySide) return [];
    let options = buildReceiveSelectOptions(paySide, tokenCatalog);
    options = filterTokenSidesByQuery(options, pickerSearch, swapChain);
    if (addressLookup.side && !isSameTokenSide(paySide, addressLookup.side)) {
      options = mergeAddressLookupToken(options, addressLookup.side);
    }
    return sortTokenSidesByBalance(
      options,
      tokenBalances,
      swapChain,
      favoriteAddressKeys
    );
  }, [
    paySide,
    tokenCatalog,
    pickerSearch,
    tokenBalances,
    addressLookup.side,
    swapChain,
    favoriteAddressKeys
  ]);

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
    if (!address || !isOnSwapChain) return;
    const cached = readSwapTokenBalanceCache(swapChain.chainId, address);
    if (Object.keys(cached).length > 0) {
      setTokenBalances(cached);
    }
    try {
      const balances = await fetchTokenBalancesMulticall(
        address,
        tokenCatalogRef.current,
        swapChain.chainId
      );
      setTokenBalances(balances);
    } catch {
      // Keep the last known balances when a refresh fails.
    }
  }, [address, isOnSwapChain, swapChain.chainId, tokenCatalogPriceKey]);

  useEffect(() => {
    loadAllBalances();
  }, [loadAllBalances]);

  const loadTokenPrices = useCallback(async () => {
    const cached = readSwapTokenPriceCache(swapChain.chainId);
    if (Object.keys(cached).length > 0) {
      setTokenPrices(cached);
    }
    try {
      const prices = await fetchSwapTokenPricesForSides(
        swapChain.chainId,
        tokenCatalogRef.current
      );
      setTokenPrices(prices);
    } catch (error) {
      console.warn(
        "[BricSwap] token price fetch failed:",
        error instanceof Error ? error.message : error
      );
      setTokenPrices(readSwapTokenPriceCache(swapChain.chainId));
    }
  }, [swapChain.chainId, tokenCatalogPriceKey]);

  useEffect(() => {
    loadTokenPrices();
    const timer = window.setInterval(
      loadTokenPrices,
      TOKEN_PRICE_AUTO_REFRESH_MS
    );
    return () => window.clearInterval(timer);
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
          address && isOnSwapChain ? address : undefined,
          swapChain.chainId
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
      initialPairKeys;
    const pay = resolveTokenSideFromSelectKey(
      savedPayKey,
      "",
      null,
      tokenCatalog,
      swapChain
    );
    if (!pay) {
      setPaySelectKey(defaultPayKey);
      setReceiveSelectKey(defaultReceiveKey);
      return;
    }

    const receive = resolveTokenSideFromSelectKey(
      savedReceiveKey,
      "",
      null,
      tokenCatalog,
      swapChain
    );
    if (receive && isReceiveAllowed(pay, receive)) {
      setPaySelectKey(savedPayKey);
      setReceiveSelectKey(savedReceiveKey);
      return;
    }

    setPaySelectKey(savedPayKey);
    const coerced = coerceReceiveSide(
      pay,
      receive ?? xautFallback,
      xautFallback,
      tokenCatalog
    );
    setReceiveSelectKey(encodeTokenSelectKey(coerced));
  }, [
    tokenCatalog,
    swapChain,
    initialPairKeys,
    defaultPayKey,
    defaultReceiveKey,
    xautFallback
  ]);

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
      xautFallback,
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
          chain: swapChain,
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
      xautFallback,
      tokenCatalog
    );

    let nextAmount = amount;
    let nextDebouncedAmountIn: bigint | null = null;
    const hasSyncedQuote =
      quote?.amountOut != null &&
      amountIn != null &&
      amountIn === debouncedAmountIn &&
      !isQuoting;
    if (hasSyncedQuote) {
      try {
        const flippedIn = BigInt(quote.amountOut);
        if (flippedIn > 0n) {
          nextAmount = formatTokenAmountExact(flippedIn, receiveSide.decimals);
          nextDebouncedAmountIn = flippedIn;
        }
      } catch {
        // Keep the current pay amount when quote output is invalid.
      }
    }

    if (nextDebouncedAmountIn == null && nextAmount.trim()) {
      try {
        const parsed = parseUnits(nextAmount.trim(), newPay.decimals);
        nextDebouncedAmountIn = parsed > 0n ? parsed : null;
      } catch {
        nextDebouncedAmountIn = null;
      }
    }

    setPaySelectKey(encodeTokenSelectKey(newPay));
    setReceiveSelectKey(encodeTokenSelectKey(newReceive));
    if (newPay.kind === "custom") saveSwapToken(swapChain.chainId, newPay);
    if (newReceive.kind === "custom")
      saveSwapToken(swapChain.chainId, newReceive);
    if (newPay.kind === "custom" || newReceive.kind === "custom") {
      setSavedTokensRevision((revision) => revision + 1);
    }
    setAmount(nextAmount);
    setDebouncedAmountIn(nextDebouncedAmountIn);
    saveLastSwapPayAmount(swapChain.chainId, nextAmount);
    setQuote(null);
    setQuoteError(null);
    setIsQuoting(false);
  };

  const handleMax = () => {
    if (!paySide || payBalance === 0n) return;
    setAmount(formatTokenAmountExact(payBalance, paySide.decimals));
  };

  const handleSwitchSwapChain = async () => {
    await switchToChainAndWait(swapChain.chainId, {
      onMismatchMessage: `Switch to ${swapChain.name}`
    });
  };

  const handleSelectSwapChain = async (chainId: number) => {
    if (chainId === swapChain.chainId) return;
    const target = getSwapChainConfig(chainId);
    await switchToChainAndWait(chainId, {
      onMismatchMessage: `Failed to switch to ${target?.networkBadge ?? "network"}`
    });
  };

  const handleRefreshQuote = () => {
    if (amountIn == null) return;
    setDebouncedAmountIn(amountIn);
    setQuoteRefreshKey((k) => k + 1);
  };

  const handleSwap = async () => {
    if (!isBricSwapAddressConfigured(swapChain)) {
      toast.error(
        `BricSwap is not configured on ${swapChain.networkBadge} yet`
      );
      return;
    }

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
        chain: swapChain,
        signer,
        token: paySide.tokenAddress,
        owner: address,
        amount: amountIn
      });
      if (allowanceResult?.reset?.txHash) {
        showSwapTxToast(
          "Allowance reset confirmed",
          allowanceResult.reset.txHash,
          { detail: `Reset ${paySide.symbol} allowance`, duration: 5000 }
        );
      }
      if (allowanceResult?.approve.txHash) {
        showSwapTxToast("Approve confirmed", allowanceResult.approve.txHash, {
          detail: `Approved ${paySide.symbol}`,
          duration: 5000
        });
      }

      // Quote swapData goes stale while waiting for approve confirmation.
      const freshQuote = await fetchSwapQuote({
        chain: swapChain,
        signer,
        tokenIn: paySide.tokenAddress,
        tokenOut: receiveSide.tokenAddress,
        amountIn,
        slippageDecimal: slippage.decimal,
        from: address,
        checkBalance: true
      });
      if (!isExecutableSwapQuote(freshQuote)) {
        throw new Error(
          freshQuote.error ?? "Quote expired after approval, please try again"
        );
      }

      const result = await executeSwapExactInput({
        chain: swapChain,
        signer,
        tokenIn: paySide.tokenAddress,
        amountIn,
        tokenOut: receiveSide.tokenAddress,
        quote: freshQuote,
        receiver: address
      });

      const swapToast =
        freshQuote.amountOut != null
          ? {
              from: {
                amount: amountIn,
                symbol: paySide.symbol,
                decimals: paySide.decimals
              },
              to: {
                amount: BigInt(freshQuote.amountOut),
                symbol: receiveSide.symbol,
                decimals: receiveSide.decimals
              }
            }
          : {
              from: {
                amount: amountIn,
                symbol: paySide.symbol,
                decimals: paySide.decimals
              },
              to: { amount: "—", symbol: receiveSide.symbol }
            };

      showSwapTxToast("Swap successful", result.txHash, { swap: swapToast });
      setAmount(DEFAULT_PAY_AMOUNT);
      saveLastSwapPayAmount(swapChain.chainId, DEFAULT_PAY_AMOUNT);
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
    if (isConnected && isOnSwapChain && !isSwapAvailable) {
      return "Swap unavailable";
    }
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

  const showTokenBalances = isConnected && Boolean(address) && isOnSwapChain;

  const rememberCustomToken = (side: TokenSide) => {
    if (side.kind === "custom") {
      saveSwapToken(swapChain.chainId, side);
      setSavedTokensRevision((revision) => revision + 1);
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
        <p className="swap-hero-sub">{BRIC_SWAP_TAGLINE}</p>
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

        {isOnSwapChain && !isSwapAvailable && (
          <div className="swap-chain-banner swap-chain-banner--unavailable">
            <p className="swap-chain-banner-text">
              BricSwap contract is not configured on {swapChain.networkBadge}{" "}
              yet. Swaps are unavailable.
            </p>
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
                {paySide
                  ? showTokenBalances
                    ? `${formatTokenAmount(payBalance, paySide.decimals)} ${paySide.symbol}`
                    : `-- ${paySide.symbol}`
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
                  onChange={(e) =>
                    setAmount(
                      sanitizePayAmountInput(e.target.value, paySide?.decimals)
                    )
                  }
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
                {receiveSide
                  ? showTokenBalances
                    ? `${formatTokenAmount(receiveBalance, receiveSide.decimals)} ${receiveSide.symbol}`
                    : `-- ${receiveSide.symbol}`
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
        chainId={swapChain.chainId}
        catalog={tokenCatalog}
        favoriteAddressKeys={favoriteAddressKeys}
        availableChains={enabledSwapChains}
        activeChainId={swapChain.chainId}
        isSwitchingChain={isSwitching}
        chainAvatarBadge={swapChain.chainAvatarBadge}
        chainAvatarColor={swapChain.chainAvatarColor}
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
        onSelectChain={handleSelectSwapChain}
        onFavoritesChange={() => setFavoriteRevision((value) => value + 1)}
        onClose={() => setPickerOpen(null)}
      />

      <SwapTokenPickerModal
        open={pickerOpen === "receive"}
        title="Select receive token"
        chainId={swapChain.chainId}
        catalog={tokenCatalog}
        favoriteAddressKeys={favoriteAddressKeys}
        availableChains={enabledSwapChains}
        activeChainId={swapChain.chainId}
        isSwitchingChain={isSwitching}
        chainAvatarBadge={swapChain.chainAvatarBadge}
        chainAvatarColor={swapChain.chainAvatarColor}
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
        onSelectChain={handleSelectSwapChain}
        onFavoritesChange={() => setFavoriteRevision((value) => value + 1)}
        onClose={() => setPickerOpen(null)}
      />
    </div>
  );
};

export default SwapPage;
