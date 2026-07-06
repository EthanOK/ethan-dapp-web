/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck — TODO: add types incrementally
import { useEffect, useState } from "react";
import seaportAbi from "@/abis/evm/seaport1_5.json";
import order_data_t from "@/fixtures/OrderData";
import orders_data_t from "@/fixtures/OrdersData";
import yunGouAggregatorsAbi from "@/abis/evm/YunGouAggregators.json";
import yunGou2_0Abi from "@/abis/evm/yungou2_0.json";
import {
  Contract,
  Interface,
  concat,
  formatUnits,
  hexlify,
  parseUnits,
  toUtf8Bytes,
  Wallet,
  type TransactionResponse
} from "ethers";
import { Chain } from "@opensea/sdk";

import { getSigner, getProvider } from "@/lib/wallet/GetProvider";
import {
  getYunGouAddress,
  getScanURL,
  getYunGouAddressAndOrder,
  stringToArray,
  getYunGouAggregatorsAddress
} from "@/lib/shared/Utils";
import Orders from "@/lib/nft/GetOrder";
import OrdersTest from "@/lib/nft/GetOrdersTestnet";
import { createOpenSeaSDK } from "@/lib/nft/CreateOpenSeaSdk";
import { YUNGOU_END, chainName_S } from "@/config/SystemConfiguration";
import { useEvmWallet, useWalletChain } from "@/hooks";
import { useI18n } from "@/i18n";
import "./YunGouAggregatorsPage.css";

const YunGouAggregatorsPage = () => {
  const { t } = useI18n();
  const [currentAccount, setCurrentAccount] = useState(null);
  const [chainId, setChainId] = useState(localStorage.getItem("chainId"));
  const [message, setMessage] = useState("");
  const [etherscan, setEtherscan] = useState("");

  const { chainIdCurrent: currentChainId } = useWalletChain();
  const { address, isConnected } = useEvmWallet();

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
      alert(t("common.ethereumNotFound"));
      return;
    }
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
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

      let valueEth = BigInt("0");

      if (chainIdStorage === "1") {
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
          contractsValue,
          tokenIdsValue
        );
      } else if (chainIdStorage === "56") {
        const openseaSDK = createOpenSeaSDK(provider, Chain.BNB);
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
      const ygAggregators = new Contract(
        YunGouAggregatorsAddress_,
        yunGouAggregatorsAbi,
        signer
      );

      const fulfillerConduitKey_0 =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const seaport = new Contract(protocolAddress, seaportAbi, signer);
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
      const inputDataWithExtra = hexConcat([inputData, extraData]);

      const currentPriceSumOpensea = BigInt(currentPriceSum);
      tradeDetails.push({
        marketId: 2,
        value: currentPriceSumOpensea,
        tradeData: inputDataWithExtra
      });

      let _sumValue = BigInt(0);
      for (let i = 0; i < tradeDetails.length; i++) {
        _sumValue = _sumValue + BigInt(tradeDetails[i].value);
      }

      const result_ygAggregators =
        await ygAggregators.populateTransaction.batchBuyWithETH(tradeDetails);
      const inputData_yg = result_ygAggregators.data;
      const inputDataWithExtra_YG = hexConcat([inputData_yg, extraData]);

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
      alert(t("common.ethereumNotFound"));
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const [YG_Address, order] = await getYunGouAddressAndOrder();
      const yungou2_0 = new Contract(YG_Address, yunGou2_0Abi, signer);
      const result_ = await yungou2_0.populateTransaction.excuteWithETH(
        order,
        currentAccount
      );
      const inputData = result_.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = hexConcat([inputData, extraData]);
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
      alert(t("common.ethereumNotFound"));
      return;
    }
    try {
      const provider = await getProvider();
      const signer = await provider.getSigner();
      const chainIdStorage = localStorage.getItem("chainId");
      let orders;
      let valueEth = BigInt("0");
      if (chainIdStorage === "5") {
        orders = orders_data_t.orders;
        for (let i = 0; i < orders.length; i++) {
          valueEth = valueEth + orders[i].totalPayment;
        }
      }
      const YunGou2_0 = await getYunGouAddress();
      const yungou2_0 = new Contract(YunGou2_0, yunGou2_0Abi, signer);
      const result_ = await yungou2_0.populateTransaction.batchExcuteWithETH(
        orders,
        currentAccount
      );
      const inputData = result_.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = hexConcat([inputData, extraData]);
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
      const yungou2_0 = new Contract(YunGou2_0, yunGou2_0Abi, signer);
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
    const yungou2_0 = new Contract(YunGou2_0, yunGou2_0Abi, signer);
    const orderHash = await yungou2_0.getOrderHash(parameters);
    const orderStatus = await yungou2_0.getOrderStatus(orderHash);
    console.log("orderHash:", orderHash, "orderStatus:", orderStatus);
  };

  return (
    <div className="yg-page main-app">
      <section className="yg-hero">
        <h1>{t("yungou.title")}</h1>
        <p>{t("yungou.subtitle")}</p>
      </section>

      <section className="yg-panel">
        <h3>{t("yungou.openseaSection")}</h3>
        <p className="yg-desc">{t("yungou.openseaDesc")}</p>
        <div className="yg-field">
          <label htmlFor="yg-contracts">{t("yungou.contracts")}</label>
          <textarea
            id="yg-contracts"
            placeholder="[0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b, ...]"
            aria-label={t("yungou.contractsAria")}
          />
        </div>
        <div className="yg-field">
          <label htmlFor="yg-tokenIds">{t("yungou.tokenIds")}</label>
          <textarea
            id="yg-tokenIds"
            placeholder="[1, 2, ...]"
            aria-label={t("yungou.tokenIdsAria")}
          />
        </div>
        <div className="yg-actions">
          <button
            type="button"
            onClick={yunGouAggregatorsHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("yungou.batchBuy")}
          </button>
        </div>
      </section>

      <section className="yg-panel">
        <h3>{t("yungou.v2Section")}</h3>
        <p className="yg-desc">{t("yungou.v2Desc")}</p>
        <div className="yg-actions">
          <button
            type="button"
            onClick={excuteWithETHHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("yungou.excuteWithEth")}
          </button>
          <button
            type="button"
            onClick={batchExcuteWithETHHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("yungou.batchExcuteWithEth")}
          </button>
          <button
            type="button"
            onClick={cancelHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("yungou.cancel")}
          </button>
          <button
            type="button"
            onClick={getYunGouOrderHashHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("yungou.getOrderHash")}
          </button>
        </div>
      </section>

      {message && (
        <div className="yg-tx-link">
          <p>{t("common.transaction")}</p>
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        </div>
      )}
    </div>
  );
};

export default YunGouAggregatorsPage;
