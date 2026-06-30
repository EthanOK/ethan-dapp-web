import { useEffect, useRef } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { toast } from "sonner";
import { getDefaultNetwork, modal } from "@/app/Wallet";
import { ensureLoggedIn } from "@/lib/wallet/ConnectWallet";
import {
  clearAppSessionKeepChainId,
  hasValidSessionToken
} from "@/lib/wallet/sessionToken";
import { dispatchAppNetworkChanged } from "@/hooks/useSwitchAppKitNetwork";

export { clearAppSessionKeepChainId };

function persistChainIdFromAppKit(currentChainId: string | number | undefined) {
  if (currentChainId === undefined || currentChainId === null) return;
  const active = getDefaultNetwork(currentChainId);
  const activeValue = String(
    (active as { caipNetworkId?: string; id?: string | number })
      .caipNetworkId ?? (active as { id?: string | number }).id
  );
  localStorage.setItem("chainId", activeValue);
  dispatchAppNetworkChanged(activeValue);
  return activeValue;
}

/**
 * App shell: SIWE login after connect, chain id persistence, Solana/BTC balance refresh.
 */
export function useReownWalletSync() {
  const { address, isConnected } = useAppKitAccount();
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const bitcoinAccount = useAppKitAccount({ namespace: "bip122" });
  const { chainId: currentChainId, caipNetwork } = useAppKitNetwork();
  const loginPendingRef = useRef(false);

  useEffect(() => {
    if (isConnected && address) {
      if (currentChainId === undefined || currentChainId === null) return;
      persistChainIdFromAppKit(currentChainId);
    }
  }, [isConnected, address, currentChainId]);

  useEffect(() => {
    if (caipNetwork?.chainNamespace !== "bip122") return;
    if (!bitcoinAccount?.isConnected || !bitcoinAccount?.address) return;
    if (currentChainId === undefined || currentChainId === null) return;
    persistChainIdFromAppKit(currentChainId);
  }, [
    caipNetwork?.chainNamespace,
    bitcoinAccount?.isConnected,
    bitcoinAccount?.address,
    currentChainId
  ]);

  useEffect(() => {
    const isSolana = caipNetwork?.chainNamespace === "solana";
    const solAddress = solanaAccount?.address;
    if (!isSolana || !solanaAccount?.isConnected || !solAddress) return;
    if (currentChainId === undefined || currentChainId === null) return;
    try {
      modal?.updateNativeBalance(solAddress, currentChainId as never, "solana");
    } catch (e) {
      console.warn("updateNativeBalance (solana) failed", e);
    }
  }, [
    caipNetwork?.chainNamespace,
    solanaAccount?.isConnected,
    solanaAccount?.address,
    currentChainId
  ]);

  useEffect(() => {
    const isBitcoin = caipNetwork?.chainNamespace === "bip122";
    const btcAddress = bitcoinAccount?.address;
    if (!isBitcoin || !bitcoinAccount?.isConnected || !btcAddress) return;
    if (currentChainId === undefined || currentChainId === null) return;
    try {
      modal?.updateNativeBalance(btcAddress, currentChainId as never, "bip122");
    } catch (e) {
      console.warn("updateNativeBalance (bip122) failed", e);
    }
  }, [
    caipNetwork?.chainNamespace,
    bitcoinAccount?.isConnected,
    bitcoinAccount?.address,
    currentChainId
  ]);

  useEffect(() => {
    const loginType = localStorage.getItem("LoginType");
    const storedAccount = localStorage.getItem("userAddress");
    const storedConnect = localStorage.getItem("@appkit/connection_status");

    if (
      loginType === "reown" &&
      storedConnect === "disconnected" &&
      storedAccount
    ) {
      clearAppSessionKeepChainId();
      return;
    }

    if (loginType !== "reown" || !isConnected || !address) return;

    // Valid token for this address — skip SIWE signature and /api/login
    if (hasValidSessionToken(address)) {
      if (address.toLowerCase() !== storedAccount?.toLowerCase()) {
        localStorage.setItem("userAddress", address);
      }
      return;
    }

    if (loginPendingRef.current) return;

    loginPendingRef.current = true;

    ensureLoggedIn(address).then((result) => {
      loginPendingRef.current = false;
      if (result) {
        localStorage.setItem("userAddress", address);
        if (result.signature) {
          toast.success("Success, BaBy is ready to use!");
        }
      } else {
        clearAppSessionKeepChainId();
        toast.error("Login failed. Please sign in again.");
      }
    });
  }, [isConnected, address]);

  return {
    address,
    isConnected,
    solanaAccount,
    bitcoinAccount,
    currentChainId,
    caipNetwork
  };
}
