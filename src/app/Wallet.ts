import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import {
  base,
  bsc,
  mainnet,
  sepolia,
  hoodi,
  solanaDevnet,
  solana,
  bitcoin,
  bitcoinTestnet
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit";
import { SolanaAdapter } from "@reown/appkit-adapter-solana";
import { BitcoinAdapter } from "@reown/appkit-adapter-bitcoin";
import {
  DefaultChainId,
  projectId_walletconnect
} from "@/config/SystemConfiguration";
import { initializeSubscribers } from "@/lib/wallet/Suscribers";

const storedChainId = localStorage.getItem("chainId") || DefaultChainId;

export type AppKitNetwork =
  | typeof sepolia
  | typeof hoodi
  | typeof mainnet
  | typeof base
  | typeof bsc
  | typeof solanaDevnet
  | typeof solana
  | typeof bitcoin
  | typeof bitcoinTestnet;

export const getDefaultNetwork = (chainId: string | number): AppKitNetwork => {
  const all: AppKitNetwork[] = [
    sepolia,
    hoodi,
    mainnet,
    base,
    bsc,
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
    bsc,
    solana,
    solanaDevnet,
    bitcoin,
    bitcoinTestnet
  ],
  defaultNetwork: getDefaultNetwork(storedChainId),
  projectId: projectId_walletconnect ?? "",
  chainImages: {
    [mainnet.id]: FALLBACK_CHAIN_ICON,
    [sepolia.id]: FALLBACK_CHAIN_ICON,
    [hoodi.id]: FALLBACK_CHAIN_ICON,
    [base.id]: FALLBACK_CHAIN_ICON,
    [bsc.id]: FALLBACK_CHAIN_ICON
  },
  features: {
    analytics: true
  }
});

initializeSubscribers(modal);

export const headerNetworksAll: AppKitNetwork[] = [
  mainnet,
  sepolia,
  hoodi,
  bsc,
  base,
  solana,
  solanaDevnet,
  bitcoin,
  bitcoinTestnet
];
