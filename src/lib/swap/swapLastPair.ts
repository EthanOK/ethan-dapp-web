const STORAGE_KEY = "swap-last-pair-v1";

type LastSwapPairRecord = {
  paySelectKey: string;
  receiveSelectKey: string;
};

type LastSwapPairStore = Record<string, LastSwapPairRecord>;

function storageKey(chainId: number): string {
  return String(chainId);
}

function readStore(): LastSwapPairStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LastSwapPairStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeStore(store: LastSwapPairStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function loadLastSwapPair(chainId: number): LastSwapPairRecord | null {
  const record = readStore()[storageKey(chainId)];
  if (
    !record ||
    typeof record.paySelectKey !== "string" ||
    typeof record.receiveSelectKey !== "string"
  ) {
    return null;
  }
  return record;
}

export function saveLastSwapPair(
  chainId: number,
  paySelectKey: string,
  receiveSelectKey: string
): void {
  const store = readStore();
  store[storageKey(chainId)] = { paySelectKey, receiveSelectKey };
  writeStore(store);
}
