import { useEffect, useRef, useState } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import {
  getEip1193Provider,
  getReadonlyProviderForChain,
  parseEvmChainIdFromStored
} from "@/lib/wallet/GetProvider";
import {
  decodeMulticallResult,
  multicall3Aggregate3StaticCall
} from "@/lib/evm/Multicall3";
import { fetchTokenBalancesMulticall } from "@/lib/swap/swapTokenMulticall";
import { tokenBalanceKey, type TokenSide } from "@/lib/swap/swapTokenRules";
import { useOpenAppKitModal } from "@/hooks/useOpenAppKitModal";
import { hasValidSessionToken } from "@/lib/wallet/sessionToken";
import {
  createAuthorization,
  createEIP7702Account,
  getDelegationAddress
} from "@/lib/evm/EIP7702Utils";
import { EIP7702Delegator_Metamask } from "@/config/SystemConfiguration";
import { SupportChains } from "@/config/ChainsConfig";
import {
  formatUnits,
  Interface,
  isAddress,
  JsonRpcProvider,
  Wallet,
  ZeroAddress
} from "ethers";
import erc20Abi from "@/abis/evm/erc20ABI.json";
import { withCustomGasPrice } from "@/lib/evm/GasStrategy";
import { getScanURL } from "@/lib/shared/Utils";
import { relayEIP7702 } from "@/services/AuthApi";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

/** ERC-5792 batch capability key exposed by wallet_getCapabilities. */
const BATCH_TXN_5792 = "atomic";
/** Chainlist RPC/explorer registry used to resolve explorers for unknown chains. */
const CHAINLIST_INFO_API = "https://chainlist.org/rpcs.json";

/** Which kind of asset a batch row is transferring. */
type TokenKind = "native" | "usdc" | "custom";

interface BatchTx {
  tokenKind: TokenKind;
  /** ERC-20 contract address (only when tokenKind !== "native"). */
  tokenAddress: string;
  /** Display unit used when parsing amount for ERC-20 rows. */
  tokenSymbol: string;
  /** Decimal places; "wei"-style integers are still allowed and skip this. */
  tokenDecimals: number;
  /**
   * Raw input. For `native` rows this MUST be a wei integer string (decimal or
   * 0x-prefixed hex); for ERC-20 rows this is a human amount that gets
   * converted via `parseAmountToWei`.
   */
  value: string;
  to: string;
}

/**
 * Canonical USDC contract addresses for chains the project actually tests on.
 * Chains not listed here disable the `usdc` option in the picker and force the
 * user to `custom` (no unverified address guesses baked into the codebase).
 */
const USDC_ADDRESSES: Record<number, string> = {
  1: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
};

/** Decimals for each USDC contract (6 for canonical Circle USDC). */
const USDC_DECIMALS = 6;
/** ethers Interface instance bound to the project's erc20ABI, for calldata encoding. */
const ERC20_IFACE = new Interface(erc20Abi);

/**
 * Parse a human-readable amount like "1.5" or "100" into a bigint scaled to
 * `decimals`. Returns `null` when the input is empty, non-numeric or has more
 * fractional digits than the token supports.
 */
const parseAmountToWei = (raw: string, decimals: number): bigint | null => {
  const s = raw.trim();
  if (!s) return null;
  if (!/^[0-9]+(\.[0-9]+)?$/.test(s)) return null;
  const [intPart, fracPart = ""] = s.split(".");
  if (fracPart.length > decimals) return null;
  const padded = (fracPart + "0".repeat(decimals)).slice(0, decimals);
  // Concatenate as a decimal string so we don't lose precision for big amounts.
  const combined = (intPart === "" ? "0" : intPart) + padded;
  if (!/^[0-9]+$/.test(combined)) return null;
  return BigInt(combined);
};

/**
 * Encode `transfer(to, amount)` calldata against an ERC-20 contract. `amount`
 * is the smallest-unit integer (already scaled to the token's decimals).
 */
const encodeErc20Transfer = (to: string, amount: bigint): string => {
  return ERC20_IFACE.encodeFunctionData("transfer", [to, amount]) as string;
};

/**
 * Resolve the (tokenKind, amountBigInt, callTo, callData, valueHex) tuple for
 * a batch row. Returns null on validation failure (toast caller decides).
 */
