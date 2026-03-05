import { React_Serve_Back } from "../common/SystemConfiguration";

const url = React_Serve_Back;

export const changeCrossChainDatas = async (
  chainId: string | number,
  ccType: string,
  amount: string | number,
  toChainId: string | number
): Promise<unknown> => {
  const userToken = localStorage.getItem("token") ?? "";
  const requestParameters = { chainId, ccType, amount, toChainId };
  const result = await fetch(`${url}/api/changeCrossChainDatas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Token": userToken
    },
    body: JSON.stringify(requestParameters)
  });
  return result.json();
};
