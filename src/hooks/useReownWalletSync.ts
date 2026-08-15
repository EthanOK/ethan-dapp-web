import { useEffect, useRef } from "react";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import {
  ChainController,
  ConnectionController
} from "@reown/appkit-controllers";
import { toast } from "sonner";
import { tGlobal } from "@/i18n";
import { getDefaultNetwork, modal } from "@/app/Wallet";
import { ensureLoggedIn } from "@/lib/wallet/ConnectWallet";
import {
  activateSessionForAddress,
  clearAppSessionKeepChainId
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
  const { address, isConnected, status } = useAppKitAccount();
  const solanaAccount = useAppKitAccount({ namespace: "solana" });
  const bitcoinAccount = useAppKitAccount({ namespace: "bip122" });
  const { chainId: currentChainId, caipNetwork } = useAppKitNetwork();
  const loginPendingRef = useRef(false);

  // ---------------------------------------------------------------
  // Login defaults to EOA, refresh keeps the user's smart-account choice.
  //
  // Reown's frame remembers the account type on its own server side and its
  // `user.preferredAccountType` wins in `onAuthProviderConnected` — clearing
  // localStorage (or leaving the in-memory type as "eoa") is NOT enough, the
  // frame sometimes still returns the smart account. The only reliable way is
  // to actively push `setPreferredAccount("eoa")` to the frame after a real
  // login.
  //
  // "Real login" (force EOA) vs "refresh rehydrate" (keep user's AA choice):
  //   - refresh: connection_status starts as "connected" and never drops to
  //     "disconnected" in this page session.
  //   - fresh login / switch account / re-login: it went through "disconnected"
  //     (or there was no prior session at all).
  // ---------------------------------------------------------------
  const bootConnRef = useRef<string | null | undefined>(undefined);
  const sawDisconnectedRef = useRef(false);
  const prevConnectedRef = useRef(false);
  const forceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const conn = localStorage.getItem("@appkit/connection_status");
    if (bootConnRef.current === undefined) bootConnRef.current = conn;
    if (conn === "disconnected") sawDisconnectedRef.current = true;
  }, [isConnected, status]);

  useEffect(() => {
    const becameConnected = isConnected && !prevConnectedRef.current;
    prevConnectedRef.current = isConnected;
    if (!becameConnected) return;

    // Refresh rehydrate (was connected the whole time, never disconnected) →
    // keep the user's explicit smart-account choice.
    const isRefreshRehydrate =
      bootConnRef.current === "connected" && !sawDisconnectedRef.current;
    if (isRefreshRehydrate) return;

    // Wait for the connect/login flow (incl. SIWE) to settle, then push EOA to
    // the frame unconditionally (do NOT short-circuit on the in-memory value —
    // the frame is the source of truth and may still hold smartAccount).
    forceTimerRef.current = window.setTimeout(() => {
      void ConnectionController.setPreferredAccountType("eoa", "eip155").catch(
        () => {
          /* frame may reject; the official defaultAccountTypes is the fallback */
        }
      );
    }, 1500);
    return () => {
      if (forceTimerRef.current !== null) {
        window.clearTimeout(forceTimerRef.current);
        forceTimerRef.current = null;
      }
    };
  }, [isConnected]);

  // ---------------------------------------------------------------
  // Disconnect hygiene: when AppKit settles into "disconnected" (after a
  // rehydrate OR a manual disconnect), aggressively wipe any stale cache.
  // Without this, a disconnect that races with @appkit/connection_status
  // being re-written by a rehydrate can leave the optimistic pill showing
  // an old address on the next refresh.
  // ---------------------------------------------------------------
  useEffect(() => {
    if (status !== "disconnected") return;
    if (typeof window === "undefined") return;
    try {
      if (
        localStorage.getItem("@appkit/connection_status") !== "disconnected"
      ) {
        localStorage.setItem("@appkit/connection_status", "disconnected");
      }
      if (localStorage.getItem("userAddress")) {
        localStorage.removeItem("userAddress");
      }
      const raw = localStorage.getItem("@appkit/native_balance_cache");
      if (raw && raw !== "{}") {
        localStorage.setItem("@appkit/native_balance_cache", "{}");
      }
      // Reset the account-type preference to EOA on disconnect, so the next
      // login starts on EOA. Must SET "eoa" (not delete the key): if the user
      // refreshes after logout, `initialize` reads this stored value and would
      // otherwise fall back to a previously stored smartAccount.
      const prefsRaw = localStorage.getItem("@appkit/preferred_account_types");
      try {
        const prefs = prefsRaw ? JSON.parse(prefsRaw) : {};
        if (prefs && typeof prefs === "object") {
          prefs.eip155 = "eoa";
          localStorage.setItem(
            "@appkit/preferred_account_types",
            JSON.stringify(prefs)
          );
        }
      } catch {
        /* ignore corrupt prefs */
      }
    } catch {
      /* ignore */
    }
  }, [status]);

  // ---------------------------------------------------------------
  // Account-type persistence guard: AppKit's `setPreferredAccountTypes`
  // (ConnectionController) sometimes writes an empty object to storage even
  // though ChainController's in-memory `preferredAccountType` is correct.
  // When the user actually picks smart-account, that choice would be lost on
  // the next refresh. Keep storage in sync with the in-memory value whenever
  // the account changes.
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!isConnected || !address) return;
    if (typeof window === "undefined") return;
    try {
      const memoryType =
        ChainController.getAccountData?.("eip155")?.preferredAccountType;
      if (!memoryType) return;
      const raw = localStorage.getItem("@appkit/preferred_account_types");
      const stored = raw ? JSON.parse(raw) : {};
      if (stored?.eip155 !== memoryType) {
        stored.eip155 = memoryType;
        localStorage.setItem(
          "@appkit/preferred_account_types",
          JSON.stringify(stored)
        );
      }
    } catch {
      /* ignore */
    }
  }, [isConnected, address, status]);

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
    const storedAccount = localStorage.getItem("userAddress");
    const storedConnect = localStorage.getItem("@appkit/connection_status");

    if (storedConnect === "disconnected" && storedAccount) {
      clearAppSessionKeepChainId();
      return;
    }

    if (!isConnected || !address) return;

    // Valid token for this address (per-address cache) — skip SIWE signature
    // and /api/login; promote the cached token to the active one.
    if (activateSessionForAddress(address)) {
      if (address.toLowerCase() !== storedAccount?.toLowerCase()) {
        localStorage.setItem("userAddress", address);
      }
      return;
    }

    if (loginPendingRef.current) return;

    loginPendingRef.current = true;

    ensureLoggedIn(address).then((result) => {
      loginPendingRef.current = false;
      // Backend offline: keep the wallet connected, no error, no signing.
      if (result === "backend_down") return;
      if (!result) {
        clearAppSessionKeepChainId();
        toast.error(tGlobal("auth.loginFailed"));
        return;
      }
      localStorage.setItem("userAddress", result.userAddress || address);
      // signature is empty when an existing token was reused.
      if (result.signature) toast.success(tGlobal("auth.loginSuccess"));
    });
  }, [isConnected, address]);

  return {
    address,
    isConnected,
    status,
    solanaAccount,
    bitcoinAccount,
    currentChainId,
    caipNetwork
  };
}
