import { useAppKitAccount } from "@reown/appkit/react";

/** EVM wallet account from Reown AppKit (default namespace). */
export function useEvmWallet() {
  const { address, isConnected, status, caipAddress } = useAppKitAccount();
  return {
    address,
    isConnected,
    status,
    caipAddress,
    /** Alias for `address` — matches legacy `currentAccount` naming in pages. */
    account: address
  };
}
