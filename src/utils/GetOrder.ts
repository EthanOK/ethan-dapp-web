import { BigNumber } from "ethers";

type OpenSeaSDKLike = {
  api: {
    getOrder: (params: any) => Promise<any>;
    generateFulfillmentData: (
      accountAddress: string,
      orderHash: string,
      protocolAddress: string,
      side: any
    ) => Promise<any>;
  };
};

const getFulfillment_transaction = async (
  openseaSDK: OpenSeaSDKLike,
  accountAddress: string,
  tokenAddress: string,
  tokenId: string | number
): Promise<any> => {
  const order = await openseaSDK.api.getOrder({
    side: "ask",
    assetContractAddress: tokenAddress,
    tokenId
  });

  if (order.orderHash === null) {
    return "null";
  }

  console.log("orderHash: " + order.orderHash);
  const fulfillment = await openseaSDK.api.generateFulfillmentData(
    accountAddress,
    order.orderHash,
    order.protocolAddress,
    order.side
  );

  if (
    fulfillment.fulfillment_data.transaction.input_data.parameters.signature ==
    null
  ) {
    return "null";
  }

  console.log("orders");
  console.log(fulfillment.fulfillment_data.orders);
  return fulfillment.fulfillment_data.transaction;
};

const getFulfillment_order = async (
  openseaSDK: OpenSeaSDKLike,
  accountAddress: string,
  tokenAddress: string,
  tokenId: string | number
): Promise<any> => {
  const order = await openseaSDK.api.getOrder({
    side: "ask",
    assetContractAddress: tokenAddress,
    tokenId
  });

  if (order.orderHash === null) {
    return "null";
  }

  const fulfillment = await openseaSDK.api.generateFulfillmentData(
    accountAddress,
    order.orderHash,
    order.protocolAddress,
    order.side
  );

  if (fulfillment.fulfillment_data.orders[0].signature === null) {
    return "null";
  }

  console.log(order);
  return [
    order.protocolAddress,
    order.currentPrice,
    fulfillment.fulfillment_data.orders[0]
  ];
};

const getFulfillAvailableOrders_data = async (
  openseaSDK: OpenSeaSDKLike,
  accountAddress: string,
  tokenAddress_s: string[],
  tokenIds: (string | number)[]
): Promise<any> => {
  const orders: any[] = [];
  const offerFulfillments: any[] = [];
  const considerationFulfillments: any[] = [];
  let protocolAddress = "0x";
  let fulfillerConduitKey: string | undefined;
  const maximumFulfilled = tokenAddress_s.length;
  let currentPriceSum = BigNumber.from(0);
  let count = 0;

  for (let i = 0; i < tokenAddress_s.length; i++) {
    const order = await openseaSDK.api.getOrder({
      side: "ask",
      assetContractAddress: tokenAddress_s[i],
      tokenId: tokenIds[i]
    });

    if (order.orderHash === null) {
      return "orderHash is null";
    }

    const fulfillment = await openseaSDK.api.generateFulfillmentData(
      accountAddress,
      order.orderHash,
      order.protocolAddress,
      order.side
    );

    if (count === 0) {
      protocolAddress = order.protocolAddress;
      fulfillerConduitKey =
        fulfillment.fulfillment_data.transaction.input_data.parameters
          .fulfillerConduitKey;
    }
    count++;

    if (fulfillment.fulfillment_data.orders[0].signature === null) {
      return "signature is null";
    }

    const length_offer =
      fulfillment.fulfillment_data.orders[0].parameters.offer.length;

    for (let j = 0; j < length_offer; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      offerFulfillments.push([fulfillmentComponent]);
    }

    const length_consideration =
      fulfillment.fulfillment_data.orders[0].parameters.consideration.length;

    for (let j = 0; j < length_consideration; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      considerationFulfillments.push([fulfillmentComponent]);
    }

    const currentPrice = BigNumber.from(order.currentPrice);
    currentPriceSum = currentPriceSum.add(currentPrice);

    orders.push(fulfillment.fulfillment_data.orders[0]);
  }

  return [
    protocolAddress,
    currentPriceSum.toString(),
    orders,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled
  ];
};

const getFulfillAvailableAdvancedOrders_datas = async (
  openseaSDK: OpenSeaSDKLike,
  accountAddress: string,
  tokenAddress_s: string[],
  tokenIds: (string | number)[]
): Promise<any> => {
  const advancedOrders: any[] = [];
  const criteriaResolvers: any[] = [];
  const offerFulfillments: any[] = [];
  const considerationFulfillments: any[] = [];
  let protocolAddress = "0x";
  let fulfillerConduitKey: string | undefined;
  const maximumFulfilled = tokenAddress_s.length;
  let currentPriceSum = BigNumber.from(0);
  let count = 0;

  for (let i = 0; i < tokenAddress_s.length; i++) {
    const order = await openseaSDK.api.getOrder({
      side: "ask",
      assetContractAddress: tokenAddress_s[i],
      tokenId: tokenIds[i]
    });

    if (order.orderHash === null) {
      return "orderHash is null";
    }

    console.log("orderHash:" + order.orderHash);
    const fulfillment = await openseaSDK.api.generateFulfillmentData(
      accountAddress,
      order.orderHash,
      order.protocolAddress,
      order.side
    );

    if (count === 0) {
      protocolAddress = order.protocolAddress;
      fulfillerConduitKey =
        fulfillment.fulfillment_data.transaction.input_data.parameters
          .fulfillerConduitKey;
    }
    count++;

    if (fulfillment.fulfillment_data.orders[0].signature === null) {
      return "signature is null";
    }

    const length_offer =
      fulfillment.fulfillment_data.orders[0].parameters.offer.length;

    for (let j = 0; j < length_offer; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      offerFulfillments.push([fulfillmentComponent]);
    }

    const length_consideration =
      fulfillment.fulfillment_data.orders[0].parameters.consideration.length;

    for (let j = 0; j < length_consideration; j++) {
      const fulfillmentComponent = {
        orderIndex: i,
        itemIndex: j
      };
      considerationFulfillments.push([fulfillmentComponent]);
    }

    const currentPrice = BigNumber.from(order.currentPrice);
    currentPriceSum = currentPriceSum.add(currentPrice);

    const advancedOrder = {
      parameters: fulfillment.fulfillment_data.orders[0].parameters,
      numerator: 1,
      denominator: 1,
      signature: fulfillment.fulfillment_data.orders[0].signature,
      extraData: "0x"
    };

    advancedOrders.push(advancedOrder);
  }

  return [
    protocolAddress,
    currentPriceSum.toString(),
    advancedOrders,
    criteriaResolvers,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled
  ];
};

export default {
  getFulfillment_transaction,
  getFulfillment_order,
  getFulfillAvailableOrders_data,
  getFulfillAvailableAdvancedOrders_datas
};
