import { ethers } from "ethers";
import type { Contract, providers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";
import seaportAbi from "../contracts/seaport1_5.json";
import Orders from "./GetOrder";
import OrdersTest from "./GetOrdersTestnet";
import { addSuffixOfTxData, getNewTx } from "./HandleTxData";

import {
  suffixOfYunGou,
  chainName_TBSC,
  OPENSEA_MAIN_API,
  chainName_S
} from "../common/SystemConfiguration";
import { getProvider } from "./GetProvider";
import { getScanURL } from "./Utils";

type TxMessageResult = [string | null, providers.TransactionResponse | null];

type FulfillmentTransaction = {
  to: string;
  value: string | number | ethers.BigNumber;
  input_data: {
    parameters: unknown;
  };
};

type FulfillAvailableOrdersBundle = [
  protocolAddress: string,
  currentPriceSum: string,
  orders: unknown[],
  offerFulfillments: unknown[],
  considerationFulfillments: unknown[],
  fulfillerConduitKey: string,
  maximumFulfilled: number
];

type SeaportContract = Contract & {
  populateTransaction: {
    fulfillBasicOrder(parameters: unknown): Promise<{ data?: string }>;
    fulfillAvailableAdvancedOrders(
      advancedOrders: unknown[],
      criteriaResolvers: unknown[],
      offerFulfillments: unknown[],
      considerationFulfillments: unknown[],
      fulfillerConduitKey: string,
      recipient: string,
      maximumFulfilled: number
    ): Promise<{ data?: string }>;
  };
  callStatic: {
    fulfillBasicOrder(
      parameters: unknown,
      overrides?: { value: ethers.BigNumber }
    ): Promise<unknown>;
    fulfillBasicOrder_efficient_6GL6yc(
      parameters: unknown,
      overrides?: { value: ethers.BigNumber }
    ): Promise<unknown>;
    fulfillOrder(
      order: unknown,
      fulfillerConduitKey: string,
      overrides?: { value: ethers.BigNumber }
    ): Promise<unknown>;
    fulfillAvailableOrders(
      orders: unknown[],
      offerFulfillments: unknown[],
      considerationFulfillments: unknown[],
      fulfillerConduitKey: string,
      maximumFulfilled: number,
      overrides?: { value: ethers.BigNumber }
    ): Promise<unknown>;
    fulfillAvailableAdvancedOrders(
      advancedOrders: unknown[],
      criteriaResolvers: unknown[],
      offerFulfillments: unknown[],
      considerationFulfillments: unknown[],
      fulfillerConduitKey: string,
      recipient: string,
      maximumFulfilled: number,
      overrides?: { value: ethers.BigNumber }
    ): Promise<unknown>;
  };
  fulfillBasicOrder_efficient_6GL6yc(
    parameters: unknown,
    overrides?: { value: ethers.BigNumber }
  ): Promise<providers.TransactionResponse>;
  fulfillOrder(
    order: unknown,
    fulfillerConduitKey: string,
    overrides?: { value: ethers.BigNumber }
  ): Promise<providers.TransactionResponse>;
  fulfillAvailableOrders(
    orders: unknown[],
    offerFulfillments: unknown[],
    considerationFulfillments: unknown[],
    fulfillerConduitKey: string,
    maximumFulfilled: number,
    overrides?: { value: ethers.BigNumber }
  ): Promise<providers.TransactionResponse>;
};

const isFulfillmentTransaction = (
  value: unknown
): value is FulfillmentTransaction => {
  if (!value || typeof value !== "object") return false;
  const tx = value as FulfillmentTransaction;
  return typeof tx.to === "string" && tx.input_data?.parameters !== undefined;
};

const isFulfillOrderTuple = (
  value: unknown
): value is [string, string | number | ethers.BigNumber, unknown] => {
  return Array.isArray(value) && value.length >= 3;
};

const isFulfillAvailableOrdersBundle = (
  value: unknown
): value is FulfillAvailableOrdersBundle => {
  return Array.isArray(value) && value.length >= 7;
};

const getNumericChainId = (): number | null => {
  const chainIdStr = localStorage.getItem("chainId");
  if (!chainIdStr) return null;
  const n = Number(chainIdStr);
  return Number.isFinite(n) ? n : null;
};

const fulfillBasicOrder = async (
  contract_: string,
  tokenId_: string,
  currentAccount: string
): Promise<TxMessageResult | undefined> => {
  const providerWeb3 = await getProvider();
  if (!providerWeb3) return;
  const signer = providerWeb3.getSigner();
  const chainId = getNumericChainId();

  let transactionData: FulfillmentTransaction | null | undefined;
  if (!contract_ || !tokenId_) {
    console.log("contractAddress or tokenId is null");
    return;
  }

  if (chainId === 1) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.Mainnet,
      apiKey: OPENSEA_MAIN_API
    });

    transactionData = await Orders.getFulfillment_transaction(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 56) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.BNB,
      apiKey: OPENSEA_MAIN_API
    });

    transactionData = await Orders.getFulfillment_transaction(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 11155111) {
    transactionData = await OrdersTest.getFulfillment_transaction(
      chainName_S,
      currentAccount,
      contract_,
      tokenId_
    );
    if (transactionData === null) {
      console.log("transactionDatas is null");
      return;
    }
  } else if (chainId === 97) {
    transactionData = await OrdersTest.getFulfillment_transaction(
      chainName_TBSC,
      currentAccount,
      contract_,
      tokenId_
    );
    if (transactionData === null) {
      console.log("transactionDatas is null");
      return;
    }
  }
  if (!isFulfillmentTransaction(transactionData)) return;

  console.log(transactionData);
  const parameters = transactionData.input_data.parameters;
  const nftcontract = new ethers.Contract(
    transactionData.to,
    seaportAbi,
    signer
  ) as SeaportContract;
  const value = transactionData.value;
  console.log(parameters);
  const result =
    await nftcontract.populateTransaction.fulfillBasicOrder(parameters);
  const inputData = result.data;
  if (!inputData) {
    return [null, null];
  }

  const resultData = await nftcontract.callStatic.fulfillBasicOrder(
    parameters,
    {
      value: ethers.BigNumber.from(value.toString())
    }
  );
  console.log(resultData);

  const tx = await getNewTx(
    signer,
    nftcontract.address,
    inputData,
    suffixOfYunGou,
    ethers.BigNumber.from(value.toString())
  );

  if (tx !== null) {
    console.log("fulfillBasicOrder... please await");
    const etherscanURL = await getScanURL();
    console.log(`Please See: ${etherscanURL}/tx/${tx.hash}`);
    const message_ = `${etherscanURL}/tx/${tx.hash}`;

    return [message_, tx];
  } else {
    return [null, null];
  }
};

