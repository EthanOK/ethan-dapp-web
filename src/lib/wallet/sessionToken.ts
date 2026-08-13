type JwtPayload = {
  address?: string;
  exp?: number;
  nonce?: string;
  iat?: number;
};

const TOKEN_MAP_KEY = "tokenMap";

/** Decode JWT payload (client-side only; API still validates the token). */
export function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** True when token is missing, malformed, or past `exp` (30s skew). */
export function isTokenExpired(token: string, skewSec = 30): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() / 1000 >= payload.exp - skewSec;
}

export function tokenMatchesAddress(token: string, address: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.address) return false;
  return payload.address.toLowerCase() === address.toLowerCase();
}

/**
 * Per-address token cache (addressLower -> token). Lets every address that has
 * logged in before reuse its own token without re-signing, even after a
 * disconnect or an account switch.
 */
function readTokenMap(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TOKEN_MAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeTokenMap(map: Record<string, string>) {
  localStorage.setItem(TOKEN_MAP_KEY, JSON.stringify(map));
}

/** Valid token for `address`: per-address cache first, legacy `token` fallback. */
export function getTokenForAddress(address: string): string | null {
  const addr = address.toLowerCase();
  const cached = readTokenMap()[addr];
  if (cached && !isTokenExpired(cached)) return cached;

  const legacy = localStorage.getItem("token");
  if (legacy && tokenMatchesAddress(legacy, addr) && !isTokenExpired(legacy)) {
    return legacy;
  }
  return null;
}

/** Store a token for an address and make it the active token (prunes expired). */
export function saveTokenForAddress(address: string, token: string) {
  const addr = address.toLowerCase();
  const map = readTokenMap();
  map[addr] = token;
  for (const key of Object.keys(map)) {
    if (isTokenExpired(map[key])) delete map[key];
  }
  writeTokenMap(map);
  localStorage.setItem("token", token);
}

/**
 * Reuse a valid cached token for `address` and promote it to the active
 * token. Returns true when a token was reused (caller should skip signing).
 */
export function activateSessionForAddress(address: string): boolean {
  const cached = getTokenForAddress(address);
  if (!cached) return false;
  localStorage.setItem("token", cached);
  return true;
}

/** Valid local session: token present, not expired, bound to the connected address. */
export function hasValidSessionToken(address: string): boolean {
  return getTokenForAddress(address) !== null;
}

/**
 * Clear the current session pointer and the active token, but KEEP the
 * per-address token cache so reconnecting or switching back to a previously
 * logged-in address does not require signing again.
 */
export function clearAppSessionKeepChainId() {
  localStorage.removeItem("userAddress");
  localStorage.removeItem("token");
}
