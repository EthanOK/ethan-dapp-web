import { useEffect, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import {
  getEip1193Provider,
  parseEvmChainIdFromStored
} from "@/lib/wallet/GetProvider";
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

/** ERC-5792 batch capability key exposed by wallet_getCapabilities. */
const BATCH_TXN_5792 = "atomic";
/** Chainlist RPC/explorer registry used to resolve explorers for unknown chains. */
const CHAINLIST_INFO_API = "https://chainlist.org/rpcs.json";

/**
 * wallet_getCapabilities returns an object keyed by CAIP-2 chain id
 * ("eip155:1"), hex ("0x1") or decimal ("1") depending on wallet version.
 * Resolve the entry for a target chain id (hex string from eth_chainId).
 */
const findCapabilitiesEntry = (
  caps: Record<string, Record<string, unknown>> | undefined,
  chainIdHex: string
): Record<string, unknown> | null => {
  if (!caps) return null;
  const chainId = parseEvmChainIdFromStored(chainIdHex);
  // 1) exact key match
  if (caps[chainIdHex]) return caps[chainIdHex];
  // 2) numeric / CAIP-2 normalized match
  const candidates = [
    String(chainId),
    `eip155:${chainId}`,
    `0x${Number(chainId).toString(16)}`
  ];
  for (const key of Object.keys(caps)) {
    const normalized = key.replace(/^eip155:/, "").toLowerCase();
    if (candidates.map((c) => c.toLowerCase()).includes(normalized)) {
      return caps[key];
    }
    if (normalized === chainIdHex.toLowerCase().replace(/^0x/, "")) {
      return caps[key];
    }
  }
  // 3) fall back to the first entry if exactly one exists
  const keys = Object.keys(caps);
  if (keys.length === 1) return caps[keys[0]];
  return null;
};

/**
 * Parse the EIP-7702 delegation target from account code.
 *
 * A delegated EOA's code is `0xef0100 || address` (3-byte magic + 20-byte
 * target). Any other non-empty code (e.g. a regular contract) is NOT an
 * EIP-7702 delegation, so it must not be reported as one.
 */
const parseEIP7702Delegation = (code: string): string | null => {
  const DELEGATION_MAGIC = "0xef0100";
  if (!code.startsWith(DELEGATION_MAGIC)) return null;
  const target = code.slice(DELEGATION_MAGIC.length);
  return target.length === 40 ? `0x${target}` : null;
};

/**
 * Extract the most useful message from a wallet RPC error. ethers can nest the
 * real error under `error.error` / `error.data`, and MetaMask may return a
 * top-level `{ code, message }` — walk the chain until a readable message is
 * found.
 */
const extractRpcErrorMessage = (error: unknown): string => {
  let current: unknown = error;
  const seen = new Set<unknown>();
  while (current != null && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const record = current as Record<string, unknown>;
    // ethers wraps the provider error as { error: { message } } /
    // { data: { message } } — prefer the nested message over the outer
    // "could not coalesce error" wrapper.
    const nested = record.error ?? record.data ?? record.info;
    if (nested != null && typeof nested === "object") {
      const nestedRecord = nested as Record<string, unknown>;
      if (
        typeof nestedRecord.message === "string" &&
        nestedRecord.message.trim()
      ) {
        return nestedRecord.message.trim();
      }
      // Nested object exists but has no message of its own (e.g. MetaMask
      // 4001's data = { location, cause }) — fall back to the current layer's
      // message instead of descending into a dead end.
      if (typeof record.message === "string" && record.message.trim()) {
        return record.message.trim();
      }
      current = nested;
      continue;
    }
    if (typeof record.message === "string" && record.message.trim()) {
      return record.message.trim();
    }
    break;
  }
  return "";
};

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

  // ---- EIP-7702 / ERC-5792 readiness state ----
  const [readiness, setReadiness] = useState<{
    checking: boolean;
    chainIdHex: string;
    chainName: string;
    capabilities: string[];
    /** EIP-7702 delegation target (parsed from 0xef0100 || address), null if none. */
    delegation: string | null;
    supportAtomic: boolean;
  }>({
    checking: false,
    chainIdHex: "",
    chainName: "",
    capabilities: [],
    delegation: null,
    supportAtomic: false
  });
  const [batchTxs, setBatchTxs] = useState([
    { to: "0xdC659bF818f5Bc99DC672C746850e2BEBbA7D87d", value: "0" },
    { to: "0x72DAcE9babA0561934a00F012ea2Df5082cd9052", value: "0" }
  ]);
  const [processingTxn, setProcessingTxn] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");

  /** 连接或切链后重新检测 ERC-5792 能力(app-network-changed 由头部切链触发)。 */
  useEffect(() => {
    if (!isConnected || !address) {
      setReadiness({
        checking: false,
        chainIdHex: "",
        chainName: "",
        capabilities: [],
        delegation: null,
        supportAtomic: false
      });
      setExplorerUrl("");
      return;
    }

    let cancelled = false;
    const runCheck = async () => {
      try {
        const provider = await getEip1193Provider();
        if (!provider || cancelled) return;
        // Raw EIP-1193 request — no ethers BrowserProvider, so no cached-
        // network NETWORK_ERROR after a wallet chain switch.
        const currChainId = (await provider.request({
          method: "eth_chainId"
        })) as string;
        setReadiness((prev) => ({ ...prev, checking: true }));
        const currCapabilities = (await provider.request({
          method: "wallet_getCapabilities",
          params: [address, [currChainId]]
        })) as Record<string, Record<string, unknown>> | undefined;
        const eoaCode = (await provider.request({
          method: "eth_getCode",
          params: [address, "latest"]
        })) as string;
        if (cancelled) return;

        const chainEntry = SupportChains.find(
          (c) => Number(c.id) === Number(currChainId)
        );
        const entry = findCapabilitiesEntry(currCapabilities, currChainId);
        const keys = entry ? Object.keys(entry) : [];
        setReadiness({
          checking: false,
          chainIdHex: currChainId,
          chainName: chainEntry?.chainName ?? "",
          capabilities: keys.length > 0 ? keys : ["None"],
          delegation: parseEIP7702Delegation(eoaCode),
          supportAtomic: keys.includes(BATCH_TXN_5792)
        });
      } catch (error) {
        if (!cancelled) {
          console.error("Readiness check failed:", error);
          setReadiness((prev) => ({ ...prev, checking: false }));
        }
      }
    };

    runCheck();
    window.addEventListener("app-network-changed", runCheck);
    return () => {
      cancelled = true;
      window.removeEventListener("app-network-changed", runCheck);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

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

  const shortHash = (hash: string) =>
    hash.length > 18 ? `${hash.slice(0, 10)}…${hash.slice(-8)}` : hash;

  /** Explorer URL for a tx hash, or "" if unknown chain. */
  const explorerUrlForToast = (hash: string): string => {
    const base = SupportChains.find(
      (c) => Number(c.id) === Number(readiness.chainIdHex)
    )?.blockExplorerUrls?.[0];
    return base && hash ? `${base.replace(/\/$/, "")}/tx/${hash}` : "";
  };

  /** Resolve block explorer base URL for a chain id (hex string). */
  const resolveExplorerBase = async (chainIdHex: string): Promise<string> => {
    const chainId = Number(chainIdHex);
    const chainEntry = SupportChains.find((c) => Number(c.id) === chainId);
    if (chainEntry?.blockExplorerUrls?.[0]) {
      return chainEntry.blockExplorerUrls[0].replace(/\/$/, "");
    }
    try {
      const chainListData = await fetch(CHAINLIST_INFO_API);
      const chainListJson: unknown[] = await chainListData.json();
      const chainInfo = (
        chainListJson as Array<{
          chainId: number | string;
          explorers?: Array<{ url?: string }>;
        }>
      ).find((c) => Number(c.chainId) === chainId);
      return chainInfo?.explorers?.[0]?.url?.replace(/\/$/, "") ?? "";
    } catch {
      return "";
    }
  };

  /** ERC-5792: submit a batch of two calls and poll wallet_getCallsStatus. */
  const handleSendCalls = async () => {
    const provider = await getEip1193Provider();
    if (!provider || !address) {
      toast.error(t("common.connectWallet"));
      return;
    }
    // Validate the two wei values (hex string without 0x, like the reference dapp).
    for (const item of batchTxs) {
      const v = item.value.trim().replace(/^0x/i, "");
      if (v !== "" && !/^[0-9a-fA-F]+$/.test(v)) {
        toast.error(t("eip7702.readinessInvalidHex"));
        return;
      }
    }
    setExplorerUrl("");
    setTxHash("");
    setProcessingTxn(true);
    setBatchId("");
    setExplorerUrl("");
    try {
      const sendParams = {
        version: "2.0.0",
        chainId: readiness.chainIdHex,
        from: address,
        atomicRequired: readiness.supportAtomic,
        calls: batchTxs.map((item) => ({
          to: item.to,
          value: `0x${item.value.trim().replace(/^0x/i, "")}`
        }))
      };
      const res = (await provider.request({
        method: "wallet_sendCalls",
        params: [sendParams]
      })) as { id: string };
      setBatchId(res.id);

      // Some MetaMask builds return the full status (status: 200 + receipts)
      // synchronously from wallet_sendCalls — treat that as already confirmed.
      const early = res as unknown as {
        status?: string | number;
        receipts?: Array<{ transactionHash?: string }>;
      };
      if (early.receipts?.[0]?.transactionHash) {
        const base = await resolveExplorerBase(readiness.chainIdHex);
        const txnHash = early.receipts[0].transactionHash;
        setTxHash(txnHash);
        if (base) setExplorerUrl(`${base}/tx/${txnHash}`);
        const eoaCode = (await provider.request({
          method: "eth_getCode",
          params: [address, "latest"]
        })) as string;
        setReadiness((prev) => ({
          ...prev,
          delegation: parseEIP7702Delegation(eoaCode)
        }));
        const txUrl0 = explorerUrlForToast(txnHash);
        toast.success(
          t("eip7702.readinessSuccessTx", { hash: shortHash(txnHash) }),
          {
            ...(txUrl0
              ? {
                  action: {
                    label: t("common.viewTransaction"),
                    onClick: () =>
                      window.open(txUrl0, "_blank", "noopener,noreferrer")
                  }
                }
              : {})
          }
        );
        setProcessingTxn(false);
        return;
      }

      let polls = 0;
      const MAX_POLLS = 60;
      const int = setInterval(async () => {
        try {
          polls += 1;
          const status = (await provider.request({
            method: "wallet_getCallsStatus",
            params: [res.id]
          })) as {
            status: string | number;
            receipts?: Array<{ transactionHash?: string }>;
          };
          const s = String(status.status).toLowerCase();
          const hasReceipt = !!status.receipts?.[0]?.transactionHash;
          // MetaMask may report a status value we do not recognise while the
          // receipt is already present — treat a receipt as confirmation too.
          if (s === "0x2" || s === "confirmed" || hasReceipt) {
            // Batch confirmed → refresh smart-account state and build explorer link.
            const base = await resolveExplorerBase(readiness.chainIdHex);
            const txnHash = status.receipts?.[0]?.transactionHash;
            if (txnHash) {
              setTxHash(txnHash);
              if (base) {
                setExplorerUrl(`${base}/tx/${txnHash}`);
              }
            }
            const eoaCode = (await provider.request({
              method: "eth_getCode",
              params: [address, "latest"]
            })) as string;
            setReadiness((prev) => ({
              ...prev,
              delegation: parseEIP7702Delegation(eoaCode)
            }));
            const txUrl = explorerUrlForToast(txnHash ?? "");
            toast.success(
              txnHash
                ? t("eip7702.readinessSuccessTx", {
                    hash: shortHash(txnHash)
                  })
                : t("eip7702.readinessSuccess"),
              {
                ...(txUrl
                  ? {
                      action: {
                        label: t("common.viewTransaction"),
                        onClick: () =>
                          window.open(txUrl, "_blank", "noopener,noreferrer")
                      }
                    }
                  : {})
              }
            );
            clearInterval(int);
            setProcessingTxn(false);
          } else if (s === "0x3" || s === "failed") {
            toast.error(t("common.txFailed"));
            clearInterval(int);
            setProcessingTxn(false);
          } else if (polls >= MAX_POLLS) {
            // Stop polling after ~60s even if the wallet never reports a
            // terminal status; the batch may still be pending onchain.
            clearInterval(int);
            setProcessingTxn(false);
          }
          // 0x1 / pending → keep polling
        } catch (error) {
          console.error(error);
          clearInterval(int);
          setProcessingTxn(false);
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      // Show the wallet's raw message (e.g. "MetaMask Tx Signature: User
      // denied transaction signature.") so the user sees exactly why it failed.
      toast.error(extractRpcErrorMessage(error) || t("common.failedGeneric"));
      setProcessingTxn(false);
    }
  };

  const handleBatchInputChange = (
    index: number,
    key: "to" | "value",
    v: string
  ) => {
    setBatchTxs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: v } : item))
    );
  };

  const handleAddBatchRow = () => {
    setBatchTxs((prev) => [...prev, { to: "", value: "0" }]);
  };

  const handleRemoveBatchRow = (index: number) => {
    setBatchTxs((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

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

      {/* ===== EIP-5792 Readiness (reference: 7702-Readiness dapp) ===== */}
      <section className="feature-hero eip5792-hero">
        <h1>{t("eip7702.readinessSection")}</h1>
        <p>{t("eip7702.readinessHint")}</p>
      </section>
      <section className="feature-panel eip7702-panel">
        {!isConnected || !address ? (
          <div className="eip7702-login">
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
                : t("eip7702.readinessConnect")}
            </button>
          </div>
        ) : (
          <>
            <div className="eip7702-readiness-info">
              <div className="eip7702-readiness-row">
                <span className="eip7702-readiness-label">
                  {t("eip7702.readinessColAccount")}
                </span>
                <span className="eip7702-readiness-value" title={address}>
                  {shortAddress(address)}
                </span>
              </div>
              <div className="eip7702-readiness-row">
                <span className="eip7702-readiness-label">
                  {t("eip7702.readinessColSmart")}
                </span>
                <span className="eip7702-readiness-value">
                  {readiness.checking
                    ? t("eip7702.readinessChecking")
                    : readiness.delegation
                      ? `${t("eip7702.readinessYes")} (${shortAddress(
                          readiness.delegation
                        )})`
                      : t("eip7702.readinessNo")}
                </span>
              </div>
              <div className="eip7702-readiness-row">
                <span className="eip7702-readiness-label">
                  {t("eip7702.readinessColChain")}
                </span>
                <span className="eip7702-readiness-value">
                  {readiness.checking
                    ? t("eip7702.readinessChecking")
                    : `${Number(readiness.chainIdHex) || ""} - ${readiness.chainName}`}
                </span>
              </div>
              <div className="eip7702-readiness-row">
                <span className="eip7702-readiness-label">
                  {t("eip7702.readinessColCaps")}
                </span>
                <span className="eip7702-readiness-value eip7702-readiness-caps">
                  {readiness.checking
                    ? t("eip7702.readinessChecking")
                    : readiness.capabilities.length > 0
                      ? readiness.capabilities.join(", ")
                      : t("eip7702.readinessNone")}
                </span>
              </div>
            </div>

            <div className="eip7702-readiness-body">
              {!readiness.checking && !readiness.supportAtomic && (
                <p className="eip7702-sponsor-hint">
                  {t("eip7702.readinessUnsupported")}
                </p>
              )}
              {!readiness.checking && (
                <>
                  <h4 className="eip7702-readiness-batch-title">
                    {t("eip7702.readinessBatchTitle")}
                  </h4>
                  <div className="eip7702-batch-table">
                    <div className="eip7702-batch-head">
                      <span>{t("eip7702.readinessTxnNo")}</span>
                      <span></span>
                      <span>{t("eip7702.readinessValue")}</span>
                      <span></span>
                      <span>{t("eip7702.readinessAddress")}</span>
                      <span></span>
                    </div>
                    {batchTxs.map((item, index) => (
                      <div className="eip7702-batch-row" key={index}>
                        <span>{index + 1}.</span>
                        <span>{t("eip7702.readinessSend")}</span>
                        <input
                          className="eip7702-batch-input eip7702-batch-value"
                          type="text"
                          value={item.value}
                          onChange={(e) =>
                            handleBatchInputChange(
                              index,
                              "value",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          spellCheck={false}
                        />
                        <span>{t("eip7702.readinessTo")}</span>
                        <input
                          className="eip7702-batch-input eip7702-batch-address"
                          type="text"
                          value={item.to}
                          onChange={(e) =>
                            handleBatchInputChange(index, "to", e.target.value)
                          }
                          placeholder="0x..."
                          spellCheck={false}
                        />
                        <button
                          type="button"
                          className="eip7702-batch-remove"
                          onClick={() => handleRemoveBatchRow(index)}
                          disabled={batchTxs.length <= 1}
                          aria-label={t("eip7702.readinessRemoveRow")}
                          title={t("eip7702.readinessRemoveRow")}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="eip7702-batch-actions">
                    <div className="eip7702-batch-actions-top">
                      <button
                        type="button"
                        className="eip7702-batch-add"
                        onClick={handleAddBatchRow}
                      >
                        {t("eip7702.readinessAddRow")}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleSendCalls()}
                      className={
                        "cta-button eip7702-btn-create" +
                        (processingTxn ? " is-loading" : "")
                      }
                      disabled={processingTxn}
                    >
                      {processingTxn && (
                        <span className="eip7702-spinner" aria-hidden />
                      )}
                      {t("eip7702.readinessSendBatchCount", {
                        count: String(batchTxs.length)
                      })}
                    </button>
                    {batchId && (
                      <div className="eip7702-batch-id" title={batchId}>
                        {t("eip7702.readinessBatchId")}:{" "}
                        <span className="eip7702-batch-id-value">
                          {batchId.length > 30
                            ? `${batchId.slice(0, 14)}…${batchId.slice(-8)}`
                            : batchId}
                        </span>
                      </div>
                    )}
                    {processingTxn && (
                      <progress
                        className="eip7702-batch-bar"
                        id="progress-bar"
                      />
                    )}
                    {txHash && (
                      <div className="eip7702-tx">
                        <div className="eip7702-tx-head">
                          <span className="eip7702-tx-label">
                            {t("eip7702.lastTransaction")}
                          </span>
                          <span className="eip7702-tx-status is-success">
                            {t("eip7702.readinessSuccess")}
                          </span>
                        </div>
                        {explorerUrl ? (
                          <a
                            className="eip7702-tx-hash"
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={txHash}
                          >
                            {txHash.length > 24
                              ? `${txHash.slice(0, 12)}…${txHash.slice(-12)}`
                              : txHash}
                          </a>
                        ) : (
                          <span className="eip7702-tx-hash" title={txHash}>
                            {txHash.length > 24
                              ? `${txHash.slice(0, 12)}…${txHash.slice(-12)}`
                              : txHash}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default EIP7702Page;
