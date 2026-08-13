import { useEffect, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { parseEvmChainIdFromStored } from "@/lib/wallet/GetProvider";
import { useOpenAppKitModal } from "@/hooks/useOpenAppKitModal";
import { hasValidSessionToken } from "@/lib/wallet/sessionToken";
import {
  createAuthorization,
  createEIP7702Account,
  getDelegationAddress
} from "@/lib/evm/EIP7702Utils";
import { EIP7702Delegator_Metamask } from "@/config/SystemConfiguration";
import { SupportChains } from "@/config/ChainsConfig";
import { JsonRpcProvider, Wallet, ZeroAddress } from "ethers";
import { withCustomGasPrice } from "@/lib/evm/GasStrategy";
import { getScanURL } from "@/lib/shared/Utils";
import { relayEIP7702 } from "@/services/AuthApi";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

/** Reuse one JsonRpcProvider per chain on this page (staticNetwork = no probe). */
const chainJsonRpcProviders = new Map<number, JsonRpcProvider>();

const EIP7702Page = () => {
  const { t } = useI18n();
  const { address, isConnected } = useAppKitAccount();
  const { chainId: appKitChainId } = useAppKitNetwork();
  const { isConnecting, openConnectModal } = useOpenAppKitModal();
  const [privateKey, setPrivateKey] = useState("");
  const [sponsorGas, setSponsorGas] = useState(true);
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
   * Resolve the target chain without any RPC: prefer the connected wallet's
   * chain (AppKit state), fall back to the stored chain id, then mainnet.
   */
  const resolveChainId = (): number | null => {
    const fromAppKit = parseEvmChainIdFromStored(String(appKitChainId ?? ""));
    if (fromAppKit !== null) return fromAppKit;
    return parseEvmChainIdFromStored(localStorage.getItem("chainId")) ?? 1;
  };

  /** Cached JSON-RPC provider from the project's own ChainsConfig RPC list. */
  const getChainJsonRpcProvider = (chainId: number): JsonRpcProvider | null => {
    const cached = chainJsonRpcProviders.get(chainId);
    if (cached) return cached;
    const chain = SupportChains.find((c) => Number(c.id) === chainId);
    const rpc = chain?.rpcUrls?.[0];
    if (!rpc) return null;
    const provider = new JsonRpcProvider(rpc, chainId, {
      staticNetwork: true
    });
    chainJsonRpcProviders.set(chainId, provider);
    return provider;
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
  }, [privateKey, appKitChainId]);

  /** Send the actual type-4 authorization transaction. */
  const executeCreate = async (
    pk: string,
    chainId: number,
    delegator: string,
    isUpdate: boolean,
    sponsored: boolean
  ) => {
    setIsCreating(true);
    try {
      const url = await getScanURL();
      const provider = getChainJsonRpcProvider(chainId);
      if (!provider) {
        toast.error(t("common.unsupportedChain"));
        return;
      }
      const pkWallet = withCustomGasPrice(new Wallet(pk, provider), chainId);
      const pkAddress = await pkWallet.getAddress();

      // EIP-7702: the authorization nonce must equal `authority`'s nonce at
      // check time. The tx sender's nonce is incremented BEFORE authorizations
      // are processed, so:
      //  - not sponsored (pk account sends): nonce = pk nonce + 1
      //  - sponsored (connected wallet sends): pk nonce untouched → nonce = pk nonce
      const pkNonce = await pkWallet.getNonce();
      const auth = await createAuthorization(
        pkWallet,
        sponsored ? pkNonce : pkNonce + 1,
        delegator
      );

      let hash: string;
      if (sponsored) {
        // Server-side relay: the pk wallet only signs the authorization; the
        // backend broadcasts the type-4 tx and pays the gas.
        const authLike = auth as {
          chainId: number;
          address: string;
          nonce: number;
          signature: { r: string; s: string; yParity: number | string };
        };
        const relayed = await relayEIP7702(chainId, pkAddress, [
          {
            chainId: Number(authLike.chainId),
            address: authLike.address,
            nonce: Number(authLike.nonce),
            yParity: Number(authLike.signature.yParity),
            r: authLike.signature.r,
            s: authLike.signature.s
          }
        ]);
        hash = relayed.txHash;
      } else {
        // Pass the already-fetched nonce so sendTransaction skips its own
        // eth_getTransactionCount call.
        hash = await createEIP7702Account(pkWallet, auth, undefined, pkNonce);
      }

      const txUrl = `${url}/tx/${hash}`;
      setTxLink(txUrl);
      setTxStatus("pending");
      // Cap the wait so a stuck pending tx does not poll eth_blockNumber /
      // eth_getTransactionReceipt forever (ethers polls every ~4s otherwise).
      let txReceipt: Awaited<ReturnType<typeof provider.waitForTransaction>>;
      try {
        txReceipt = await provider.waitForTransaction(hash, 1, 120_000);
      } catch {
        toast.error(t("eip7702.txTimeout"));
        setTxStatus("failed");
        return;
      }
      if (txReceipt?.status === 1) {
        toast.success(
          isUpdate ? t("eip7702.updateSuccess") : t("eip7702.createSuccess"),
          {
            action: {
              label: t("common.viewTransaction"),
              onClick: () => window.open(txUrl, "_blank", "noopener,noreferrer")
            }
          }
        );
        setDelegationStatus({ state: "delegated", address: delegator });
        setTxStatus("success");
      } else {
        toast.error(t("common.txFailed"));
        setTxStatus("failed");
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

      await executeCreate(
        pk,
        chainId,
        delegator,
        delegationStatus.state === "delegated",
        sponsorGas
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
      const pkWallet = withCustomGasPrice(new Wallet(pk, provider), chainId);
      const pkAddress = await pkWallet.getAddress();
      const currentDelegation = await getDelegationAddress(pkWallet);
      if (currentDelegation === null) {
        toast.error(t("eip7702.notAccount"));
        return;
      }

      // Same nonce rule as create: sponsored → pk's current nonce, else +1.
      const pkNonce = await pkWallet.getNonce();
      const revokeAuth = await createAuthorization(
        pkWallet,
        sponsorGas ? pkNonce : pkNonce + 1,
        ZeroAddress
      );

      let hash: string;
      if (sponsorGas) {
        const authLike = revokeAuth as {
          chainId: number;
          address: string;
          nonce: number;
          signature: { r: string; s: string; yParity: number | string };
        };
        const relayed = await relayEIP7702(chainId, pkAddress, [
          {
            chainId: Number(authLike.chainId),
            address: authLike.address,
            nonce: Number(authLike.nonce),
            yParity: Number(authLike.signature.yParity),
            r: authLike.signature.r,
            s: authLike.signature.s
          }
        ]);
        hash = relayed.txHash;
      } else {
        hash = await createEIP7702Account(
          pkWallet,
          revokeAuth,
          undefined,
          pkNonce
        );
      }

      const txUrl = `${url}/tx/${hash}`;
      setTxLink(txUrl);
      setTxStatus("pending");
      // Cap the wait so a stuck pending tx does not poll forever.
      let txReceipt: Awaited<ReturnType<typeof provider.waitForTransaction>>;
      try {
        txReceipt = await provider.waitForTransaction(hash, 1, 120_000);
      } catch {
        toast.error(t("eip7702.txTimeout"));
        setTxStatus("failed");
        return;
      }
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
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    } finally {
      setIsRevoking(false);
    }
  };

  const shortAddress = (addr: string) =>
    addr.length > 14 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;

  /** Logged in = wallet connected and a valid (per-address) token exists. */
  const loggedIn = isConnected && !!address && hasValidSessionToken(address);

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
        <div className="eip7702-sponsor">
          <label className="eip7702-sponsor-toggle">
            <input
              type="checkbox"
              checked={sponsorGas}
              onChange={(e) => setSponsorGas(e.target.checked)}
            />
            <span>{t("eip7702.sponsorGas")}</span>
          </label>
          {sponsorGas ? (
            <p className="eip7702-sponsor-hint">
              {t("eip7702.sponsorGasHint")}
            </p>
          ) : (
            <p className="eip7702-sponsor-hint">
              {t("eip7702.sponsorOffHint")}
            </p>
          )}
          {sponsorGas && !loggedIn && (
            <div className="eip7702-login">
              <p className="eip7702-sponsor-hint">{t("eip7702.needLogin")}</p>
              <button
                type="button"
                onClick={() => void openConnectModal()}
                className={
                  "cta-button eip7702-btn-create" +
                  (isConnecting ? " is-loading" : "")
                }
                disabled={isConnecting}
              >
                {isConnecting
                  ? t("common.processing")
                  : t("eip7702.loginToSponsor")}
              </button>
            </div>
          )}
          {sponsorGas && loggedIn && address && (
            <p className="eip7702-sponsor-hint">
              {t("eip7702.loggedInAs")}: {shortAddress(address)}
            </p>
          )}
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
            className={
              "cta-button eip7702-btn-create" +
              (isCreating ? " is-loading" : "")
            }
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
              className={
                "cta-button eip7702-btn-revoke" +
                (isRevoking ? " is-loading" : "")
              }
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
