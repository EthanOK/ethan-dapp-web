import tronIcon from "@/assets/icons/tron.svg";

type TronIconProps = {
  size?: number | string;
  className?: string;
};

export function TronIcon({ size = 24, className }: TronIconProps) {
  return (
    <img
      src={tronIcon}
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden
      draggable={false}
    />
  );
}
