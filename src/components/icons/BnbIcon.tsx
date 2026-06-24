import bnbIcon from "@/assets/icons/bnb.svg";

type BnbIconProps = {
  size?: number | string;
  className?: string;
};

export function BnbIcon({ size = 24, className }: BnbIconProps) {
  return (
    <img
      src={bnbIcon}
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden
      draggable={false}
    />
  );
}
