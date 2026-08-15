/**
 * Synchronously read everything we already know about a previous wallet session
 * from localStorage so the header can render an "address + balance" pill
 * immediately on page load — BEFORE AppKit's async session rehydration
 * completes (which involves a network round-trip to the WalletConnect relay
 * for non-injected wallets).
 *
 * Sources (all client-side, no app SDK import required):
 *   - `@appkit/connection_status`: "connected" | "disconnected"
 *   - `@appkit/connections`: { [namespace]: [{ connectorId, accounts: [...] }] }
 *     (AppKit's own persisted connection list — the most reliable place to find
 *     the last connected address)
 *   - `userAddress`: last SIWE-logged-in EVM address (also written on connect)
 *   - `@appkit/native_balance_cache`: { [caipAddress]: { balance, symbol, ... } }
 *
 * The values returned here are intentionally read on the first render only;
 * subsequent AppKit-driven re-renders supply the authoritative state and the
 * optimistic pill is replaced.
 */

export type CachedBalance = {
  balance: string;
  symbol: string;
};

export type CachedSession = {
  hasSession: boolean;
  address: string | null;
  balance: CachedBalance | null;
};

/** Address truncation matching AppKit's `<wui-account-button>` (4 + 6). */
export function shortAddress(addr: string, start = 4, end = 6): string {
  if (!addr || addr.length < start + end + 2) return addr;
  return `${addr.slice(0, start)}...${addr.slice(-end)}`;
}

/** Extract the last connected EVM address from AppKit's connections list. */
function addressFromConnections(): string | null {
  try {
    const raw = localStorage.getItem("@appkit/connections");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<
      string,
      Array<{ connectorId?: string; accounts?: Array<{ address?: string }> }>
    >;
    // eip155 is the primary namespace; fall back to the first namespace that
    // has accounts so Solana-only users still get a pill.
    const namespaces = [
      "eip155",
      ...Object.keys(parsed).filter((n) => n !== "eip155")
    ];
    for (const ns of namespaces) {
      const conns = parsed[ns];
      if (!Array.isArray(conns)) continue;
      for (const conn of conns) {
        const accounts = conn?.accounts;
        if (!Array.isArray(accounts)) continue;
        for (const account of accounts) {
          if (account?.address && /^0x[0-9a-fA-F]{40}$/.test(account.address)) {
            return account.address;
          }
        }
      }
    }
  } catch {
    /* ignore corrupt connections */
  }
  return null;
}

/** Read the previous-session snapshot synchronously from localStorage. */
export function readCachedSession(): CachedSession {
  if (typeof window === "undefined") {
    return { hasSession: false, address: null, balance: null };
  }

  let hasSession = false;
  let address: string | null = null;
  try {
    hasSession =
      localStorage.getItem("@appkit/connection_status") === "connected";
    const stored = localStorage.getItem("userAddress");
    if (stored && /^0x[0-9a-fA-F]{40}$/.test(stored)) address = stored;
  } catch {
    /* ignore */
  }
  // Fall back to AppKit's own persisted connections (covers sessions where
  // the SIWE login never completed, so `userAddress` is missing).
  if (!address) address = addressFromConnections();
  if (!hasSession || !address) {
    return { hasSession, address, balance: null };
  }

  let balance: CachedBalance | null = null;
  try {
    const raw = localStorage.getItem("@appkit/native_balance_cache");
    if (!raw) return { hasSession, address, balance: null };
    const cache = JSON.parse(raw) as Record<
      string,
      { balance?: string; symbol?: string; caipAddress?: string }
    >;
    const addrLower = address.toLowerCase();
    for (const key of Object.keys(cache)) {
      const entry = cache[key];
      if (!entry || typeof entry !== "object") continue;
      const caip = entry.caipAddress ?? key;
      const colonIdx = caip.lastIndexOf(":");
      const addrPart = (
        colonIdx >= 0 ? caip.slice(colonIdx + 1) : caip
      ).toLowerCase();
      if (
        addrPart === addrLower &&
        typeof entry.balance === "string" &&
        typeof entry.symbol === "string"
      ) {
        balance = { balance: entry.balance, symbol: entry.symbol };
        break;
      }
    }
  } catch {
    /* ignore corrupt cache */
  }
  return { hasSession, address, balance };
}
