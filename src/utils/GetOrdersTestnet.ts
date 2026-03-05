import { BigNumber } from "ethers";

const getFulfillment_transactions = async (
  chainName: string,
  fulfiller: string,
  tokenAddress: string,
  tokenIds: (string | number)[]
): Promise<any[] | null> => {
  const [orderhashs, protocolAddress] = await getOrderHashs(
    chainName,
    tokenAddress,
    tokenIds
  );
  if (!orderhashs.length) {
    return null;
  }

  await waitOneSecond();
  const transactions: any[] = [];
  for (let i = 0; i < orderhashs.length; i++) {
    await waitOneSecond();
    const transaction = await getFulfillmentData_transaction(
      orderhashs[i],
      chainName,
      protocolAddress[i],
      fulfiller
    );

    transactions.push(transaction);
    console.log("orderhash:" + orderhashs[i]);
  }
  return transactions;
};

const getFulfillment_transaction = async (
  chainName: string,
  fulfiller: string,
  tokenAddress: string,
  tokenId: string | number
): Promise<any | null> => {
  const OrderData = await getOrderHash(chainName, tokenAddress, tokenId);
  if (!OrderData) {
    return null;
  }

  const [orderhash, protocolAddress] = OrderData;
  await waitOneSecond();

  const transaction = await getFulfillmentData_transaction(
    orderhash,
    chainName,
    protocolAddress,
    fulfiller
  );

  return transaction;
};

const getFulfillAvailableAdvancedOrders_datas = async (
  chainName: string,
  fulfiller: string,
  tokenAddress_s: string[],
  tokenIds: (string | number)[]
): Promise<any[] | null> => {
  const advancedOrders: any[] = [];
  const criteriaResolvers: any[] = [];
  const offerFulfillments: any[] = [];
  const considerationFulfillments: any[] = [];
  let protocolAddress_ = "0x";
  let fulfillerConduitKey: string | undefined;
  const maximumFulfilled = tokenAddress_s.length;
  let currentPriceSum = BigNumber.from(0);
  let count = 0;

  for (let i = 0; i < tokenAddress_s.length; i++) {
    const OrderData = await getOrderHash(
      chainName,
      tokenAddress_s[i],
      tokenIds[i]
    );
    if (!OrderData) {
      return null;
    }

    console.log("OrderData:");
    console.log(OrderData);
    const [orderHash, protocolAddress, currentPrice] = OrderData;

    await waitOneSecond();
    console.log("getFulfillmentData params:");
    console.log(orderHash, chainName, protocolAddress, fulfiller);
    const fulfillment = await getFulfillmentData(
      orderHash,
      chainName,
      protocolAddress,
      fulfiller
    );
    await waitOneSecond();

    const fulfillmentData = fulfillment.fulfillment_data;
    const order0 = fulfillmentData?.orders?.[0];
    if (!fulfillmentData || !order0) {
      return null;
    }

    if (count === 0) {
      protocolAddress_ = protocolAddress;
      fulfillerConduitKey =
        fulfillmentData.transaction?.input_data?.parameters
          ?.fulfillerConduitKey;
    }
    count++;

    if (order0.signature === null) {
      return null;
    }

    const offerItems: any[] = order0.parameters?.offer ?? [];
    const considerationItems: any[] = order0.parameters?.consideration ?? [];

    for (let j = 0; j < offerItems.length; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      offerFulfillments.push([fulfillmentComponent]);
    }

    for (let j = 0; j < considerationItems.length; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      considerationFulfillments.push([fulfillmentComponent]);
    }

    currentPriceSum = currentPriceSum.add(BigNumber.from(currentPrice));

    const advancedOrder = {
      parameters: order0.parameters,
      numerator: 1,
      denominator: 1,
      signature: order0.signature,
      extraData: "0x"
    };

    advancedOrders.push(advancedOrder);
  }

  console.log("opensea orders total payment:" + currentPriceSum.toString());
  return [
    protocolAddress_,
    currentPriceSum.toString(),
    advancedOrders,
    criteriaResolvers,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled
  ];
};

const getFulfillAvailableOrders_data = async (
  chainName: string,
  fulfiller: string,
  tokenAddress_s: string[],
  tokenIds: (string | number)[]
): Promise<any[] | null> => {
  const orders: any[] = [];
  const offerFulfillments: any[] = [];
  const considerationFulfillments: any[] = [];
  let protocolAddress_ = "0x";
  let fulfillerConduitKey: string | undefined;
  const maximumFulfilled = tokenAddress_s.length;
  let currentPriceSum = BigNumber.from(0);
  let count = 0;

  for (let i = 0; i < tokenAddress_s.length; i++) {
    const OrderData = await getOrderHash(
      chainName,
      tokenAddress_s[i],
      tokenIds[i]
    );
    if (!OrderData) {
      return null;
    }

    console.log("OrderData:");
    console.log(OrderData);
    const [orderHash, protocolAddress, currentPrice] = OrderData;

    await waitOneSecond();
    console.log("getFulfillmentData params:");
    console.log(orderHash, chainName, protocolAddress, fulfiller);
    const fulfillment = await getFulfillmentData(
      orderHash,
      chainName,
      protocolAddress,
      fulfiller
    );
    await waitOneSecond();

    const fulfillmentData = fulfillment.fulfillment_data;
    const order0 = fulfillmentData?.orders?.[0];
    if (!fulfillmentData || !order0) {
      return null;
    }

    if (count === 0) {
      protocolAddress_ = protocolAddress;
      fulfillerConduitKey =
        fulfillmentData.transaction?.input_data?.parameters
          ?.fulfillerConduitKey;
    }
    count++;

    if (order0.signature === null) {
      return null;
    }

    const offerItems: any[] = order0.parameters?.offer ?? [];
    const considerationItems: any[] = order0.parameters?.consideration ?? [];

    for (let j = 0; j < offerItems.length; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      offerFulfillments.push([fulfillmentComponent]);
    }

    for (let j = 0; j < considerationItems.length; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      considerationFulfillments.push([fulfillmentComponent]);
    }

    currentPriceSum = currentPriceSum.add(BigNumber.from(currentPrice));

    const order = {
      parameters: order0.parameters,
      signature: order0.signature
    };

    orders.push(order);
  }

  console.log("opensea orders total payment:" + currentPriceSum.toString());
  return [
    protocolAddress_,
    currentPriceSum.toString(),
    orders,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled
  ];
};

