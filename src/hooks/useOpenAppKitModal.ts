import { useCallback, useState } from "react";
import { toast } from "sonner";
import { tGlobal } from "@/i18n";
import { modal } from "@/app/Wallet";

type AppKitModalLike = {
  open?: () => Promise<void> | void;
};

/** Open AppKit connect modal. */
export function useOpenAppKitModal() {
  const [isConnecting, setIsConnecting] = useState(false);

  const openConnectModal = useCallback(async () => {
    setIsConnecting(true);
    try {
      const maybeModal = modal as unknown as AppKitModalLike;
      await maybeModal?.open?.();
    } catch (error) {
      console.error("Connect failed:", error);
      toast.error(tGlobal("wallet.connectFailed"));
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return { isConnecting, openConnectModal };
}
