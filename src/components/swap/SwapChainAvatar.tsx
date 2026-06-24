import { CHAIN_ID_MAPPING } from "@bric-labs/bric-sdk";
import { BnbIcon } from "@/components/icons/BnbIcon";
import { EthereumIcon } from "@/components/icons/EthereumIcon";

type SwapChainAvatarProps = {
  chainId: number;
  badge: string;
  color: string;
  className?: string;
};

export function SwapChainAvatar({
  chainId,
  badge,
  color,
  className
}: SwapChainAvatarProps) {
  if (chainId === CHAIN_ID_MAPPING.ETHEREUM) {
    return (
      <span className={className} aria-hidden>
        <EthereumIcon size="100%" />
      </span>
    );
  }

  if (chainId === CHAIN_ID_MAPPING.BSC) {
    return (
      <span className={className} aria-hidden>
        <BnbIcon size="100%" />
      </span>
    );
  }

  return (
    <span className={className} style={{ background: color }} aria-hidden>
      {badge}
    </span>
  );
}
