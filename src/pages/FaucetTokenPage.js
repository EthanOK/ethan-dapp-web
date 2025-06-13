import { useEffect, useState } from "react";
import {
  getFaucetContract,
  getERC20Contract,
  getERC721Contract
} from "../utils/GetContract.js";
import { ZERO_ADDRESS } from "../common/SystemConfiguration.js";
import { getDecimal, getDecimalBigNumber } from "../utils/Utils.js";
import { ethers } from "ethers";
import { addSuffixOfTxData } from "../utils/HandleTxData.js";
import { switchChain } from "../utils/GetProvider.js";
import { login } from "../utils/ConnectWallet.js";
import { faucetConfig, getFaucetTokenAddress } from "../common/ChainsConfig.js";
const FaucetTokenPage = () => {
  //   const [tableData, setTableData] = useState([]);

  const [isMounted, setIsMounted] = useState(false);
  const [myYgmeBalance, setMyYgmeBalance] = useState(0);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [selectedToken, setSelectedToken] = useState(
    localStorage.getItem("faucetTokenName") || "YGIO"
  );
  const [tokenBalance, setTokenBalance] = useState(0);

  const tokenOptions = [
    { label: "YGIO", faucetAmount: 1000 },
    { label: "USDT", faucetAmount: 1000 },
    { label: "WstETH", faucetAmount: 5 }
  ];

  const currentToken = tokenOptions.find((t) => t.label === selectedToken);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updateBalance, 5000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (selectedToken) {
      fetchBalance();
    }
  }, [selectedToken]);

  useEffect(() => {
    if (isMounted) {
      configData();
      if (window.ethereum) {
        window.ethereum.on("chainChanged", async (chainId) => {
          let chainId_ = Number.parseInt(chainId);
          localStorage.setItem("chainId", chainId_.toString());
        });

        window.ethereum.on("accountsChanged", async (accounts) => {
          let account = accounts[0];

          localStorage.setItem("userAddress", account);

          console.log("selectedToken", selectedToken);
        });
      }
    }
  }, [isMounted]);

  const configData = async () => {
    try {
      let account = localStorage.getItem("userAddress");
      setCurrentAccount(account);
      await updateBalance();
      setSelectedToken(selectedToken);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectChange = (event) => {
    const tokenName = event.target.value;
    setSelectedToken(tokenName);

    localStorage.setItem("faucetTokenName", tokenName);
  };

  const fetchBalance = async () => {
    try {
      const result = await getTokenBalance(selectedToken);
      setTokenBalance(result);
    } catch (err) {
      console.error("Failed to fetch balance", err);
      setTokenBalance(0);
    }
  };

  const getTokenBalance = async (tokenName) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let ygioAddress = getFaucetTokenAddress(chainId, tokenName);
    let contract = await getERC20Contract(ygioAddress);
    let ygioBalance = await contract.balanceOf(account);
    let decimals = await contract.decimals();
    let balanceStandard = getDecimal(ygioBalance, decimals);
    return balanceStandard;
  };

  const updateBalance = async () => {
    try {
      let account = localStorage.getItem("userAddress");
      let chainId = localStorage.getItem("chainId");
      let ygmeAddress = faucetConfig[chainId].ygme;

      if (ygmeAddress) {
        let ygmecontract = await getERC721Contract(ygmeAddress);

        let ygmeBalance = await ygmecontract.balanceOf(account);

        setMyYgmeBalance(ygmeBalance.toString());
      }
    } catch (error) {
      console.log(error);
    }
  };
  const faucetYGIOHandler = async (faucetAmount) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let accountFrom = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";
    let ygioAddress = faucetConfig[Number(chainId)].ygio;
    if (chainId === 5) {
      accountFrom = "0xa002d00E2Db3Aa0a8a3f0bD23Affda03a694D06A";
    }
    try {
      let faucetContract = await getFaucetContract();
      console.log(
        ygioAddress,
        accountFrom,
        account,
        getDecimalBigNumber(faucetAmount, 18)
      );

      console.log(getDecimalBigNumber(faucetAmount, 18).toString());

      let tx = await faucetContract.faucet(
        ygioAddress,
        accountFrom,
        account,
        getDecimalBigNumber(faucetAmount, 18)
      );

      let result = await tx.wait();
      if (result.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        await updateBalance();
      } else {
        console.log("Failure!");
      }
    } catch (error) {}
  };

  const faucetTokenHandler = async (tokenName, faucetAmount) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let accountFrom = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";
    let ygioAddress = getFaucetTokenAddress(chainId, tokenName);
    if (chainId === 5) {
      accountFrom = "0xa002d00E2Db3Aa0a8a3f0bD23Affda03a694D06A";
    }
    try {
      let faucetContract = await getFaucetContract();
      console.log(
        ygioAddress,
        accountFrom,
        account,
        getDecimalBigNumber(faucetAmount, 18)
      );

      console.log(getDecimalBigNumber(faucetAmount, 18).toString());

      let tx = await faucetContract.faucet(
        ygioAddress,
        accountFrom,
        account,
        getDecimalBigNumber(faucetAmount, 18)
      );

      let result = await tx.wait();
      if (result.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        await updateBalance();
      } else {
        console.log("Failure!");
      }
    } catch (error) {}
  };

  const faucetYGMEHandler = async (faucetAmount) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let ygmeAddress = faucetConfig[chainId].ygme;

    try {
      let faucetContract = await getFaucetContract();

      let calldata = ethers.utils.defaultAbiCoder.encode(
        ["address", "address", "uint256"],
        [account, ZERO_ADDRESS, 10]
      );

      let data = await addSuffixOfTxData("0xdf791e50", calldata);

      let tx = await faucetContract.faucetDatas(ygmeAddress, data);

      let result = await tx.wait();
      if (result.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        await updateBalance();
      } else {
        console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const faucetUSDTHandler = async (faucetAmount) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let accountFrom = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";
    let usdtAddress = faucetConfig[Number(chainId)].usdt;
    let amount;
    if (chainId == 5) {
      accountFrom = "0xa002d00E2Db3Aa0a8a3f0bD23Affda03a694D06A";
      amount = getDecimalBigNumber(faucetAmount, 6);
    } else if (chainId == 97) {
      amount = getDecimalBigNumber(faucetAmount, 18);
    } else if (chainId == 11155111) {
      amount = getDecimalBigNumber(faucetAmount, 6);
    }
    try {
      let faucetContract = await getFaucetContract();
      console.log(usdtAddress, accountFrom, account, amount.toString());
      let tx = await faucetContract.faucet(
        usdtAddress,
        accountFrom,
        account,
        amount
      );

      let result = await tx.wait();
      if (result.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        await updateBalance();
      } else {
        console.log("Failure!");
      }
    } catch (error) {}
  };

  const faucetYULPHandler = async (faucetAmount) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let accountFrom;
    let lpAddress = faucetConfig[chainId].yulp;
    let amount;
    if (chainId == 5) {
      accountFrom = "0xa002d00E2Db3Aa0a8a3f0bD23Affda03a694D06A";
      amount = getDecimalBigNumber(faucetAmount, 6);
    } else if (chainId == 97) {
      accountFrom = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";
      amount = getDecimalBigNumber(faucetAmount, 18);
    }
    try {
      let faucetContract = await getFaucetContract();
      console.log(lpAddress, accountFrom, account, amount.toString());
      let tx = await faucetContract.faucet(
        lpAddress,
        accountFrom,
        account,
        amount
      );

      let result = await tx.wait();
      if (result.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
        await updateBalance();
      } else {
        console.log("Failure!");
      }
    } catch (error) {}
  };

  const faucetButton = (coinType, faucetAmount = 5) => {
    faucetAmount = String(faucetAmount);
    const handlers = {
      YGME: {
        handler: () => faucetYGMEHandler(faucetAmount),
        label: "YGME",
        amount: faucetAmount
      },
      YGIO: {
        handler: () => faucetYGIOHandler(faucetAmount),
        label: "YGIO",
        amount: faucetAmount
      },
      USDT: {
        handler: () => faucetUSDTHandler(faucetAmount),
        label: "USDT",
        amount: faucetAmount
      },
      WstETH: {
        handler: () => faucetTokenHandler(coinType, faucetAmount),
        label: "WstETH",
        amount: faucetAmount
      }
    };

    const config = handlers[coinType];

    if (!config) return null;

    return (
      <button onClick={config.handler} className="cta-button mint-nft-button">
        Faucet {config.amount} {config.label}
      </button>
    );
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
      // configAccountData(account);

      localStorage.setItem("userAddress", account);

      setCurrentAccount(account);

      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }
  };

  const PleaseLogin = () => {
    // return <h2>UnLogin, Please Login</h2>;
    return (
      <button
        onClick={connectandsign}
        className="cta-button connect-wallet-button"
      >
        Metamask Login
      </button>
    );
  };

  return (
    <center>
      {showAlert && (
        <div className="alert">
          <h1>Claim Successful!</h1>
        </div>
      )}{" "}
      <h1>Please Switch To Sepolia</h1>
      <div className="bordered-div">
        <h2>Faucet YGME</h2>
        <h3>My YGME Balance: {myYgmeBalance}</h3>
        {currentAccount ? faucetButton("YGME") : PleaseLogin()}
      </div>
      <p></p>
      <div className="bordered-div">
        <h2>Faucet Token</h2>

        <select
          value={selectedToken}
          onChange={handleSelectChange}
          style={{
            width: "120px",
            height: "30px",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center", // 选项居中
            textAlignLast: "center" // select 默认选中项居中（兼容性需注意）
          }}
        >
          {tokenOptions.map((token) => (
            <option key={token.label} value={token.label}>
              {token.label}
            </option>
          ))}
        </select>

        <h3>
          My {selectedToken} Balance: {tokenBalance}
        </h3>

        {currentAccount
          ? faucetButton(selectedToken, currentToken.faucetAmount)
          : PleaseLogin()}
      </div>
    </center>
  );
};

export default FaucetTokenPage;
