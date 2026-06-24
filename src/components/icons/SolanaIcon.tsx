import solanaIcon from "@/assets/icons/solana.svg";

type SolanaIconProps = {
  size?: number | string;
  className?: string;
};

export function SolanaIcon({ size = 24, className }: SolanaIconProps) {
  return (
    <img
      src={solanaIcon}
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden
      draggable={false}
    />
  );
}
