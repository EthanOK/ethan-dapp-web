import { useEffect, useState } from "react";
import {
  getChainId,
  parseEvmChainIdFromStored
} from "@/lib/wallet/GetProvider";
import {
  createAuthorization,
  createEIP7702Account,
  getDelegationAddress,
  revokeEIP7702Account
} from "@/lib/evm/EIP7702Utils";
import { EIP7702Delegator_Metamask } from "@/config/SystemConfiguration";
import { SupportChains } from "@/config/ChainsConfig";
import { JsonRpcProvider, Wallet } from "ethers";
import { withCustomGasPrice } from "@/lib/evm/GasStrategy";
import { getScanURL } from "@/lib/shared/Utils";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

const EIP7702Page = () => {
  const { t } = useI18n();
  const [privateKey, setPrivateKey] = useState("");
  const [delegationAddress, setDelegationAddress] = useState(
    EIP7702Delegator_Metamask
  );
  const [txLink, setTxLink] = useState("");
  const [txStatus, setTxStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [delegationStatus, setDelegationStatus] = useState<{
    state: "idle" | "checking" | "none" | "delegated";
    address?: string;
  }>({ state: "idle" });

  /**
   * Resolve the target chain. Prefers the connected wallet's chain; falls back
   * to the stored chain id, then defaults to Ethereum mainnet. This lets the
   * page work without a connected wallet (signing is done with the input key).
   */
  const resolveChainId = async (): Promise<number | null> => {
    const fromWallet = await getChainId();
    if (fromWallet !== null) return fromWallet;
    return parseEvmChainIdFromStored(localStorage.getItem("chainId")) ?? 1;
  };

  /** JSON-RPC provider from the project's own ChainsConfig RPC list. */
  const getChainJsonRpcProvider = (chainId: number): JsonRpcProvider | null => {
    const chain = SupportChains.find((c) => Number(c.id) === chainId);
    const rpc = chain?.rpcUrls?.[0];
    if (!rpc) return null;
    return new JsonRpcProvider(rpc, chainId);
  };

  /** Accept private keys with or without the 0x prefix; returns null if invalid. */
  const normalizePrivateKey = (raw: string): string | null => {
    const s = raw.trim();
    if (/^0x[0-9a-fA-F]{64}$/.test(s)) return s.toLowerCase();
    if (/^[0-9a-fA-F]{64}$/.test(s)) return `0x${s.toLowerCase()}`;
    return null;
  };

  /** Live-check the account's current on-chain delegation when the key changes. */
  useEffect(() => {
    const pk = normalizePrivateKey(privateKey);
    if (!pk) {
      setDelegationStatus({ state: "idle" });
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setDelegationStatus({ state: "checking" });
      try {
        const chainId = await resolveChainId();
        if (chainId === null) return;
        const provider = getChainJsonRpcProvider(chainId);
        if (!provider) return;
        const delegation = await getDelegationAddress(new Wallet(pk, provider));
        if (cancelled) return;
        setDelegationStatus(
          delegation === null
            ? { state: "none" }
            : { state: "delegated", address: delegation }
        );
      } catch {
        if (!cancelled) setDelegationStatus({ state: "idle" });
      }
    }, 500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateKey]);

  /** Send the actual type-4 authorization transaction. */
  const executeCreate = async (
    pk: string,
    chainId: number,
    delegator: string,
    isUpdate: boolean
  ) => {
    setIsCreating(true);
    try {
      const url = await getScanURL();
      const provider = getChainJsonRpcProvider(chainId);
      if (!provider) {
        toast.error(t("common.unsupportedChain"));
        return;
      }
      const signer = withCustomGasPrice(new Wallet(pk, provider), chainId);
      let currentNonce = await signer.getNonce();
      currentNonce++;
      const auth = await createAuthorization(signer, currentNonce, delegator);
      const hash = await createEIP7702Account(signer, auth);
      if (!hash) return;
      const txUrl = `${url}/tx/${hash}`;
      setTxLink(txUrl);
      setTxStatus("pending");
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) {
          toast.success(
            isUpdate ? t("eip7702.updateSuccess") : t("eip7702.createSuccess"),
            {
              action: {
                label: t("common.viewTransaction"),
                onClick: () =>
                  window.open(txUrl, "_blank", "noopener,noreferrer")
              }
            }
          );
          setDelegationStatus({ state: "delegated", address: delegator });
          setTxStatus("success");
        } else {
          toast.error(t("common.txFailed"));
          setTxStatus("failed");
        }
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    } finally {
      setIsCreating(false);
    }
  };

  const createEIP7702AccountHandler = async () => {
    const pk = normalizePrivateKey(privateKey);
    if (!pk) {
      toast.error(t("eip7702.enterPrivateKey"));
      return;
    }
    const delegator = delegationAddress.trim();
    if (!delegator) {
      toast.error(t("eip7702.enterDelegatorAddress"));
      return;
    }
    try {
      const chainId = await resolveChainId();
      if (chainId === null) {
        toast.error(t("error.chainIdRequired"));
        return;
      }
      const provider = getChainJsonRpcProvider(chainId);
      if (!provider) {
        toast.error(t("common.unsupportedChain"));
        return;
      }
      const signer = withCustomGasPrice(new Wallet(pk, provider), chainId);
      toast(
        delegationStatus.state === "delegated"
          ? t("eip7702.updateLog")
          : t("eip7702.createLog")
      );
      await executeCreate(
        pk,
        chainId,
        delegator,
        delegationStatus.state === "delegated"
      );
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  const revokeEIP7702AccountHandler = async () => {
    const pk = normalizePrivateKey(privateKey);
    if (!pk) {
      toast.error(t("eip7702.enterPrivateKey"));
      return;
    }
    setIsRevoking(true);
    try {
      const url = await getScanURL();
      const chainId = await resolveChainId();
      if (chainId === null) {
        toast.error(t("error.chainIdRequired"));
        return;
      }
      const provider = getChainJsonRpcProvider(chainId);
      if (!provider) {
        toast.error(t("common.unsupportedChain"));
        return;
      }
      const signer = withCustomGasPrice(new Wallet(pk, provider), chainId);
      const currentDelegation = await getDelegationAddress(signer);
      if (currentDelegation === null) {
        toast.error(t("eip7702.notAccount"));
        return;
      }
      const hash = await revokeEIP7702Account(signer);
      const txUrl = `${url}/tx/${hash}`;
      setTxLink(txUrl);
      setTxStatus("pending");
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) {
          toast.success(t("eip7702.revokeSuccess"), {
            action: {
              label: t("common.viewTransaction"),
              onClick: () => window.open(txUrl, "_blank", "noopener,noreferrer")
            }
          });
          setDelegationStatus({ state: "none" });
          setTxStatus("success");
        } else {
          toast.error(t("common.txFailed"));
          setTxStatus("failed");
        }
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    } finally {
      setIsRevoking(false);
    }
  };

  const shortAddress = (addr: string) =>
    addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

  const statusText = (() => {
    switch (delegationStatus.state) {
      case "checking":
        return t("eip7702.checking");
      case "none":
        return t("eip7702.notDelegated");
      case "delegated":
        return delegationStatus.address
          ? shortAddress(delegationStatus.address)
          : "";
      default:
        return t("eip7702.enterPkToCheck");
    }
  })();

  return (
    <div className="feature-page main-app">
      <section className="feature-hero eip7702-hero">
        <h1>{t("eip7702.title")}</h1>
        <p>{t("eip7702.subtitle")}</p>
        <span className="eip7702-shield">
          <span className="eip7702-shield-dot" aria-hidden />
          {t("eip7702.securityBadge")}
        </span>
      </section>
      <section className="feature-panel eip7702-panel">
        <h3 className="eip7702-panel-title">
          {t("eip7702.delegationSection")}
        </h3>
        <div className="feature-field">
          <label htmlFor="eip7702-pk">{t("eip7702.privateKey")}</label>
          <input
            id="eip7702-pk"
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="eip7702-delegator">
            {t("eip7702.delegatorAddress")}
          </label>
          <input
            id="eip7702-delegator"
            type="text"
            value={delegationAddress}
            onChange={(e) => setDelegationAddress(e.target.value)}
            placeholder="0x..."
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div
          className={
            "eip7702-status" +
            (delegationStatus.state === "delegated"
              ? " is-delegated"
              : " is-none")
          }
        >
          <span className="eip7702-status-label">
            {t("eip7702.currentDelegation")}
          </span>
          <span
            className="eip7702-status-value"
            title={
              delegationStatus.state === "delegated"
                ? delegationStatus.address
                : undefined
            }
          >
            {statusText}
          </span>
        </div>
        <div className="feature-actions eip7702-actions">
          <button
            type="button"
            onClick={createEIP7702AccountHandler}
            className="cta-button eip7702-btn-create"
            disabled={!privateKey.trim() || isCreating || isRevoking}
          >
            {isCreating ? (
              <>
                <span className="eip7702-spinner" aria-hidden />
                {t("common.processing")}
              </>
            ) : delegationStatus.state === "delegated" ? (
              t("eip7702.updateAccount")
            ) : (
              t("eip7702.createAccount")
            )}
          </button>
          {delegationStatus.state === "delegated" && (
            <button
              type="button"
              onClick={revokeEIP7702AccountHandler}
              className="cta-button eip7702-btn-revoke"
              disabled={!privateKey.trim() || isCreating || isRevoking}
            >
              {isRevoking ? (
                <>
                  <span className="eip7702-spinner" aria-hidden />
                  {t("common.processing")}
                </>
              ) : (
                t("eip7702.revokeAccount")
              )}
            </button>
          )}
        </div>
        {txLink && (
          <div className="eip7702-tx">
            <div className="eip7702-tx-head">
              <span className="eip7702-tx-label">
                {t("eip7702.lastTransaction")}
              </span>
              {txStatus && (
                <span className={"eip7702-tx-status is-" + txStatus}>
                  {txStatus === "pending" && (
                    <span className="eip7702-tx-dot" aria-hidden />
                  )}
                  {txStatus === "pending"
                    ? t("eip7702.txPending")
                    : txStatus === "success"
                      ? t("eip7702.txSuccess")
                      : t("eip7702.txFailed")}
                </span>
              )}
            </div>
            <a
              className="eip7702-tx-hash"
              href={txLink}
              target="_blank"
              rel="noopener noreferrer"
              title={txLink.split("/tx/")[1] ?? txLink}
            >
              {(() => {
                const h = txLink.split("/tx/")[1] ?? txLink;
                return h.length > 24 ? `${h.slice(0, 12)}…${h.slice(-12)}` : h;
              })()}
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default EIP7702Page;