const fulfillOrder = async (
  contract_: string,
  tokenId_: string,
  currentAccount: string
): Promise<TxMessageResult | undefined> => {
  const providerWeb3 = await getProvider();
  if (!providerWeb3) return;
  const signer = providerWeb3.getSigner();
  const chainId = getNumericChainId();
  let orderdata: unknown;

  if (chainId === 1) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.Mainnet,
      apiKey: OPENSEA_MAIN_API
    });
    orderdata = await Orders.getFulfillment_order(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 56) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.BNB,
      apiKey: OPENSEA_MAIN_API
    });
    orderdata = await Orders.getFulfillment_order(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 11155111) {
    orderdata = await OrdersTest.getFulfillment_order(
      chainName_S,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 97) {
    orderdata = await OrdersTest.getFulfillment_order(
      chainName_TBSC,
      currentAccount,
      contract_,
      tokenId_
    );
  }

  if (!isFulfillOrderTuple(orderdata)) {
    console.log("orderdata invalid");
    return [null, null];
  }

  const [protocolAddress, value_wei, order] = orderdata;

  const nftcontract = new ethers.Contract(
    protocolAddress,
    seaportAbi,
    signer
  ) as SeaportContract;
  console.log("parameters:");
  console.log(order);

  const fulfillerConduitKey =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const callStaticReturn = await nftcontract.callStatic.fulfillOrder(
    order,
    fulfillerConduitKey,
    {
      value: ethers.BigNumber.from(value_wei.toString())
    }
  );
  console.log("call fulfillOrder result: " + callStaticReturn);

  const tx = await nftcontract.fulfillOrder(order, fulfillerConduitKey, {
    value: ethers.BigNumber.from(value_wei.toString())
  });

  console.log("fulfillOrder... please await");
  const etherscanURL = await getScanURL();
  console.log(`Please See: ${etherscanURL}/tx/${tx.hash}`);
  const message_ = `${etherscanURL}/tx/${tx.hash}`;
  return [message_, tx];
};

