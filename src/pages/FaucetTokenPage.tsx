/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import { Interface } from "ethers";
import {
  multicall3Aggregate3StaticCall,
  decodeMulticallResult,
  type Multicall3Call
} from "@/lib/evm/Multicall3";
import erc20ABI from "@/abis/evm/erc20ABI.json";
import { getFaucetContract, getERC20Decimals } from "@/lib/evm/GetContract";
import { getDecimal, getDecimalBigNumber } from "@/lib/shared/Utils";
import { getReadonlyProviderForChain } from "@/lib/wallet/GetProvider";
import {
  faucetChainIdList,
  faucetConfig,
  getFaucetTokenAddress,
  getFaucetTokenListByChain,
  getChainName
} from "@/config/FaucetConfig";
import YGMEABI from "@/abis/evm/YGMEABI.json";
import { toast } from "sonner";
import {
  useEvmWallet,
  useOpenAppKitModal,
  useSwitchAppKitNetwork,
  useWalletChain
} from "@/hooks";
import { useI18n } from "@/i18n";

const faucetFromAddress = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";

/** Recommender used when minting the YGME ERC-721 via the faucet forwarder. */
const YGME_ZERO_RECOMMENDER = "0x0000000000000000000000000000000000000000";

const isErc721Token = (
  tokenName: string,
  chainIdParam: number | null
): boolean => {
  if (chainIdParam == null) return false;
  const token = getFaucetTokenListByChain(chainIdParam).find(
    (t) => t.label === tokenName
  );
  return token?.type === "erc721";
};

