import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import { getDefaultReadonlyProvider, getProvider } from "../utils/GetProvider";
import { isAddress } from "../utils/Utils";
import { SupportChains } from "../common/ChainsConfig";
import {
  decodeMulticallResult,
  multicall3Aggregate3StaticCall
} from "utils/multicall3";

const PLACEHOLDER_TOKEN = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT
const PLACEHOLDER_OWNER = "0xe698a7917eEE4fDf03296add549eE4A7167DD406";
const PLACEHOLDER_SPENDER = "0x1111111254EEB25477B68fb85Ed929f73A960582"; // 1inch Router v5 (example)

type AllowanceResult = {
  tokenAddress: string;
  owner: string;
  spender: string;
  chainId?: number;
  symbol?: string;
  decimals?: number;
  raw: string;
  formatted: string;
};

const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

const ERC20AllowancePage = () => {
  const { address, isConnected } = useAppKitAccount();

  const [selectedChainIdRaw, setSelectedChainIdRaw] = useState<string>(() =>
    (localStorage.getItem("chainId") ?? "").trim()
  );
  const [tokenAddress, setTokenAddress] = useState(PLACEHOLDER_TOKEN);
  const [owner, setOwner] = useState(PLACEHOLDER_OWNER);
  const [spender, setSpender] = useState(PLACEHOLDER_SPENDER);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AllowanceResult | null>(null);

  useEffect(() => {
    const onNetworkChanged = (e: Event) => {
      const detail = (e as CustomEvent<{ chainId: string }>).detail;
      if (detail?.chainId != null)
        setSelectedChainIdRaw(String(detail.chainId));
    };
    window.addEventListener("app-network-changed", onNetworkChanged);
    return () =>
      window.removeEventListener("app-network-changed", onNetworkChanged);
  }, []);

  useEffect(() => {
    if (isConnected && address) setOwner(address);
  }, [isConnected, address]);

  const tokenAddressTrimmed = tokenAddress.trim();
  const ownerTrimmed = owner.trim();
  const spenderTrimmed = spender.trim();

  const canQuery = useMemo(() => {
    return (
      isAddress(tokenAddressTrimmed) &&
      isAddress(ownerTrimmed) &&
      isAddress(spenderTrimmed)
    );
  }, [tokenAddressTrimmed, ownerTrimmed, spenderTrimmed]);

  const selectedNetworkLabel = useMemo(() => {
    const stored = (selectedChainIdRaw ?? "").trim();
    let evmId: number | null = null;

    if (stored.startsWith("eip155:")) {
      const id = stored.split(":")[1];
      const n = Number(id);
      evmId = Number.isFinite(n) ? n : null;
    } else if (/^\d+$/.test(stored)) {
      const n = Number(stored);
      evmId = Number.isFinite(n) ? n : null;
    }

    if (typeof evmId === "number") {
      const chain = SupportChains.find((c) => Number(c.id) === evmId);
      return chain ? `${chain.name} (${evmId})` : `chainId ${evmId}`;
    }

    return stored ? `chainId ${stored}` : "unknown network";
  }, [selectedChainIdRaw]);

  const queryAllowance = async () => {
    if (!isAddress(tokenAddressTrimmed)) {
      toast.error("Invalid token contract address");
      return;
    }
    if (!isAddress(ownerTrimmed)) {
      toast.error("Invalid owner address");
      return;
    }
    if (!isAddress(spenderTrimmed)) {
      toast.error("Invalid spender address");
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const provider = (await getProvider()) ?? getDefaultReadonlyProvider();
      if (!provider) {
        toast.error(`No EVM provider for ${selectedNetworkLabel}`);
        return;
      }

      let chainIdFromProvider: number | undefined = undefined;
      try {
        const network = await provider.getNetwork();
        chainIdFromProvider = network?.chainId;
      } catch {
        // ignore network detection failures for readonly RPC
      }

      const parseCallError = (err: unknown): string => {
        const e = err as {
          code?: string | number;
          reason?: string;
          error?: { message?: string };
          data?: string;
          message?: string;
        };
        const msg = String(
          e?.reason ?? e?.error?.message ?? e?.message ?? "Call failed"
        );
        const isCallException =
          String(e?.code) === "CALL_EXCEPTION" ||
          /missing revert data|call exception/i.test(msg);
        if (isCallException) {
          return "Call reverted (missing revert data). Common causes: wrong network, token not ERC20, or token not deployed on this chain.";
        }
        return msg;
      };

      // Single static call via Multicall3: decimals, symbol, allowance
      const erc20Iface = new ethers.utils.Interface(ERC20_ABI);
      const calls = [
        {
          target: tokenAddressTrimmed,
          allowFailure: true,
          callData: erc20Iface.encodeFunctionData("decimals", [])
        },
        {
          target: tokenAddressTrimmed,
          allowFailure: true,
          callData: erc20Iface.encodeFunctionData("symbol", [])
        },
        {
          target: tokenAddressTrimmed,
          allowFailure: true,
          callData: erc20Iface.encodeFunctionData("allowance", [
            ownerTrimmed,
            spenderTrimmed
          ])
        }
      ];

      let res: Awaited<ReturnType<typeof multicall3Aggregate3StaticCall>>;
      try {
        res = await multicall3Aggregate3StaticCall(provider, calls);
      } catch (err: unknown) {
        toast.error(parseCallError(err));
        return;
      }

      const decimalsRaw = decodeMulticallResult<number>(
        erc20Iface,
        "decimals",
        res[0]
      );
      const decimals = Number.isFinite(Number(decimalsRaw))
        ? Number(decimalsRaw)
        : 18;
      const symbol = decodeMulticallResult<string>(
        erc20Iface,
        "symbol",
        res[1]
      );

      const rawAllowance = decodeMulticallResult<ethers.BigNumber>(
        erc20Iface,
        "allowance",
        res[2]
      );
      if (!rawAllowance) {
        toast.error(`allowance() failed on ${selectedNetworkLabel}`);
        return;
      }

      const raw = rawAllowance.toString();
      const formatted = ethers.utils.formatUnits(rawAllowance, decimals);
      setResult({
        tokenAddress: tokenAddressTrimmed,
        owner: ownerTrimmed,
        spender: spenderTrimmed,
        chainId: chainIdFromProvider,
        symbol,
        decimals,
        raw,
        formatted
      });
      toast.success("Query successful");
    } catch (err: unknown) {
      const e = err as { reason?: string; message?: string };
      toast.error(e?.reason ?? e?.message ?? "Query failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>ERC20 Allowance Checker</h1>
        <p>Check how much an ERC20 owner has approved for a spender.</p>
      </section>

      <section className="feature-panel">
        <h3>Inputs</h3>
        <p className="feature-field-hint">
          Token is the ERC20 contract. Owner is the token holder. Spender is the
          approved address (often a router/contract).
        </p>

        <div className="feature-field">
          <label htmlFor="allowance-token">Token Contract</label>
          <input
            id="allowance-token"
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder={PLACEHOLDER_TOKEN}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="feature-field">
          <label htmlFor="allowance-owner">Owner</label>
          <input
            id="allowance-owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder={PLACEHOLDER_OWNER}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="feature-field">
          <label htmlFor="allowance-spender">Spender</label>
          <input
            id="allowance-spender"
            type="text"
            value={spender}
            onChange={(e) => setSpender(e.target.value)}
            placeholder={PLACEHOLDER_SPENDER}
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div className="feature-actions feature-actions--inline">
          <button
            type="button"
            onClick={queryAllowance}
            className="cta-button mint-nft-button"
            disabled={!canQuery || isLoading}
          >
            {isLoading ? "Querying…" : "Check Allowance"}
          </button>
        </div>

        {result && (
          <div className="feature-result" style={{ marginTop: 12 }}>
            <div style={{ opacity: 0.9, marginBottom: 8 }}>
              Network chainId: <b>{String(result.chainId ?? "-")}</b>
            </div>
            <div style={{ opacity: 0.9, marginBottom: 8 }}>
              Token: <b>{result.symbol ?? "-"}</b> (decimals:{" "}
              <b>{String(result.decimals ?? "-")}</b>)
            </div>
            <div style={{ marginBottom: 8 }}>
              Allowance (formatted): <b>{result.formatted}</b>
            </div>
            <div style={{ wordBreak: "break-all", opacity: 0.85 }}>
              Allowance (raw): <b>{result.raw}</b>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ERC20AllowancePage;
