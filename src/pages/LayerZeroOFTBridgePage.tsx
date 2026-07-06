import { useEffect, useMemo, useState } from "react";
import {
  AbiCoder,
  Contract,
  Interface,
  MaxUint256,
  dataSlice,
  formatEther,
  formatUnits,
  id,
  parseUnits,
  zeroPadValue
} from "ethers";
import { toast } from "sonner";
import {
  useEvmWallet,
  useOpenAppKitModal,
  useSwitchAppKitNetwork,
  useWalletChain
} from "@/hooks";
import {
  getDefaultReadonlyProvider,
  getProvider,
  getSigner,
  getSignerAndChainId
} from "@/lib/wallet/GetProvider";
import { isAddress, getDecimalBigNumber } from "@/lib/shared/Utils";
import { truncateHash } from "@/lib/shared/Format";
import { SupportChains } from "@/config/ChainsConfig";
import { faucetChainIdList, getChainName } from "@/config/FaucetConfig";
import {
  decodeMulticallResult,
  multicall3Aggregate3StaticCall,
  type Multicall3Call
} from "@/lib/evm/Multicall3";
import {
  evmChainIdToLzV2SrcEndpointId,
  getLayerZeroScanLink
} from "@/lib/evm/LayerZero";
import { tGlobal, useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/locales/en";
import "./LayerZeroOFTBridgePage.css";

/** LayerZero V2 testnet dstEid presets (official EIDs) */
const LZ_DST_EID_PRESETS: { key: TranslationKey; eid: number }[] = [
  { key: "lz.preset.sepolia", eid: 40161 },
  { key: "lz.preset.hoodi", eid: 40449 },
  { key: "lz.preset.baseSepolia", eid: 40245 },
  { key: "lz.preset.arbSepolia", eid: 40231 },
  { key: "lz.preset.bscTestnet", eid: 40102 }
];

/** Short line for toasts: source → destination, plus amount + token when known */
function formatLzBridgeRouteSummary(
  srcChainId: number | undefined,
  dstEid: number,
  opts?: { tokenSymbol?: string | null; amount?: string }
): string {
  const chainCfg =
    srcChainId != null
      ? SupportChains.find((x) => Number(x.id) === srcChainId)
      : undefined;
  const srcName =
    chainCfg?.name ??
    (srcChainId != null ? `chain ${srcChainId}` : "unknown chain");

  const dstPreset = LZ_DST_EID_PRESETS.find((p) => p.eid === dstEid);
  const dstStr = dstPreset ? tGlobal(dstPreset.key) : `dstEid ${dstEid}`;

  let line = `${srcName} → ${dstStr}`;
  const sym = opts?.tokenSymbol?.trim();
  const amt = opts?.amount?.trim();
  if (sym) {
    line += amt ? ` · ${amt} ${sym}` : ` · ${sym}`;
  } else if (amt) {
    line += ` · ${amt} (token)`;
  }
  return line;
}

/** Default OFT / OFTAdapter per metadata source chain */
const DEFAULT_OFT_BY_META_CHAIN_ID: Record<number, string> = {
  11155111: "0x43D67403d1581056187fE80633175186F7eF8677",
  560048: "0xadf015fe835927a2e7a336cb4f61975912feb5eb"
};

/** Chains allowed for Load OFT Metadata (Sepolia + Hoodi) */
const LZ_META_ALLOWED_CHAIN_IDS = [11155111, 560048] as const;
/** Default when switching from an unsupported chain */
const LZ_META_DEFAULT_CHAIN_ID = 11155111;

const getDefaultOftForChain = (chainId: number): string =>
  DEFAULT_OFT_BY_META_CHAIN_ID[chainId] ??
  DEFAULT_OFT_BY_META_CHAIN_ID[LZ_META_DEFAULT_CHAIN_ID];

const LZ_BRIDGE_DST_EID_STORAGE_KEY = "lzOftBridgeDstEid";
const LZ_META_CHAIN_STORAGE_KEY = "lzOftBridgeMetaChainId";

const isLzMetaSourceChain = (chainId: number): boolean =>
  (LZ_META_ALLOWED_CHAIN_IDS as readonly number[]).includes(chainId);

const metaChainLabel = (chainId: number): string =>
  SupportChains.find((c) => Number(c.id) === chainId)?.name ??
  `chain ${chainId}`;

const readStoredMetaChainId = (): number => {
  try {
    const n = Number(localStorage.getItem(LZ_META_CHAIN_STORAGE_KEY));
    if (isLzMetaSourceChain(n)) return n;
  } catch {
    /* ignore */
  }
  return LZ_META_DEFAULT_CHAIN_ID;
};

const persistMetaChainId = (chainId: number) => {
  if (!isLzMetaSourceChain(chainId)) return;
  try {
    localStorage.setItem(LZ_META_CHAIN_STORAGE_KEY, String(chainId));
  } catch {
    /* ignore */
  }
};

const readStoredDstEid = (): string | null => {
  try {
    const raw = localStorage.getItem(LZ_BRIDGE_DST_EID_STORAGE_KEY);
    if (!raw?.trim()) return null;
    const n = Number(raw.trim());
    if (!Number.isFinite(n) || n <= 0 || n >= 0xffffffff) return null;
    return String(Math.floor(n));
  } catch {
    return null;
  }
};

const persistDstEid = (eid: number) => {
  try {
    localStorage.setItem(LZ_BRIDGE_DST_EID_STORAGE_KEY, String(eid));
  } catch {
    /* ignore */
  }
};

/** OFT: token() == address(this); OFTAdapter: token() is the underlying ERC20 */
const OFT_DETECT_ABI = [
  "function token() view returns (address)",
  "function approvalRequired() view returns (bool)"
];

const OFT_ABI = [
  "function quoteSend((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd) _sendParam, bool _payInLzToken) view returns (uint256 nativeFee, uint256 lzTokenFee)",
  "function send((uint32 dstEid, bytes32 to, uint256 amountLD, uint256 minAmountLD, bytes extraOptions, bytes composeMsg, bytes oftCmd) _sendParam, (uint256 nativeFee, uint256 lzTokenFee) _fee, address _refundAddress) payable",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address account) view returns (uint256)"
];

