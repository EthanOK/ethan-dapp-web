import bitcoinIcon from "@/assets/icons/bitcoin.svg";

type BitcoinIconProps = {
  size?: number | string;
  className?: string;
};

export function BitcoinIcon({ size = 24, className }: BitcoinIconProps) {
  return (
    <img
      src={bitcoinIcon}
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden
      draggable={false}
    />
  );
}
