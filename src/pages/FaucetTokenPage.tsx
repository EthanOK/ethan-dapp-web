/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Interface } from "ethers";
import {
  getFaucetContract,
  getERC20Contract,
  getERC20Decimals
} from "@/lib/evm/GetContract";
import { getDecimal, getDecimalBigNumber } from "@/lib/shared/Utils";
import {
  getSignerAndChainId,
  parseEvmChainIdFromStored
} from "@/lib/wallet/GetProvider";
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
  const [tokenBalance, setTokenBalance] = useState(0);
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
        setTokenBalance(0);
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
    const intervalId = setInterval(updateBalance, 5000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  const getTokenBalance = async (
    tokenName: string,
    chainIdParam: number | null = null
  ): Promise<number> => {
    const account = localStorage.getItem("userAddress");
    const chainIdVal =
      chainIdParam ??
      selectedChainId ??
      parseEvmChainIdFromStored(localStorage.getItem("chainId")) ??
      0;
    const tokenAddress = getFaucetTokenAddress(chainIdVal, tokenName);
    if (!tokenAddress || !account) return 0;
    const contract = await getERC20Contract(tokenAddress);
    if (!contract) return 0;
    const balance = await contract.balanceOf(account);
    if (isErc721Token(tokenName, chainIdVal)) {
      // ERC-721: balanceOf returns the NFT count, no decimals.
      return getDecimal(balance, 0);
    }
    const decimals = await contract.decimals();
    return getDecimal(balance, Number(decimals));
  };

  const getTokenTotalClaim = async (
    tokenName: string,
    chainIdParam: number | null = null
  ): Promise<number> => {
    const chainIdVal =
      chainIdParam ??
      selectedChainId ??
      parseEvmChainIdFromStored(localStorage.getItem("chainId")) ??
      0;
    const tokenAddress = getFaucetTokenAddress(chainIdVal, tokenName);
    if (!tokenAddress) return 0;
    const contract = await getERC20Contract(tokenAddress);
    if (!contract) return 0;
    if (isErc721Token(tokenName, chainIdVal)) {
      // ERC-721: minted on demand, no "remaining supply" concept.
      return 0;
    }
    const balance1 = await contract.balanceOf(faucetFromAddress);
    const chainConfig = faucetConfig[String(chainIdVal)] as
      | Record<string, string>
      | undefined;
    const faucetAddress = chainConfig?.faucet;
    if (!faucetAddress) return 0;
    const balance2 = await contract.allowance(faucetFromAddress, faucetAddress);
    const minBalance =
      BigInt(balance1) < BigInt(balance2) ? balance1 : balance2;
    const decimals = await contract.decimals();
    return getDecimal(minBalance, Number(decimals));
  };

  const faucetBalance = async () => {
    try {
      if (!selectedChainId) return;
      const tokens = getFaucetTokenListByChain(selectedChainId);
      if (tokens.length === 0) {
        setTokenBalance(0);
        setTotalAmount(0);
        return;
      }
      const selectedToken_ = selectedToken || tokens[0].label;
      const tokenExists = tokens.find((t) => t.label === selectedToken_);
      if (!tokenExists) {
        const fallbackToken = tokens[0].label;
        setSelectedToken(fallbackToken);
        localStorage.setItem(
          `faucetTokenName_${selectedChainId}`,
          fallbackToken
        );
        const total = await getTokenTotalClaim(fallbackToken, selectedChainId);
        setTotalAmount(total);
        try {
          setTokenBalance(
            await getTokenBalance(fallbackToken, selectedChainId)
          );
        } catch {
          setTokenBalance(0);
        }
        return;
      }
      const total = await getTokenTotalClaim(selectedToken_, selectedChainId);
      setTotalAmount(total);
      try {
        setTokenBalance(await getTokenBalance(selectedToken_, selectedChainId));
      } catch {
        setTokenBalance(0);
      }
    } catch (err) {
      console.error("Failed to fetch balance", err);
      setTokenBalance(0);
      setTotalAmount(0);
    }
  };

  useEffect(() => {
    if (selectedChainId) faucetBalance();
  }, [selectedToken, selectedChainId, isConnected, address]);

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

  const handleChainSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const cid = parseInt(event.target.value, 10);
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

  const updateBalance = async () => {
    const account = localStorage.getItem("userAddress");
    if (!account || !selectedChainId) return;
    await faucetBalance();
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
    if (ok) await updateBalance();
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
          await updateBalance();
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
        await updateBalance();
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
      <section className="feature-hero">
        <h1>{t("faucet.title")}</h1>
        <p>{t("faucet.subtitle")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("common.selectChain")}</h3>
        <div className="feature-field">
          <label htmlFor="faucet-chain">{t("common.chain")}</label>
          <select
            id="faucet-chain"
            value={selectedChainId ?? ""}
            onChange={handleChainSelectChange}
            aria-label={t("common.selectChain")}
          >
            {faucetChainIdList.map((cid) => (
              <option key={cid} value={cid}>
                {getChainName(cid)}
              </option>
            ))}
          </select>
        </div>
        {selectedChainId && (
          <p className="feature-field" style={{ marginBottom: 0 }}>
            {t("common.current")}:{" "}
            <strong>{chainId ? getChainName(chainId) : "—"}</strong>
            {/* {chainId != null &&
              selectedChainId != null &&
              chainId !== selectedChainId && (
                <span style={{ color: "var(--w3-accent)", marginLeft: 8 }}>
                  → Please switch to target network
                </span>
              )} */}
          </p>
        )}
      </section>
      {selectedChainId && (
        <section className="feature-panel">
          <h3>{t("faucet.tokenSection")}</h3>
          {currentToken?.type !== "erc721" && (
            <p style={{ color: "var(--w3-text-muted)", marginBottom: 16 }}>
              {t("faucet.remainingSupply")}{" "}
              <strong style={{ color: "var(--w3-text)" }}>{totalAmount}</strong>
            </p>
          )}
          {availableTokens.length > 0 ? (
            <>
              <div className="feature-field">
                <label>{t("common.token")}</label>
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
              <p style={{ color: "var(--w3-text-muted)", marginBottom: 16 }}>
                {t("faucet.myBalance", { token: selectedToken })}{" "}
                <strong style={{ color: "var(--w3-text)" }}>
                  {tokenBalance}
                </strong>
              </p>
              <div className="feature-actions">
                {selectedChainId != null &&
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
            </>
          ) : (
            <p style={{ color: "var(--w3-text-muted)" }}>
              {t("faucet.noTokens")}
            </p>
          )}
        </section>
      )}
      {shouldShowConnect && (
        <section className="feature-panel">
          <button
            onClick={openConnectModal}
            className="cta-button connect-wallet-button"
            disabled={isConnecting}
          >
            {isConnecting ? t("common.connecting") : t("common.connectWallet")}
          </button>
        </section>
      )}
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
                  <span
                    className={`token-type-badge token-type-badge--${token.type ?? "erc20"}`}
                  >
                    {token.type === "erc721"
                      ? t("common.tokenTypeErc721")
                      : t("common.tokenTypeErc20")}
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