const addressToBytes32 = (addr: string): string => {
  return zeroPadValue(addr, 32);
};

const explorerTxUrl = (chainId: number | undefined, txHash: string): string => {
  if (!chainId) return "";
  const c = SupportChains.find((x) => Number(x.id) === chainId);
  const base = c?.blockExplorerUrls?.[0];
  if (!base) return "";
  return `${base.replace(/\/$/, "")}/tx/${txHash}`;
};

/** Format ERC20 allowance for display; MaxUint256 shown as unlimited */
const formatAllowanceForDisplay = (
  raw: bigint,
  tokenDecimals: number
): string => {
  if (raw === MaxUint256) {
    return tGlobal("common.unlimitedAllowance");
  }
  try {
    return formatUnits(raw, tokenDecimals);
  } catch {
    return raw.toString();
  }
};

const LZ_ERR_NO_PEER = id("NoPeer(uint32)").slice(0, 10).toLowerCase();
const LZ_ERR_SLIPPAGE = id("SlippageExceeded(uint256,uint256)")
  .slice(0, 10)
  .toLowerCase();
const LZ_ERR_INSUFFICIENT_FEE = id("InsufficientFee(uint256,uint256)")
  .slice(0, 10)
  .toLowerCase();
const LZ_ERR_INVALID_LOCAL_DECIMALS = id("InvalidLocalDecimals()")
  .slice(0, 10)
  .toLowerCase();

/** Extract revert data (0x…) from wallet / ethers CALL_EXCEPTION */
const extractRevertHexData = (err: unknown): string | undefined => {
  const pick = (v: unknown): string | undefined => {
    if (typeof v !== "string") return undefined;
    const t = v.trim();
    if (t.startsWith("0x") && t.length >= 10) return t;
    return undefined;
  };
  const e = err as {
    data?: unknown;
    reason?: unknown;
    error?: {
      data?: unknown;
      body?: unknown;
      error?: { data?: unknown; body?: unknown };
    };
  };
  const fromBody = (body: unknown): string | undefined => {
    if (typeof body !== "string") return undefined;
    try {
      const j = JSON.parse(body) as {
        error?: { data?: string; message?: string };
        data?: string;
      };
      return pick(j.error?.data) ?? pick(j.data);
    } catch {
      return undefined;
    }
  };
  return (
    pick(e.data) ??
    pick(e.reason) ??
    pick(e.error?.data) ??
    pick(e.error?.error?.data) ??
    fromBody(e.error?.body) ??
    fromBody(e.error?.error?.body) ??
    undefined
  );
};

/** Decode common LayerZero OFT / OApp custom errors for easier debugging */
const decodeLayerZeroOftRevert = (
  data: string,
  tokenDecimals?: number
): string | null => {
  const hex = data.trim().toLowerCase();
  if (hex.length < 10) return null;
  const sel = hex.slice(0, 10);
  try {
    if (sel === LZ_ERR_NO_PEER) {
      if (hex.length < 10 + 64) return null;
      const [eid] = AbiCoder.defaultAbiCoder().decode(
        ["uint32"],
        dataSlice(data, 4)
      );
      return `NoPeer: dstEid ${eid} has no peer. Call setPeer on the OFT for this endpoint, or use a dstEid that already has a peer.`;
    }
    if (sel === LZ_ERR_SLIPPAGE) {
      const [amt, minAmt] = AbiCoder.defaultAbiCoder().decode(
        ["uint256", "uint256"],
        dataSlice(data, 4)
      );
      if (
        typeof tokenDecimals === "number" &&
        tokenDecimals >= 0 &&
        tokenDecimals <= 36
      ) {
        return `SlippageExceeded: expected credited amount ~${formatUnits(amt, tokenDecimals)}, but minAmountLD requires at least ${formatUnits(minAmt, tokenDecimals)}. Increase slippage or lower the amount.`;
      }
      return `SlippageExceeded: credited ${amt.toString()}, minimum required ${minAmt.toString()} (raw units).`;
    }
    if (sel === LZ_ERR_INSUFFICIENT_FEE) {
      const [required, provided] = AbiCoder.defaultAbiCoder().decode(
        ["uint256", "uint256"],
        dataSlice(data, 4)
      );
      return `InsufficientFee: need ~${formatEther(required)} ETH (native), provided ~${formatEther(provided)} ETH. Retry the bridge or increase msg.value.`;
    }
    if (sel === LZ_ERR_INVALID_LOCAL_DECIMALS) {
      return "InvalidLocalDecimals: local decimals incompatible with OFT config (often underlying token vs Adapter mismatch).";
    }
  } catch {
    return null;
  }
  return null;
};

