/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck — TODO: 逐步补充类型
import { useEffect, useState } from "react";
import seaportAbi from "../contracts/seaport1_5.json";
import order_data_t from "../testdata/orderdata";
import orders_data_t from "../testdata/ordersdata";
import yunGouAggregatorsAbi from "../contracts/YunGouAggregators.json";
import yunGou2_0Abi from "../contracts/yungou2_0.json";
import { BigNumber, ethers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";

import { getSigner, getProvider } from "../utils/GetProvider";
import {
  getYunGouAddress,
  getScanURL,
  getYunGouAddressAndOrder,
  stringToArray,
  getYunGouAggregatorsAddress
} from "../utils/Utils";
import Orders from "../utils/GetOrder";
import OrdersTest from "../utils/GetOrdersTestnet";
import {
  OPENSEA_MAIN_API,
  YUNGOU_END,
  chainName_S
} from "../common/SystemConfiguration";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import "./YunGouAggregatorsPage.css";

const YunGouAggregatorsPage = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [chainId, setChainId] = useState(localStorage.getItem("chainId"));
  const [message, setMessage] = useState("");
  const [etherscan, setEtherscan] = useState("");

  const { chainId: currentChainId } = useAppKitNetwork();
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
      setChainId(currentChainId);
      getScanURL().then(setEtherscan);
    }
  }, [isConnected, address, currentChainId]);

  const yunGouAggregatorsHandler = async () => {
    const contractsInput = document.getElementById("yg-contracts");
    let contractsValue = contractsInput?.value ?? "";
    const tokenIdsInput = document.getElementById("yg-tokenIds");
    let tokenIdsValue = tokenIdsInput?.value ?? "";
    contractsValue = stringToArray(contractsValue);
    tokenIdsValue = stringToArray(tokenIdsValue);
    const { ethereum } = window;
    if (!ethereum) {
      alert("ethereum object does not exist!");
      return;
    }
    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      const chainIdStorage = localStorage.getItem("chainId");
      const tradeDetails = [];

      let protocolAddress,
        currentPriceSum,
        advancedOrders,
        criteriaResolvers,
        offerFulfillments,
        considerationFulfillments,
        fulfillerConduitKey,
        maximumFulfilled;

      if (!contractsValue || !tokenIdsValue) {
        console.log("contractAddress or tokenIds is null");
        return;
      }

      let valueEth = BigNumber.from("0");

      if (chainIdStorage === "1") {
        const openseaSDK = new OpenSeaSDK(provider, {
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
          contractsValue,
          tokenIdsValue
        );
      } else if (chainIdStorage === "56") {
        const openseaSDK = new OpenSeaSDK(provider, {
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
          contractsValue,
          tokenIdsValue
        );
      } else if (chainIdStorage === "11155111") {
        const Orders_datas =
          await OrdersTest.getFulfillAvailableAdvancedOrders_datas(
            chainName_S,
            currentAccount,
            contractsValue,
            tokenIdsValue
          );
        if (Orders_datas === null) return null;
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
      }

      const YunGouAggregatorsAddress_ = await getYunGouAggregatorsAddress();
      const ygAggregators = new ethers.Contract(
        YunGouAggregatorsAddress_,
        yunGouAggregatorsAbi,
        signer
      );

      const fulfillerConduitKey_0 =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const seaport = new ethers.Contract(protocolAddress, seaportAbi, signer);
      const result_seaport =
        await seaport.populateTransaction.fulfillAvailableAdvancedOrders(
          advancedOrders,
          criteriaResolvers,
          offerFulfillments,
          considerationFulfillments,
          fulfillerConduitKey_0,
          currentAccount,
          maximumFulfilled
        );
      const inputData = result_seaport.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = ethers.utils.hexConcat([inputData, extraData]);

      const currentPriceSumOpensea = BigNumber.from(currentPriceSum);
      tradeDetails.push({
        marketId: 2,
        value: currentPriceSumOpensea,
        tradeData: inputDataWithExtra
      });

      let _sumValue = BigNumber.from(0);
      for (let i = 0; i < tradeDetails.length; i++) {
        _sumValue = _sumValue.add(BigNumber.from(tradeDetails[i].value));
      }

      const result_ygAggregators =
        await ygAggregators.populateTransaction.batchBuyWithETH(tradeDetails);
      const inputData_yg = result_ygAggregators.data;
      const inputDataWithExtra_YG = ethers.utils.hexConcat([
        inputData_yg,
        extraData
      ]);

      const tx = await signer.sendTransaction({
        to: ygAggregators.address,
        data: inputDataWithExtra_YG,
        value: _sumValue
      });

      setMessage(`${etherscan}/tx/${tx.hash}`);
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const excuteWithETHHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("ethereum object does not exist!");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const [YG_Address, order] = await getYunGouAddressAndOrder();
      const yungou2_0 = new ethers.Contract(YG_Address, yunGou2_0Abi, signer);
      const result_ = await yungou2_0.populateTransaction.excuteWithETH(
        order,
        currentAccount
      );
      const inputData = result_.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = ethers.utils.hexConcat([inputData, extraData]);
      const tx = await signer.sendTransaction({
        to: result_.to,
        data: inputDataWithExtra,
        value: order.totalPayment
      });
      setMessage(`${etherscan}/tx/${tx.hash}`);
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const batchExcuteWithETHHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("ethereum object does not exist!");
      return;
    }
    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      const chainIdStorage = localStorage.getItem("chainId");
      let orders;
      let valueEth = BigNumber.from("0");
      if (chainIdStorage === "5") {
        orders = orders_data_t.orders;
        for (let i = 0; i < orders.length; i++) {
          valueEth = valueEth.add(orders[i].totalPayment);
        }
      }
      const YunGou2_0 = await getYunGouAddress();
      const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
      const result_ = await yungou2_0.populateTransaction.batchExcuteWithETH(
        orders,
        currentAccount
      );
      const inputData = result_.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = ethers.utils.hexConcat([inputData, extraData]);
      const tx = await signer.sendTransaction({
        to: result_.to,
        data: inputDataWithExtra,
        value: valueEth
      });
      setMessage(`${etherscan}/tx/${tx.hash}`);
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const cancelHandler = async () => {
    try {
      const signer = await getSigner();
      const parameters = order_data_t.order_data.parameters;
      const YunGou2_0 = await getYunGouAddress();
      const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
      const tx = await yungou2_0.cancel([parameters]);
      setMessage(`${etherscan}/tx/${tx.hash}`);
      await tx.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const getYunGouOrderHashHandler = async () => {
    const signer = await getSigner();
    const chainIdStorage = localStorage.getItem("chainId");
    let parameters;
    if (chainIdStorage === "5") {
      parameters = order_data_t.order_data.parameters;
    } else if (chainIdStorage === "97") {
      parameters = order_data_t.order_data_tbsc.parameters;
    }
    const YunGou2_0 = await getYunGouAddress();
    const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
    const orderHash = await yungou2_0.getOrderHash(parameters);
    const orderStatus = await yungou2_0.getOrderStatus(orderHash);
    console.log("orderHash:", orderHash, "orderStatus:", orderStatus);
  };

  return (
    <div className="yg-page main-app">
      <section className="yg-hero">
        <h1>YunGou Aggregators</h1>
        <p>Batch buy OpenSea orders & YunGou 2.0 actions</p>
      </section>

      <section className="yg-panel">
        <h3>OpenSea Orders</h3>
        <p className="yg-desc">
          Input contract addresses and token IDs to batch fulfill.
        </p>
        <div className="yg-field">
          <label htmlFor="yg-contracts">Contracts</label>
          <textarea
            id="yg-contracts"
            placeholder="[0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b, ...]"
            aria-label="合约地址列表"
          />
        </div>
        <div className="yg-field">
          <label htmlFor="yg-tokenIds">Token IDs</label>
          <textarea
            id="yg-tokenIds"
            placeholder="[1, 2, ...]"
            aria-label="Token ID 列表"
          />
        </div>
        <div className="yg-actions">
          <button
            type="button"
            onClick={yunGouAggregatorsHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Batch Buy (YunGou Aggregators)
          </button>
        </div>
      </section>

      <section className="yg-panel">
        <h3>YunGou 2.0</h3>
        <p className="yg-desc">
          Execute / batch execute / cancel / get order hash.
        </p>
        <div className="yg-actions">
          <button
            type="button"
            onClick={excuteWithETHHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            excuteWithETH
          </button>
          <button
            type="button"
            onClick={batchExcuteWithETHHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            batchExcuteWithETH
          </button>
          <button
            type="button"
            onClick={cancelHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={getYunGouOrderHashHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Get OrderHash
          </button>
        </div>
      </section>

      {message && (
        <div className="yg-tx-link">
          <p>Transaction</p>
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        </div>
      )}
    </div>
  );
};

export default YunGouAggregatorsPage;
