import { Contract, type TransactionResponse } from "ethers";
import { Chain } from "@opensea/sdk";
import seaportAbi from "@/abis/evm/seaport1_5.json";
import Orders from "@/lib/nft/GetOrder";
import OrdersTest from "@/lib/nft/GetOrdersTestnet";
import { addSuffixOfTxData, getNewTx } from "@/lib/evm/HandleTxData";

import {
  suffixOfYunGou,
  chainName_TBSC,
  chainName_S
} from "@/config/SystemConfiguration";
import {
  getProvider,
  parseEvmChainIdFromStored
} from "@/lib/wallet/GetProvider";
import { withCustomGasPrice } from "@/lib/evm/GasStrategy";
import { getScanURL } from "@/lib/shared/Utils";
import { createOpenSeaSDK } from "@/lib/nft/CreateOpenSeaSdk";

type TxMessageResult = [string | null, TransactionResponse | null];

type FulfillmentTransaction = {
  to: string;
  value: string | number | bigint;
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
      overrides?: { value: bigint }
    ): Promise<unknown>;
    fulfillBasicOrder_efficient_6GL6yc(
      parameters: unknown,
      overrides?: { value: bigint }
    ): Promise<unknown>;
    fulfillOrder(
      order: unknown,
      fulfillerConduitKey: string,
      overrides?: { value: bigint }
    ): Promise<unknown>;
    fulfillAvailableOrders(
      orders: unknown[],
      offerFulfillments: unknown[],
      considerationFulfillments: unknown[],
      fulfillerConduitKey: string,
      maximumFulfilled: number,
      overrides?: { value: bigint }
    ): Promise<unknown>;
    fulfillAvailableAdvancedOrders(
      advancedOrders: unknown[],
      criteriaResolvers: unknown[],
      offerFulfillments: unknown[],
      considerationFulfillments: unknown[],
      fulfillerConduitKey: string,
      recipient: string,
      maximumFulfilled: number,
      overrides?: { value: bigint }
    ): Promise<unknown>;
  };
  fulfillBasicOrder_efficient_6GL6yc(
    parameters: unknown,
    overrides?: { value: bigint }
  ): Promise<TransactionResponse>;
  fulfillOrder(
    order: unknown,
    fulfillerConduitKey: string,
    overrides?: { value: bigint }
  ): Promise<TransactionResponse>;
  fulfillAvailableOrders(
    orders: unknown[],
    offerFulfillments: unknown[],
    considerationFulfillments: unknown[],
    fulfillerConduitKey: string,
    maximumFulfilled: number,
    overrides?: { value: bigint }
  ): Promise<TransactionResponse>;
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
): value is [string, string | number | bigint, unknown] => {
  return Array.isArray(value) && value.length >= 3;
};

const isFulfillAvailableOrdersBundle = (
  value: unknown
): value is FulfillAvailableOrdersBundle => {
  return Array.isArray(value) && value.length >= 7;
};

const getNumericChainId = (): number | null =>
  parseEvmChainIdFromStored(localStorage.getItem("chainId"));

