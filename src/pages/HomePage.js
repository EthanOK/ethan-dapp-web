/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import seaportAbi from "../contracts/seaport1_5.json";

import order_data_t from "../testdata/orderdata.js";
import orders_data_t from "../testdata/ordersdata.js";
import yunGouAggregatorsAbi from "../contracts/YunGouAggregators.json";

import yunGou2_0Abi from "../contracts/yungou2_0.json";
import { BigNumber, ethers } from "ethers";
import { OpenSeaSDK, Chain } from "opensea-js";

import { login } from "../utils/ConnectWallet.js";

import {
  getSigner,
  getProvider,
  getChainIdAndBalanceETHAndTransactionCount,
  switchChain,
  getChainId
} from "../utils/GetProvider.js";

import {
  getYunGouAddress,
  getScanURL,
  getYunGouAddressAndOrder,
  stringToArray,
  getYunGouAggregatorsAddress
} from "../utils/Utils.js";
import Orders from "../utils/GetOrder.js";
import OrdersTest from "../utils/GetOrdersTestnet.js";
import {
  OPENSEA_MAIN_API,
  YUNGOU_END,
  DefaultChainId,
  chainName_S
} from "../common/SystemConfiguration.js";
import { SupportChains } from "../common/ChainsConfig.js";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";

