import {
  getTokenForAddress,
  isTokenExpired,
  saveTokenForAddress
} from "@/lib/wallet/sessionToken";
import { isBackendHealthy, postLogin } from "@/services/AuthApi";
import { store } from "@/lib/wallet/Suscribers";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The Reown embedded wallet (Google/social login) aborts every pending RPC
 * request — personal_sign included — the moment the AppKit modal closes after
 * connect. Wait for the modal to be fully closed before requesting a signature.
 */
export const waitForAppKitModalClosed = async (
  timeoutMs = 8000
): Promise<void> => {
  const isOpen = () =>
    Boolean((store.appKitState as { open?: boolean } | null)?.open);
  const started = Date.now();
  while (isOpen() && Date.now() - started < timeoutMs) {
    await sleep(150);
  }
  // Settle delay so an in-flight rejectRpcRequests() finishes before we sign.
  await sleep(300);
};

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
    // Social-login connects may still be closing the AppKit modal; signing in
    // that window gets the personal_sign request aborted by the SDK.
    await waitForAppKitModalClosed();

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
