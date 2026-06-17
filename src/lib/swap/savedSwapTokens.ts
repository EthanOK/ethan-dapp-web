import { isAddress } from "@/lib/shared/Utils";
import {
  buildDefaultTokenSides,
  getSwapChainConfig,
  type SwapChainDefinition
} from "@/config/SwapChainConfig";
import {
  addressesEqual,
  customTokenSide,
  type TokenSide
} from "@/lib/swap/swapTokenRules";

const STORAGE_KEY_V2 = "swap-saved-tokens-v2";
const STORAGE_KEY_V1 = "swap-saved-tokens-v1";

type SavedSwapTokenRecord = {
  tokenAddress: string;
  symbol: string;
  decimals: number;
  name?: string;
  chainId: number;
};

type SavedSwapTokenStore = Record<string, SavedSwapTokenRecord[]>;

function storageKey(chainId: number): string {
  return String(chainId);
}

function toRecord(side: TokenSide, chainId: number): SavedSwapTokenRecord {
  return {
    tokenAddress: side.tokenAddress,
    symbol: side.symbol,
    decimals: side.decimals,
    name: side.name,
    chainId: side.chainId ?? chainId
  };
}

function fromRecord(record: SavedSwapTokenRecord): TokenSide | null {
  if (!isAddress(record.tokenAddress)) return null;
  return customTokenSide(
    record.tokenAddress,
    record.symbol,
    record.decimals,
    record.name,
    record.chainId
  );
}

function readStore(): SavedSwapTokenStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return migrateLegacyStore();
    const parsed = JSON.parse(raw) as SavedSwapTokenStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: SavedSwapTokenStore): void {
  localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(store));
}

/** One-time migration from chain-agnostic v1 blob → v2 keyed by Ethereum. */
function migrateLegacyStore(): SavedSwapTokenStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V1);
    if (!raw) return {};
    const legacy = JSON.parse(raw) as Array<
      Omit<SavedSwapTokenRecord, "chainId">
    >;
    if (!Array.isArray(legacy) || legacy.length === 0) return {};
    const eth = getSwapChainConfig(1);
    if (!eth) return {};
    const store: SavedSwapTokenStore = {
      [storageKey(eth.chainId)]: legacy.map((r) => ({
        ...r,
        chainId: eth.chainId
      }))
    };
    writeStore(store);
    localStorage.removeItem(STORAGE_KEY_V1);
    return store;
  } catch {
    return {};
  }
}

export function loadSavedSwapTokens(chainId: number): TokenSide[] {
  const store = readStore();
  const records = store[storageKey(chainId)] ?? [];
  return records.map(fromRecord).filter((t): t is TokenSide => t != null);
}

/** Persist a custom token for the given chain; returns updated list for that chain. */
export function saveSwapToken(chainId: number, side: TokenSide): TokenSide[] {
  if (side.kind !== "custom") return loadSavedSwapTokens(chainId);
  const existing = loadSavedSwapTokens(chainId);
  if (existing.some((t) => addressesEqual(t.tokenAddress, side.tokenAddress))) {
    return existing;
  }
  const token = customTokenSide(
    side.tokenAddress,
    side.symbol,
    side.decimals,
    side.name,
    chainId
  );
  const store = readStore();
  const key = storageKey(chainId);
  const nextRecords = [...(store[key] ?? []), toRecord(token, chainId)];
  store[key] = nextRecords;
  writeStore(store);
  return nextRecords.map(fromRecord).filter((t): t is TokenSide => t != null);
}

/** Default catalog + user-saved custom tokens for one chain. */
export function buildSwapTokenCatalog(
  chain: SwapChainDefinition,
  saved: TokenSide[]
): TokenSide[] {
  const out = buildDefaultTokenSides(chain);
  for (const side of saved) {
    if (side.kind !== "custom") continue;
    if (side.chainId != null && side.chainId !== chain.chainId) continue;
    if (out.some((t) => addressesEqual(t.tokenAddress, side.tokenAddress))) {
      continue;
    }
    out.push(
      side.chainId === chain.chainId
        ? side
        : customTokenSide(
            side.tokenAddress,
            side.symbol,
            side.decimals,
            side.name,
            chain.chainId
          )
    );
  }
  return out;
}

export function findTokenByAddress(
  catalog: TokenSide[],
  address: string
): TokenSide | undefined {
  return catalog.find((t) => addressesEqual(t.tokenAddress, address));
}