const formatBridgeContractError = (
  err: unknown,
  tokenDecimals?: number
): string => {
  const msg = err instanceof Error ? err.message : String(err);
  if (/user rejected|denied transaction|User denied/i.test(msg)) {
    return tGlobal("lz.userRejected");
  }
  const data = extractRevertHexData(err);
  const decoded = data ? decodeLayerZeroOftRevert(data, tokenDecimals) : null;
  if (decoded) return decoded;
  if (/cannot estimate gas|UNPREDICTABLE_GAS_LIMIT/i.test(msg)) {
    return `Cannot estimate gas (simulation may fail): ${msg}. Common causes: NoPeer, insufficient allowance, msg.value too low for nativeFee, or amount/decimals mismatch. Check peer and network, then retry; set Gas limit under Advanced if needed.`;
  }
  return msg || tGlobal("lz.operationFailed");
};

type SendParamTuple = [number, string, bigint, bigint, string, string, string];

const buildSendParam = (
  dstEid: number,
  recipient: string,
  amountLD: bigint,
  minAmountLD: bigint,
  extraOptionsHex: string,
  composeHex: string,
  oftCmdHex: string
): SendParamTuple => [
  dstEid,
  addressToBytes32(recipient),
  amountLD,
  minAmountLD,
  extraOptionsHex || "0x",
  composeHex || "0x",
  oftCmdHex || "0x"
];