/** Format supply: thousands separators, integers stay integer, decimals up to 2. */
const formatSupply = (value: number): string => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const FaucetTokenPage = () => {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(() => {
    try {
      return localStorage.getItem("userAddress");
    } catch {
      return null;
    }
  });
  const [chainId, setChainId] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);
  const [selectedToken, setSelectedToken] = useState("");
  const [tokenPickerOpen, setTokenPickerOpen] = useState(false);
  const [chainPickerOpen, setChainPickerOpen] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<Record<string, number>>(
    {}
  );
  const [tokenSupplies, setTokenSupplies] = useState<Record<string, number>>(
    {}
  );
  const [totalAmount, setTotalAmount] = useState(0);
  const [isTransactionProcessing, setIsTransactionProcessing] = useState(false);
  const { address, isConnected } = useEvmWallet();
  const { chainIdCurrent } = useWalletChain();
  const { isConnecting, openConnectModal } = useOpenAppKitModal();
  const {
    isSwitching: isSwitchingChain,
    switchNetwork,
    switchToChainAndWait
  } = useSwitchAppKitNetwork();

  const shouldShowConnect = (() => {
    if (!isMounted) return false;
    if (isConnected && address) return false;
    try {
      const stored = localStorage.getItem("@appkit/connection_status");
      return stored !== "connected";
    } catch {
      return true;
    }
  })();

  const availableTokens = selectedChainId
    ? getFaucetTokenListByChain(selectedChainId)
    : [];
  const currentToken = availableTokens.find((t) => t.label === selectedToken);

  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
      const cid = chainIdCurrent != null ? Number(chainIdCurrent) : null;
      setChainId(cid);
      localStorage.setItem("userAddress", address);
      if (!selectedChainId && cid != null && faucetChainIdList.includes(cid)) {
        setSelectedChainId(cid);
      } else if (!selectedChainId) {
        setSelectedChainId(faucetChainIdList[0]);
      }
    } else if (!isConnected) {
      setCurrentAccount(null);
    }
  }, [isConnected, address, chainIdCurrent]);

  useEffect(() => {
    if (selectedChainId) {
      const tokens = getFaucetTokenListByChain(selectedChainId);
      if (tokens.length > 0) {
        const savedTokenKey = `faucetTokenName_${selectedChainId}`;
        const savedTokenName = localStorage.getItem(savedTokenKey);
        let tokenToSelect = savedTokenName;
        const tokenExists = tokens.find((t) => t.label === savedTokenName);
        if (!tokenExists || !savedTokenName) {
          tokenToSelect = tokens[0].label;
          localStorage.setItem(savedTokenKey, tokenToSelect);
        }
        setSelectedToken(tokenToSelect ?? "");
        localStorage.setItem("faucetChainId", selectedChainId.toString());
      } else {
        setSelectedToken("");
        setTokenBalances({});
        setTotalAmount(0);
      }
    }
  }, [selectedChainId]);

  useEffect(() => {
    setIsMounted(true);
    const savedChainId = localStorage.getItem("faucetChainId");
    if (
      savedChainId &&
      faucetChainIdList.includes(parseInt(savedChainId, 10))
    ) {
      const cid = parseInt(savedChainId, 10);
      setSelectedChainId(cid);
      const savedTokenKey = `faucetTokenName_${cid}`;
      const savedTokenName = localStorage.getItem(savedTokenKey);
      if (savedTokenName) {
        const tokens = getFaucetTokenListByChain(cid);
        if (tokens.find((t) => t.label === savedTokenName)) {
          setSelectedToken(savedTokenName);
        }
      }
    } else if (faucetChainIdList.length > 0) {
      setSelectedChainId(faucetChainIdList[0]);
    }
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!selectedChainId) return;
    batchUpdateTokenData(selectedChainId);
    const intervalId = setInterval(() => {
      batchUpdateTokenData(selectedChainId);
    }, 30000);
    return () => clearInterval(intervalId);
  }, [selectedChainId, isConnected, address]);

  /**
   * Batch-fetch via Multicall3: per ERC-20 token, decimals + faucet balance +
   * allowance (remaining supply), and per token the connected user's balance.
   * No wallet connection required (read-only RPC); user balance is skipped
   * when no address is stored. Switching tokens never triggers a query.
   */
  const batchUpdateTokenData = async (chainIdParam: number) => {
    try {
      const provider = getReadonlyProviderForChain(chainIdParam);
      if (!provider) {
        setTokenSupplies({});
        setTokenBalances({});
        return;
      }
      const tokens = getFaucetTokenListByChain(chainIdParam);
      if (tokens.length === 0) {
        setTokenSupplies({});
        setTokenBalances({});
        return;
      }
      const chainConfig = faucetConfig[String(chainIdParam)] as
        | Record<string, string>
        | undefined;
      const faucetAddress = chainConfig?.faucet;
      if (!faucetAddress) {
        setTokenSupplies({});
        setTokenBalances({});
        return;
      }
      const userAddress = localStorage.getItem("userAddress");

      const erc20Interface = new Interface(erc20ABI);
      const calls: Multicall3Call[] = [];
      const tokenMeta: { label: string; isErc721: boolean }[] = [];

      tokens.forEach((token) => {
        const tokenAddress = getFaucetTokenAddress(chainIdParam, token.label);
        if (!tokenAddress) return;
        tokenMeta.push({
          label: token.label,
          isErc721: token.type === "erc721"
        });
        if (token.type !== "erc721") {
          calls.push({
            target: tokenAddress,
            allowFailure: true,
            callData: erc20Interface.encodeFunctionData("decimals", [])
          });
          calls.push({
            target: tokenAddress,
            allowFailure: true,
            callData: erc20Interface.encodeFunctionData("balanceOf", [
              faucetFromAddress
            ])
          });
          calls.push({
            target: tokenAddress,
            allowFailure: true,
            callData: erc20Interface.encodeFunctionData("allowance", [
              faucetFromAddress,
              faucetAddress
            ])
          });
        }
        if (userAddress) {
          calls.push({
            target: tokenAddress,
            allowFailure: true,
            callData: erc20Interface.encodeFunctionData("balanceOf", [
              userAddress
            ])
          });
        }
      });

      if (calls.length === 0) {
        setTokenSupplies({});
        setTokenBalances({});
        return;
      }

      const results = await multicall3Aggregate3StaticCall(provider, calls);

      const newSupplies: Record<string, number> = {};
      const newBalances: Record<string, number> = {};
      tokens.forEach((token) => {
        newSupplies[token.label] = 0;
        newBalances[token.label] = 0;
      });

      let index = 0;
      tokenMeta.forEach(({ label, isErc721 }) => {
        if (isErc721) {
          // ERC-721: minted on demand → supply MAX; user balance = NFT count.
          if (userAddress) {
            const nftCount = decodeMulticallResult<bigint>(
              erc20Interface,
              "balanceOf",
              results[index++]
            );
            newBalances[label] =
              nftCount === undefined ? 0 : getDecimal(nftCount, 0);
          }
          return;
        }
        const decimals = decodeMulticallResult<bigint>(
          erc20Interface,
          "decimals",
          results[index++]
        );
        const balance = decodeMulticallResult<bigint>(
          erc20Interface,
          "balanceOf",
          results[index++]
        );
        const allowance = decodeMulticallResult<bigint>(
          erc20Interface,
          "allowance",
          results[index++]
        );
        if (
          decimals === undefined ||
          balance === undefined ||
          allowance === undefined
        ) {
          newSupplies[label] = 0;
        } else {
          const minBalance = balance < allowance ? balance : allowance;
          newSupplies[label] = getDecimal(minBalance, Number(decimals));
        }
        if (userAddress) {
          const userBalance = decodeMulticallResult<bigint>(
            erc20Interface,
            "balanceOf",
            results[index++]
          );
          newBalances[label] =
            userBalance !== undefined && decimals !== undefined
              ? getDecimal(userBalance, Number(decimals))
              : 0;
        }
      });

      setTokenSupplies(newSupplies);
      setTokenBalances(newBalances);
    } catch (err) {
      console.error("Failed to batch fetch token data", err);
      setTokenSupplies({});
      setTokenBalances({});
    }
  };

  useEffect(() => {
    setTotalAmount(tokenSupplies[selectedToken] ?? 0);
  }, [tokenSupplies, selectedToken]);

  const selectToken = (tokenName: string) => {
    setSelectedToken(tokenName);
    if (selectedChainId) {
      localStorage.setItem(`faucetTokenName_${selectedChainId}`, tokenName);
    }
  };

  // Close the token picker modal on Escape.
  useEffect(() => {
    if (!tokenPickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTokenPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tokenPickerOpen]);

  const chainMenuRef = useRef<HTMLDivElement>(null);
  // Close chain dropdown on outside click (same pattern as HeaderLocaleMenu).
  useEffect(() => {
    if (!chainPickerOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!chainMenuRef.current?.contains(event.target as Node)) {
        setChainPickerOpen(false);
      }
    };
    const timerId = window.setTimeout(() => {
      document.addEventListener("pointerdown", onPointerDown);
    }, 0);
    return () => {
      window.clearTimeout(timerId);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [chainPickerOpen]);

  const handleChainSelect = async (cid: number) => {
    setChainPickerOpen(false);
    setSelectedChainId(cid);
    localStorage.setItem("faucetChainId", cid.toString());
    if (chainIdCurrent != null && cid !== chainIdCurrent) {
      try {
        await switchNetwork(cid);
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error(t("error.switchChain"));
      }
    }
  };

  const switchToTargetChain = async (): Promise<boolean> => {
    const targetChainId = selectedChainId ?? faucetChainIdList[0];
    if (chainId === targetChainId) return true;
    const ok = await switchToChainAndWait(targetChainId, {
      onMismatchMessage: t("faucet.switchTimeout")
    });
    if (ok) setChainId(targetChainId);
    return ok;
  };

  const checkAndSwitchChain = async (): Promise<number | null> => {
    const targetChainId = selectedChainId ?? faucetChainIdList[0];
    if (chainId !== targetChainId) {
      const ok = await switchToTargetChain();
      return ok ? targetChainId : null;
    }
    return targetChainId;
  };

  const switchToTargetChainHandler = async () => {
    const ok = await switchToTargetChain();
    if (ok && selectedChainId) await batchUpdateTokenData(selectedChainId);
  };

  const faucetTokenHandler = async (
    tokenName: string,
    faucetAmount: string
  ) => {
    setIsTransactionProcessing(true);
    try {
      const chainIdC = await checkAndSwitchChain();
      if (chainIdC === null) return;
      const account = currentAccount;
      if (!account) return;
      const tokenAddress = getFaucetTokenAddress(chainIdC, tokenName);
      if (!tokenAddress) return;
      const faucetContract = await getFaucetContract();
      if (!faucetContract) return;

      if (isErc721Token(tokenName, chainIdC)) {
        // ERC-721 (YGME): mint via the faucet's `faucetDatas` forwarder so the
        // faucet contract is the caller of `swap` (bypasses user whitelist).
        const ygmeInterface = new Interface(YGMEABI);
        const swapData = ygmeInterface.encodeFunctionData("swap", [
          account,
          YGME_ZERO_RECOMMENDER,
          faucetAmount
        ]);
        const tx = await faucetContract.faucetDatas(tokenAddress, swapData);
        const result = await tx.wait();
        if (result.status === 1) {
          toast.success(t("faucet.mintYgmeSuccess"));
          await batchUpdateTokenData(chainIdC);
        }
        return;
      }

      const decimals = await getERC20Decimals(tokenAddress);
      if (Number(faucetAmount) > totalAmount) {
        toast.error(t("faucet.insufficientSupply"));
        return;
      }
      const tx = await faucetContract.faucet(
        tokenAddress,
        faucetFromAddress,
        account,
        getDecimalBigNumber(faucetAmount, decimals)
      );
      const result = await tx.wait();
      if (result.status === 1) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        await batchUpdateTokenData(chainIdC);
      }
    } catch (error) {
      const e = error as {
        code?: string | number;
        reason?: string;
        message?: string;
      };
      const msg = String(e?.message ?? e?.reason ?? "");
      const rejected =
        String(e?.code) === "ACTION_REJECTED" ||
        String(e?.code) === "4001" ||
        /user rejected|rejected|denied/i.test(msg);
      if (rejected) {
        toast(t("faucet.userRejected"));
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t("faucet.failed"));
      }
    } finally {
      setIsTransactionProcessing(false);
    }
  };

  const faucetButton = (coinType: string, faucetAmount: number = 5) => {
    const amountStr = String(faucetAmount);
    return (
      <button
        onClick={() => faucetTokenHandler(coinType, amountStr)}
        className="cta-button mint-nft-button"
        disabled={!currentAccount || isTransactionProcessing}
      >
        {isTransactionProcessing ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #ffffff",
                borderRightColor: "transparent",
                borderRadius: "50%",
                animation: "rotate 1s linear infinite",
                marginRight: "8px"
              }}
            />
            {t("common.processingDots")}
          </>
        ) : (
          t("faucet.faucetButton", { amount: amountStr, token: coinType })
        )}
      </button>
    );
  };

  const checkWalletIsConnected = async (): Promise<boolean> => {
    const { ethereum } = window;
    try {
      if (!ethereum) {
        alert(t("common.installMetamask"));
        return false;
      }
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  return (
    <div className="feature-page main-app">
      {showAlert && (
        <div className="feature-alert">
          <strong>{t("faucet.claimSuccess")}</strong>
        </div>
      )}
      <section className="feature-hero faucet-hero">
        <h1>{t("faucet.title")}</h1>
        <p>{t("faucet.subtitle")}</p>
      </section>
      <section className="feature-panel faucet-panel">
        <h3 className="faucet-panel-title">{t("faucet.claimSection")}</h3>
        <div className="faucet-panel-grid">
          <div className="faucet-field">
            <label htmlFor="faucet-chain">{t("common.chain")}</label>
            <div className="faucet-token-select" ref={chainMenuRef}>
              <button
                type="button"
                id="faucet-chain"
                className="faucet-token-select-btn"
                onClick={() => setChainPickerOpen((value) => !value)}
                aria-haspopup="listbox"
                aria-expanded={chainPickerOpen}
                aria-label={t("common.selectChain")}
              >
                <span className="faucet-token-select-label">
                  {selectedChainId != null
                    ? getChainName(selectedChainId)
                    : t("common.selectChain")}
                </span>
                <svg
                  className="faucet-token-select-arrow"
                  width={10}
                  height={10}
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 3.5L5 6.5L8 3.5"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {chainPickerOpen && (
                <div
                  className="faucet-chain-select-menu"
                  role="listbox"
                  aria-label={t("common.selectChain")}
                >
                  {faucetChainIdList.map((cid) => (
                    <button
                      key={cid}
                      type="button"
                      role="option"
                      aria-selected={selectedChainId === cid}
                      className={
                        "faucet-chain-select-option" +
                        (selectedChainId === cid ? " is-active" : "")
                      }
                      onClick={() => handleChainSelect(cid)}
                    >
                      {getChainName(cid)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {selectedChainId && availableTokens.length > 0 && (
            <div className="faucet-field">
              <label htmlFor="faucet-token">{t("common.token")}</label>
              <div className="faucet-token-select">
                <button
                  type="button"
                  id="faucet-token"
                  className="faucet-token-select-btn"
                  onClick={() => setTokenPickerOpen(true)}
                  aria-haspopup="dialog"
                  aria-expanded={tokenPickerOpen}
                  aria-label={t("common.selectToken")}
                >
                  <span className="faucet-token-select-label">
                    {selectedToken}
                    {currentToken && (
                      <span
                        className={`token-type-badge token-type-badge--${currentToken.type ?? "erc20"}`}
                      >
                        {currentToken.type === "erc721"
                          ? t("common.tokenTypeErc721")
                          : t("common.tokenTypeErc20")}
                      </span>
                    )}
                  </span>
                  <svg
                    className="faucet-token-select-arrow"
                    width={10}
                    height={10}
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M2 3.5L5 6.5L8 3.5"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
        {selectedChainId && availableTokens.length > 0 && (
          <div className="faucet-summary">
            <div className="faucet-summary-item">
              <span className="faucet-summary-label">
                {t("faucet.colRemaining")}
              </span>
              <span className="faucet-summary-value">
                {currentToken?.type === "erc721"
                  ? "MAX"
                  : tokenSupplies[selectedToken] != null
                    ? formatSupply(Number(tokenSupplies[selectedToken]))
                    : "—"}
              </span>
            </div>
            <div className="faucet-summary-item">
              <span className="faucet-summary-label">
                {t("faucet.colBalance")}
              </span>
              <span className="faucet-summary-value">
                {tokenBalances[selectedToken] != null
                  ? formatSupply(Number(tokenBalances[selectedToken]))
                  : "—"}
              </span>
            </div>
            <div className="faucet-summary-item">
              <span className="faucet-summary-label">
                {t("faucet.colReceive")}
              </span>
              <span className="faucet-summary-value">
                {currentToken ? formatSupply(currentToken.faucetAmount) : "—"}
              </span>
            </div>
          </div>
        )}
        <div className="faucet-actions">
          {shouldShowConnect ? (
            <button
              type="button"
              onClick={openConnectModal}
              className="cta-button connect-wallet-button"
              disabled={isConnecting}
            >
              {isConnecting
                ? t("common.connecting")
                : t("common.connectWallet")}
            </button>
          ) : selectedChainId != null &&
            chainId != null &&
            chainId !== selectedChainId ? (
            <button
              type="button"
              onClick={switchToTargetChainHandler}
              className="cta-button mint-nft-button"
              disabled={!currentAccount || isSwitchingChain}
            >
              {isSwitchingChain ? (
                <>
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      border: "2px solid currentColor",
                      borderRightColor: "transparent",
                      borderRadius: "50%",
                      animation: "rotate 1s linear infinite",
                      marginRight: "8px"
                    }}
                  />
                  {t("common.switchingEllipsis")}
                </>
              ) : (
                t("common.switchToChain", {
                  chain: getChainName(selectedChainId)
                })
              )}
            </button>
          ) : (
            currentToken &&
            faucetButton(selectedToken, currentToken.faucetAmount)
          )}
        </div>
        <p className="faucet-note">{t("faucet.footerNote")}</p>
      </section>
      {tokenPickerOpen && (
        <div
          className="faucet-picker-overlay"
          onClick={() => setTokenPickerOpen(false)}
          role="presentation"
        >
          <div
            className="faucet-picker-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("common.selectToken")}
          >
            <div className="faucet-picker-header">
              <h3>{t("common.selectToken")}</h3>
              <button
                type="button"
                className="faucet-picker-close"
                onClick={() => setTokenPickerOpen(false)}
                aria-label={t("common.close")}
              >
                ×
              </button>
            </div>
            <div className="faucet-picker-list-header">
              <span className="faucet-picker-list-header-name">
                {t("faucet.colName")}
              </span>
              <span className="faucet-picker-list-header-meta">
                <span className="faucet-picker-list-header-supply">
                  {t("faucet.colRemaining")}
                </span>
                <span className="faucet-picker-list-header-type">
                  {t("faucet.colType")}
                </span>
              </span>
            </div>
            <div className="faucet-picker-list">
              {availableTokens.map((token) => (
                <button
                  type="button"
                  key={token.label}
                  className={`faucet-picker-option ${selectedToken === token.label ? "active" : ""}`}
                  onClick={() => {
                    selectToken(token.label);
                    setTokenPickerOpen(false);
                  }}
                >
                  <span className="faucet-picker-option-label">
                    {token.label}
                  </span>
                  <span className="faucet-picker-option-meta">
                    <span
                      className="faucet-picker-option-supply"
                      title={
                        token.type === "erc721"
                          ? undefined
                          : t("faucet.remainingSupply")
                      }
                    >
                      {token.type === "erc721"
                        ? "MAX"
                        : tokenSupplies[token.label] != null
                          ? formatSupply(Number(tokenSupplies[token.label]))
                          : "—"}
                    </span>
                    <span
                      className={`token-type-badge token-type-badge--${token.type ?? "erc20"}`}
                    >
                      {token.type === "erc721"
                        ? t("common.tokenTypeErc721")
                        : t("common.tokenTypeErc20")}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaucetTokenPage;
