import { getBalanceETH } from "./GetProvider";

type BlurTxData = {
  from: string;
  to: string;
  value: string;
  data: string;
};

type BlurOrderInfo = {
  contractAddress: string;
  maker: string;
  orderId: string;
  tokenId: string;
  tokenPrice: number;
};

export const getBlurCalldata = async (
  tokenAddress: string,
  tokenId: string | number,
  buyerAddress: string,
  buyerBlurAccessToken: string
): Promise<BlurTxData | null | 0> => {
  const postURL = "https://api.nftgo.io/api/v1/nft-aggregator/aggregate-v2";

  const blurOrderInfos = await getNFTGoBlurOrderInfos(tokenAddress, tokenId);
  if (!blurOrderInfos.length) return null;

  const orderInfos = [blurOrderInfos[0]];

  let tokenPrice = 0;
  for (let i = 0; i < orderInfos.length; i++) {
    const orderInfo = orderInfos[i];
    tokenPrice += Number(orderInfo.tokenPrice);
  }

  const balance = await getBalanceETH(buyerAddress);
  console.log(tokenPrice, balance);
  if (balance != null && Number(tokenPrice) > Number(balance)) {
    alert(`User ETH Insufficient, Need ${tokenPrice} ETH`);
    return 0;
  }

  const data = {
    orderInfos,
    buyer: buyerAddress,
    safeMode: false,
    // accessToken 是登陆 blur 获得的token
    accessToken: buyerBlurAccessToken
  };

  try {
    const response = await fetch(postURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      console.log(response);
      console.log("Network Error");
      return null;
    }

    const responseData: any = await response.json();
    if (responseData.errorCode !== 0) {
      return null;
    }

    const txData: BlurTxData | undefined =
      responseData.data?.aggregateResult?.actions?.[0]?.data?.txData;

    return txData ?? null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getNFTGoBlurOrderInfos = async (
  contractAddress: string,
  tokenId: string | number
): Promise<BlurOrderInfo[]> => {
  const postURL = `https://api.nftgo.io/api/v2/asset/orders?contract=${contractAddress}&tokenId=${tokenId}&limit=20`;
  const orderInfos: BlurOrderInfo[] = [];

  try {
    const response = await fetch(postURL, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      console.log("Network Error");
      return orderInfos;
    }

    const responseData: any = await response.json();
    const orders: any[] = responseData.data?.orders ?? [];

    if (!orders.length) {
      return orderInfos;
    }

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];

      if (
        typeof order.orderKind === "string" &&
        order.orderKind.includes("blur")
      ) {
        const orderInfo: BlurOrderInfo = {
          contractAddress: String(order.address),
          maker: String(order.maker),
          orderId: String(order.id),
          tokenId: String(order.tokenId),
          tokenPrice: Number(order.tokenPrice)
        };
        orderInfos.push(orderInfo);
      }

      if (orderInfos.length) {
        return orderInfos;
      }
    }

    return orderInfos;
  } catch (error) {
    console.log(error);
    return orderInfos;
  }
};
