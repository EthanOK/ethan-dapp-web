import { useEffect, useRef } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { toast } from "sonner";
import { getDefaultNetwork, modal } from "@/app/Wallet";
import { login } from "@/lib/wallet/ConnectWallet";
import { dispatchAppNetworkChanged } from "@/hooks/useSwitchAppKitNetwork";

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

export function clearAppSessionKeepChainId() {
  localStorage.removeItem("userAddress");
}

/**
 * App shell: SIWE login after connect, chain id persistence, Solana/BTC balance refresh.
 */
export function useReownWalletSync() {
  const { address, isConnected } = useAppKitAccount();
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const bitcoinAccount = useAppKitAccount({ namespace: "bip122" });
  const { chainId: currentChainId, caipNetwork } = useAppKitNetwork();
  const prevIsConnectedRef = useRef(false);

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
    const wasConnected = prevIsConnectedRef.current;
    const justConnected = !wasConnected && isConnected;
    prevIsConnectedRef.current = isConnected;

    if (
      loginType === "reown" &&
      justConnected &&
      address &&
      address !== storedAccount
    ) {
      login().then((result) => {
        if (result) {
          localStorage.setItem("userAddress", address);
          toast.success("Success, BaBy is ready to use!");
        } else {
          clearAppSessionKeepChainId();
        }
      });
    }

    if (
      loginType === "reown" &&
      storedConnect === "disconnected" &&
      storedAccount
    ) {
      clearAppSessionKeepChainId();
    }
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