const buildCallForRow = (
  row: BatchTx,
  chainId: number,
  helpers: {
    usdcForChain: string | null;
    isAddressOk: (s: string) => boolean;
  }
):
  | {
      callTo: string;
      callValue: string;
      callData: string | undefined;
    }
  | { error: string } => {
  const to = row.to.trim();
  if (!helpers.isAddressOk(to)) return { error: "address" };

  if (row.tokenKind === "native") {
    // Human-readable amount: "0.1" means 0.1 native token (18 decimals for
    // every supported chain: ETH / BNB / OKB).
    const amount = parseAmountToWei(row.value, 18);
    if (amount === null) return { error: "amount" };
    return {
      callTo: to,
      callValue: `0x${amount.toString(16)}`,
      callData: undefined
    };
  }

  // ERC-20 branch.
  let tokenAddress = "";
  let decimals = 18;
  if (row.tokenKind === "usdc") {
    if (!helpers.usdcForChain) return { error: "usdcUnsupported" };
    tokenAddress = helpers.usdcForChain;
    decimals = USDC_DECIMALS;
  } else {
    tokenAddress = row.tokenAddress.trim();
    if (!helpers.isAddressOk(tokenAddress)) return { error: "token" };
    const d = Number(row.tokenDecimals);
    if (!Number.isInteger(d) || d < 0 || d > 36) return { error: "amount" };
    decimals = d;
  }

  const amount = parseAmountToWei(row.value, decimals);
  if (amount === null) return { error: "amount" };
  const data = encodeErc20Transfer(to, amount);
  return { callTo: tokenAddress, callValue: "0x0", callData: data };
};

/**
 * wallet_getCapabilities returns an object keyed by CAIP-2 chain id
 * ("eip155:1"), hex ("0x1") or decimal ("1") depending on wallet version.
 * Resolve the entry for a target chain id (hex string from eth_chainId).
 */
