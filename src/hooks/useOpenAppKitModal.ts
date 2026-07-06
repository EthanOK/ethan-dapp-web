import { useCallback, useState } from "react";
import { toast } from "sonner";
import { tGlobal } from "@/i18n";
import { modal } from "@/app/Wallet";

type AppKitModalLike = {
  open?: () => Promise<void> | void;
};

/** Open AppKit connect modal and mark Reown login type in localStorage. */
export function useOpenAppKitModal() {
  const [isConnecting, setIsConnecting] = useState(false);

  const openConnectModal = useCallback(async () => {
    setIsConnecting(true);
    try {
      localStorage.setItem("LoginType", "reown");
      const maybeModal = modal as unknown as AppKitModalLike;
      await maybeModal?.open?.();
    } catch (error) {
      console.error("Connect failed:", error);
      localStorage.removeItem("LoginType");
      toast.error(tGlobal("wallet.connectFailed"));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return { isConnecting, openConnectModal };
}
