import type { TranslationKey } from "@/i18n/locales/en";

/**
 * Single source of truth for the app shell navigation.
 *
 * The sidebar renders `NAV_GROUPS`, and the ⌘K palette searches exactly the
 * same set — the two can never drift apart.
 *
 * Deliberately NOT indexed anywhere: `/market` (needs a `?coinId=` param and
 * is only ever opened from the markets list) plus `/getCollection`,
 * `/yunGouAggregators`, `/getOpenSeaData`, `/buyNFT` and `/getIPFS`. Those
 * five are abandoned but still registered; the user does not want them
 * surfaced, so they get no sidebar slot and no search hit.
 *
 * Icons are referenced by key and resolved through `NAV_ICONS` in
 * `navIcons.tsx`, so this file stays plain data (no JSX, no React import —
 * keeps it out of the eager component graph).
 */
export type NavItem = {
  /** Stable id, also used as the icon key and React key. */
  id: string;
  titleKey: TranslationKey;
  to: string;
  /** Lowercase latin tokens the ⌘K palette matches against, on top of the
   *  translated title and the route path. Keeps search useful in every
   *  locale (e.g. typing "swap" while the UI is in Chinese). */
  keywords?: string[];
};

export type NavGroup = {
  id: string;
  /** `null` renders the items without a group heading. */
  titleKey: TranslationKey | null;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "overview",
    titleKey: null,
    items: [
      {
        id: "home",
        titleKey: "nav.home",
        to: "/",
        keywords: ["home", "dashboard", "overview", "start"]
      }
    ]
  },
  {
    id: "trade",
    titleKey: "nav.group.trade",
    items: [
      {
        id: "markets",
        titleKey: "nav.markets",
        to: "/markets",
        keywords: ["market", "markets", "price", "ticker", "list"]
      },
      {
        id: "bricswap",
        titleKey: "nav.bricswap",
        to: "/bricswap",
        keywords: ["swap", "bric", "bricswap", "exchange", "trade", "dex"]
      },
      {
        id: "oftBridge",
        titleKey: "nav.oftBridge",
        to: "/layerzeroOftBridge",
        keywords: [
          "bridge",
          "oft",
          "layerzero",
          "layer zero",
          "cross chain",
          "lz"
        ]
      },
      {
        id: "estimateTxFee",
        titleKey: "nav.estimateTxFee",
        to: "/estimateTxFee",
        keywords: ["gas", "fee", "estimate", "txfee", "cost"]
      }
    ]
  },
  {
    id: "account",
    titleKey: "nav.group.account",
    items: [
      {
        id: "erc20Allowance",
        titleKey: "nav.erc20Allowance",
        to: "/erc20Allowance",
        keywords: ["allowance", "approve", "erc20", "token", "spender"]
      },
      {
        id: "burn",
        titleKey: "nav.burn",
        to: "/burn",
        keywords: ["burn", "destroy", "supply", "token"]
      },
      {
        id: "faucet",
        titleKey: "nav.faucet",
        to: "/faucet",
        keywords: ["faucet", "testnet", "test token", "drip", "mint"]
      },
      {
        id: "ens",
        titleKey: "nav.ens",
        to: "/ens",
        keywords: ["ens", "domain", "name", "resolve", "reverse"]
      },
      {
        id: "erc6551",
        titleKey: "nav.erc6551",
        to: "/erc6551",
        keywords: ["erc6551", "6551", "token bound", "tba", "account"]
      },
      {
        id: "web3Auth",
        titleKey: "nav.web3Auth",
        to: "/web3Auth",
        keywords: ["web3auth", "auth", "login", "social", "sign in", "evm"]
      }
    ]
  },
  {
    id: "developer",
    titleKey: "nav.group.developer",
    items: [
      {
        id: "createTransaction",
        titleKey: "nav.createTransaction",
        to: "/createTransaction",
        keywords: ["create", "transaction", "raw tx", "build", "send"]
      },
      {
        id: "utilsSign",
        titleKey: "utils.signSection",
        to: "/signature",
        keywords: [
          "sign",
          "signature",
          "eip712",
          "712",
          "typed data",
          "hex",
          "message",
          "opensea"
        ]
      },
      {
        id: "eip7702",
        titleKey: "nav.eip7702",
        to: "/eip7702",
        keywords: ["eip7702", "7702", "delegation", "account abstraction"]
      },
      {
        id: "mnemonic",
        titleKey: "nav.mnemonic",
        to: "/mnemonic",
        keywords: ["mnemonic", "seed", "phrase", "bip39", "wallet", "derive"]
      },
      {
        id: "utilsContractAddress",
        // Shorter than the page's own heading, which is too wide for the
        // sidebar; the h1 keeps the full "Calculate Contract Address".
        titleKey: "nav.contractAddress",
        to: "/contractAddress",
        keywords: [
          "contract",
          "address",
          "create",
          "nonce",
          "deploy",
          "predict"
        ]
      },
      {
        id: "utilsPrice",
        titleKey: "utils.priceSection",
        to: "/tokenPrice",
        keywords: [
          "price",
          "sqrtpricex96",
          "sqrt",
          "lp",
          "liquidity",
          "pair",
          "uniswap",
          "pancake",
          "v2",
          "v3",
          "tick"
        ]
      },
      {
        id: "utilsIpfs",
        titleKey: "utils.ipfsSection",
        to: "/ipfsGateway",
        keywords: ["ipfs", "cid", "gateway", "pinata", "cloudflare", "metadata"]
      }
    ]
  },
  {
    id: "solana",
    titleKey: "nav.group.solana",
    items: [
      {
        id: "solanaUtils",
        titleKey: "nav.solanaUtils",
        to: "/solanaUtils",
        keywords: ["solana", "utils", "convert", "address", "spl"]
      },
      {
        id: "wsol",
        titleKey: "nav.wsol",
        to: "/wsolSolana",
        keywords: ["wsol", "sol", "wrap", "unwrap", "solana"]
      },
      {
        id: "web3AuthSolana",
        titleKey: "nav.web3AuthSolana",
        to: "/web3AuthSolana",
        keywords: ["web3auth", "solana", "auth", "login", "social"]
      }
    ]
  }
];

/** Pages promoted to the top of the palette when the query is empty. */
export const PALETTE_SHORTCUTS: string[] = [
  "home",
  "markets",
  "bricswap",
  "oftBridge"
];

export type PaletteEntry = NavItem & { groupId: string };

/**
 * Every page the palette can reach — exactly the sidebar's set, nothing more.
 * Abandoned routes are excluded on purpose, see the file header.
 */
export const ALL_PAGES: PaletteEntry[] = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({ ...item, groupId: group.id }))
);
