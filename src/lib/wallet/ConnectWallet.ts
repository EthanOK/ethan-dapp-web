import {
  getTokenForAddress,
  isTokenExpired,
  saveTokenForAddress
} from "@/lib/wallet/sessionToken";
import { isBackendHealthy, postLogin } from "@/services/AuthApi";

export type LoginResult = {
  userAddress: string;
  userToken: string;
  signature: string;
};

/** Logged-in token, `"backend_down"` when health check fails, or `null` on failure. */
export type EnsureLoginResult = LoginResult | "backend_down" | null;

/** SIWE sign + POST /api/login. Caller should check hasValidSessionToken first. */
export const login = async (): Promise<LoginResult | null> => {
  try {
    const { signSiweMessage } = await import("@/lib/signing/SignFunc");
    const params = await signSiweMessage();
    if (params === null) return null;

    const { message, signature, siweMessage } = params;

    const userToken = await postLogin(message, signature);
    if (!userToken) return null;

    saveTokenForAddress(siweMessage.address ?? "", userToken);

    return {
      userAddress: siweMessage.address ?? "",
      userToken,
      signature
    };
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

/**
 * Reuse a valid local token; otherwise only sign in when the backend is healthy
 * (a down backend returns `"backend_down"` and must not break the frontend).
 */
export async function ensureLoggedIn(
  address: string
): Promise<EnsureLoginResult> {
  // Reuse this address's cached token (per-address cache) if it is still valid.
  const cached = getTokenForAddress(address);
  if (cached) {
    localStorage.setItem("token", cached);
    return { userAddress: address, userToken: cached, signature: "" };
  }
  const legacy = localStorage.getItem("token");
  if (legacy && isTokenExpired(legacy)) localStorage.removeItem("token");

  if (!(await isBackendHealthy())) return "backend_down";
  return login();
}
