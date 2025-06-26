import { getAccount, getSignerAndChainId } from "./GetProvider.js";
import { signEIP712Message, signSiweMessage } from "./SignFunc.js";
import { getUserToken } from "../api/GetData.js";

const login = async () => {
  try {
    let params = await signSiweMessage();
    if (params === null) return [null, null];

    let res = await getUserToken(params);
    if (res.code === -444) {
      alert(res.message);
      return [null, null];
    }

    localStorage.setItem("token", res.data.userToken);
    return [params.signature, params.message.userAddress];
  } catch (error) {
    console.log(error);
    const account = await getAccount();
    return [true, account];
  }
};
export { login };
