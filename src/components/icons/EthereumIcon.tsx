import ethereumIcon from "@/assets/icons/ethereum.svg";

type EthereumIconProps = {
  size?: number | string;
  className?: string;
};

export function EthereumIcon({ size = 24, className }: EthereumIconProps) {
  return (
    <img
      src={ethereumIcon}
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden
      draggable={false}
    />
  );
}
