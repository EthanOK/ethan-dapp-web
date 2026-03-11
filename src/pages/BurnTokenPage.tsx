import { useEffect, useState } from "react";
import { getERC20Contract, getERC20Decimals } from "../utils/GetContract";
import { isAddress, getScanURL } from "../utils/Utils";
import { BigNumber } from "ethers";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { toast } from "sonner";
import { useAppKitAccount } from "@reown/appkit/react";

const PLACEHOLDER_ADDRESS = "0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b";

const truncateHash = (hash: string, start = 16, end = 14): string => {
  if (!hash || hash.length <= start + end) return hash;
  return `${hash.slice(0, start)}…${hash.slice(-end)}`;
};

const BurnTokenPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null);
  const [tokenDecimals, setTokenDecimals] = useState<number>(18);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnAmount, setBurnAmount] = useState<string>("");
  type TxStatus = "pending" | "success" | "failed" | "rejected";
  type TxResult = { link?: string; status: TxStatus };
  const [burnTx, setBurnTx] = useState<TxResult | null>(null);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
  }, [isMounted]);

  const parseAddress = (val: string): string | null => {
    const trimmed = val.trim();
    if (trimmed.length === 44 && trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as string;
        return isAddress(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return isAddress(trimmed) ? trimmed : null;
  };

  const getBalanceHandler = async () => {
    const addr = parseAddress(tokenAddress);
    if (!addr) {
      toast.error("Invalid token address");
      return;
    }
    if (!address) return;

    setIsLoadingBalance(true);
    setTokenBalance(null);
    setTokenSymbol(null);
    try {
      const contract = await getERC20Contract(addr);
      if (!contract) {
        toast.error("Failed to load contract");
        return;
      }
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        getERC20Decimals(addr),
        contract.symbol().catch(() => null)
      ]);
      setTokenAddress(addr);
      setTokenBalance(balance);
      setTokenDecimals(decimals);
      setTokenSymbol(
        typeof symbol === "string" && symbol.length > 0 ? symbol : null
      );
      setBurnAmount(formatUnits(balance, decimals));
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to get balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const computeBurnAmountBN = (): BigNumber | null => {
    if (!tokenBalance) return null;
    const raw = burnAmount.trim();
    if (raw === "") return tokenBalance;
    try {
      const bn = parseUnits(raw, tokenDecimals);
      if (bn.lte(0)) return null;
      return bn;
    } catch {
      return null;
    }
  };

  const burnTokenHandler = async () => {
    const addr = parseAddress(tokenAddress);
    if (!addr) {
      toast.error("Invalid token address");
      return;
    }
    if (!tokenBalance || tokenBalance.isZero()) {
      toast.error("No balance to burn");
      return;
    }
    const amountToBurn = computeBurnAmountBN();
    if (!amountToBurn) {
      toast.error("Invalid burn amount");
      return;
    }
    if (amountToBurn.gt(tokenBalance)) {
      toast.error("Burn amount exceeds balance");
      return;
    }

    setBurnTx(null);
    setIsBurning(true);
    try {
      const contract = await getERC20Contract(addr);
      if (!contract) {
        toast.error("Failed to load contract");
        return;
      }
      const burnAccount = "0x0000000000000000000000000000000000000001";
      const tx = await contract.transfer(burnAccount, amountToBurn);
      const url = await getScanURL();
      const link = `${url}/tx/${tx.hash}`;
      setBurnTx({ link, status: "pending" });
      const receipt = await tx.wait();
      setBurnTx({ link, status: receipt.status === 1 ? "success" : "failed" });
      if (receipt.status === 1) {
        toast.success("Burn successful");
        await getBalanceHandler();
      } else {
        toast.error("Burn failed");
      }
    } catch (err: unknown) {
      const e = err as {
        code?: number | string;
        reason?: string;
        message?: string;
      };
      const rejected =
        String(e?.code) === "4001" ||
        /rejected|denied|user rejected/i.test(
          String(e?.message ?? e?.reason ?? "")
        );
      if (rejected) {
        toast("Transaction rejected");
        setBurnTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.message ?? e?.reason ?? "Burn failed");
        setBurnTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
    } finally {
      setIsBurning(false);
    }
  };

  const balanceDisplay =
    tokenBalance != null ? formatUnits(tokenBalance, tokenDecimals) : null;

  const burnAmountBN = computeBurnAmountBN();
  const burnAmountExceeds =
    tokenBalance != null &&
    burnAmountBN != null &&
    burnAmountBN.gt(tokenBalance);
  const burnAmountInvalid =
    tokenBalance != null && burnAmount.trim() !== "" && burnAmountBN == null;

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>Burn Token</h1>
        <p>Burn ERC20 tokens by transferring them to the zero address</p>
        <p className="feature-field-hint" style={{ marginTop: 8 }}>
          Please switch to testnet for testing
        </p>
      </section>

      <section className="feature-panel">
        <h3>ERC20 Token</h3>
        <div className="feature-field">
          <label htmlFor="burn-token-address">Token contract address</label>
          <input
            id="burn-token-address"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder={PLACEHOLDER_ADDRESS}
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getBalanceHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || isLoadingBalance}
          >
            {isLoadingBalance ? "Loading…" : "Query Balance"}
          </button>
        </div>

        {balanceDisplay !== null && (
          <>
            <div className="feature-field" style={{ marginTop: 16 }}>
              <label>Balance{tokenSymbol ? ` (${tokenSymbol})` : ""}</label>
              <div
                className="feature-field-value"
                style={{
                  padding: "10px 12px",
                  background: "var(--w3-bg-elevated)",
                  borderRadius: "var(--w3-radius-sm)",
                  border: "1px solid var(--w3-border)",
                  fontFamily: "var(--w3-font-mono)",
                  fontSize: "1rem"
                }}
              >
                {balanceDisplay}
              </div>
            </div>

            <div className="feature-field" style={{ marginTop: 16 }}>
              <label htmlFor="burn-amount">
                Burn Amount{" "}
                <span style={{ color: "var(--w3-text-dim)" }}>
                  (max {balanceDisplay}
                  {tokenSymbol ? ` ${tokenSymbol}` : ""})
                </span>
              </label>
              <input
                id="burn-amount"
                type="text"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="leave empty to burn max"
                spellCheck={false}
                autoComplete="off"
              />
              {(burnAmountInvalid || burnAmountExceeds) && (
                <div
                  style={{
                    marginTop: 8,
                    color: "var(--w3-text-muted)",
                    fontSize: "0.85rem"
                  }}
                >
                  {burnAmountInvalid && "Amount format invalid"}
                  {burnAmountExceeds && "Amount exceeds balance"}
                </div>
              )}
            </div>
          </>
        )}

        <div
          className="feature-actions feature-actions--inline"
          style={{ marginTop: 20 }}
        >
          <button
            type="button"
            onClick={burnTokenHandler}
            className="cta-button mint-nft-button"
            disabled={
              !currentAccount ||
              isBurning ||
              !tokenBalance ||
              tokenBalance.isZero() ||
              burnAmountInvalid ||
              burnAmountExceeds
            }
          >
            {isBurning
              ? "Burning…"
              : `Burn token${tokenSymbol ? ` (${tokenSymbol})` : ""}`}
          </button>
          {burnTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${burnTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${burnTx.status}`}
              >
                {burnTx.status === "pending" && "Pending"}
                {burnTx.status === "success" && "Success"}
                {burnTx.status === "failed" && "Failed"}
                {burnTx.status === "rejected" && "Rejected"}
              </span>
              {burnTx.link && (
                <a
                  href={burnTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={burnTx.link.split("/").pop() ?? ""}
                >
                  {truncateHash(burnTx.link.split("/").pop() ?? "")}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default BurnTokenPage;
