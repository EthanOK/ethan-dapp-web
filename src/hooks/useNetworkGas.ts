import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchNetworkGasSnapshot,
  parseEvmChainId,
  type NetworkGasSnapshot
} from "@/lib/evm/GasStrategy";
import { getReadonlyProviderForChain } from "@/lib/wallet/GetProvider";

const POLL_MS = 30_000;

export function useNetworkGas(chainId: string | number | undefined) {
  const [snapshot, setSnapshot] = useState<NetworkGasSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const evmChainId = parseEvmChainId(chainId);
    if (evmChainId == null) {
      setSnapshot(null);
      setError(null);
      setLoading(false);
      return;
    }

    const provider = getReadonlyProviderForChain(evmChainId);
    if (!provider) {
      setSnapshot(null);
      setError("no-rpc");
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const next = await fetchNetworkGasSnapshot(provider, evmChainId);
      if (requestId !== requestIdRef.current) return;
      setSnapshot(next);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setSnapshot(null);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [chainId]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      void refresh();
    }, POLL_MS);

    const onNetworkChanged = () => {
      void refresh();
    };
    window.addEventListener("app-network-changed", onNetworkChanged);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener("app-network-changed", onNetworkChanged);
    };
  }, [refresh]);

  return {
    snapshot,
    loading,
    error,
    refresh,
    isEvm: parseEvmChainId(chainId) != null
  };
}
