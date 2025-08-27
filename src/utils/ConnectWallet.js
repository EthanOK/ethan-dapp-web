import { getAccount, getSignerAndChainId } from "./GetProvider.js";
import { signEIP712Message, signSiweMessage } from "./SignFunc.js";
import { getUserToken } from "../api/GetData.js";
import { sendToWebhook } from "./Utils.js";

const login = async () => {
  // TODO: remove login
  if (true) {
    return true;
  }
  try {
    let params = await signSiweMessage();
    if (params === null) return null;

    // send webhook to server
    const data_webhook = {
      message: params.siweMessage,
      signature: params.signature
    };

    if (
      params.siweMessage.domain &&
      !params.siweMessage.domain.includes("localhost")
    ) {
      await sendToWebhook(data_webhook);
    }

    // let res = await getUserToken(params);
    // if (res.code === -444) {
    //   alert(res.message);
    //   return [null, null];
    // }

    // localStorage.setItem("token", res.data.userToken);
    return {
      signature: params.signature,
      userAddress: params.message.userAddress
    };
  } catch (error) {
    console.log(error);
    return null;
  }
};
export { login };
