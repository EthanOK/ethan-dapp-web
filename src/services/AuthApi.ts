import { React_Serve_Back } from "@/config/SystemConfiguration";

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
