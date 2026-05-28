import { useEffect, useState } from "react";
import {
  isAddress,
  utf8ToHexBytes,
  getScanURL,
  getDecimalBigNumber
} from "@/lib/shared/Utils";
import {
  getSigner,
  getProvider,
  getDefaultReadonlyProvider
} from "@/lib/wallet/GetProvider";
import { toast } from "sonner";
import { useEvmWallet } from "@/hooks";
import { truncateHash } from "@/lib/shared/Format";
import { formatUnits, parseUnits } from "ethers";
import { multicall3Aggregate3Value } from "@/lib/evm/Multicall3";

const PLACEHOLDER_ADDRESS = "0xe698a7917eEE4fDf03296add549eE4A7167DD406";

const parseToAddresses = (raw: string): string[] => {
  const trimmed = raw.trim();
  if (trimmed === "") return [];

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.map((x) => String(x).trim()).filter((x) => x.length > 0);
    } catch {
      // fall through to bracket/delimiter parsing (e.g. [0x..,0x..])
    }
  }

  const withoutBrackets =
    trimmed.startsWith("[") && trimmed.endsWith("]")
      ? trimmed.slice(1, -1)
      : trimmed;

  return withoutBrackets
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .map((s) => s.replace(/^['"]+|['"]+$/g, ""))
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

const parseNonceInput = (raw: string): number | "empty" | "invalid" => {
  const t = raw.trim();
  if (t === "") return "empty";
  if (!/^\d+$/.test(t)) return "invalid";
  const n = Number(t);
  if (!Number.isSafeInteger(n) || n < 0) return "invalid";
  return n;
};

const CreateTransactionPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  type TxStatus = "pending" | "success" | "failed" | "rejected";
  type TxResult = { link?: string; status: TxStatus };
  const [transferTx, setTransferTx] = useState<TxResult | null>(null);
  const [createTx, setCreateTx] = useState<TxResult | null>(null);
  const [advTx, setAdvTx] = useState<TxResult | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isAdvBusy, setIsAdvBusy] = useState(false);

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("0.1");
  const [inputData, setInputData] = useState("");

  const [toTx, setToTx] = useState("");
  const [valueTx, setValueTx] = useState("0");
  const [dataTx, setDataTx] = useState("");

  const [nonceTx, setNonceTx] = useState("");
  const [cancelTxHash, setCancelTxHash] = useState("");
  const [isFetchingNonceFromHash, setIsFetchingNonceFromHash] = useState(false);

  const { address, isConnected } = useEvmWallet();

  const resolveTxProvider = async () => {
    const injected = await getProvider();
    return injected ?? getDefaultReadonlyProvider();
  };

  const refreshPendingNonce = async (account: string | null) => {
    if (!account || !isAddress(account)) return;
    try {
      const provider = await resolveTxProvider();
      if (!provider) return;
      const n = await provider.getTransactionCount(account, "latest");
      setNonceTx(String(n));
    } catch {
      // leave field unchanged on failure
    }
  };

  const fetchNonceFromTxHash = async () => {
    const h = cancelTxHash.trim();
    if (!TX_HASH_RE.test(h)) {
      toast.error("Invalid transaction hash (0x + 64 hex)");
      return;
    }
    setIsFetchingNonceFromHash(true);
    try {
      const provider = await resolveTxProvider();
      if (!provider) {
        toast.error("No RPC available");
        return;
      }
      const tx = await provider.getTransaction(h);
      if (!tx) {
        toast.error("Transaction not found on this network");
        return;
      }
      setNonceTx(String(tx.nonce));
      if (
        currentAccount &&
        tx.from.toLowerCase() !== currentAccount.toLowerCase()
      ) {
        toast(
          "Tx sender differs from connected wallet; nonce filled for review"
        );
      } else {
        toast.success("Nonce loaded from transaction");
      }
    } catch {
      toast.error("Failed to load transaction");
    } finally {
      setIsFetchingNonceFromHash(false);
    }
  };

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

  useEffect(() => {
    if (!isMounted || !currentAccount) return;
    void refreshPendingNonce(currentAccount);
  }, [isMounted, currentAccount]);

  const transferNativeHandler = async () => {
    const toList = parseToAddresses(to);
    if (toList.length === 0) {
      toast.error("To address is not valid");
      return;
    }
    const invalid = toList.find((a) => !isAddress(a));
    if (invalid) {
      toast.error("To address is not valid");
      return;
    }
    const amountBN = getDecimalBigNumber(amount === "" ? "0" : amount, 18);
    const hexData = inputData.trim().startsWith("0x")
      ? inputData.trim()
      : inputData.trim() === ""
        ? undefined
        : utf8ToHexBytes(inputData);

    if (toList.length > 1 && (hexData ?? "").trim() !== "") {
      toast.error("Batch transfer does not support Data");
      return;
    }

    setTransferTx(null);
    setIsTransferring(true);
    try {
      const signer = await getSigner();
      if (!signer) return;
      const url = await getScanURL();
      const tx =
        toList.length === 1
          ? await signer.sendTransaction({
              to: toList[0],
              data: hexData,
              value: amountBN
            })
          : await (async () => {
              const calls = toList.map((addr) => ({
                target: addr,
                allowFailure: false,
                value: amountBN,
                callData: "0x"
              }));
              const totalValue = amountBN * BigInt(toList.length);
              return multicall3Aggregate3Value(signer, calls, { totalValue });
            })();

      const link = `${url}/tx/${tx.hash}`;
      setTransferTx({ link, status: "pending" });
      const receipt = await tx.wait();
      setTransferTx({
        link,
        status: receipt?.status === 1 ? "success" : "failed"
      });
      if (receipt?.status === 1) toast.success("Transaction successful");
      else toast.error("Transaction failed");
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
        setTransferTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.reason ?? e?.message ?? "Error");
        setTransferTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
    } finally {
      setIsTransferring(false);
    }
  };

  const createTxHandler = async () => {
    const toTrimmed = toTx.trim();
    if (toTrimmed.length > 0 && !isAddress(toTrimmed)) {
      toast.error("To address is not valid");
      return;
    }
    const dataTrimmed = dataTx.trim();
    if (dataTrimmed.length > 0) {
      if (!dataTrimmed.startsWith("0x") || dataTrimmed.length % 2 !== 0) {
        toast.error("Data must be hex (0x...) or empty");
        return;
      }
    }
    const valueBN = getDecimalBigNumber(valueTx === "" ? "0" : valueTx, 18);
    const dataToUse = dataTrimmed === "" ? "0x" : dataTrimmed;

    setCreateTx(null);
    setIsCreating(true);
    try {
      const signer = await getSigner();
      if (!signer) return;
      const url = await getScanURL();
      const tx = await signer.sendTransaction({
        to: toTrimmed === "" ? undefined : toTrimmed,
        data: dataToUse,
        value: valueBN
      });
      const link = `${url}/tx/${tx.hash}`;
      setCreateTx({ link, status: "pending" });
      const receipt = await tx.wait();
      setCreateTx({
        link,
        status: receipt?.status === 1 ? "success" : "failed"
      });
      if (receipt?.status === 1) toast.success("Transaction successful");
      else toast.error("Transaction failed");
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
        setCreateTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.reason ?? e?.message ?? "Error");
        setCreateTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
    } finally {
      setIsCreating(false);
    }
  };

  /** Replace/cancel a stuck tx: self-transfer 0 ETH with the same nonce (use higher gas in the wallet if needed). */
  const cancelTxHandler = async () => {
    if (!currentAccount) {
      toast.error("Connect wallet");
      return;
    }
    const nonceParsed = parseNonceInput(nonceTx);
    if (nonceParsed === "empty" || nonceParsed === "invalid") {
      toast.error("Set the nonce of the pending transaction to cancel");
      return;
    }

    setAdvTx(null);
    setIsAdvBusy(true);
    try {
      const signer = await getSigner();
      if (!signer) return;
      const url = await getScanURL();
      const tx = await signer.sendTransaction({
        to: currentAccount,
        data: "0x",
        value: 0n,
        nonce: nonceParsed
      });
      const link = `${url}/tx/${tx.hash}`;
      setAdvTx({ link, status: "pending" });
      const receipt = await tx.wait();
      setAdvTx({
        link,
        status: receipt?.status === 1 ? "success" : "failed"
      });
      if (receipt?.status === 1) {
        toast.success("Cancelled transaction");
        void refreshPendingNonce(currentAccount);
      } else toast.error("Transaction failed");
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
        setAdvTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.reason ?? e?.message ?? "Error");
        setAdvTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
    } finally {
      setIsAdvBusy(false);
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>Create Transaction</h1>
        <p>Transfer native coin or send a raw transaction / deploy contract</p>
      </section>

      <section className="feature-panel">
        <h3>Transfer native coin</h3>
        <p className="feature-field-hint">
          Send ETH (or native token) to an address. Data can be text or hex
          (0x...); leave empty for a simple transfer. To can also be an array
          (JSON like [0x..,0x..] or comma/newline separated). When multiple
          addresses are provided, it will batch transfer via Multicall3 and
          treat Value as per-recipient amount.
        </p>
        <div className="feature-field">
          <label htmlFor="create-to">To</label>
          <textarea
            id="create-to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={PLACEHOLDER_ADDRESS}
            className="estimate-address-input"
            rows={2}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="create-amount">Value (ETH)</label>
          <input
            id="create-amount"
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="create-input-data">
            Data (optional, text or 0x hex)
          </label>
          <textarea
            id="create-input-data"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="e.g. message or 0x..."
            rows={3}
            spellCheck={false}
          />
        </div>
        <div className="feature-actions feature-actions--inline">
          <button
            type="button"
            onClick={transferNativeHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || isTransferring}
          >
            {isTransferring ? "Sending…" : "Transfer"}
          </button>
          {transferTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${transferTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${transferTx.status}`}
              >
                {transferTx.status === "pending" && "Pending"}
                {transferTx.status === "success" && "Success"}
                {transferTx.status === "failed" && "Failed"}
                {transferTx.status === "rejected" && "Rejected"}
              </span>
              {transferTx.link && (
                <a
                  href={transferTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={transferTx.link.split("/").pop() ?? ""}
                >
                  {truncateHash(transferTx.link.split("/").pop() ?? "")}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="feature-panel">
        <h3>Create transaction / Deploy contract</h3>
        <p className="feature-field-hint">
          Raw transaction with hex data. Leave To empty for contract deploy.
          Nonce is chosen by the wallet.
        </p>
        <div className="feature-field">
          <label htmlFor="create-tx-to">To (optional for deploy)</label>
          <input
            id="create-tx-to"
            type="text"
            value={toTx}
            onChange={(e) => setToTx(e.target.value)}
            placeholder={PLACEHOLDER_ADDRESS}
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="create-tx-value">Value (ETH)</label>
          <input
            id="create-tx-value"
            type="text"
            value={valueTx}
            onChange={(e) => setValueTx(e.target.value)}
            placeholder="0"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="create-tx-data">
            Data (hex, e.g. 0x or contract bytecode)
          </label>
          <textarea
            id="create-tx-data"
            value={dataTx}
            onChange={(e) => setDataTx(e.target.value)}
            placeholder="0x"
            rows={4}
            spellCheck={false}
          />
        </div>
        <div className="feature-actions feature-actions--inline">
          <button
            type="button"
            onClick={createTxHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || isCreating}
          >
            {isCreating ? "Sending…" : "Create transaction"}
          </button>
          {createTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${createTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${createTx.status}`}
              >
                {createTx.status === "pending" && "Pending"}
                {createTx.status === "success" && "Success"}
                {createTx.status === "failed" && "Failed"}
                {createTx.status === "rejected" && "Rejected"}
              </span>
              {createTx.link && (
                <a
                  href={createTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={createTx.link.split("/").pop() ?? ""}
                >
                  {truncateHash(createTx.link.split("/").pop() ?? "")}
                </a>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="feature-panel">
        <h3>Cancel pending</h3>
        <p className="feature-field-hint">
          Paste the pending or stuck transaction hash and load its nonce, or set
          nonce manually. Refresh fills next nonce from chain head (
          <code>latest</code>). Cancel sends 0 ETH to yourself with this nonce
          to replace—raise gas in the wallet if needed.
        </p>
        <div className="feature-field">
          <label htmlFor="adv-cancel-tx-hash">Transaction hash</label>
          <div className="feature-actions feature-actions--inline">
            <input
              id="adv-cancel-tx-hash"
              type="text"
              value={cancelTxHash}
              onChange={(e) => setCancelTxHash(e.target.value)}
              placeholder="0x…"
              spellCheck={false}
              autoComplete="off"
              className="estimate-address-input"
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              type="button"
              className="cta-button mint-nft-button"
              disabled={isAdvBusy || isFetchingNonceFromHash}
              onClick={() => void fetchNonceFromTxHash()}
            >
              {isFetchingNonceFromHash ? "Loading…" : "Load nonce"}
            </button>
          </div>
        </div>
        <div className="feature-field">
          <label htmlFor="adv-tx-nonce">Nonce</label>
          <div className="feature-actions feature-actions--inline">
            <input
              id="adv-tx-nonce"
              type="text"
              inputMode="numeric"
              value={nonceTx}
              onChange={(e) => setNonceTx(e.target.value)}
              placeholder="latest chain head"
              spellCheck={false}
              autoComplete="off"
              className="estimate-address-input"
              style={{ flex: 1, minWidth: 0 }}
            />
            <button
              type="button"
              className="cta-button mint-nft-button"
              disabled={!currentAccount || isAdvBusy || isFetchingNonceFromHash}
              onClick={() => void refreshPendingNonce(currentAccount)}
            >
              Refresh
            </button>
          </div>
        </div>
        <div className="feature-actions feature-actions--inline">
          <button
            type="button"
            onClick={cancelTxHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || isAdvBusy || isFetchingNonceFromHash}
            title="0 ETH self-transfer with this nonce"
          >
            {isAdvBusy ? "Sending…" : "Cancel transaction"}
          </button>
          {advTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${advTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${advTx.status}`}
              >
                {advTx.status === "pending" && "Pending"}
                {advTx.status === "success" && "Success"}
                {advTx.status === "failed" && "Failed"}
                {advTx.status === "rejected" && "Rejected"}
              </span>
              {advTx.link && (
                <a
                  href={advTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={advTx.link.split("/").pop() ?? ""}
                >
                  {truncateHash(advTx.link.split("/").pop() ?? "")}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CreateTransactionPage;
