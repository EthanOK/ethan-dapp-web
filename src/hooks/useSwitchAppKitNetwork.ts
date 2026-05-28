import { useCallback, useState } from "react";
import { toast } from "sonner";
import { getDefaultNetwork, modal } from "@/app/Wallet";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";

export function dispatchAppNetworkChanged(chainId: number | string) {
  window.dispatchEvent(
    new CustomEvent("app-network-changed", {
      detail: { chainId: String(chainId) }
    })
  );
}

/** Switch wallet network via AppKit; optional poll until signer chain matches. */
export function useSwitchAppKitNetwork() {
  const [isSwitching, setIsSwitching] = useState(false);

  const switchNetwork = useCallback(async (chainId: number | string) => {
    await modal.switchNetwork(getDefaultNetwork(chainId));
  }, []);

  const switchToChainAndWait = useCallback(
    async (
      targetChainId: number,
      options?: { timeoutMs?: number; onMismatchMessage?: string }
    ): Promise<boolean> => {
      const timeoutMs = options?.timeoutMs ?? 15000;
      setIsSwitching(true);
      try {
        await modal.switchNetwork(getDefaultNetwork(targetChainId));
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
          const [, cid] = await getSignerAndChainId();
          if (cid === targetChainId) {
            localStorage.setItem("chainId", String(targetChainId));
            dispatchAppNetworkChanged(targetChainId);
            return true;
          }
          await new Promise((r) => setTimeout(r, 400));
        }
        const [, current] = await getSignerAndChainId();
        if (current === targetChainId) {
          localStorage.setItem("chainId", String(targetChainId));
          dispatchAppNetworkChanged(targetChainId);
          return true;
        }
        toast.error(
          options?.onMismatchMessage ??
            `Failed to switch to chain ${targetChainId}; switch manually in the wallet`
        );
        return false;
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error("切换链失败，请手动切换");
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    []
  );

  return { isSwitching, switchNetwork, switchToChainAndWait };
}
