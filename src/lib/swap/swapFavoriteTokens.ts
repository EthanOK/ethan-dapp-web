import {
  addressesEqual,
  tokenBalanceKey,
  type TokenSide
} from "@/lib/swap/swapTokenRules";

const STORAGE_KEY = "swap-favorite-tokens-v1";

export const SWAP_FAVORITE_MAX = 8;

type FavoriteTokenStore = Record<string, string[]>;

function storageKey(chainId: number): string {
  return String(chainId);
}

function readStore(): FavoriteTokenStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FavoriteTokenStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: FavoriteTokenStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadFavoriteTokenAddresses(chainId: number): string[] {
  const records = readStore()[storageKey(chainId)] ?? [];
  return records.filter(
    (address) => typeof address === "string" && address.length > 0
  );
}

export function isFavoriteTokenAddress(
  chainId: number,
  tokenAddress: string
): boolean {
  const key = tokenBalanceKey(tokenAddress);
  return loadFavoriteTokenAddresses(chainId).some((address) => address === key);
}

export type ToggleFavoriteResult = {
  addresses: string[];
  added: boolean;
  removed: boolean;
  limitReached: boolean;
};

/** Toggle favorite by token address; returns updated list for the chain. */
export function toggleFavoriteTokenAddress(
  chainId: number,
  tokenAddress: string
): ToggleFavoriteResult {
  const key = tokenBalanceKey(tokenAddress);
  const store = readStore();
  const chainKey = storageKey(chainId);
  const current = store[chainKey] ?? [];
  const index = current.indexOf(key);

  if (index >= 0) {
    const next = current.filter((_, i) => i !== index);
    store[chainKey] = next;
    writeStore(store);
    return {
      addresses: next,
      added: false,
      removed: true,
      limitReached: false
    };
  }

  if (current.length >= SWAP_FAVORITE_MAX) {
    return {
      addresses: current,
      added: false,
      removed: false,
      limitReached: true
    };
  }

  const next = [...current, key];
  store[chainKey] = next;
  writeStore(store);
  return { addresses: next, added: true, removed: false, limitReached: false };
}

/** Resolve saved favorite addresses to catalog entries (preserves favorite order). */
export function resolveFavoriteTokenSides(
  chainId: number,
  catalog: TokenSide[]
): TokenSide[] {
  const addresses = loadFavoriteTokenAddresses(chainId);
  const out: TokenSide[] = [];
  for (const address of addresses) {
    const side = catalog.find((t) => addressesEqual(t.tokenAddress, address));
    if (side) out.push(side);
  }
  return out;
}