const fulfillBasicOrder = async (
  contract_: string,
  tokenId_: string,
  currentAccount: string
): Promise<TxMessageResult | undefined> => {
  const providerWeb3 = await getProvider();
  if (!providerWeb3) return;
  const signer = withCustomGasPrice(
    await providerWeb3.getSigner(),
    getNumericChainId() ?? undefined
  );
  const chainId = getNumericChainId();

  let transactionData: FulfillmentTransaction | null | undefined;
  if (!contract_ || !tokenId_) {
    return;
  }

  if (chainId === 1) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, Chain.Mainnet);

    transactionData = await Orders.getFulfillment_transaction(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 56) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, "bsc" as Chain);

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
      return;
    }
  }
  if (!isFulfillmentTransaction(transactionData)) return;

  const parameters = transactionData.input_data.parameters;
  const nftcontract = new Contract(
    transactionData.to,
    seaportAbi,
    signer
  ) as SeaportContract;
  const value = transactionData.value;

  const result =
    await nftcontract.populateTransaction.fulfillBasicOrder(parameters);
  const inputData = result.data;
  if (!inputData) {
    return [null, null];
  }

  const resultData = await (
    nftcontract as Contract
  ).fulfillBasicOrder.staticCall(parameters, {
    value: BigInt(value.toString())
  });

  const tx = await getNewTx(
    signer,
    String(nftcontract.target),
    inputData,
    suffixOfYunGou,
    BigInt(value.toString())
  );

  if (tx !== null) {
    const etherscanURL = await getScanURL();

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
  const signer = withCustomGasPrice(
    await providerWeb3.getSigner(),
    getNumericChainId() ?? undefined
  );
  const chainId = getNumericChainId();
  let orderdata: unknown;

  if (chainId === 1) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, Chain.Mainnet);
    orderdata = await Orders.getFulfillment_order(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 56) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, "bsc" as Chain);
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
    return [null, null];
  }

  const [protocolAddress, value_wei, order] = orderdata;

  const nftcontract = new Contract(
    protocolAddress,
    seaportAbi,
    signer
  ) as SeaportContract;

  const fulfillerConduitKey =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  const callStaticReturn = await (
    nftcontract as Contract
  ).fulfillOrder.staticCall(order, fulfillerConduitKey, {
    value: BigInt(value_wei.toString())
  });

  const tx = await nftcontract.fulfillOrder(order, fulfillerConduitKey, {
    value: BigInt(value_wei.toString())
  });

  const etherscanURL = await getScanURL();

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
  const signer = withCustomGasPrice(
    await providerWeb3.getSigner(),
    getNumericChainId() ?? undefined
  );
  const chainId = getNumericChainId();
  let transactionData: FulfillmentTransaction | null | undefined;

  if (chainId === 1) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, Chain.Mainnet);
    transactionData = await Orders.getFulfillment_transaction(
      openseaSDK,
      currentAccount,
      contract_,
      tokenId_
    );
  } else if (chainId === 56) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, "bsc" as Chain);
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
      return;
    }
  }
  if (!isFulfillmentTransaction(transactionData)) return;

  const parameters = transactionData.input_data.parameters;
  const nftcontract = new Contract(
    transactionData.to,
    seaportAbi,
    signer
  ) as SeaportContract;
  const value = transactionData.value;
  const resultData = await (
    nftcontract as Contract
  ).fulfillBasicOrder_efficient_6GL6yc.staticCall(parameters, {
    value: BigInt(value.toString())
  });

  const tx = await nftcontract.fulfillBasicOrder_efficient_6GL6yc(parameters, {
    value: BigInt(value.toString())
  });

  const etherscanURL = await getScanURL();

  const message_ = `${etherscanURL}/tx/${tx.hash}`;
  return [message_, tx];
};

const fulfillAvailableOrders = async (
  contracts_: string[],
  tokenIds_: (string | number)[],
  currentAccount: string
): Promise<TxMessageResult | undefined> => {
  const data = { contracts: contracts_, tokenIds: tokenIds_ };

  const providerWeb3 = await getProvider();
  if (!providerWeb3) return;
  const signer = withCustomGasPrice(
    await providerWeb3.getSigner(),
    getNumericChainId() ?? undefined
  );
  const chainId = getNumericChainId();

  let protocolAddress: string;
  let currentPriceSum: string;
  let orders: any[];
  let offerFulfillments: any[];
  let considerationFulfillments: any[];
  let fulfillerConduitKey: string;
  let maximumFulfilled: number;

  if (chainId === 1) {
    const openseaSDK = createOpenSeaSDK(providerWeb3, Chain.Mainnet);
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
    const openseaSDK = createOpenSeaSDK(providerWeb3, "bsc" as Chain);
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
  } else {
    return [null, null];
  }

  const nftcontract = new Contract(
    protocolAddress,
    seaportAbi,
    signer
  ) as SeaportContract;

  const callstaticResult = await (
    nftcontract as Contract
  ).fulfillAvailableOrders.staticCall(
    orders,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled,
    {
      value: BigInt(currentPriceSum.toString())
    }
  );

  const tx = await nftcontract.fulfillAvailableOrders(
    orders,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey,
    maximumFulfilled,
    {
      value: BigInt(currentPriceSum.toString())
    }
  );

  const etherscanURL = await getScanURL();

  const message_ = `${etherscanURL}/tx/${tx.hash}`;
  return [message_, tx];
};

const fulfillAvailableAdvancedOrders = async (
  contracts_: string[],
  tokenIds_: (string | number)[],
  currentAccount: string
): Promise<TxMessageResult | null | undefined> => {
  const data = { contracts: contracts_, tokenIds: tokenIds_ };

  const provider = await getProvider();
  if (!provider) return;
  const signer = withCustomGasPrice(
    await provider.getSigner(),
    getNumericChainId() ?? undefined
  );
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
    return;
  }

  if (chainId === 1) {
    const openseaSDK = createOpenSeaSDK(provider, Chain.Mainnet);
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
    const openseaSDK = createOpenSeaSDK(provider, "bsc" as Chain);
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

  const nftcontract = new Contract(
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

  const callstaticResult = await (
    nftcontract as Contract
  ).fulfillAvailableAdvancedOrders.staticCall(
    advancedOrders,
    criteriaResolvers,
    offerFulfillments,
    considerationFulfillments,
    fulfillerConduitKey_0,
    currentAccount,
    maximumFulfilled,
    {
      value: BigInt(currentPriceSum.toString())
    }
  );

  const tx = await signer.sendTransaction({
    to: nftcontract.target,
    data: inputDataWithExtra,
    value: BigInt(currentPriceSum.toString())
  });

  const etherscanURL = await getScanURL();

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
