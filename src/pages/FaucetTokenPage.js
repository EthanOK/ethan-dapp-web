import { useEffect, useState } from "react";
import {
  getFaucetContract,
  getERC20Contract,
  getERC721Contract,
  getERC20Decimals
} from "../utils/GetContract.js";
import { ZERO_ADDRESS } from "../common/SystemConfiguration.js";
import { getDecimal, getDecimalBigNumber } from "../utils/Utils.js";
import { ethers } from "ethers";
import { addSuffixOfTxData } from "../utils/HandleTxData.js";
import { switchChain } from "../utils/GetProvider.js";
import { login } from "../utils/ConnectWallet.js";
import {
  faucetConfig,
  faucetTokenList,
  getFaucetTokenAddress
} from "../common/ChainsConfig.js";
const FaucetTokenPage = () => {
  //   const [tableData, setTableData] = useState([]);

  const [isMounted, setIsMounted] = useState(false);
  const [myYgmeBalance, setMyYgmeBalance] = useState(0);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [selectedToken, setSelectedToken] = useState("YGIO");
  const [tokenBalance, setTokenBalance] = useState(0);

  const currentToken = faucetTokenList.find((t) => t.label === selectedToken);

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
      faucetBalance();
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

  const faucetBalance = async () => {
    try {
      const selectedToken_ = localStorage.getItem("faucetTokenName") || "YGIO";
      const result = await getTokenBalance(selectedToken_);
      setTokenBalance(result);
    } catch (err) {
      console.error("Failed to fetch balance", err);
      setTokenBalance(0);
    }
  };

  const getTokenBalance = async (tokenName) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let tokenAddress = getFaucetTokenAddress(chainId, tokenName);
    let contract = await getERC20Contract(tokenAddress);
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

        // update faucet balance
        await faucetBalance();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const faucetTokenHandler = async (tokenName, faucetAmount) => {
    let account = localStorage.getItem("userAddress");
    let chainId = localStorage.getItem("chainId");
    let accountFrom = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";
    let tokenAddress = getFaucetTokenAddress(chainId, tokenName);
    if (chainId === 5) {
      accountFrom = "0xa002d00E2Db3Aa0a8a3f0bD23Affda03a694D06A";
    }
    const decimals = await getERC20Decimals(tokenAddress);
    let tx;
    try {
      let faucetContract = await getFaucetContract();
      if (tokenName.toLowerCase() === "ygme") {
        let calldata = ethers.utils.defaultAbiCoder.encode(
          ["address", "address", "uint256"],
          [account, ZERO_ADDRESS, faucetAmount]
        );
        let data = await addSuffixOfTxData("0xdf791e50", calldata);
        tx = await faucetContract.faucetDatas(tokenAddress, data);
      } else {
        tx = await faucetContract.faucet(
          tokenAddress,
          accountFrom,
          account,
          getDecimalBigNumber(faucetAmount, decimals)
        );
      }

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

    const handler = {
      handler: () => faucetTokenHandler(coinType, faucetAmount),
      label: coinType,
      amount: faucetAmount
    };

    const config = handler;

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
            textAlign: "center",
            textAlignLast: "center"
          }}
        >
          {faucetTokenList.map((token) => (
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