const fulfillBasicOrder_efficient = async (
  contract_: string,
  tokenId_: string,
  currentAccount: string
): Promise<TxMessageResult | undefined> => {
  const providerWeb3 = await getProvider();
  if (!providerWeb3) return;
  const signer = providerWeb3.getSigner();
  const chainId = getNumericChainId();
  let transactionData: FulfillmentTransaction | null | undefined;

  if (chainId === 1) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.Mainnet,
      apiKey: OPENSEA_MAIN_API
    });
    transactionData = await Orders.getFulfillment_transaction(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 56) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.BNB,
      apiKey: OPENSEA_MAIN_API
    });
    transactionData = await Orders.getFulfillment_transaction(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 11155111) {
    transactionData = await OrdersTest.getFulfillment_transaction(
      chainName_S,
      currentAccount,
      contract_,
      tokenId_
    );
    if (transactionData === null) {
      console.log("transactionDatas is null");
      return;
    }
  } else if (chainId === 97) {
    transactionData = await OrdersTest.getFulfillment_transaction(
      chainName_TBSC,
      currentAccount,
      contract_,
      tokenId_
    );
    if (transactionData === null) {
      console.log("transactionDatas is null");
      return;
    }
  }
  if (!isFulfillmentTransaction(transactionData)) return;

  const parameters = transactionData.input_data.parameters;
  const nftcontract = new ethers.Contract(
    transactionData.to,
    seaportAbi,
    signer
  ) as SeaportContract;
  const value = transactionData.value;
  const resultData =
    await nftcontract.callStatic.fulfillBasicOrder_efficient_6GL6yc(
      parameters,
      {
        value: ethers.BigNumber.from(value.toString())
      }
    );
  console.log(resultData);
  const tx = await nftcontract.fulfillBasicOrder_efficient_6GL6yc(parameters, {
    value: ethers.BigNumber.from(value.toString())
  });

  console.log("fulfillBasicOrder_efficient... please await");
  const etherscanURL = await getScanURL();
  console.log(`Please See: ${etherscanURL}/tx/${tx.hash}`);
  const message_ = `${etherscanURL}/tx/${tx.hash}`;
  return [message_, tx];
};

