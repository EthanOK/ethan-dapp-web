import {
  DISCORD_WEBHOOK_URL,
  React_Serve_Back
} from "@/config/SystemConfiguration";
import {
  hasValidSessionToken,
  isTokenExpired
} from "@/lib/wallet/sessionToken";
import { sendToWebhook } from "@/lib/shared/Utils";

function shouldNotifyLoginWebhook(siweDomain: string): boolean {
  if (!DISCORD_WEBHOOK_URL?.trim()) return false;
  return siweDomain !== "" && !siweDomain.includes("localhost");
}

export type LoginResult = {
  userAddress: string;
  userToken: string;
  signature: string;
};

/** Logged-in token, `"backend_down"` when health check fails, or `null` on failure. */
export type EnsureLoginResult = LoginResult | "backend_down" | null;

type LoginApiResponse = {
  code?: number;
  data?: { userToken?: string };
};

/** Healthy = 2xx with `{ "status": "ok" }`; anything else (incl. errors) is false. */
export async function isBackendHealthy(timeoutMs = 8000): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${React_Serve_Back}/api/health`, {
      headers: { accept: "application/json" },
      signal: controller.signal
    });
    const json = res.ok ? ((await res.json()) as { status?: string }) : null;
    return json?.status === "ok";
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** SIWE sign + POST /api/login. Caller should check hasValidSessionToken first. */
export const login = async (): Promise<LoginResult | null> => {
  try {
    const { signSiweMessage } = await import("@/lib/signing/SignFunc");
    const params = await signSiweMessage();
    if (params === null) return null;

    const { message, signature, siweMessage } = params;

    const res = await fetch(`${React_Serve_Back}/api/login`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, signature })
    });

    if (!res.ok) {
      console.error("Login failed:", res.status, await res.text());
      return null;
    }

    const json = (await res.json()) as LoginApiResponse;
    const userToken = json.data?.userToken;
    if (json.code !== 200 || !userToken) {
      console.error("Login rejected:", json);
      return null;
    }

    localStorage.setItem("token", userToken);

    const domain = siweMessage.domain ?? "";
    if (shouldNotifyLoginWebhook(domain)) {
      void sendToWebhook({ siweMessage, signature });
    }

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
  const token = localStorage.getItem("token");
  if (token && hasValidSessionToken(address)) {
    return { userAddress: address, userToken: token, signature: "" };
  }
  if (token && isTokenExpired(token)) localStorage.removeItem("token");

  if (!(await isBackendHealthy())) return "backend_down";
  return login();
}
