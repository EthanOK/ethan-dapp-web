import { React_Serve_Back } from "@/config/SystemConfiguration";
import { getTokenForAddress } from "@/lib/wallet/sessionToken";

type LoginApiResponse = {
  code?: number;
  data?: { userToken?: string };
};

/** POST /api/login with a SIWE message + signature. Returns the userToken or null. */
export async function postLogin(
  message: string,
  signature: string
): Promise<string | null> {
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

  return userToken;
}

/** GET /api/health — true only on 2xx with `{ "status": "ok" }`; errors are false. */
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

export type RelayAuthorizationInput = {
  chainId: number;
  address: string;
  nonce: number;
  yParity: number | string;
  r: string;
  s: string;
};

type RelayApiResponse = {
  code?: number;
  data?: { txHash?: string; from?: string };
  message?: string;
};

/**
 * POST /api/relay7702 — broadcast a signed EIP-7702 authorization as a type-4
 * transaction whose sender is the server's relayer (it pays the gas). Requires
 * a valid login token.
 */
export async function relayEIP7702(
  chainId: number,
  to: string,
  authorizationList: RelayAuthorizationInput[]
): Promise<{ txHash: string; from: string }> {
  // Prefer the per-address cached token (survives disconnect); fall back to the
  // active token. The relay endpoint is auth-gated, so a missing/expired token
  // yields 401.
  const userAddress = localStorage.getItem("userAddress") ?? "";
  const token =
    (userAddress ? getTokenForAddress(userAddress) : null) ??
    localStorage.getItem("token") ??
    "";
  const res = await fetch(`${React_Serve_Back}/api/relay7702`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ chainId, to, authorizationList })
  });

  let json: RelayApiResponse = {};
  try {
    json = (await res.json()) as RelayApiResponse;
  } catch {
    // keep empty json on non-JSON responses
  }

  if (res.status === 401) {
    throw new Error(
      "未登录或登录已过期（401），请先在页面上连接钱包完成登录后再试"
    );
  }

  if (!res.ok || json.code !== 200 || !json.data?.txHash) {
    throw new Error(
      json.message ??
        `服务端代付失败 (HTTP ${res.status})，请确认已登录且后端已配置 RELAYER_PRIVATE_KEY`
    );
  }
  return { txHash: json.data.txHash, from: json.data.from ?? "" };
}