const HomePage = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentAccountBalance, setCurrentAccountBalance] = useState(null);
  const [currentAccountNonce, setCurrentAccountNonce] = useState(null);
  const [chainId, setChainId] = useState(
    localStorage.getItem("chainId") || DefaultChainId
  );
  const [message, setMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [etherscan, setEtherscan] = useState("");

  const { address, isConnected } = useAppKitAccount();
  const { chainId: chainID } = useAppKitNetwork();

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(() => updateData(), 3000);

    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, [isConnected, address, chainID]);

  const updateData = () => {
    let chainId_ = localStorage.getItem("chainId");
    let loginType = localStorage.getItem("LoginType");
    if (loginType === "metamask") {
    } else if (chainID !== undefined && Number(chainId_) !== Number(chainID)) {
      setChainId(chainID);
      localStorage.setItem("chainId", chainID);
    }

    if (isConnected && address) {
      localStorage.setItem("userAddress", address);
    }

    let currentAccount_ = localStorage.getItem("userAddress");
    if (currentAccount !== currentAccount_) {
      configAccountData(currentAccount_);
    }
  };

  useEffect(() => {
    if (isMounted) {
      let account = localStorage.getItem("userAddress");

      let chainId = localStorage.getItem("chainId");

      if (chainId === null) {
        localStorage.setItem("chainId", DefaultChainId);
      }

      if (window.ethereum) {
        window.ethereum.on("chainChanged", async (chainId) => {
          let chainId_ = Number.parseInt(chainId);
          localStorage.setItem("chainId", chainId_.toString());

          let account = localStorage.getItem("userAddress");
          await configAccountData(account);
        });

        window.ethereum.on("accountsChanged", async (accounts) => {
          let account = accounts[0];

          localStorage.setItem("userAddress", account);
          // await login();
          await configAccountData(account);
        });
      }

      // if (account !== null) {
      //   configAccountData(account);
      // }
    }
  }, [isMounted]);

  const handleSelectChange = (event) => {
    let account = localStorage.getItem("userAddress");
    if (account === null) {
      let networkId = event.target.value;

      setChainId(event.target.value);

      localStorage.setItem("chainId", networkId);
    }
  };

  // config AccountData
  const configAccountData = async (account) => {
    setCurrentAccount(account);

    let [chainId, balance_ether, nonce] =
      await getChainIdAndBalanceETHAndTransactionCount(account);

    setChainId(localStorage.getItem("chainId"));

    setCurrentAccountBalance(balance_ether);

    setCurrentAccountNonce(nonce);

    setEtherscan(await getScanURL());
  };

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    try {
      if (!ethereum) {
        alert("Please install Metamask");
        console.log("Make sure you have Metamask installed!");
        console.log("`````````````");
        return false;
      } else {
        console.log("Wallet exists! let's go!");

        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  const connectandsign = async () => {
    let connect = await checkWalletIsConnected();
    if (!connect) {
      return;
    }

    localStorage.setItem("LoginType", "metamask");
    let chainId = await window.ethereum.request({ method: "eth_chainId" });
    let chainId_local = localStorage.getItem("chainId");
    console.log(chainId_local);
    if (chainId !== chainId_local) {
      let success = await switchChain(chainId_local);
      if (!success) {
        return null;
      }
    }

    let [result, account] = await login();
    if (result) {
      configAccountData(account);

      localStorage.setItem("userAddress", account);

      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const connectandsignWalletConnect = async () => {
    localStorage.setItem("LoginType", "walletconnect");

    let [result, account] = await login();
    if (result) {
      configAccountData(account);

      localStorage.setItem("userAddress", account);

      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };
  const disconnect = async () => {
    // 重新加载当前 URL。此方法的功能类似于浏览器的“刷新”按钮
    window.location.reload();

    localStorage.clear();

    console.log("断开连接");
  };

  // TODO:yunGouAggregatorsHandler
  const yunGouAggregatorsHandler = async () => {
    const tradeDetails = [];
    const contractsInput = document.getElementById("contracts");
    let contractsValue = contractsInput.value;
    const tokenIdsInput = document.getElementById("tokenIds");
    let tokenIdsValue = tokenIdsInput.value;
    contractsValue = stringToArray(contractsValue);
    tokenIdsValue = stringToArray(tokenIdsValue);
    const { ethereum } = window;
    if (!ethereum) {
      alert("ethereum object does not exist!");
    }
    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      const chainId = localStorage.getItem("chainId");

      let protocolAddress,
        currentPriceSum,
        advancedOrders,
        criteriaResolvers,
        offerFulfillments,
        considerationFulfillments,
        fulfillerConduitKey,
        maximumFulfilled;
      console.log(contractsValue);
      if (contractsValue === "" || tokenIdsValue === "") {
        console.log("contractAddress or tokenIds is null");
        return;
      }

      let orders;
      let valueEth = BigNumber.from("0");

      if (chainId === "1") {
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
      } else if (chainId === "56") {
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
      } else if (chainId === "11155111") {
        orders = [order_data_t.order_data];
        for (let i = 0; i < orders.length; i++) {
          valueEth = valueEth.add(orders[i].totalPayment);
        }
        const Orders_datas =
          await OrdersTest.getFulfillAvailableAdvancedOrders_datas(
            chainName_S,
            currentAccount,
            contractsValue,
            tokenIdsValue
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
      }
      const YunGouAggregatorsAddress_ = await getYunGouAggregatorsAddress();
      const ygAggregators = new ethers.Contract(
        YunGouAggregatorsAddress_,
        yunGouAggregatorsAbi,
        signer
      );

      // function fulfillAvailableAdvancedOrders(
      //   AdvancedOrder[] calldata,
      //   CriteriaResolver[] calldata,
      //   FulfillmentComponent[][] calldata,
      //   FulfillmentComponent[][] calldata,
      //   bytes32 fulfillerConduitKey,
      //   address recipient,
      //   uint256 maximumFulfilled)
      const fulfillerConduitKey_0 =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const seaport = new ethers.Contract(protocolAddress, seaportAbi, signer);
      let result_seaport =
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

      // const tx = await signer.sendTransaction({
      //   to: ygAggregators.address,
      //   data: inputDataWithExtra,
      //   value: ethers.BigNumber.from(currentPriceSum.toString()),
      // });

      // TODO Add YunGou data
      /*       let YunGou2_0 = await getYunGouAddress();
      const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
      let result_yg = await yungou2_0.populateTransaction.batchExcuteWithETH(
        orders,
        currentAccount
      );
      const ygdata = result_yg.data;
      const tradeDetail_yg = {
        marketId: 1,
        // value: valueEth.add(ethers.utils.parseEther("0.02")),
        value: valueEth,
        tradeData: ygdata,
      };
      tradeDetails.push(tradeDetail_yg); */

      // TODO Add opsnea data
      let currentPriceSumOpensea = BigNumber.from(currentPriceSum);
      const tradeDetail_opensea = {
        marketId: 2,
        value: currentPriceSumOpensea,
        tradeData: inputDataWithExtra
      };

      tradeDetails.push(tradeDetail_opensea);
      // sum Value
      let _sumValue = BigNumber.from(0);
      for (let i = 0; i < tradeDetails.length; i++) {
        _sumValue = _sumValue.add(BigNumber.from(tradeDetails[i].value));
      }
      console.log("all orders tatal payment:" + _sumValue.toString());

      let result_ygAggregators =
        await ygAggregators.populateTransaction.batchBuyWithETH(tradeDetails);
      const inputData_yg = result_ygAggregators.data;
      const inputDataWithExtra_YG = ethers.utils.hexConcat([
        inputData_yg,
        extraData
      ]);
      // console.log(inputDataWithExtra_YG);
      const tx = await signer.sendTransaction({
        to: ygAggregators.address,
        data: inputDataWithExtra_YG,
        value: _sumValue
      });

      // let tx = await ygAggregators.batchBuyWithETH(tradeDetails, {
      //   value: ethers.BigNumber.from(currentPriceSum.toString()),
      // });
      console.log("Minting..please await");

      console.log(`Please See: ${etherscan}/tx/${tx.hash}`);
      let message_ = `${etherscan}/tx/${tx.hash}`;
      setMessage(message_);
      await tx.wait();
      console.log("Success Minted!");
    } catch (error) {
      console.log(error);
    }
  };
  // TODO:excuteWithETHHandler
  const excuteWithETHHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("ethereum object does not exist!");
    }
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();

      let [YG_Address, order] = await getYunGouAddressAndOrder();

      const yungou2_0 = new ethers.Contract(YG_Address, yunGou2_0Abi, signer);
      let result_ = await yungou2_0.populateTransaction.excuteWithETH(
        order,
        currentAccount
      );
      console.log(result_);

      const inputData = result_.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = ethers.utils.hexConcat([inputData, extraData]);

      // 可以附加 后缀
      const tx = await signer.sendTransaction({
        to: result_.to,
        data: inputDataWithExtra,
        value: order.totalPayment
      });
      // 直接调用合约
      // let tx = await yungou1_5.excuteWithETH(order, currentAccount, {
      //   value: order.totalPayment,
      // });

      console.log(`Please See: ${etherscan}/tx/${tx.hash}`);
      let message_ = `${etherscan}/tx/${tx.hash}`;
      setMessage(message_);
      await tx.wait();
      console.log("Success!");
    } catch (error) {
      console.log(error);
      // TODO:get Error data
      console.log(error.error.data.originalError);
    }
  };
  // TODO:batchExcuteWithETHHandler
  const batchExcuteWithETHHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("ethereum object does not exist!");
    }
    try {
      const provider = await getProvider();
      const signer = provider.getSigner();
      const chainId = localStorage.getItem("chainId");
      let orders;
      let valueEth = BigNumber.from("0");
      if (chainId === "1") {
      } else if (chainId === "5") {
        orders = orders_data_t.orders;
        for (let i = 0; i < orders.length; i++) {
          valueEth = valueEth.add(orders[i].totalPayment);
        }
        // let order = order_data_t.order_data;
        // orders = [order];
      }
      console.log(orders);
      // console.log(valueEth);
      let YunGou2_0 = await getYunGouAddress();
      const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
      let result_ = await yungou2_0.populateTransaction.batchExcuteWithETH(
        orders,
        currentAccount
      );
      console.log(result_);

      const inputData = result_.data;
      const extraData = YUNGOU_END;
      const inputDataWithExtra = ethers.utils.hexConcat([inputData, extraData]);

      // 可以附加 后缀
      const tx = await signer.sendTransaction({
        to: result_.to,
        data: inputDataWithExtra,
        value: valueEth
        // value: "100000000000000000",
      });
      // 直接调用合约;
      // let tx = await yungou2_0.batchExcuteWithETH(orders, currentAccount, {
      //   value: "100000000000000000",
      // });

      console.log(`Please See: ${etherscan}/tx/${tx.hash}`);
      let message_ = `${etherscan}/tx/${tx.hash}`;
      setMessage(message_);
      await tx.wait();
      console.log("Success!");
    } catch (error) {
      console.log(error);
    }
  };
  // cancelHandler
  const cancelHandler = async () => {
    const signer = await getSigner();

    let parameters = order_data_t.order_data.parameters;
    // TODO: cancel contract
    let YunGou2_0 = await getYunGouAddress();
    const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
    let tx = await yungou2_0.cancel([parameters]);

    console.log(`Please See: ${etherscan}/tx/${tx.hash}`);
    let message_ = `${etherscan}/tx/${tx.hash}`;
    setMessage(message_);
    await tx.wait();
    console.log("Success!");
  };

  // TODO:getYunGouOrderHashHandler
  const getYunGouOrderHashHandler = async () => {
    const signer = await getSigner();

    //   struct BasicOrderParameters {
    //     OrderType orderType;
    //     address payable offerer;
    //     address offerToken;
    //     uint256 offerTokenId;
    //     uint256 unitPrice;
    //     uint256 sellAmount;
    //     uint256 startTime;
    //     uint256 endTime;
    //     address paymentToken;
    //     uint256 paymentTokenId;
    //     uint256 salt;
    //     uint256 royaltyFee;
    //     uint256 platformFee;
    //     uint256 afterTaxPrice;
    // }

    let parameters, chainId;
    chainId = localStorage.getItem("chainId");
    if (chainId === 5) {
      parameters = order_data_t.order_data.parameters;
    } else if (chainId === 97) {
      parameters = order_data_t.order_data_tbsc.parameters;
    }
    let YunGou2_0 = await getYunGouAddress();
    console.log(chainId);
    console.log(YunGou2_0);
    console.log(parameters);
    // TODO: get orderHash
    const yungou2_0 = new ethers.Contract(YunGou2_0, yunGou2_0Abi, signer);
    let orderHash = await yungou2_0.getOrderHash(parameters);
    console.log("orderHash: " + orderHash);
    let orderStatus = await yungou2_0.getOrderStatus(orderHash);
    console.log("orderStatus: " + orderStatus);
  };

  const connectMeatamask = () => {
    return (
      <button
        onClick={connectandsign}
        className="cta-button connect-wallet-button"
      >
        Metamask
      </button>
    );
  };

  const connectReownButton = () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isConnecting, setIsConnecting] = useState(false);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { address, isConnected } = useAppKitAccount();

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const loginType = localStorage.getItem("LoginType");
      const storedAccount = localStorage.getItem("userAddress");
      if (
        loginType === "reown" &&
        isConnected &&
        address &&
        address !== storedAccount
      ) {
        login();
      }
      const storedConnect = localStorage.getItem("@appkit/connection_status");
      if (
        loginType === "reown" &&
        storedConnect === "disconnected" &&
        storedAccount
      ) {
        console.log("Reown断开连接");
        disconnect();
      }
    }, [isConnected, address]);

    const handleConnect = async () => {
      setIsConnecting(true);

      try {
        localStorage.setItem("LoginType", "reown");
      } catch (error) {
        console.error("Reown连接失败:", error);
        localStorage.removeItem("LoginType");
      } finally {
        setIsConnecting(false);
      }
    };

    return (
      <appkit-button
        label={isConnecting ? "Connecting..." : "Connect With Reown"}
        style={{ display: "block", margin: "0 auto" }}
        onClick={handleConnect}
        // disabled={isConnecting}
      />
    );
  };

  const connectWalletConnect = () => {
    return (
      <button
        onClick={connectandsignWalletConnect}
        className="cta-button connect-wallet-button"
      >
        WalletConnect
      </button>
    );
  };

  const showWalletType = () => {
    const loginType = localStorage.getItem("LoginType");
    const typeMap = {
      metamask: "Metamask",
      walletconnect: "WalletConnect",
      reown: "Reown"
    };

    return (
      <button className="cta-button connect-wallet-button">
        {`Already logged in with ${typeMap[loginType] || "Unknown"}`}
      </button>
    );
  };

  // TODO:aggregatorsButton
  const aggregatorsButton = () => {
    return (
      <button
        onClick={yunGouAggregatorsHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        YunGou Aggregators
      </button>
    );
  };
  // TODO:excuteWithETHButton
  const excuteWithETHButton = () => {
    return (
      <button
        onClick={excuteWithETHHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        YunGou excuteWithETH
      </button>
    );
  };
  // TODO:batchExcuteWithETHButton
  const batchExcuteWithETHButton = () => {
    return (
      <button
        onClick={batchExcuteWithETHHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        YunGou batchExcuteWithETH
      </button>
    );
  };
  // cancelButton
  const cancelButton = () => {
    return (
      <button
        onClick={cancelHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        YunGou cancel
      </button>
    );
  };

  // TODO:getYunGouOrderHashButton
  const getYunGouOrderHashButton = () => {
    return (
      <button
        onClick={getYunGouOrderHashHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        get YunGou OrderHash
      </button>
    );
  };

  return (
    <div className="main-app">
      {showAlert && (
        <div className="alert">
          <h1>Login successful!</h1>
        </div>
      )}
      <h1>Welcome To Ethan DApp</h1>

      <div>
        <div>
          <p>ChainId: {chainId}</p>
          <p>Account: {currentAccount}</p>
          <p>Balance: {currentAccountBalance}</p>
          <p>Nonce: {currentAccountNonce}</p>
        </div>
        <div>
          <h2>Set Network:</h2>
          <select
            value={chainId}
            onChange={handleSelectChange}
            style={{ width: "100px", height: "30px", fontSize: "12px" }}
          >
            {SupportChains.map((chain) => (
              <option
                key={chain.id}
                value={chain.id}
                style={{ textAlign: "center" }}
              >
                {chain.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div>
            <h2 style={{ color: "red" }}>Login:</h2>
            {isConnected ? connectReownButton() : connectReownButton()}
            <p></p>
            {/* {currentAccount ? showWalletType() : connectMeatamask()} */}
            <p></p>
            {/* {currentAccount ? showWalletType() : connectWalletConnect()} */}
          </div>
        </div>
        <p></p>
        <center>
          <h2>YunGouAggregators</h2>
          <div className="bordered-div">
            <h4>OpenSea Orders</h4>
            <div>
              <label>输入contracts:</label>
              <textarea
                id="contracts"
                placeholder="[0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b,0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b]"
                style={{ height: "100px", width: "400px" }}
              />
            </div>
            <div>
              <label>输入tokenIds:</label>
              <textarea
                id="tokenIds"
                placeholder="[1,2]"
                style={{ height: "100px", width: "400px" }}
              />
            </div>
            <p></p>
            {aggregatorsButton()}
          </div>
        </center>
      </div>

      <h3>YunGou 2.0</h3>
      {excuteWithETHButton()}
      <p></p>
      {batchExcuteWithETHButton()}
      <p></p>
      {cancelButton()}
      <p></p>
      {getYunGouOrderHashButton()}

      <div>
        <h2>
          Please See:
          <p></p>
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        </h2>
      </div>
    </div>
  );
};

export default HomePage;
