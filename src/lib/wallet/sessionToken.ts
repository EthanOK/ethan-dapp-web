type JwtPayload = {
  address?: string;
  exp?: number;
  nonce?: string;
  iat?: number;
};

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

/** Valid local session: token present, not expired, bound to the connected address. */
export function hasValidSessionToken(address: string): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;
  if (isTokenExpired(token)) return false;
  return tokenMatchesAddress(token, address);
}

export function clearAppSessionKeepChainId() {
  localStorage.removeItem("userAddress");
  localStorage.removeItem("token");
}