const findCapabilitiesEntry = (
  caps: Record<string, Record<string, unknown>> | undefined,
  chainIdHex: string
): Record<string, unknown> | null => {
  if (!caps || Object.keys(caps).length === 0) return null;
  // Build every reasonable key form so we match no matter what shape the
  // wallet returns (hex "0x1", CAIP "eip155:1", decimal "1", or lowercased
  // variants). Reown's embedded wallet has been observed to return all of
  // these at different times.
  const numeric = Number.parseInt(chainIdHex, 16);
  const candidates = new Set<string>(
    [
      chainIdHex,
      chainIdHex.toLowerCase(),
      String(numeric),
      `eip155:${numeric}`,
      `0x${numeric.toString(16)}`
    ]
      .filter((s) => s && s !== "NaN" && s !== "eip155:NaN")
      .map((s) => s.toLowerCase().replace(/^eip155:/, ""))
  );
  for (const key of Object.keys(caps)) {
    const normalized = key.toLowerCase().replace(/^eip155:/, "");
    if (candidates.has(normalized)) return caps[key];
  }
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
  const { address, isConnected, embeddedWalletInfo } = useAppKitAccount();
  const accountType = embeddedWalletInfo?.accountType;
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
    /** True when the account has contract code that is NOT an EIP-7702 delegation. */
    isSmartAccount: boolean;
    supportAtomic: boolean;
  }>({
    checking: false,
    chainIdHex: "",
    chainName: "",
    capabilities: [],
    delegation: null,
    isSmartAccount: false,
    supportAtomic: false
  });
  // Native currency symbol of the active chain (BNB on BSC, OKB on X Layer,
  // ETH on Ethereum/Sepolia/Base...). Falls back to "ETH" until readiness
  // resolves the chain id.
  const nativeTokenSymbol =
    SupportChains.find(
      (c) => Number(c.id) === Number.parseInt(readiness.chainIdHex, 16)
    )?.nativeCurrency.symbol ?? "ETH";
  const [batchTxs, setBatchTxs] = useState<BatchTx[]>([
    {
      tokenKind: "native",
      tokenAddress: "",
      tokenSymbol: "ETH",
      tokenDecimals: 18,
      to: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
      value: "0.01"
    },
    {
      tokenKind: "native",
      tokenAddress: "",
      tokenSymbol: "ETH",
      tokenDecimals: 18,
      to: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
      value: "0.01"
    }
  ]);
  const [processingTxn, setProcessingTxn] = useState(false);
  const [batchId, setBatchId] = useState("");
  const [txHash, setTxHash] = useState("");
  const [explorerUrl, setExplorerUrl] = useState("");
  const [batchStatus, setBatchStatus] = useState<
    "pending" | "success" | "failed" | null
  >(null);

  /** 连接或切链后重新检测 ERC-5792 能力(app-network-changed 由头部切链触发)。 */
  useEffect(() => {
    if (!isConnected || !address) {
      setReadiness({
        checking: false,
        chainIdHex: "",
        chainName: "",
        capabilities: [],
        delegation: null,
        isSmartAccount: false,
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
        // eth_chainId should return a 0x-hex string per EIP-1193, but Reown's
        // embedded wallet returns a decimal number. Normalize both to hex so
        // downstream matching (findCapabilitiesEntry) and display work.
        const rawChainId = (await provider.request({
          method: "eth_chainId"
        })) as string | number;
        const currChainId =
          typeof rawChainId === "string"
            ? rawChainId
            : `0x${Number(rawChainId).toString(16)}`;
        setReadiness((prev) => ({ ...prev, checking: true }));
        const currCapabilities = (await provider.request({
          method: "wallet_getCapabilities",
          // ERC-5792 spec: params?: [Address] | [Address, Hex[]]. Reown's
          // zod schema mis-types this as a flat array and logs a harmless
          // "invalid_union" warning, but it still returns capabilities.
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
        const delegation = parseEIP7702Delegation(eoaCode);
        // Source of truth for smart account vs EOA is AppKit's `accountType`,
        // not `eth_getCode`: a smart account is often counterfactual / not yet
        // deployed on the active chain, so its on-chain code is "0x" and
        // would be misreported as EOA. AppKit knows the wallet's chosen
        // account type from `user.preferredAccountType`.
        const isSmartAccount = accountType === "smartAccount";
        setReadiness({
          checking: false,
          chainIdHex: currChainId,
          chainName: chainEntry?.chainName ?? "",
          capabilities: keys.length > 0 ? keys : ["None"],
          delegation,
          isSmartAccount,
          supportAtomic: keys.includes(BATCH_TXN_5792)
        });
      } catch (error) {
        console.error("[readiness] check failed:", error);
        if (!cancelled) {
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

  /**
   * Wait for a submitted batch to reach a terminal on-chain state.
   *
   * Reown's embedded (smart-account) wallet returns a raw UserOperation hash
   * from wallet_sendCalls, not a chain transaction hash — so a plain
   * eth_getTransactionReceipt on that string returns null forever. Query
   * wallet_getCallsStatus first (ERC-5792, implemented by the Reown frame),
   * falling back to eth_getTransactionReceipt for EOA wallets. Returns the
   * final status plus the real transaction hash when available.
   */
  const waitForConfirmation = async (
    provider: {
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
    },
    userOpHash: string
  ): Promise<{
    status: "confirmed" | "failed" | "timeout";
    txHash: string;
  }> => {
    const MAX_POLLS = 60;
    for (let polls = 0; polls < MAX_POLLS; polls += 1) {
      try {
        const status = (await provider.request({
          method: "wallet_getCallsStatus",
          params: [userOpHash]
        })) as {
          status?: string | number;
          receipts?: Array<{ transactionHash?: string }>;
        };
        const s = String(status.status ?? "").toLowerCase();
        const txHash = status.receipts?.[0]?.transactionHash;
        if (s === "0x2" || s === "confirmed" || txHash) {
          return { status: "confirmed", txHash: txHash ?? userOpHash };
        }
        if (s === "0x3" || s === "failed") {
          return { status: "failed", txHash: txHash ?? userOpHash };
        }
        // still pending — keep polling via wallet_getCallsStatus.
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      } catch (error) {
        // Reown's wallet_getCallsStatus throws while the UserOperation is
        // still in-flight: "User Operation receipt ... could not be found.
        // The User Operation may not have been processed yet." That's a
        // PENDING signal, not an unsupported-method error — keep polling it.
        const msg = String(
          (error as { message?: string })?.message ?? ""
        ).toLowerCase();
        if (
          msg.includes("could not be found") ||
          msg.includes("not been processed") ||
          msg.includes("not found")
        ) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        // Any other error (e.g. EOA wallet without wallet_getCallsStatus)
        // → fall through to the plain tx receipt below.
      }
      try {
        const receipt = (await provider.request({
          method: "eth_getTransactionReceipt",
          params: [userOpHash]
        })) as { status?: string | number } | null;
        if (receipt) {
          const s = String(receipt.status ?? "").toLowerCase();
          if (s === "0x1" || s === "1") {
            return { status: "confirmed", txHash: userOpHash };
          }
          if (s === "0x0" || s === "0") {
            return { status: "failed", txHash: userOpHash };
          }
        }
      } catch {
        // RPC hiccup — keep polling.
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return { status: "timeout", txHash: userOpHash };
  };

  /** ERC-5792: submit a batch of two calls and poll wallet_getCallsStatus. */
  const handleSendCalls = async () => {
    const provider = await getEip1193Provider();
    if (!provider || !address) {
      toast.error(t("common.connectWallet"));
      return;
    }
    // Resolve the active chain -> decimal chainId (readiness.chainIdHex is hex).
    const chainId =
      readiness.chainIdHex === ""
        ? null
        : Number.parseInt(readiness.chainIdHex, 16);
    if (chainId === null || Number.isNaN(chainId)) {
      toast.error(t("error.chainIdRequired"));
      return;
    }
    const usdcForChain = USDC_ADDRESSES[chainId] ?? null;
    const isAddressOk = (s: string): boolean => {
      try {
        return isAddress(s);
      } catch {
        return false;
      }
    };
    // Build each row's call. Validation errors map back to user-facing keys.
    const errorKey: Record<string, string> = {
      address: t("eip7702.readinessInvalidAddress"),
      amount: t("eip7702.readinessInvalidAmount"),
      token: t("eip7702.readinessInvalidToken"),
      usdcUnsupported: t("eip7702.readinessUsdcUnsupported")
    };
    const builtCalls: Array<{
      to: string;
      value: string;
      data?: string;
    }> = [];
    for (const row of batchTxs) {
      const built = buildCallForRow(row, chainId, {
        usdcForChain,
        isAddressOk
      });
      if ("error" in built) {
        toast.error(errorKey[built.error] ?? t("common.failedGeneric"));
        return;
      }
      builtCalls.push({
        to: built.callTo,
        value: built.callValue,
        ...(built.callData ? { data: built.callData } : {})
      });
    }
    setExplorerUrl("");
    setTxHash("");
    setProcessingTxn(true);
    setBatchId("");
    setExplorerUrl("");
    setBatchStatus("pending");
    try {
      const sendParams = {
        version: "2.0.0",
        chainId: readiness.chainIdHex,
        from: address,
        atomicRequired: readiness.supportAtomic,
        calls: builtCalls
      };
      const res = (await provider.request({
        method: "wallet_sendCalls",
        params: [sendParams]
      })) as { id: string } | string;

      // 兼容两种返回:标准 ERC-5792 返回 { id },但 Reown 内嵌钱包(AA)直接
      // 返回 UserOperation hash 字符串。这个字符串本身不是链上交易 hash
      // (普通 eth_getTransactionReceipt 查不到),要用 wallet_getCallsStatus
      // 确认,并从中取真正的 bundle transaction hash。
      if (typeof res === "string") {
        const userOpHash = res.startsWith("0x") ? res : `0x${res}`;
        setTxHash(userOpHash);
        const base = await resolveExplorerBase(readiness.chainIdHex);
        if (base) setExplorerUrl(`${base}/tx/${userOpHash}`);

        const { status, txHash } = await waitForConfirmation(
          provider,
          userOpHash
        );
        if (status === "failed") {
          setBatchStatus("failed");
          toast.error(t("common.txFailed"));
          setProcessingTxn(false);
          return;
        }

        const eoaCode = (await provider.request({
          method: "eth_getCode",
          params: [address, "latest"]
        })) as string;
        setReadiness((prev) => ({
          ...prev,
          delegation: parseEIP7702Delegation(eoaCode)
        }));
        // Page shows the AA Transaction Hash (UserOperation hash), but the
        // "View transaction" link should open the real chain tx hash (bundle
        // transaction hash) so it resolves to a normal transaction page.
        setBatchStatus(status === "timeout" ? "pending" : "success");
        const txUrl0 = explorerUrlForToast(txHash || userOpHash);
        toast.success(
          status === "timeout"
            ? t("eip7702.readinessSubmittedPending", {
                hash: shortHash(txHash || userOpHash)
              })
            : t("eip7702.readinessSuccessTx", {
                hash: shortHash(txHash || userOpHash)
              }),
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
        setBatchStatus("success");
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
            setBatchStatus("success");
            setProcessingTxn(false);
          } else if (s === "0x3" || s === "failed") {
            toast.error(t("common.txFailed"));
            clearInterval(int);
            setBatchStatus("failed");
            setProcessingTxn(false);
          } else if (polls >= MAX_POLLS) {
            // Stop polling after ~60s even if the wallet never reports a
            // terminal status; the batch may still be pending onchain.
            clearInterval(int);
            setBatchStatus("pending");
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

  const handleBatchInputChange = <K extends keyof BatchTx>(
    index: number,
    key: K,
    v: BatchTx[K]
  ) => {
    setBatchTxs((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: v } : item))
    );
  };

  /** Switch a row's token kind, restoring sane defaults when needed. */
  const handleAddBatchRow = () => {
    setBatchTxs((prev) => [
      ...prev,
      {
        tokenKind: "native",
        tokenAddress: "",
        tokenSymbol: nativeTokenSymbol,
        tokenDecimals: 18,
        to: "",
        value: "0.01"
      }
    ]);
  };

  const handleRemoveBatchRow = (index: number) => {
    setBatchTxs((prev) =>
      prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)
    );
  };

  // ---- Saved custom token list (per chain, persisted in localStorage) ----
  // Tokens resolved on-chain can be pinned here so they show up directly in
  // the per-row Token picker.
  type SavedCustomToken = { address: string; symbol: string; decimals: number };
  const CUSTOM_TOKENS_STORAGE_KEY = "EthanDapp.EIP7702.CustomTokens";
  const loadCustomTokens = (): Record<number, SavedCustomToken[]> => {
    try {
      const raw = window.localStorage.getItem(CUSTOM_TOKENS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };
  const [customTokens, setCustomTokens] =
    useState<Record<number, SavedCustomToken[]>>(loadCustomTokens);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        CUSTOM_TOKENS_STORAGE_KEY,
        JSON.stringify(customTokens, (_key, v) =>
          typeof v === "bigint" ? Number(v) : v
        )
      );
    } catch {
      /* storage full / unavailable — ignore */
    }
  }, [customTokens]);

  // ---- Token picker modal (bricswap-style: list + search-address + star) ----
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerRowIndex, setPickerRowIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerLookup, setPickerLookup] = useState<{
    status: "loading" | "ok" | "error";
    symbol?: string;
    decimals?: number;
  } | null>(null);

  // Switching chain resets every row back to the new chain's native token.
  const prevChainIdHexRef = useRef(readiness.chainIdHex);
  useEffect(() => {
    if (prevChainIdHexRef.current === readiness.chainIdHex) return;
    prevChainIdHexRef.current = readiness.chainIdHex;
    if (!readiness.chainIdHex) return;
    setBatchTxs((prev) =>
      prev.map((item) => ({
        ...item,
        tokenKind: "native",
        tokenAddress: "",
        tokenSymbol: nativeTokenSymbol,
        tokenDecimals: 18
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readiness.chainIdHex]);

  useEffect(() => {
    if (!pickerOpen) {
      setPickerSearch("");
      setPickerLookup(null);
      return;
    }
    const addr = pickerSearch.trim();
    if (!isAddress(addr)) {
      setPickerLookup(null);
      return;
    }
    const chainId = Number.parseInt(readiness.chainIdHex, 16);
    const provider = getReadonlyProviderForChain(chainId);
    if (!provider) {
      setPickerLookup({ status: "error" });
      return;
    }
    setPickerLookup({ status: "loading" });
    const timer = window.setTimeout(() => {
      multicall3Aggregate3StaticCall(provider, [
        {
          target: addr,
          allowFailure: true,
          callData: ERC20_IFACE.encodeFunctionData("symbol")
        },
        {
          target: addr,
          allowFailure: true,
          callData: ERC20_IFACE.encodeFunctionData("decimals")
        }
      ])
        .then((res) => {
          const symbol = decodeMulticallResult<string>(
            ERC20_IFACE,
            "symbol",
            res[0]
          );
          const decimals = decodeMulticallResult<number>(
            ERC20_IFACE,
            "decimals",
            res[1]
          );
          if (symbol === undefined || decimals === undefined) {
            setPickerLookup({ status: "error" });
            return;
          }
          setPickerLookup({
            status: "ok",
            symbol,
            decimals: Number(decimals)
          });
        })
        .catch(() => setPickerLookup({ status: "error" }));
    }, 600);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen, pickerSearch, readiness.chainIdHex]);

  // ---- Picker balances (native + ERC20 via Multicall3) ----
  const [pickerBalances, setPickerBalances] = useState<
    Record<string, bigint | null>
  >({});

  useEffect(() => {
    if (!pickerOpen || !address) return;
    const chainId = Number.parseInt(readiness.chainIdHex, 16);
    if (!Number.isInteger(chainId)) return;
    const owner = address;

    // Build TokenSide list: native(ZeroAddress) + USDC + saved + lookup.
    const sides: TokenSide[] = [
      {
        kind: "custom",
        key: ZeroAddress.toLowerCase(),
        tokenAddress: ZeroAddress,
        symbol: nativeTokenSymbol,
        decimals: 18,
        name: nativeTokenSymbol
      }
    ];
    const usdcAddr = USDC_ADDRESSES[chainId];
    if (usdcAddr) {
      sides.push({
        kind: "custom",
        key: usdcAddr.toLowerCase(),
        tokenAddress: usdcAddr,
        symbol: "USDC",
        decimals: USDC_DECIMALS,
        name: "USD Coin"
      });
    }
    for (const tk of customTokens[chainId] ?? []) {
      sides.push({
        kind: "custom",
        key: tk.address.toLowerCase(),
        tokenAddress: tk.address,
        symbol: tk.symbol,
        decimals: Number(tk.decimals),
        name: tk.symbol
      });
    }
    if (pickerLookup?.status === "ok" && isAddress(pickerSearch.trim())) {
      const a = pickerSearch.trim();
      if (
        !sides.some((s) => s.tokenAddress.toLowerCase() === a.toLowerCase())
      ) {
        sides.push({
          kind: "custom",
          key: a.toLowerCase(),
          tokenAddress: a,
          symbol: pickerLookup.symbol ?? "CUSTOM",
          decimals: Number(pickerLookup.decimals ?? 18),
          name: pickerLookup.symbol ?? "CUSTOM"
        });
      }
    }

    let cancelled = false;
    fetchTokenBalancesMulticall(owner, sides, chainId)
      .then((balances) => {
        if (cancelled) return;
        setPickerBalances((prev) => {
          const next = { ...prev };
          sides.forEach((side) => {
            const key = tokenBalanceKey(side.tokenAddress);
            next[`${chainId}:${key}:${owner.toLowerCase()}`] =
              balances[key] ?? null;
          });
          return next;
        });
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    pickerOpen,
    address,
    readiness.chainIdHex,
    customTokens,
    pickerLookup?.status,
    pickerSearch
  ]);

  /** Short human-readable balance: 4 fractional digits max. */
  const formatPickerBalance = (
    raw: bigint | null | undefined,
    decimals: number
  ): string => {
    if (raw == null) return "—";
    const s = formatUnits(raw, decimals);
    const [intPart, fracPart = ""] = s.split(".");
    const frac4 = fracPart.padEnd(4, "0").slice(0, 4).replace(/0+$/, "");
    return frac4 ? `${intPart}.${frac4}` : intPart;
  };

  /** Fill the target row with a picked token and close the picker. */
  const pickToken = (opt: {
    kind: "native" | "usdc" | "custom";
    address?: string;
    symbol?: string;
    decimals?: number;
  }) => {
    if (pickerRowIndex == null) return;
    // Picking a resolved custom address auto-collects it (silent) if new.
    if (opt.kind === "custom" && opt.address) {
      const chainId = Number.parseInt(readiness.chainIdHex, 16);
      if (Number.isInteger(chainId)) {
        const exists = (customTokens[chainId] ?? []).some(
          (tk) => tk.address.toLowerCase() === (opt.address ?? "").toLowerCase()
        );
        if (!exists) {
          toggleSaveCustomToken(
            opt.address,
            opt.symbol ?? "CUSTOM",
            Number(opt.decimals ?? 18),
            true
          );
        }
      }
    }
    setBatchTxs((prev) =>
      prev.map((item, i) => {
        if (i !== pickerRowIndex) return item;
        if (opt.kind === "native") {
          return {
            ...item,
            tokenKind: "native",
            tokenAddress: "",
            tokenSymbol: nativeTokenSymbol,
            tokenDecimals: 18
          };
        }
        if (opt.kind === "usdc") {
          return {
            ...item,
            tokenKind: "usdc",
            tokenAddress: "",
            tokenSymbol: "USDC",
            tokenDecimals: USDC_DECIMALS
          };
        }
        return {
          ...item,
          tokenKind: "custom",
          tokenAddress: opt.address ?? "",
          tokenSymbol: opt.symbol ?? "CUSTOM",
          tokenDecimals: Number(opt.decimals ?? 18)
        };
      })
    );
    setPickerOpen(false);
  };

  /** Add / remove a resolved token to the saved list for the active chain. */
  const toggleSaveCustomToken = (
    address: string,
    symbol: string,
    decimals: number,
    silent = false
  ) => {
    const chainId = Number.parseInt(readiness.chainIdHex, 16);
    if (!Number.isInteger(chainId)) return;
    let willAdd = false;
    setCustomTokens((prev) => {
      const list = prev[chainId] ?? [];
      const exists = list.some(
        (tk) => tk.address.toLowerCase() === address.toLowerCase()
      );
      willAdd = !exists;
      const next = exists
        ? list.filter(
            (tk) => tk.address.toLowerCase() !== address.toLowerCase()
          )
        : [...list, { address, symbol, decimals: Number(decimals) }];
      return { ...prev, [chainId]: next };
    });
    if (!silent) {
      if (willAdd) {
        toast.success(t("eip7702.readinessTokenAdded"));
      } else {
        toast.info(t("eip7702.readinessTokenRemoved"));
      }
    }
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
                  {t("eip7702.readinessColSmartAccount")}
                </span>
                <span className="eip7702-readiness-value">
                  {readiness.checking
                    ? t("eip7702.readinessChecking")
                    : readiness.isSmartAccount
                      ? t("eip7702.readinessYes")
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
                    : readiness.chainIdHex
                      ? `${parseInt(readiness.chainIdHex, 16)} - ${readiness.chainName}`
                      : "-"}
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
              {!readiness.checking && (
                <>
                  <h4 className="eip7702-readiness-batch-title">
                    {t("eip7702.readinessBatchTitle")}
                  </h4>
                  <div className="eip7702-batch-table">
                    <div className="eip7702-batch-head">
                      <span>{t("eip7702.readinessTxnNo")}</span>
                      <span>{t("eip7702.readinessToken")}</span>
                      <span>
                        {t("eip7702.readinessValue")}
                        <span className="eip7702-batch-token-hint">
                          {` (${t("eip7702.readinessAmount")})`}
                        </span>
                      </span>
                      <span></span>
                      <span>{t("eip7702.readinessAddress")}</span>
                      <span></span>
                    </div>
                    {batchTxs.map((item, index) => {
                      const chainIdNum =
                        readiness.chainIdHex !== ""
                          ? Number.parseInt(readiness.chainIdHex, 16)
                          : Number.NaN;
                      const usdcSupportedOnChain =
                        readiness.chainIdHex !== "" &&
                        Boolean(
                          USDC_ADDRESSES[
                            Number.parseInt(readiness.chainIdHex, 16)
                          ]
                        );
                      const placeholder = "0.0";
                      const rowTokenSymbol =
                        item.tokenKind === "native"
                          ? nativeTokenSymbol
                          : item.tokenKind === "usdc"
                            ? "USDC"
                            : item.tokenSymbol.trim() || "Token";
                      return (
                        <div className="eip7702-batch-row" key={index}>
                          <span>{index + 1}.</span>
                          <button
                            type="button"
                            className="eip7702-batch-token-chip"
                            onClick={() => {
                              setPickerRowIndex(index);
                              setPickerSearch("");
                              setPickerOpen(true);
                            }}
                            title={t("eip7702.readinessToken")}
                            aria-label={t("eip7702.readinessToken")}
                          >
                            <span className="eip7702-batch-token-chip-avatar">
                              {rowTokenSymbol.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="eip7702-batch-token-chip-label">
                              {rowTokenSymbol}
                            </span>
                            <span
                              className="eip7702-batch-token-chip-chevron"
                              aria-hidden
                            />
                          </button>
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
                            placeholder={placeholder}
                            spellCheck={false}
                          />
                          <span>{t("eip7702.readinessTo")}</span>
                          <input
                            className="eip7702-batch-input eip7702-batch-address"
                            type="text"
                            value={item.to}
                            onChange={(e) =>
                              handleBatchInputChange(
                                index,
                                "to",
                                e.target.value
                              )
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
                      );
                    })}
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
                            {accountType === "smartAccount"
                              ? t("eip7702.aaTransactionHash")
                              : t("eip7702.lastTransaction")}
                          </span>
                          {batchStatus && (
                            <span
                              className={"eip7702-tx-status is-" + batchStatus}
                            >
                              {batchStatus === "pending" && (
                                <span className="eip7702-tx-dot" aria-hidden />
                              )}
                              {batchStatus === "pending"
                                ? t("eip7702.txPending")
                                : batchStatus === "success"
                                  ? t("eip7702.txSuccess")
                                  : t("eip7702.txFailed")}
                            </span>
                          )}
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
      {pickerOpen &&
        (() => {
          const pickerChainId =
            readiness.chainIdHex !== ""
              ? Number.parseInt(readiness.chainIdHex, 16)
              : Number.NaN;
          const ownerKey = address?.toLowerCase();
          const usdcSupported =
            Number.isInteger(pickerChainId) &&
            Boolean(USDC_ADDRESSES[pickerChainId]);
          const savedTokens = Number.isInteger(pickerChainId)
            ? (customTokens[pickerChainId] ?? [])
            : [];
          const lookupAddr = pickerSearch.trim();
          const lookupSaved =
            Number.isInteger(pickerChainId) &&
            savedTokens.some(
              (tk) => tk.address.toLowerCase() === lookupAddr.toLowerCase()
            );
          const q = pickerSearch.trim().toLowerCase();
          const includes = (s: string) => !q || s.toLowerCase().includes(q);
          const showNative = includes(nativeTokenSymbol);
          const showUsdc = usdcSupported && includes("USDC");
          return (
            <div
              className="eip7702-token-modal-overlay"
              onClick={() => setPickerOpen(false)}
            >
              <div
                className="eip7702-token-modal eip7702-picker"
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="eip7702-token-modal-head">
                  <h3>{t("eip7702.readinessToken")}</h3>
                  <button
                    type="button"
                    className="eip7702-token-modal-close"
                    onClick={() => setPickerOpen(false)}
                    aria-label={t("eip7702.readinessTokenCancel")}
                  >
                    ×
                  </button>
                </div>
                <div className="eip7702-picker-search">
                  <input
                    className="eip7702-picker-search-input"
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder={t("eip7702.readinessPickerSearch")}
                    spellCheck={false}
                    autoFocus
                  />
                </div>
                <ul className="eip7702-picker-list">
                  {showNative && (
                    <li>
                      <div className="eip7702-picker-row">
                        <span
                          className="eip7702-picker-star-spacer"
                          aria-hidden
                        />
                        <button
                          type="button"
                          className="eip7702-picker-main"
                          onClick={() => pickToken({ kind: "native" })}
                        >
                          <span className="eip7702-picker-avatar">
                            {nativeTokenSymbol.slice(0, 2).toUpperCase()}
                          </span>
                          <span className="eip7702-picker-info">
                            <span className="eip7702-picker-symbol">
                              {nativeTokenSymbol}
                            </span>
                            <span className="eip7702-picker-desc">
                              {t("eip7702.readinessNativeDesc")}
                              {" · "}
                              {SupportChains.find(
                                (c) => Number(c.id) === pickerChainId
                              )?.chainName ?? `Chain ${pickerChainId}`}
                            </span>
                          </span>
                          <span className="eip7702-picker-balance">
                            {formatPickerBalance(
                              pickerBalances[
                                `${pickerChainId}:${ZeroAddress.toLowerCase()}:${ownerKey}`
                              ],
                              18
                            )}
                          </span>
                        </button>
                      </div>
                    </li>
                  )}
                  {showUsdc && usdcSupported && (
                    <li>
                      <div className="eip7702-picker-row">
                        <span
                          className="eip7702-picker-star-spacer"
                          aria-hidden
                        />
                        <button
                          type="button"
                          className="eip7702-picker-main"
                          onClick={() => pickToken({ kind: "usdc" })}
                        >
                          <span className="eip7702-picker-avatar">US</span>
                          <span className="eip7702-picker-info">
                            <span className="eip7702-picker-symbol">USDC</span>
                            <span
                              className="eip7702-picker-desc"
                              title={USDC_ADDRESSES[pickerChainId]}
                            >
                              {USDC_ADDRESSES[pickerChainId].slice(0, 6)}…
                              {USDC_ADDRESSES[pickerChainId].slice(-4)}
                            </span>
                          </span>
                          <span className="eip7702-picker-balance">
                            {formatPickerBalance(
                              pickerBalances[
                                `${pickerChainId}:${USDC_ADDRESSES[pickerChainId].toLowerCase()}:${ownerKey}`
                              ],
                              USDC_DECIMALS
                            )}
                          </span>
                        </button>
                      </div>
                    </li>
                  )}
                  {savedTokens
                    .filter((tk) => includes(tk.symbol))
                    .map((tk) => (
                      <li key={tk.address}>
                        <div className="eip7702-picker-row">
                          <button
                            type="button"
                            className="eip7702-picker-star is-saved"
                            onClick={() =>
                              toggleSaveCustomToken(
                                tk.address,
                                tk.symbol,
                                tk.decimals
                              )
                            }
                            title={t("eip7702.readinessTokenRemoveFromList")}
                            aria-label={t(
                              "eip7702.readinessTokenRemoveFromList"
                            )}
                          >
                            ★
                          </button>
                          <button
                            type="button"
                            className="eip7702-picker-main"
                            onClick={() =>
                              pickToken({
                                kind: "custom",
                                address: tk.address,
                                symbol: tk.symbol,
                                decimals: tk.decimals
                              })
                            }
                          >
                            <span className="eip7702-picker-avatar">
                              {tk.symbol.slice(0, 2).toUpperCase()}
                            </span>
                            <span className="eip7702-picker-info">
                              <span className="eip7702-picker-symbol">
                                {tk.symbol}
                              </span>
                              <span className="eip7702-picker-desc">
                                {tk.address.slice(0, 6)}…{tk.address.slice(-4)}
                              </span>
                            </span>
                            <span className="eip7702-picker-balance">
                              {formatPickerBalance(
                                pickerBalances[
                                  `${pickerChainId}:${tk.address.toLowerCase()}:${ownerKey}`
                                ],
                                Number(tk.decimals)
                              )}
                            </span>
                          </button>
                        </div>
                      </li>
                    ))}
                  {pickerLookup?.status === "loading" && (
                    <li className="eip7702-picker-status">
                      {t("eip7702.readinessTokenQuerying")}
                    </li>
                  )}
                  {pickerLookup?.status === "error" && (
                    <li className="eip7702-picker-status is-error">
                      {t("eip7702.readinessTokenQueryFailed")}
                    </li>
                  )}
                  {pickerLookup?.status === "ok" && (
                    <li>
                      <div className="eip7702-picker-row">
                        <button
                          type="button"
                          className={`eip7702-picker-star${
                            lookupSaved ? " is-saved" : ""
                          }`}
                          onClick={() =>
                            toggleSaveCustomToken(
                              lookupAddr,
                              pickerLookup.symbol ?? "",
                              Number(pickerLookup.decimals ?? 18)
                            )
                          }
                          title={
                            lookupSaved
                              ? t("eip7702.readinessTokenRemoveFromList")
                              : t("eip7702.readinessTokenAddToList")
                          }
                          aria-label={
                            lookupSaved
                              ? t("eip7702.readinessTokenRemoveFromList")
                              : t("eip7702.readinessTokenAddToList")
                          }
                        >
                          {lookupSaved ? "★" : "☆"}
                        </button>
                        <button
                          type="button"
                          className="eip7702-picker-main"
                          onClick={() =>
                            pickToken({
                              kind: "custom",
                              address: lookupAddr,
                              symbol: pickerLookup.symbol ?? "CUSTOM",
                              decimals: Number(pickerLookup.decimals ?? 18)
                            })
                          }
                        >
                          <span className="eip7702-picker-avatar">
                            {(pickerLookup.symbol ?? "TO")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                          <span className="eip7702-picker-info">
                            <span className="eip7702-picker-symbol">
                              {pickerLookup.symbol ?? "CUSTOM"}
                            </span>
                            <span className="eip7702-picker-desc">
                              {lookupAddr.slice(0, 6)}…{lookupAddr.slice(-4)}
                              {" · "}
                              {String(pickerLookup.decimals ?? "")}
                            </span>
                          </span>
                          <span className="eip7702-picker-balance">
                            {formatPickerBalance(
                              pickerBalances[
                                `${pickerChainId}:${lookupAddr.toLowerCase()}:${ownerKey}`
                              ],
                              Number(pickerLookup.decimals ?? 18)
                            )}
                          </span>
                        </button>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default EIP7702Page;
