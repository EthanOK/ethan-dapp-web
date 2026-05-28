import { useMemo } from "react";
import { useAppKitNetwork } from "@reown/appkit/react";

/** Active AppKit network + numeric chain id when available. */
export function useWalletChain() {
  const {
    chainId: chainIdCurrent,
    caipNetwork,
    switchNetwork
  } = useAppKitNetwork();

  const chainIdNum = useMemo(() => {
    if (chainIdCurrent == null) return null;
    const n = Number(chainIdCurrent);
    return Number.isFinite(n) ? n : null;
  }, [chainIdCurrent]);

  return {
    chainIdCurrent,
    chainIdNum,
    caipNetwork,
    switchNetwork
  };
}