const LayerZeroOFTBridgePage = () => {
  const { t } = useI18n();
  const { address, isConnected } = useEvmWallet();
  const { chainIdNum: walletChainNum, chainIdCurrent } = useWalletChain();
  const { isConnecting: isConnectingWallet, openConnectModal } =
    useOpenAppKitModal();
  const {
    isSwitching: isSwitchingMetaChain,
    switchNetwork,
    switchToChainAndWait
  } = useSwitchAppKitNetwork();

  const [selectedSourceChainId, setSelectedSourceChainId] = useState<number>(
    () => readStoredMetaChainId()
  );
  const [oftAddress, setOftAddress] = useState(() =>
    getDefaultOftForChain(readStoredMetaChainId())
  );
  const [dstEidInput, setDstEidInput] = useState(
    () => readStoredDstEid() ?? "40245"
  );
  const [recipient, setRecipient] = useState("");
  const [amountStr, setAmountStr] = useState("1.0");
  const [slippageBps, setSlippageBps] = useState("0");
  const [extraOptions, setExtraOptions] = useState("0x");
  const [composeMsg, setComposeMsg] = useState("0x");
  const [oftCmd, setOftCmd] = useState("0x");
  /** If empty, estimateGas.send + 30% headroom before send; if set, skip estimation */
  const [sendGasLimitInput, setSendGasLimitInput] = useState("");

  const [decimals, setDecimals] = useState<number | null>(null);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [balanceFormatted, setBalanceFormatted] = useState<string | null>(null);
  /** On-chain balance (same units as amountLD) for amount ≤ balance checks */
  const [tokenBalanceLD, setTokenBalanceLD] = useState<bigint | null>(null);
  /** Underlying token allowance to Adapter when in OFTAdapter mode */
  const [allowance, setAllowance] = useState<bigint | null>(null);
  const [isAdapterMode, setIsAdapterMode] = useState(false);
  const [underlyingAddress, setUnderlyingAddress] = useState<string | null>(
    null
  );
  const [nativeFee, setNativeFee] = useState<bigint>(() => BigInt(0));
  const [lzTokenFee, setLzTokenFee] = useState<bigint>(() => BigInt(0));
  const [chainId, setChainId] = useState<number | undefined>(undefined);

  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  /** One-click: approve exact amount if needed → quoteSend → send */
  const [isBridgeOneClick, setIsBridgeOneClick] = useState(false);
  /** Last successful bridge LayerZero Scan URL, shown next to the button */
  const [lastBridgeScanLink, setLastBridgeScanLink] = useState<string | null>(
    null
  );
  /** Source tx hash for the last successful bridge (shown next to Scan link) */
  const [lastBridgeTxHash, setLastBridgeTxHash] = useState<string | null>(null);

  const dstEidNum = useMemo(() => {
    const n = Number(String(dstEidInput).trim());
    return Number.isFinite(n) && n > 0 && n < 0xffffffff ? Math.floor(n) : null;
  }, [dstEidInput]);

  /** Select Chain → LayerZero V2 source endpoint id (drives Common EIDs filtering) */
  const selectedSourceLzEid = useMemo(
    () => evmChainIdToLzV2SrcEndpointId(selectedSourceChainId),
    [selectedSourceChainId]
  );

  /** Presets excluding the selected source chain (e.g. Hoodi source → no Hoodi in list) */
  const dstPresetChoices = useMemo(
    () =>
      selectedSourceLzEid == null
        ? LZ_DST_EID_PRESETS
        : LZ_DST_EID_PRESETS.filter((p) => p.eid !== selectedSourceLzEid),
    [selectedSourceLzEid]
  );

  const dstEidEqualsSourceChain =
    selectedSourceLzEid != null &&
    dstEidNum != null &&
    dstEidNum === selectedSourceLzEid;

  useEffect(() => {
    if (!dstEidEqualsSourceChain) return;
    const alt = LZ_DST_EID_PRESETS.find((p) => p.eid !== selectedSourceLzEid);
    if (alt) {
      setDstEidInput(String(alt.eid));
      persistDstEid(alt.eid);
    }
  }, [dstEidEqualsSourceChain, selectedSourceLzEid]);

  const slippageBpsNum = useMemo(() => {
    const n = Number(String(slippageBps).trim());
    if (!Number.isFinite(n) || n < 0 || n > 5000) return null;
    return Math.floor(n);
  }, [slippageBps]);

  const parsedAmountLD = useMemo((): bigint | null => {
    if (decimals == null) return null;
    const amt = amountStr.trim();
    if (amt === "") return null;
    try {
      const v = getDecimalBigNumber(amt, decimals);
      return v <= 0n ? null : v;
    } catch {
      return null;
    }
  }, [amountStr, decimals]);

  /** Adapter mode: underlying must be approved to the Adapter before send */
  const allowanceInsufficient = useMemo(() => {
    if (!isAdapterMode || parsedAmountLD == null) return false;
    if (allowance == null) return true;
    return allowance < parsedAmountLD;
  }, [isAdapterMode, parsedAmountLD, allowance]);

  const amountExceedsBalance = useMemo(() => {
    if (parsedAmountLD == null || tokenBalanceLD == null) return false;
    return parsedAmountLD > tokenBalanceLD;
  }, [parsedAmountLD, tokenBalanceLD]);

  useEffect(() => {
    if (isConnected && address) {
      setRecipient((r) => (r.trim() === "" ? address : r));
    }
  }, [isConnected, address]);

  /** After wallet connects, sync chain id so presets can exclude this chain (no need to load meta first) */
  useEffect(() => {
    let cancelled = false;
    if (!isConnected) return undefined;
    void (async () => {
      try {
        const provider = (await getProvider()) ?? getDefaultReadonlyProvider();
        if (!provider || cancelled) return;
        const net = await provider.getNetwork();
        if (!cancelled) setChainId(Number(net.chainId));
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isConnected]);

  const oftTrimmed = oftAddress.trim();
  const recipientTrimmed = recipient.trim();

  const canReadMeta = isAddress(oftTrimmed);

  /** Wallet must match Select Chain before load / bridge (Faucet-style) */
  const needsMetaChainSwitch = useMemo(
    () =>
      isConnected &&
      walletChainNum != null &&
      walletChainNum !== selectedSourceChainId,
    [isConnected, walletChainNum, selectedSourceChainId]
  );

  const oftAddressPlaceholder = useMemo(
    () => getDefaultOftForChain(selectedSourceChainId),
    [selectedSourceChainId]
  );

  useEffect(() => {
    if (!isLzMetaSourceChain(selectedSourceChainId)) return;
    persistMetaChainId(selectedSourceChainId);
    setOftAddress(getDefaultOftForChain(selectedSourceChainId));
    setDecimals(null);
    setSymbol(null);
    setBalanceFormatted(null);
    setTokenBalanceLD(null);
    setAllowance(null);
    setIsAdapterMode(false);
    setUnderlyingAddress(null);
  }, [selectedSourceChainId]);

  const handleSourceChainSelectChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const cid = parseInt(event.target.value, 10);
    if (!isLzMetaSourceChain(cid)) return;
    setSelectedSourceChainId(cid);
    persistMetaChainId(cid);
    if (chainIdCurrent != null && cid !== Number(chainIdCurrent)) {
      try {
        await switchNetwork(cid);
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error(t("error.switchChain"));
      }
    }
  };

  const switchToMetaChain = async (targetChainId: number): Promise<boolean> => {
    const targetName = metaChainLabel(targetChainId);
    const ok = await switchToChainAndWait(targetChainId, {
      onMismatchMessage: t("lz.switchTimeout", { chain: targetName })
    });
    if (ok) persistMetaChainId(targetChainId);
    return ok;
  };

  const canQuoteOrSend =
    canReadMeta &&
    dstEidNum != null &&
    isAddress(recipientTrimmed) &&
    slippageBpsNum != null &&
    !dstEidEqualsSourceChain;

  const loadTokenMeta = async (options?: { silent?: boolean }) => {
    const silent = Boolean(options?.silent);
    if (!canReadMeta) {
      toast.error(t("lz.invalidOftAddress"));
      return;
    }
    if (!silent && !isConnected) {
      toast.error(t("lz.connectFirst"));
      return;
    }
    if (
      !silent &&
      isConnected &&
      walletChainNum != null &&
      walletChainNum !== selectedSourceChainId
    ) {
      toast.error(
        t("lz.switchBeforeLoad", {
          chain: getChainName(selectedSourceChainId)
        })
      );
      return;
    }
    setIsLoadingMeta(true);
    setDecimals(null);
    setSymbol(null);
    setBalanceFormatted(null);
    setTokenBalanceLD(null);
    setAllowance(null);
    setIsAdapterMode(false);
    setUnderlyingAddress(null);
    try {
      const provider = (await getProvider()) ?? getDefaultReadonlyProvider();
      if (!provider) {
        toast.error(t("lz.rpcFailed"));
        return;
      }
      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));
      if (!silent && isLzMetaSourceChain(Number(net.chainId))) {
        persistMetaChainId(Number(net.chainId));
      }

      const oftDetectIface = new Interface(OFT_DETECT_ABI);
      const erc20Iface = new Interface(ERC20_ABI);

      const runSequential = async () => {
        const detect = new Contract(
          oftTrimmed,
          [...OFT_DETECT_ABI, ...OFT_ABI],
          provider
        );
        let assetAddr = oftTrimmed;
        let adapter = false;
        try {
          const tok: string = await detect.token();
          if (tok.toLowerCase() !== oftTrimmed.toLowerCase()) {
            adapter = true;
            assetAddr = tok;
          }
        } catch {
          /* no token(): treat contract as ERC20 OFT */
        }
        setIsAdapterMode(adapter);
        setUnderlyingAddress(adapter ? assetAddr : null);
        const erc20 = new Contract(assetAddr, ERC20_ABI, provider);
        const [dec, sym] = await Promise.all([
          erc20.decimals() as Promise<number>,
          erc20.symbol() as Promise<string>
        ]);
        const decN = Number(dec);
        setDecimals(decN);
        setSymbol(String(sym));
        if (address && isAddress(address)) {
          const bal: bigint = await erc20.balanceOf(address);
          setBalanceFormatted(formatUnits(bal, decN));
          setTokenBalanceLD(bal);
          if (adapter) {
            const alw: bigint = await erc20.allowance(address, oftTrimmed);
            setAllowance(alw);
          } else {
            setAllowance(null);
          }
        } else {
          setBalanceFormatted(null);
          setTokenBalanceLD(null);
          setAllowance(null);
        }
        let approvalHint = "";
        if (adapter) {
          try {
            const req: boolean = await detect.approvalRequired();
            approvalHint = req
              ? t("lz.approveUnderlying")
              : t("lz.approvalNotRequired");
          } catch {
            approvalHint = t("lz.adapterApprovalHint");
          }
        }
        if (!silent) {
          toast.success(
            adapter
              ? t("lz.detectedAdapter", {
                  symbol: String(sym),
                  hint: approvalHint
                })
              : t("lz.detectedOft")
          );
        }
      };

      try {
        const batchA: Multicall3Call[] = [
          {
            target: oftTrimmed,
            allowFailure: true,
            callData: oftDetectIface.encodeFunctionData("token", [])
          },
          {
            target: oftTrimmed,
            allowFailure: true,
            callData: oftDetectIface.encodeFunctionData("approvalRequired", [])
          }
        ];
        const resA = await multicall3Aggregate3StaticCall(provider, batchA);

        let adapter = false;
        let assetAddr = oftTrimmed;
        if (resA[0]?.success) {
          const tok = decodeMulticallResult<string>(
            oftDetectIface,
            "token",
            resA[0]
          );
          if (
            tok &&
            isAddress(tok) &&
            tok.toLowerCase() !== oftTrimmed.toLowerCase()
          ) {
            adapter = true;
            assetAddr = tok;
          }
        }

        setIsAdapterMode(adapter);
        setUnderlyingAddress(adapter ? assetAddr : null);

        const callsB: Multicall3Call[] = [
          {
            target: assetAddr,
            allowFailure: true,
            callData: erc20Iface.encodeFunctionData("decimals", [])
          },
          {
            target: assetAddr,
            allowFailure: true,
            callData: erc20Iface.encodeFunctionData("symbol", [])
          }
        ];
        if (address && isAddress(address)) {
          callsB.push({
            target: assetAddr,
            allowFailure: true,
            callData: erc20Iface.encodeFunctionData("balanceOf", [address])
          });
          if (adapter) {
            callsB.push({
              target: assetAddr,
              allowFailure: true,
              callData: erc20Iface.encodeFunctionData("allowance", [
                address,
                oftTrimmed
              ])
            });
          }
        }

        const resB = await multicall3Aggregate3StaticCall(provider, callsB);
        let bi = 0;
        const decRaw = decodeMulticallResult<number>(
          erc20Iface,
          "decimals",
          resB[bi++]
        );
        const decN = Number(decRaw);
        if (!Number.isFinite(decN) || decN < 0 || decN > 255) {
          await runSequential();
          return;
        }
        setDecimals(decN);

        const symDecoded = decodeMulticallResult<string>(
          erc20Iface,
          "symbol",
          resB[bi++]
        );
        const symLabel =
          symDecoded != null && String(symDecoded).trim() !== ""
            ? String(symDecoded)
            : "?";
        setSymbol(symLabel);

        if (address && isAddress(address)) {
          const bal = decodeMulticallResult<bigint>(
            erc20Iface,
            "balanceOf",
            resB[bi++]
          );
          if (bal != null) {
            setBalanceFormatted(formatUnits(bal, decN));
            setTokenBalanceLD(bal);
          } else {
            setBalanceFormatted(null);
            setTokenBalanceLD(null);
          }
          if (adapter) {
            const alw = decodeMulticallResult<bigint>(
              erc20Iface,
              "allowance",
              resB[bi++]
            );
            setAllowance(alw ?? null);
          } else {
            setAllowance(null);
          }
        } else {
          setBalanceFormatted(null);
          setTokenBalanceLD(null);
          setAllowance(null);
        }

        let approvalHint = "";
        if (adapter) {
          const req = decodeMulticallResult<boolean>(
            oftDetectIface,
            "approvalRequired",
            resA[1]
          );
          if (req === true) {
            approvalHint = t("lz.approveUnderlying");
          } else if (req === false) {
            approvalHint = t("lz.approvalNotRequired");
          } else {
            approvalHint = t("lz.adapterApprovalHint");
          }
        }

        if (!silent) {
          toast.success(
            adapter
              ? t("lz.detectedAdapter", {
                  symbol: symLabel,
                  hint: approvalHint
                })
              : t("lz.detectedOft")
          );
        }
      } catch {
        await runSequential();
      }
    } catch (e: unknown) {
      toast.error(formatBridgeContractError(e) || t("lz.contractReadFailed"));
    } finally {
      setIsLoadingMeta(false);
    }
  };

  const approveAdapter = async () => {
    if (!isAdapterMode || !underlyingAddress || !isAddress(underlyingAddress)) {
      toast.error(t("lz.loadAdapterFirst"));
      return;
    }
    const signer = await getSigner();
    if (!signer) {
      toast.error(t("lz.connectFirst"));
      return;
    }
    setIsApproving(true);
    try {
      const erc20 = new Contract(underlyingAddress, ERC20_ABI, signer);
      const tx = await erc20.approve(oftTrimmed, MaxUint256);
      toast.message(t("lz.submittingApproval"));
      await tx.wait();
      toast.success(t("lz.approvalConfirmed"));
      await loadTokenMeta();
    } catch (e: unknown) {
      toast.error(formatBridgeContractError(e) || t("lz.approvalFailed"));
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * OFTAdapter: on-chain allowance below amount approves exact amount, then quoteSend then send (msg.value = nativeFee).
   */
  const bridgeQuoteApproveSend = async () => {
    if (!canQuoteOrSend || decimals == null) {
      toast.error(t("lz.completeForm"));
      return;
    }
    const signer = await getSigner();
    if (!signer) {
      toast.error(t("lz.connectFirst"));
      return;
    }

    const amt = amountStr.trim() === "" ? "0" : amountStr.trim();
    let amountLD: bigint;
    try {
      amountLD = getDecimalBigNumber(amt, decimals);
    } catch {
      toast.error(t("lz.invalidAmount"));
      return;
    }
    if (amountLD <= 0n) {
      toast.error(t("lz.amountMustBePositive"));
      return;
    }
    if (tokenBalanceLD != null && amountLD > tokenBalanceLD) {
      const balHint =
        balanceFormatted != null && symbol
          ? ` (${balanceFormatted} ${symbol})`
          : "";
      toast.error(t("lz.amountExceedsBalanceToast", { hint: balHint }));
      return;
    }

    const minAmountLD = (amountLD * BigInt(10000 - slippageBpsNum!)) / 10000n;
    const sendParam = buildSendParam(
      dstEidNum!,
      recipientTrimmed,
      amountLD,
      minAmountLD,
      extraOptions.trim() || "0x",
      composeMsg.trim() || "0x",
      oftCmd.trim() || "0x"
    );

    const provider = (await getProvider()) ?? getDefaultReadonlyProvider();
    if (!provider) {
      toast.error(t("lz.cannotConnectRpc"));
      return;
    }

    const parseManualGasLimit = (): bigint | null => {
      const t = sendGasLimitInput.trim();
      if (t === "") return null;
      if (!/^\d+$/.test(t)) return null;
      const n = Number(t);
      if (!Number.isSafeInteger(n) || n < 21000 || n > 30_000_000) return null;
      return BigInt(n);
    };

    setNativeFee(BigInt(0));
    setLzTokenFee(BigInt(0));
    setLastBridgeScanLink(null);
    setLastBridgeTxHash(null);
    setIsBridgeOneClick(true);
    try {
      const refundAddress = await signer.getAddress();

      if (isAdapterMode && underlyingAddress && address) {
        const erc20Read = new Contract(underlyingAddress, ERC20_ABI, provider);
        const alw = await erc20Read.allowance(address, oftTrimmed);
        if (alw < amountLD) {
          const erc20Signer = new Contract(
            underlyingAddress,
            ERC20_ABI,
            signer
          );
          const approveTx = await erc20Signer.approve(oftTrimmed, amountLD);
          await approveTx.wait();
          toast.success(t("lz.allowanceConfirmed"));
        }
      }

      const net = await provider.getNetwork();
      setChainId(Number(net.chainId));

      const cRead = new Contract(oftTrimmed, OFT_ABI, provider);
      const [nativeFeeLocal, lzTokenFeeLocal]: bigint[] = await cRead.quoteSend(
        sendParam,
        false
      );
      setNativeFee(nativeFeeLocal);
      setLzTokenFee(lzTokenFeeLocal);

      const sendValue = nativeFeeLocal;
      const feeTuple = {
        nativeFee: nativeFeeLocal,
        lzTokenFee: lzTokenFeeLocal ?? BigInt(0)
      };

      const c = new Contract(oftTrimmed, OFT_ABI, signer);
      const manualGas = parseManualGasLimit();
      let gasLimit: bigint | undefined;
      if (manualGas != null) {
        gasLimit = manualGas;
      } else {
        try {
          const est = await c.send.estimateGas(
            sendParam,
            feeTuple,
            refundAddress,
            { value: sendValue }
          );
          gasLimit = (est * 130n) / 100n;
        } catch (estErr: unknown) {
          toast.error(formatBridgeContractError(estErr, decimals));
          return;
        }
      }

      const routeSummary = formatLzBridgeRouteSummary(
        Number(net.chainId),
        sendParam[0],
        { tokenSymbol: symbol, amount: amountStr.trim() }
      );
      toast.message(t("lz.submittingTx", { route: routeSummary }));
      const tx = await c.send(sendParam, feeTuple, refundAddress, {
        value: sendValue,
        gasLimit
      });
      toast.message(t("lz.txSubmitted", { route: routeSummary }));
      const receipt = await tx.wait();

      const txHash = receipt.transactionHash;
      const scanLink = getLayerZeroScanLink(
        txHash,
        sendParam[0] >= 40_000 && sendParam[0] < 50_000
      );
      toast.success(
        <span>
          {t("lz.bridgeSubmitted")}{" "}
          <a href={scanLink} target="_blank" rel="noreferrer">
            {t("lz.viewOnScan")}
          </a>
        </span>
      );
      setLastBridgeScanLink(scanLink);
      setLastBridgeTxHash(txHash);

      await loadTokenMeta({ silent: true });
    } catch (e: unknown) {
      setLastBridgeScanLink(null);
      setLastBridgeTxHash(null);
      toast.error(
        formatBridgeContractError(e, decimals) || t("lz.bridgeFailed")
      );
    } finally {
      setIsBridgeOneClick(false);
    }
  };

  return (
    <div className="feature-page main-app lz-bridge">
      <section className="feature-hero">
        <h1>{t("lz.title")}</h1>

        <p className="lz-bridge-hero-note">
          {t("lz.docsLabel")}{" "}
          <a
            href="https://docs.layerzero.network/v2/developers/evm/oft/quickstart"
            target="_blank"
            rel="noreferrer"
          >
            {t("lz.docsLink")}
          </a>
        </p>
      </section>

      <section className="feature-panel">
        <h3>{t("common.selectChain")}</h3>
        <div className="feature-field">
          <label htmlFor="lz-source-chain">{t("common.chain")}</label>
          <select
            id="lz-source-chain"
            className="app-header-network-select"
            style={{ width: "100%", maxWidth: "100%" }}
            value={selectedSourceChainId}
            onChange={(e) => void handleSourceChainSelectChange(e)}
            aria-label={t("common.selectChain")}
          >
            {faucetChainIdList.map((cid) => (
              <option key={cid} value={cid}>
                {getChainName(cid)}
              </option>
            ))}
          </select>
        </div>
        <p className="feature-field" style={{ marginBottom: 0 }}>
          {t("common.current")}:{" "}
          <strong>
            {walletChainNum != null ? getChainName(walletChainNum) : "—"}
          </strong>
        </p>
      </section>

      <section className="feature-panel">
        <h3>{t("lz.oftSection")}</h3>

        <div className="feature-field">
          <label htmlFor="lz-oft-addr">{t("lz.oftAddress")}</label>
          <input
            id="lz-oft-addr"
            type="text"
            value={oftAddress}
            onChange={(e) => setOftAddress(e.target.value)}
            placeholder={oftAddressPlaceholder}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="feature-actions feature-actions--inline">
          {!isConnected ? (
            <button
              type="button"
              className="cta-button connect-wallet-button"
              onClick={() => void openConnectModal()}
              disabled={isConnectingWallet}
            >
              {isConnectingWallet
                ? t("common.connecting")
                : t("common.connectWallet")}
            </button>
          ) : needsMetaChainSwitch ? (
            <button
              type="button"
              className="cta-button mint-nft-button"
              onClick={() => void switchToMetaChain(selectedSourceChainId)}
              disabled={!canReadMeta || isSwitchingMetaChain}
            >
              {isSwitchingMetaChain ? (
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
                      marginRight: "8px",
                      verticalAlign: "middle"
                    }}
                  />
                  {t("common.switchingEllipsis")}
                </>
              ) : (
                t("common.switchToChain", {
                  chain: getChainName(selectedSourceChainId)
                })
              )}
            </button>
          ) : (
            <button
              type="button"
              className="cta-button mint-nft-button"
              onClick={() => void loadTokenMeta()}
              disabled={!canReadMeta || isLoadingMeta}
            >
              {isLoadingMeta ? t("common.loading") : t("lz.loadMetadata")}
            </button>
          )}
        </div>

        {symbol != null && decimals != null && (
          <div className="feature-result" style={{ marginTop: 14 }}>
            <div>
              {t("lz.mode")}{" "}
              <b>{isAdapterMode ? t("lz.oftAdapter") : t("lz.oft")}</b>
              {isAdapterMode && underlyingAddress && (
                <>
                  <br />
                  {t("lz.underlying")}{" "}
                  <span
                    style={{
                      fontFamily: "var(--w3-font-mono)",
                      fontSize: "0.9em"
                    }}
                  >
                    {underlyingAddress}
                  </span>
                </>
              )}
            </div>
            <div style={{ marginTop: 6 }}>
              {t("lz.nameDecimals", { symbol, decimals: String(decimals) })}
              {balanceFormatted != null && (
                <>{t("lz.balance", { balance: balanceFormatted })}</>
              )}
            </div>
            {isAdapterMode && allowance != null && address && (
              <div style={{ marginTop: 6, opacity: 0.9 }}>
                {t("lz.allowanceToAdapter")}{" "}
                <b>{formatAllowanceForDisplay(allowance, decimals)}</b>
                <span> {symbol}</span>
                {parsedAmountLD != null &&
                  allowance >= parsedAmountLD &&
                  t("lz.coversAmount")}
                {allowanceInsufficient && parsedAmountLD != null && (
                  <span style={{ color: "var(--lz-amber)", marginLeft: 8 }}>
                    {t("lz.insufficientAllowance")}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <h3 style={{ marginTop: 28 }}>{t("lz.bridgeParams")}</h3>

        <div className="feature-field lz-bridge-param-main">
          <label htmlFor="lz-amount">{t("common.amount")}</label>
          <input
            id="lz-amount"
            type="text"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value)}
            placeholder={
              decimals != null ? "e.g. 1" : t("lz.loadDecimalsFirst")
            }
            spellCheck={false}
            autoComplete="off"
            aria-invalid={amountExceedsBalance}
          />
          {amountExceedsBalance && (
            <p
              className="feature-field-hint"
              style={{
                marginTop: 8,
                marginBottom: 0,
                color: "var(--lz-amber)"
              }}
            >
              {t("lz.amountExceedsBalance")}
              {balanceFormatted != null && symbol != null && (
                <>
                  {" "}
                  (<b>{balanceFormatted}</b> {symbol})
                </>
              )}
              .
            </p>
          )}
        </div>

        <div className="lz-bridge-rail" style={{ marginTop: 12 }}>
          <div className="lz-bridge-rail-label">{t("lz.destinationLabel")}</div>
          <div className="feature-field" style={{ marginBottom: 8 }}>
            <label htmlFor="lz-dst-preset">{t("lz.commonEids")}</label>
            <select
              id="lz-dst-preset"
              className="app-header-network-select"
              style={{ width: "100%", maxWidth: "100%" }}
              value={
                dstEidNum != null &&
                dstPresetChoices.some((p) => p.eid === dstEidNum)
                  ? String(dstEidNum)
                  : ""
              }
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                setDstEidInput(v);
                const n = Number(v);
                if (Number.isFinite(n) && n > 0 && n < 0xffffffff) {
                  persistDstEid(Math.floor(n));
                }
              }}
            >
              <option value="">{t("lz.pickPreset")}</option>
              {dstPresetChoices.map((p) => (
                <option key={p.eid} value={String(p.eid)}>
                  {t(p.key)}
                </option>
              ))}
            </select>
          </div>
          <div className="feature-field" style={{ marginBottom: 0 }}>
            <label htmlFor="lz-dst-eid">{t("lz.dstEid")}</label>
            <input
              id="lz-dst-eid"
              type="text"
              inputMode="numeric"
              value={dstEidInput}
              onChange={(e) => setDstEidInput(e.target.value)}
              onBlur={() => {
                if (dstEidNum != null) persistDstEid(dstEidNum);
              }}
              spellCheck={false}
              aria-invalid={dstEidEqualsSourceChain}
            />
          </div>
          {dstEidEqualsSourceChain && (
            <p
              className="feature-field-hint"
              style={{ marginTop: 8, marginBottom: 0 }}
            >
              {t("lz.dstEidConflict")}
            </p>
          )}
        </div>

        <div className="feature-field">
          <label htmlFor="lz-recipient">{t("lz.recipient")}</label>
          <input
            id="lz-recipient"
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x…"
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="feature-field">
          <label htmlFor="lz-slippage">{t("lz.slippage")}</label>
          <input
            id="lz-slippage"
            type="text"
            inputMode="numeric"
            value={slippageBps}
            onChange={(e) => setSlippageBps(e.target.value)}
          />
        </div>

        <details className="lz-bridge-advanced">
          <summary className="lz-bridge-advanced-summary">
            {t("lz.advanced")}
          </summary>

          <div className="feature-field">
            <label htmlFor="lz-extra">{t("lz.extraOptions")}</label>
            <input
              id="lz-extra"
              type="text"
              value={extraOptions}
              onChange={(e) => setExtraOptions(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="feature-field">
            <label htmlFor="lz-compose">{t("lz.composeMsg")}</label>
            <input
              id="lz-compose"
              type="text"
              value={composeMsg}
              onChange={(e) => setComposeMsg(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="feature-field">
            <label htmlFor="lz-oftcmd">{t("lz.oftCmd")}</label>
            <input
              id="lz-oftcmd"
              type="text"
              value={oftCmd}
              onChange={(e) => setOftCmd(e.target.value)}
              spellCheck={false}
            />
          </div>
          <div className="feature-field">
            <label htmlFor="lz-send-gas">{t("lz.gasLimit")}</label>
            <input
              id="lz-send-gas"
              type="text"
              inputMode="numeric"
              value={sendGasLimitInput}
              onChange={(e) => setSendGasLimitInput(e.target.value)}
              placeholder={t("lz.gasLimitPlaceholder")}
              spellCheck={false}
            />
          </div>
        </details>

        <div className="lz-fee-card">
          <div className="lz-fee-row">
            <span className="lz-fee-label">{t("lz.nativeFee")}</span>
            <span className="lz-fee-value">{nativeFee.toString()}</span>
          </div>
          <div className="lz-fee-row">
            <span className="lz-fee-label">{t("lz.lzTokenFee")}</span>
            <span className="lz-fee-value">{lzTokenFee.toString()}</span>
          </div>
          <div className="lz-fee-row">
            <span className="lz-fee-label">{t("lz.sendMsgValue")}</span>
            <span className="lz-fee-value lz-fee-value--warn">
              {nativeFee.toString()}
            </span>
          </div>
          {lzTokenFee > 0n && (
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                fontSize: "0.78rem",
                color: "var(--lz-amber)",
                lineHeight: 1.45
              }}
            >
              {t("lz.lzTokenFeeHint")}
            </p>
          )}
        </div>

        <div className="feature-actions feature-actions--inline lz-bridge-send-row">
          <button
            type="button"
            className="cta-button mint-nft-button"
            onClick={bridgeQuoteApproveSend}
            disabled={
              !canQuoteOrSend ||
              decimals == null ||
              isBridgeOneClick ||
              amountExceedsBalance
            }
            title={t("lz.bridgeTitle")}
          >
            {isBridgeOneClick ? t("common.processing") : t("lz.bridgeNow")}
          </button>
          {lastBridgeScanLink != null && (
            <>
              {lastBridgeTxHash != null && (
                <a
                  className="lz-bridge-tx-hash-inline"
                  href={lastBridgeScanLink}
                  target="_blank"
                  rel="noreferrer"
                  title={lastBridgeTxHash}
                >
                  {t("lz.scanLink", {
                    hash: truncateHash(lastBridgeTxHash)
                  })}
                </a>
              )}
            </>
          )}
        </div>

        <p className="lz-bridge-disclaimer">{t("lz.disclaimer")}</p>
      </section>
    </div>
  );
};

export default LayerZeroOFTBridgePage;