const getFulfillment_order = async (
  chainName: string,
  fulfiller: string,
  tokenAddress: string,
  tokenId: string | number
): Promise<any[] | null> => {
  const OrderData = await getOrderHash(chainName, tokenAddress, tokenId);
  if (!OrderData) {
    return null;
  }

  console.log("OrderData:");
  console.log(OrderData);
  const [orderHash, protocolAddress, currentPrice] = OrderData;

  await waitOneSecond();
  console.log(
    "getFulfillmentData params:orderHash, chainName, protocolAddress, fulfiller"
  );
  console.log(orderHash, chainName, protocolAddress, fulfiller);
  const fulfillment = await getFulfillmentData(
    orderHash,
    chainName,
    protocolAddress,
    fulfiller
  );
  console.log(fulfillment);

  const fulfillmentData = fulfillment.fulfillment_data;
  const order0 = fulfillmentData?.orders?.[0];
  if (!fulfillmentData || !order0) {
    return null;
  }

  return [protocolAddress, currentPrice, order0];
};

const GetOrdersTestnet = {
  getFulfillment_transactions,
  getFulfillment_transaction,
  getFulfillAvailableAdvancedOrders_datas,
  getFulfillment_order,
  getFulfillAvailableOrders_data
};

export default GetOrdersTestnet;

async function waitOneSecond(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000));
}

async function getOrderHashs(
  chainName: string,
  contract_address: string,
  token_ids: (string | number)[]
): Promise<[string[], string[]]> {
  const options: RequestInit = {
    method: "GET",
    headers: { accept: "application/json" }
  };

  let str_token_ids = "";
  for (let i = 0; i < token_ids.length; i++) {
    if (i === 0) {
      str_token_ids = `${token_ids[i]}`;
    } else {
      str_token_ids = `${str_token_ids}&token_ids=${token_ids[i]}`;
    }
  }

  const listings_url = `https://testnets-api.opensea.io/v2/orders/${chainName}/seaport/listings?asset_contract_address=${contract_address}&token_ids=${str_token_ids}`;

  const orders: any[] =
    (await fetch(listings_url, options)
      .then((response) => response.json())
      .then((response) => {
        return response.orders as any[];
      })
      .catch((err) => {
        console.error(err);
        return [];
      })) ?? [];

  const orderhashs: string[] = [];
  const protocolAddress: string[] = [];

  for (let i = 0; i < orders.length; i++) {
    orderhashs.push(String(orders[i].order_hash));
    protocolAddress.push(String(orders[i].protocol_address));
  }

  return [orderhashs, protocolAddress];
}

async function getOrderHash(
  chainName: string,
  contract_address: string,
  token_id: string | number
): Promise<[string, string, string] | null> {
  const options: RequestInit = {
    method: "GET",
    headers: { accept: "application/json" }
  };

  const listings_url = `https://testnets-api.opensea.io/v2/orders/${chainName}/seaport/listings?asset_contract_address=${contract_address}&token_ids=${token_id}`;

  const orders: any[] =
    (await fetch(listings_url, options)
      .then((response) => response.json())
      .then((response) => {
        return response.orders as any[];
      })
      .catch((err) => {
        console.error(err);
        return [];
      })) ?? [];

  if (!orders.length) {
    return null;
  }

  console.log("orders:");
  console.log(orders);

  return [
    String(orders[0].order_hash),
    String(orders[0].protocol_address),
    String(orders[0].current_price)
  ];
}

type TestnetFulfillmentResponse = {
  fulfillment_data?: {
    transaction?: any;
    orders?: any[];
  };
};

async function getFulfillmentData(
  hash: string,
  chain: string,
  protocol_address: string,
  fulfiller: string
): Promise<TestnetFulfillmentResponse> {
  const options: RequestInit = {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      listing: {
        hash,
        chain,
        protocol_address
      },
      fulfiller: { address: fulfiller }
    })
  };

  const response_data: TestnetFulfillmentResponse =
    (await fetch(
      "https://testnets-api.opensea.io/v2/listings/fulfillment_data",
      options
    )
      .then((response) => response.json())
      .then((response) => response as TestnetFulfillmentResponse)
      .catch((err) => {
        console.error(err);
        return {};
      })) ?? {};

  return response_data;
}

async function getFulfillmentData_transaction(
  hash: string,
  chain: string,
  protocol_address: string,
  fulfiller: string
): Promise<any> {
  const response_data = await getFulfillmentData(
    hash,
    chain,
    protocol_address,
    fulfiller
  );

  const tx = response_data.fulfillment_data?.transaction;
  if (!tx) {
    console.log("fulfillment_data.transaction is empty");
    return null;
  }

  console.log(response_data);
  return tx;
}
