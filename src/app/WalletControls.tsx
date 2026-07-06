import { useState } from "react";
import { headerNetworksAll } from "@/app/Wallet";
import { useReownWalletSync } from "@/hooks/useReownWalletSync";
import { useHeaderChainId } from "@/hooks/useHeaderChainId";
import { useI18n } from "@/i18n";

/**
 * Wallet-dependent header cluster (network selector + connect button).
 *
 * Lazy-loaded on purpose: importing this module pulls in `@/app/Wallet`
 * (`createAppKit` + the EVM/Solana/Bitcoin adapters, viem, etc.). Keeping it
 * out of the eager `App` graph removes that whole stack from the entry chunk,
 * so first paint no longer ships the wallet SDK bundle.
 */
function WalletControls() {
  const { t } = useI18n();
  const { address, isConnected, currentChainId } = useReownWalletSync();
  const { chainId, handleHeaderNetworkChange } = useHeaderChainId({
    isConnected,
    address,
    currentChainId
  });
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    try {
      localStorage.setItem("LoginType", "reown");
    } catch (error) {
      console.error("Reown连接失败:", error);
      localStorage.removeItem("LoginType");
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <label htmlFor="app-network" className="app-header-network-label">
        Network
      </label>
      <select
        id="app-network"
        className="app-header-network-select"
        value={String(chainId ?? "")}
        onChange={handleHeaderNetworkChange}
        aria-label="Network"
      >
        {headerNetworksAll.map((network) => {
          const value = String(
            (network as { caipNetworkId?: string; id?: string | number })
              .caipNetworkId ?? (network as { id?: string | number }).id
          );
          return (
            <option key={value} value={value}>
              {network.name}
            </option>
          );
        })}
      </select>
      <div className="w3-connect-wrap">
        <appkit-button
          label={
            isConnecting ? t("common.connecting") : t("common.connectWallet")
          }
          style={{ display: "block", marginLeft: "auto" }}
          onClick={handleConnect}
        />
      </div>
    </>
  );
}

export default WalletControls;
