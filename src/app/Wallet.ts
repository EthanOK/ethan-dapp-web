import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import {
  base,
  baseSepolia,
  bsc,
  bscTestnet,
  mainnet,
  sepolia,
  hoodi,
  solanaDevnet,
  solana,
  bitcoin,
  bitcoinTestnet,
  xLayer
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin";
import {
  DefaultChainId,
  projectId_walletconnect
} from "@/config/SystemConfiguration";
import { getStoredAppTheme } from "@/hooks/useAppTheme";
import { initializeSubscribers } from "@/lib/wallet/Suscribers";

const storedChainId = localStorage.getItem("chainId") || DefaultChainId;

export type AppKitNetwork =
  | typeof sepolia
  | typeof hoodi
  | typeof mainnet
  | typeof base
  | typeof baseSepolia
  | typeof bsc
  | typeof bscTestnet
  | typeof solanaDevnet
  | typeof solana
  | typeof bitcoin
  | typeof bitcoinTestnet
  | typeof xLayer;

export const getDefaultNetwork = (chainId: string | number): AppKitNetwork => {
  const all: AppKitNetwork[] = [
    sepolia,
    hoodi,
    mainnet,
    base,
    baseSepolia,
    bsc,
    bscTestnet,
    xLayer,
    solanaDevnet,
    solana,
    bitcoin,
    bitcoinTestnet
  ];
  const asString = String(chainId);

  const byCaip = all.find(
    (n) => (n as { caipNetworkId?: string }).caipNetworkId === asString
  );
  if (byCaip) return byCaip;

  const asNumber =
    typeof chainId === "number"
      ? chainId
      : /^\d+$/.test(asString)
        ? Number(asString)
        : undefined;
  if (typeof asNumber === "number") {
    const byId = all.find(
      (n) => (n as { id?: number | string }).id === asNumber
    );
    if (byId) return byId;
  }

  const bySolanaId = all.find(
    (n) => (n as { id?: number | string }).id === asString
  );
  if (bySolanaId) return bySolanaId;

  return sepolia;
};

const metadata = {
  name: "Ethan Dapp Website",
  description: "Ethan Dapp Website",
  url: "https://ethan-dapp.vercel.app",
  icons: ["https://ethan-dapp.vercel.app/favicon.ico"]
};

const FALLBACK_CHAIN_ICON =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export const modal = createAppKit({
  adapters: [new EthersAdapter(), new SolanaAdapter(), new BitcoinAdapter()],
  metadata,
  networks: [
    sepolia,
    hoodi,
    mainnet,
    base,
    baseSepolia,
    bsc,
    bscTestnet,
    xLayer,
    solana,
    solanaDevnet,
    bitcoin,
    bitcoinTestnet
  ],
  defaultNetwork: getDefaultNetwork(storedChainId),
  projectId: projectId_walletconnect ?? "",
  themeMode: getStoredAppTheme(),
  // Official default account type: social logins land on the EOA account (no
  // ERC-6492 wrapping while the smart account is undeployed). A user who
  // explicitly switches to smart-account has that stored in
  // `@appkit/preferred_account_types`, which wins over this default on init
  // (ChainController: defaultTypes = { ...defaultAccountTypes, ...stored }).
  defaultAccountTypes: { eip155: "eoa" },
  chainImages: {
    [mainnet.id]: FALLBACK_CHAIN_ICON,
    [sepolia.id]: FALLBACK_CHAIN_ICON,
    [hoodi.id]: FALLBACK_CHAIN_ICON,
    [base.id]: FALLBACK_CHAIN_ICON,
    [baseSepolia.id]: FALLBACK_CHAIN_ICON,
    [bsc.id]: FALLBACK_CHAIN_ICON,
    [bscTestnet.id]: FALLBACK_CHAIN_ICON,
    [xLayer.id]: FALLBACK_CHAIN_ICON
  },
  features: {
    analytics: true
  }
});

initializeSubscribers(modal);

/**
 * Header picker, grouped by network type: mainnets first, testnets under their
 * own label — one flat list made the two hard to tell apart at a glance.
 */
export const headerNetworkGroups: {
  key: "mainnet" | "testnet";
  networks: AppKitNetwork[];
}[] = [
  {
    key: "mainnet",
    networks: [mainnet, bsc, base, xLayer, solana, bitcoin]
  },
  {
    key: "testnet",
    networks: [
      sepolia,
      hoodi,
      bscTestnet,
      baseSepolia,
      solanaDevnet,
      bitcoinTestnet
    ]
  }
];

/** Flat view of the same list, for looking a network up by id. */
export const headerNetworksAll: AppKitNetwork[] = headerNetworkGroups.flatMap(
  (group) => group.networks
);

/**
 * Names shown in the picker, keyed by chain id. Two of viem's names need
 * trimming: the group heading already says mainnet or testnet, and "BNB Smart
 * Chain Testnet" is long enough to fill the whole menu row.
 */
const NETWORK_DISPLAY_NAMES: Record<number, string> = {
  196: "X Layer",
  97: "BSC Testnet"
};

export const displayNameForNetwork = (network: AppKitNetwork): string => {
  const id = Number((network as { id?: string | number }).id);
  return NETWORK_DISPLAY_NAMES[id] ?? network.name;
};
