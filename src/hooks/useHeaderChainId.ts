import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { tGlobal } from "@/i18n";
import { DefaultChainId } from "@/config/SystemConfiguration";
import { getDefaultNetwork } from "@/app/Wallet";
import {
  dispatchAppNetworkChanged,
  useSwitchAppKitNetwork
} from "@/hooks/useSwitchAppKitNetwork";

type HeaderChainSync = {
  isConnected: boolean;
  address?: string;
  currentChainId?: string | number;
};

function chainIdValueFromAppKit(currentChainId: string | number): string {
  const active = getDefaultNetwork(currentChainId);
  return String(
    (active as { caipNetworkId?: string; id?: string | number })
      .caipNetworkId ?? (active as { id?: string | number }).id
  );
}

/** Header network selector value synced with AppKit + localStorage. */
export function useHeaderChainId(wallet: HeaderChainSync) {
  const { isConnected, address, currentChainId } = wallet;
  const [chainId, setChainId] = useState<string>(
    () => localStorage.getItem("chainId") || DefaultChainId
  );
  const { switchNetwork } = useSwitchAppKitNetwork();

  useEffect(() => {
    if (!isConnected || !address) return;
    if (currentChainId === undefined || currentChainId === null) return;
    setChainId(chainIdValueFromAppKit(currentChainId));
  }, [isConnected, address, currentChainId]);

  const handleHeaderNetworkChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const nextId = e?.target?.value;
      if (!nextId) return;
      setChainId(nextId);
      localStorage.setItem("chainId", nextId);
      dispatchAppNetworkChanged(nextId);
      try {
        await switchNetwork(nextId);
      } catch (err) {
        console.error("Switch network failed:", err);
        toast.error(tGlobal("error.switchNetwork"));
      }
    },
    [switchNetwork]
  );

  return { chainId, setChainId, handleHeaderNetworkChange };
}
