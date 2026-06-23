const STORAGE_KEY = "swap-last-pair-v1";

type LastSwapPairRecord = {
  paySelectKey: string;
  receiveSelectKey: string;
  payAmount?: string;
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

/** Last pay amount for a chain; empty/invalid entries return null. */
export function loadLastSwapPayAmount(chainId: number): string | null {
  const amount = loadLastSwapPair(chainId)?.payAmount;
  if (typeof amount !== "string") return null;
  const trimmed = amount.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function saveLastSwapPayAmount(
  chainId: number,
  payAmount: string
): void {
  const trimmed = payAmount.trim();
  if (!trimmed) return;

  const store = readStore();
  const key = storageKey(chainId);
  const existing = store[key];
  store[key] = {
    paySelectKey: existing?.paySelectKey ?? "",
    receiveSelectKey: existing?.receiveSelectKey ?? "",
    payAmount: trimmed
  };
  writeStore(store);
}

export function saveLastSwapPair(
  chainId: number,
  paySelectKey: string,
  receiveSelectKey: string
): void {
  const store = readStore();
  const key = storageKey(chainId);
  const existing = store[key];
  store[key] = {
    paySelectKey,
    receiveSelectKey,
    payAmount: existing?.payAmount
  };
  writeStore(store);
}