const fulfillAvailableOrders = async (
  contracts_: string[],
  tokenIds_: (string | number)[],
  currentAccount: string
): Promise<TxMessageResult | undefined> => {
  const data = { contracts: contracts_, tokenIds: tokenIds_ };
  console.log(data);

  const providerWeb3 = await getProvider();
  if (!providerWeb3) return;
  const signer = providerWeb3.getSigner();
  const chainId = getNumericChainId();

  let protocolAddress: string;
  let currentPriceSum: string;
  let orders: any[];
  let offerFulfillments: any[];
  let considerationFulfillments: any[];
  let fulfillerConduitKey: string;
  let maximumFulfilled: number;

  if (chainId === 1) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.Mainnet,
      apiKey: OPENSEA_MAIN_API
    });
    [
      protocolAddress,
      currentPriceSum,
      orders,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = await Orders.getFulfillAvailableOrders_data(
      openseaSDK,
      currentAccount,
      contracts_,
      tokenIds_
    );
  } else if (chainId === 56) {
    const openseaSDK = new OpenSeaSDK(providerWeb3 as any, {
      chain: Chain.BNB,
      apiKey: OPENSEA_MAIN_API
    });
    [
      protocolAddress,
      currentPriceSum,
      orders,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = await Orders.getFulfillAvailableOrders_data(
      openseaSDK,
      currentAccount,
      contracts_,
      tokenIds_
    );
  } else if (chainId === 11155111) {
    const bundle = await OrdersTest.getFulfillAvailableOrders_data(
      chainName_S,
      currentAccount,
      contracts_,
      tokenIds_
    );
    if (!isFulfillAvailableOrdersBundle(bundle)) {
      return [null, null];
    }
    [
      protocolAddress,
      currentPriceSum,
      orders,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = bundle;
    console.log(orders);
  } else if (chainId === 97) {
    const bundle = await OrdersTest.getFulfillAvailableOrders_data(
      chainName_TBSC,
      currentAccount,
      contracts_,
      tokenIds_
    );
    if (!isFulfillAvailableOrdersBundle(bundle)) {
      return [null, null];
    }
    [
      protocolAddress,
      currentPriceSum,
      orders,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = bundle;
    console.log(orders);
  } else {
    return [null, null];
  }

  const nftcontract = new ethers.Contract(
    protocolAddress,
    seaportAbi,
    signer
  ) as SeaportContract;

  const callstaticResult = await nftcontract.callStatic.fulfillAvailableOrders(
    orders,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled,
    {
      value: ethers.BigNumber.from(currentPriceSum.toString())
    }
  );
  console.log("callstaticResult: " + callstaticResult);
  const tx = await nftcontract.fulfillAvailableOrders(
    orders,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled,
    {
      value: ethers.BigNumber.from(currentPriceSum.toString())
    }
  );
  console.log("fulfillAvailableOrders... please await");
  const etherscanURL = await getScanURL();
  console.log(`Please See: ${etherscanURL}/tx/${tx.hash}`);
  const message_ = `${etherscanURL}/tx/${tx.hash}`;
  return [message_, tx];
};

const fulfillAvailableAdvancedOrders = async (
  contracts_: string[],
  tokenIds_: (string | number)[],
  currentAccount: string
): Promise<TxMessageResult | null | undefined> => {
  const data = { contracts: contracts_, tokenIds: tokenIds_ };
  console.log(data);
  const provider = await getProvider();
  if (!provider) return;
  const signer = provider.getSigner();
  const chainId = getNumericChainId();

  let protocolAddress: string;
  let currentPriceSum: string;
  let advancedOrders: any[];
  let criteriaResolvers: any[];
  let offerFulfillments: any[];
  let considerationFulfillments: any[];
  let fulfillerConduitKey: string;
  let maximumFulfilled: number;

  if (!contracts_.length || !tokenIds_.length) {
    console.log("contractAddress or tokenIds is null");
    return;
  }

  if (chainId === 1) {
    const openseaSDK = new OpenSeaSDK(provider as any, {
      chain: Chain.Mainnet,
      apiKey: OPENSEA_MAIN_API
    });
    [
      protocolAddress,
      currentPriceSum,
      advancedOrders,
      criteriaResolvers,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = await Orders.getFulfillAvailableAdvancedOrders_datas(
      openseaSDK,
      currentAccount,
      contracts_,
      tokenIds_
    );
  } else if (chainId === 56) {
    const openseaSDK = new OpenSeaSDK(provider as any, {
      chain: Chain.BNB,
      apiKey: OPENSEA_MAIN_API
    });
    [
      protocolAddress,
      currentPriceSum,
      advancedOrders,
      criteriaResolvers,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = await Orders.getFulfillAvailableAdvancedOrders_datas(
      openseaSDK,
      currentAccount,
      contracts_,
      tokenIds_
    );
  } else if (chainId === 11155111) {
    const Orders_datas =
      await OrdersTest.getFulfillAvailableAdvancedOrders_datas(
        chainName_S,
        currentAccount,
        contracts_,
        tokenIds_
      );
    if (Orders_datas === null) {
      console.log("Orders_datas is null");
      return null;
    }
    [
      protocolAddress,
      currentPriceSum,
      advancedOrders,
      criteriaResolvers,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = Orders_datas;
  } else if (chainId === 97) {
    const Orders_datas =
      await OrdersTest.getFulfillAvailableAdvancedOrders_datas(
        chainName_TBSC,
        currentAccount,
        contracts_,
        tokenIds_
      );
    if (Orders_datas === null) {
      console.log("Orders_datas is null");
      return null;
    }
    [
      protocolAddress,
      currentPriceSum,
      advancedOrders,
      criteriaResolvers,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey,
      maximumFulfilled
    ] = Orders_datas;
  } else {
    return [null, null];
  }

  console.log("advancedOrders: ");
  console.log(advancedOrders);
  console.log("criteriaResolvers: ");
  console.log(criteriaResolvers);
  console.log("offerFulfillments: ");
  console.log(offerFulfillments);
  console.log("considerationFulfillments: ");
  console.log(considerationFulfillments);
  const nftcontract = new ethers.Contract(
    protocolAddress,
    seaportAbi,
    signer
  ) as SeaportContract;

  const fulfillerConduitKey_0 =
    "0x0000000000000000000000000000000000000000000000000000000000000000";

  const result =
    await nftcontract.populateTransaction.fulfillAvailableAdvancedOrders(
      advancedOrders,
      criteriaResolvers,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey_0,
      currentAccount,
      maximumFulfilled
    );
  const inputData = result.data;
  if (!inputData) {
    return [null, null];
  }

  const inputDataWithExtra = await addSuffixOfTxData(inputData, suffixOfYunGou);

  const callstaticResult =
    await nftcontract.callStatic.fulfillAvailableAdvancedOrders(
      advancedOrders,
      criteriaResolvers,
      offerFulfillments,
      considerationFulfillments,
      fulfillerConduitKey_0,
      currentAccount,
      maximumFulfilled,
      {
        value: ethers.BigNumber.from(currentPriceSum.toString())
      }
    );
  console.log("callstaticResult: " + callstaticResult);

  const tx = await signer.sendTransaction({
    to: nftcontract.address,
    data: inputDataWithExtra,
    value: ethers.BigNumber.from(currentPriceSum.toString())
  });

  console.log("fulfillAvailableAdvancedOrders... please await");
  const etherscanURL = await getScanURL();
  console.log(`Please See: ${etherscanURL}/tx/${tx.hash}`);
  const message_ = `${etherscanURL}/tx/${tx.hash}`;
  return [message_, tx];
};

export {
  fulfillBasicOrder,
  fulfillOrder,
  fulfillBasicOrder_efficient,
  fulfillAvailableAdvancedOrders,
  fulfillAvailableOrders
};
