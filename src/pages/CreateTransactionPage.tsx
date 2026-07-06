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
import { useI18n } from "@/i18n";
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
  const { t } = useI18n();
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
      toast.error(t("createTx.invalidTxHash"));
      return;
    }
    setIsFetchingNonceFromHash(true);
    try {
      const provider = await resolveTxProvider();
      if (!provider) {
        toast.error(t("common.noRpcAvailable"));
        return;
      }
      const tx = await provider.getTransaction(h);
      if (!tx) {
        toast.error(t("createTx.txNotFound"));
        return;
      }
      setNonceTx(String(tx.nonce));
      if (
        currentAccount &&
        tx.from.toLowerCase() !== currentAccount.toLowerCase()
      ) {
        toast(t("createTx.senderMismatch"));
      } else {
        toast.success(t("createTx.nonceLoaded"));
      }
    } catch {
      toast.error(t("createTx.loadTxFailed"));
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
      toast.error(t("createTx.invalidTo"));
      return;
    }
    const invalid = toList.find((a) => !isAddress(a));
    if (invalid) {
      toast.error(t("createTx.invalidTo"));
      return;
    }
    const amountBN = getDecimalBigNumber(amount === "" ? "0" : amount, 18);
    const hexData = inputData.trim().startsWith("0x")
      ? inputData.trim()
      : inputData.trim() === ""
        ? undefined
        : utf8ToHexBytes(inputData);

    if (toList.length > 1 && (hexData ?? "").trim() !== "") {
      toast.error(t("createTx.batchNoData"));
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
      if (receipt?.status === 1) toast.success(t("common.txSuccessful"));
      else toast.error(t("common.txFailed"));
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
        toast(t("common.txRejected"));
        setTransferTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.reason ?? e?.message ?? t("common.error"));
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
      toast.error(t("createTx.invalidTo"));
      return;
    }
    const dataTrimmed = dataTx.trim();
    if (dataTrimmed.length > 0) {
      if (!dataTrimmed.startsWith("0x") || dataTrimmed.length % 2 !== 0) {
        toast.error(t("createTx.invalidData"));
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
      if (receipt?.status === 1) toast.success(t("common.txSuccessful"));
      else toast.error(t("common.txFailed"));
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
        toast(t("common.txRejected"));
        setCreateTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.reason ?? e?.message ?? t("common.error"));
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
      toast.error(t("createTx.connectWallet"));
      return;
    }
    const nonceParsed = parseNonceInput(nonceTx);
    if (nonceParsed === "empty" || nonceParsed === "invalid") {
      toast.error(t("createTx.setNonce"));
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
        toast.success(t("createTx.cancelled"));
        void refreshPendingNonce(currentAccount);
      } else toast.error(t("common.txFailed"));
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
        toast(t("common.txRejected"));
        setAdvTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(e?.reason ?? e?.message ?? t("common.error"));
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
        <h1>{t("createTx.title")}</h1>
        <p>{t("createTx.subtitle")}</p>
      </section>

      <section className="feature-panel">
        <h3>{t("createTx.transferSection")}</h3>
        <p className="feature-field-hint">{t("createTx.transferHint")}</p>
        <div className="feature-field">
          <label htmlFor="create-to">{t("common.to")}</label>
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
          <label htmlFor="create-amount">{t("common.valueEth")}</label>
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
            {t("createTx.dataOptional")}
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
            {isTransferring ? t("common.sending") : t("common.transfer")}
          </button>
          {transferTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${transferTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${transferTx.status}`}
              >
                {transferTx.status === "pending" && t("common.pending")}
                {transferTx.status === "success" && t("common.success")}
                {transferTx.status === "failed" && t("common.failed")}
                {transferTx.status === "rejected" && t("common.rejected")}
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
        <h3>{t("createTx.deploySection")}</h3>
        <p className="feature-field-hint">{t("createTx.deployHint")}</p>
        <div className="feature-field">
          <label htmlFor="create-tx-to">{t("createTx.toOptional")}</label>
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
          <label htmlFor="create-tx-value">{t("common.valueEth")}</label>
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
          <label htmlFor="create-tx-data">{t("createTx.dataHex")}</label>
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
            {isCreating ? t("common.sending") : t("createTx.createButton")}
          </button>
          {createTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${createTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${createTx.status}`}
              >
                {createTx.status === "pending" && t("common.pending")}
                {createTx.status === "success" && t("common.success")}
                {createTx.status === "failed" && t("common.failed")}
                {createTx.status === "rejected" && t("common.rejected")}
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
        <h3>{t("createTx.cancelSection")}</h3>
        <p className="feature-field-hint">{t("createTx.cancelHint")}</p>
        <div className="feature-field">
          <label htmlFor="adv-cancel-tx-hash">{t("common.txHash")}</label>
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
              {isFetchingNonceFromHash
                ? t("common.loading")
                : t("createTx.loadNonce")}
            </button>
          </div>
        </div>
        <div className="feature-field">
          <label htmlFor="adv-tx-nonce">{t("common.nonce")}</label>
          <div className="feature-actions feature-actions--inline">
            <input
              id="adv-tx-nonce"
              type="text"
              inputMode="numeric"
              value={nonceTx}
              onChange={(e) => setNonceTx(e.target.value)}
              placeholder={t("createTx.noncePlaceholder")}
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
              {t("common.refresh")}
            </button>
          </div>
        </div>
        <div className="feature-actions feature-actions--inline">
          <button
            type="button"
            onClick={cancelTxHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || isAdvBusy || isFetchingNonceFromHash}
            title={t("createTx.cancelTitle")}
          >
            {isAdvBusy ? t("common.sending") : t("createTx.cancelButton")}
          </button>
          {advTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${advTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${advTx.status}`}
              >
                {advTx.status === "pending" && t("common.pending")}
                {advTx.status === "success" && t("common.success")}
                {advTx.status === "failed" && t("common.failed")}
                {advTx.status === "rejected" && t("common.rejected")}
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
