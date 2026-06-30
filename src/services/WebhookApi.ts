import { React_Serve_Back } from "@/config/SystemConfiguration";
import { stringifyJson } from "@/lib/shared/Format";

/**
 * Relay a notification through the backend (`POST /api/webhooks`) so the real
 * target URL (e.g. Discord) stays server-side. Requires the login JWT.
 */
export const postWebhooks = async (
  data: unknown,
  userToken: string,
  destination = "discord"
): Promise<unknown> => {
  if (!userToken) return null;
  try {
    const response = await fetch(`${React_Serve_Back}/api/webhooks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`
      },
      body: JSON.stringify({ destination, content: stringifyJson(data, 4) })
    });
    if (!response.ok) {
      throw new Error(`Webhook relay error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Webhook relay failed:", error);
    return null;
  }
};
