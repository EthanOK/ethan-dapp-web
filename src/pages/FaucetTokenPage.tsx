/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  getFaucetContract,
  getERC20Contract,
  getERC20Decimals
} from "../utils/GetContract";
import { getDecimal, getDecimalBigNumber } from "../utils/Utils";
import { BigNumber } from "ethers";
import { getSignerAndChainId } from "../utils/GetProvider";
import {
  faucetChainIdList,
  faucetConfig,
  getFaucetTokenAddress,
  getFaucetTokenListByChain,
  getChainName
} from "../common/FaucetConfig";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { getDefaultNetwork, modal } from "../EthanDapp";
import { toast } from "sonner";

const faucetFromAddress = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";

const FaucetTokenPage = () => {
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
  const [tokenBalance, setTokenBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isTransactionProcessing, setIsTransactionProcessing] = useState(false);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const { address, isConnected } = useAppKitAccount();
  const { chainId: chainIdCurrent } = useAppKitNetwork();

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

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      localStorage.setItem("LoginType", "reown");
      // Prefer opening the AppKit modal when available
      const maybeModal = modal as unknown as {
        open?: () => Promise<void> | void;
      };
      await maybeModal?.open?.();
      // If modal.open doesn't exist, user can still connect via header appkit button
    } catch (error) {
      console.error("Connect failed:", error);
      localStorage.removeItem("LoginType");
      toast.error("Connect wallet failed, please try again");
    } finally {
      setIsConnecting(false);
    }
  };

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
      parseInt(localStorage.getItem("chainId") ?? "0", 10);
    const tokenAddress = getFaucetTokenAddress(chainIdVal, tokenName);
    if (!tokenAddress || !account) return 0;
    const contract = await getERC20Contract(tokenAddress);
    if (!contract) return 0;
    const ygioBalance = await contract.balanceOf(account);
    const decimals = await contract.decimals();
    return getDecimal(ygioBalance, Number(decimals));
  };

  const getTokenTotalClaim = async (
    tokenName: string,
    chainIdParam: number | null = null
  ): Promise<number> => {
    const chainIdVal =
      chainIdParam ??
      selectedChainId ??
      parseInt(localStorage.getItem("chainId") ?? "0", 10);
    const tokenAddress = getFaucetTokenAddress(chainIdVal, tokenName);
    if (!tokenAddress) return 0;
    const contract = await getERC20Contract(tokenAddress);
    if (!contract) return 0;
    const balance1 = await contract.balanceOf(faucetFromAddress);
    const chainConfig = faucetConfig[String(chainIdVal)] as
      | Record<string, string>
      | undefined;
    const faucetAddress = chainConfig?.faucet;
    if (!faucetAddress) return 0;
    const balance2 = await contract.allowance(faucetFromAddress, faucetAddress);
    const minBalance = BigNumber.from(balance1).lt(balance2)
      ? balance1
      : balance2;
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

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const tokenName = event.target.value;
    setSelectedToken(tokenName);
    if (selectedChainId) {
      localStorage.setItem(`faucetTokenName_${selectedChainId}`, tokenName);
    }
  };

  const handleChainSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const cid = parseInt(event.target.value, 10);
    setSelectedChainId(cid);
    localStorage.setItem("faucetChainId", cid.toString());
    if (chainIdCurrent != null && cid !== chainIdCurrent) {
      try {
        await modal.switchNetwork(getDefaultNetwork(cid));
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error("切换链失败，请手动切换");
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
    try {
      // toast.info("Please switch to " + getChainName(targetChainId));
      await modal.switchNetwork(getDefaultNetwork(targetChainId));
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        const [, current] = await getSignerAndChainId();
        if (current === targetChainId) {
          setChainId(targetChainId);
          localStorage.setItem("chainId", String(targetChainId));
          window.dispatchEvent(
            new CustomEvent("app-network-changed", {
              detail: { chainId: String(targetChainId) }
            })
          );
          // toast.success("Switched to " + getChainName(targetChainId));
          return true;
        }
        await new Promise((r) => setTimeout(r, 400));
      }
      const [, current] = await getSignerAndChainId();
      if (current !== targetChainId) {
        toast.error(
          "Switching network timeout or not completed, please switch manually and try again"
        );
        return false;
      }
      return true;
    } catch (error) {
      toast.error(
        "Switching network failed or canceled, please switch manually and try again"
      );
      return false;
    }
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
    setIsSwitchingChain(true);
    try {
      const ok = await switchToTargetChain();
      if (ok) await updateBalance();
    } finally {
      setIsSwitchingChain(false);
    }
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
      const decimals = await getERC20Decimals(tokenAddress);
      if (Number(faucetAmount) > totalAmount) {
        toast.error("Insufficient Supply");
        return;
      }
      const faucetContract = await getFaucetContract();
      if (!faucetContract) return;
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
        toast("User rejected the transaction");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Faucet failed, please try again");
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
            Processing...
          </>
        ) : (
          `Faucet ${amountStr} ${coinType}`
        )}
      </button>
    );
  };

  const checkWalletIsConnected = async (): Promise<boolean> => {
    const { ethereum } = window;
    try {
      if (!ethereum) {
        alert("Please install Metamask");
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
          <strong>Claim Successful!</strong>
        </div>
      )}
      <section className="feature-hero">
        <h1>Faucet Token</h1>
        <p>Select chain and token to claim testnet tokens</p>
      </section>
      <section className="feature-panel">
        <h3>Select Chain</h3>
        <div className="feature-field">
          <label htmlFor="faucet-chain">Chain</label>
          <select
            id="faucet-chain"
            value={selectedChainId ?? ""}
            onChange={handleChainSelectChange}
            aria-label="Select chain"
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
            Current: <strong>{chainId ? getChainName(chainId) : "—"}</strong>
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
          <h3>Faucet Token</h3>
          <p style={{ color: "var(--w3-text-muted)", marginBottom: 16 }}>
            Remaining Supply:{" "}
            <strong style={{ color: "var(--w3-text)" }}>{totalAmount}</strong>
          </p>
          {availableTokens.length > 0 ? (
            <>
              <div className="feature-field">
                <label htmlFor="faucet-token">Token</label>
                <select
                  id="faucet-token"
                  value={selectedToken}
                  onChange={handleSelectChange}
                  aria-label="Select token"
                >
                  {availableTokens.map((token) => (
                    <option key={token.label} value={token.label}>
                      {token.label}
                    </option>
                  ))}
                </select>
              </div>
              <p style={{ color: "var(--w3-text-muted)", marginBottom: 16 }}>
                My {selectedToken} Balance:{" "}
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
                        Switching...
                      </>
                    ) : (
                      `Switch to ${getChainName(selectedChainId)}`
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
              No tokens available for this chain
            </p>
          )}
        </section>
      )}
      {shouldShowConnect && (
        <section className="feature-panel">
          <button
            onClick={handleConnect}
            className="cta-button connect-wallet-button"
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </button>
        </section>
      )}
    </div>
  );
};

export default FaucetTokenPage;
