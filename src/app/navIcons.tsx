import type { ReactNode } from "react";

/**
 * Hand-rolled stroke icons for the sidebar / command palette.
 *
 * The project deliberately ships no icon dependency (no lucide, no
 * react-icons), so these follow the existing pattern in `App.tsx`
 * (`LogoMarkIcon`, `ThemeSunIcon`, …): inline 24×24 SVG, `currentColor`,
 * no fill — which means they inherit the active/hover text colour for free
 * and need zero theme-specific variants.
 */

type IconProps = {
  size?: number;
};

function Svg({
  size = 16,
  strokeWidth = 1.6,
  children
}: IconProps & { strokeWidth?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* ----- Overview ----- */

const HomeIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9.5V20h13V9.5" />
    <path d="M9.5 20v-5.5h5V20" />
  </Svg>
);

/* ----- Trade ----- */

const MarketsIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 4v16" />
    <path d="M4 20h16" />
    <path d="M8 15V9" />
    <path d="M12 17V7" />
    <path d="M16 13v-3" />
    <path d="M20 11V6" />
  </Svg>
);

const SwapIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </Svg>
);

const BridgeIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M3 16c0-5 4-9 9-9s9 4 9 9" />
    <path d="M3 16v4M21 16v4" />
    <path d="M3 13h4M17 13h4M8 13v3M16 13v3" />
  </Svg>
);

const GasIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M6 21V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16" />
    <path d="M4 21h13" />
    <path d="M6 9h9" />
    <path d="M15 3v4" />
    <path d="M18.5 8.5 21 11l-2.5 2.5" />
  </Svg>
);

/* ----- Account ----- */

const ShieldIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3 5 6v6c0 4.2 3 7.7 7 9 4-1.3 7-4.8 7-9V6l-7-3z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);

const FlameIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 21c3.3 0 6-2.5 6-5.8 0-4.4-4-5.4-4-9.2 0 0-2.4 1.3-2.4 4.2 0 1.4-.9 2.2-1.9 1.6C8.4 10.6 6 12.6 6 15.2 6 18.5 8.7 21 12 21z" />
    <path d="M12 21c1.4 0 2.5-1 2.5-2.5 0-1.9-2.5-2.6-2.5-4.7 0 0-1.6 1-1.6 2.6 0 .6-.3 1.1-.8 1.3-.8.3-1.6 1-1.6 1.9 0 1 .8 1.4 2 1.4" />
  </Svg>
);

const DropIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3.5s6 6.4 6 10.2a6 6 0 0 1-12 0C6 9.9 12 3.5 12 3.5z" />
    <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
  </Svg>
);

const AtIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 5 2 9 9 0 1 0-3.2 4" />
  </Svg>
);

const BoxIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4z" />
    <path d="M4 7l8 4 8-4" />
    <path d="M12 11v10" />
  </Svg>
);

const KeyIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="8" cy="14" r="4" />
    <path d="M10.8 11.2 20 3" />
    <path d="M17 6l3 3" />
    <path d="M20 9l-2 2" />
  </Svg>
);

/* ----- Developer ----- */

const WrenchIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M15.5 3.5a5.5 5.5 0 0 0-7.3 6.9L3 15.6V21h5.4l5.2-5.2a5.5 5.5 0 0 0 6.9-7.3l-3 3-2.6-2.6 3-3a5.5 5.5 0 0 0-2.4-.4z" />
  </Svg>
);

const TxIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z" />
    <path d="M13 3v6h6" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </Svg>
);

const SignIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M3 18c3.5 0 4.5-9 8.5-9s2 6 4.5 6c1.6 0 2.6-1.4 3-3" />
    <path d="M15 15h6" />
    <path d="M3 21h18" />
  </Svg>
);

const CodeIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M8.5 8 4 12l4.5 4" />
    <path d="M15.5 8 20 12l-4.5 4" />
    <path d="M13.5 5.5 10.5 18.5" />
  </Svg>
);

const MnemonicIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 9h18" />
    <path d="M7 13h6M7 16.5h4" />
  </Svg>
);

/* ----- Solana ----- */

const SolanaIcon = ({ size }: IconProps) => (
  <Svg size={size} strokeWidth={1.8}>
    <path d="M5.5 17.5h13l-2.6 2.8H4.4z" />
    <path d="M5.5 10.4h13l-2.6 2.8H4.4z" />
    <path d="M5.5 3.7h13l-2.6 2.8H4.4z" />
  </Svg>
);

const WsolIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3.5s5.5 5.9 5.5 9.4a5.5 5.5 0 0 1-11 0C6.5 9.4 12 3.5 12 3.5z" />
    <path d="M5 20.5h14" />
  </Svg>
);

/* ----- Hidden pages ----- */

const ChartIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 19V5" />
    <path d="M4 19h16" />
    <path d="M7 16l3.5-5 3 2.5L19 7" />
    <circle cx="10.5" cy="11" r="1.1" />
    <circle cx="16.5" cy="8" r="1.1" />
  </Svg>
);

const LayersIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3 3 8l9 5 9-5-9-5z" />
    <path d="M3 13l9 5 9-5" />
  </Svg>
);

const AggregateIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M4 6h6M4 12h10M4 18h5" />
    <path d="M17 15l3 3-3 3" />
  </Svg>
);

const WaveIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M3 9c2.5-3 5-3 7.5 0s5 3 7.5 0" />
    <path d="M3 14c2.5-3 5-3 7.5 0s5 3 7.5 0" />
    <path d="M3 19c2.5-3 5-3 7.5 0s5 3 7.5 0" />
  </Svg>
);

const ImageIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="8.5" cy="9.5" r="1.6" />
    <path d="M4 17l4.5-4.5 3.5 3.5 3-3L20 17" />
  </Svg>
);

const IpfsIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3 6 6.5v5L12 15l6-3.5v-5L12 3z" />
    <path d="M6 13.5v4L12 21l6-3.5v-4" />
    <path d="M12 15v6" />
  </Svg>
);

/* ----- Utilities ----- */

const LanguageIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.6 2.8 3.9 6 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-6-3.9-9S9.4 5.8 12 3z" />
  </Svg>
);

const TargetIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" />
  </Svg>
);

/* ----- Shell controls ----- */

const SearchIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </Svg>
);

const SettingsIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.5v2.2M12 18.3v2.2M4.9 7.8l1.9 1.1M17.2 15.1l1.9 1.1M4.9 16.2l1.9-1.1M17.2 8.9l1.9-1.1" />
  </Svg>
);

const SunIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M5.6 5.6 7 7M17 17l1.4 1.4M3 12h2M19 12h2M5.6 18.4 7 17M17 7l1.4-1.4" />
  </Svg>
);

const MoonIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M12 3a9 9 0 1 0 9 9 7.2 7.2 0 0 1-9-9z" />
  </Svg>
);

const ChevronIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

const ArrowIcon = ({ size }: IconProps) => (
  <Svg size={size}>
    <path d="M5 12h13" />
    <path d="M13 7l5 5-5 5" />
  </Svg>
);

export const NAV_ICONS: Record<string, (props: IconProps) => JSX.Element> = {
  home: HomeIcon,
  markets: MarketsIcon,
  bricswap: SwapIcon,
  oftBridge: BridgeIcon,
  estimateTxFee: GasIcon,
  erc20Allowance: ShieldIcon,
  burn: FlameIcon,
  faucet: DropIcon,
  ens: AtIcon,
  erc6551: BoxIcon,
  web3Auth: KeyIcon,
  createTransaction: TxIcon,
  eip7702: CodeIcon,
  mnemonic: MnemonicIcon,
  utilsSign: SignIcon,
  utilsIpfs: IpfsIcon,
  utilsPrice: ChartIcon,
  utilsContractAddress: TargetIcon,
  solanaUtils: SolanaIcon,
  wsol: WsolIcon,
  web3AuthSolana: KeyIcon,
  marketChart: ChartIcon,
  getCollection: LayersIcon,
  yunGouAggregators: AggregateIcon,
  getOpenSeaData: WaveIcon,
  buyNFT: ImageIcon,
  getIPFS: IpfsIcon,
  search: SearchIcon,
  settings: SettingsIcon,
  sun: SunIcon,
  moon: MoonIcon,
  language: LanguageIcon,
  chevron: ChevronIcon,
  arrow: ArrowIcon
};

export function NavIcon({ name, size }: { name: string; size?: number }) {
  const Icon = NAV_ICONS[name] ?? WrenchIcon;
  return <Icon size={size} />;
}
