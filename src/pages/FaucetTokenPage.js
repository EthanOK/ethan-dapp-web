/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import {
  getFaucetContract,
  getERC20Contract,
  getERC20Decimals
} from "../utils/GetContract.js";
import { getDecimal, getDecimalBigNumber } from "../utils/Utils.js";
import { BigNumber } from "ethers";
import { switchChain } from "../utils/GetProvider.js";
import { login } from "../utils/ConnectWallet.js";
import {
  faucetChainIdList,
  faucetConfig,
  getFaucetTokenAddress,
  getFaucetTokenListByChain,
  getChainName
} from "../common/FaucetConfig.js";
import { useAppKitAccount, useAppKitNetwork } from "@reown/appkit/react";
import { getDefaultNetwork, modal } from "../EthanDapp.js";
import { useRef } from "react";
import { toast } from "sonner";
const FaucetTokenPage = () => {
  //   const [tableData, setTableData] = useState([]);

  const [isMounted, setIsMounted] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const [selectedChainId, setSelectedChainId] = useState(null);
  const [selectedToken, setSelectedToken] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  // 根据选择的链获取代币列表
  const availableTokens = selectedChainId
    ? getFaucetTokenListByChain(selectedChainId)
    : [];
  const currentToken = availableTokens.find((t) => t.label === selectedToken);
  const faucetFromAddress = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";

  const { address, isConnected } = useAppKitAccount();
  const { chainId: chainIdCurrent } = useAppKitNetwork();

  const [isTransactionProcessing, setIsTransactionProcessing] = useState(false);

  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
      setChainId(chainIdCurrent);
      // 保存用户地址到 localStorage
      localStorage.setItem("userAddress", address);
      // 初始化选择的链ID
      if (!selectedChainId && faucetChainIdList.includes(chainIdCurrent)) {
        setSelectedChainId(chainIdCurrent);
      } else if (!selectedChainId) {
        // 如果当前链不在支持列表中，默认选择第一个支持的链
        setSelectedChainId(faucetChainIdList[0]);
      }
      // 移除 updateBalance() 调用，因为 selectedToken 和 selectedChainId 设置好后
      // 会通过第128-133行的 useEffect 自动调用 faucetBalance()
    }
  }, [isConnected, address, chainIdCurrent]);

  // 当选择的链改变时，恢复该链之前选择的代币
  useEffect(() => {
    if (selectedChainId) {
      const tokens = getFaucetTokenListByChain(selectedChainId);
      if (tokens.length > 0) {
        // 尝试恢复该链之前选择的代币
        const savedTokenKey = `faucetTokenName_${selectedChainId}`;
        const savedTokenName = localStorage.getItem(savedTokenKey);

        let tokenToSelect = savedTokenName;
        // 检查保存的代币是否在当前链上可用
        const tokenExists = tokens.find((t) => t.label === savedTokenName);
        if (!tokenExists || !savedTokenName) {
          // 如果保存的代币不可用或不存在，使用第一个可用代币
          tokenToSelect = tokens[0].label;
          localStorage.setItem(savedTokenKey, tokenToSelect);
        }

        setSelectedToken(tokenToSelect);
        localStorage.setItem("faucetChainId", selectedChainId.toString());
        // 移除这里的 faucetBalance() 调用，因为 selectedToken 状态更新是异步的
        // 会通过第126-131行的 useEffect 在 selectedToken 和 selectedChainId 都设置好后自动调用
      } else {
        // 如果链上没有可用代币，清空选择
        setSelectedToken("");
        setTokenBalance(0);
        setTotalAmount(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChainId]);

  useEffect(() => {
    setIsMounted(true);
    // 从 localStorage 恢复选择的链
    const savedChainId = localStorage.getItem("faucetChainId");
    if (savedChainId && faucetChainIdList.includes(parseInt(savedChainId))) {
      const chainId = parseInt(savedChainId);
      setSelectedChainId(chainId);
      // 恢复该链之前选择的代币
      const savedTokenKey = `faucetTokenName_${chainId}`;
      const savedTokenName = localStorage.getItem(savedTokenKey);
      if (savedTokenName) {
        const tokens = getFaucetTokenListByChain(chainId);
        const tokenExists = tokens.find((t) => t.label === savedTokenName);
        if (tokenExists) {
          setSelectedToken(savedTokenName);
        }
      }
    } else if (faucetChainIdList.length > 0) {
      setSelectedChainId(faucetChainIdList[0]);
    }
    const intervalId = setInterval(updateBalance, 5000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    // 当 selectedChainId 设置好时，更新余额
    // selectedToken 可以为空，faucetBalance() 内部会处理
    // Remaining Supply 不依赖钱包连接状态，但用户余额需要钱包连接
    if (selectedChainId) {
      faucetBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToken, selectedChainId, isConnected, address]);

  const handleSelectChange = (event) => {
    const tokenName = event.target.value;
    setSelectedToken(tokenName);
    // 按链保存代币选择
    if (selectedChainId) {
      localStorage.setItem(`faucetTokenName_${selectedChainId}`, tokenName);
    }
  };

  const handleChainSelectChange = async (event) => {
    const chainId = parseInt(event.target.value);
    setSelectedChainId(chainId);
    localStorage.setItem("faucetChainId", chainId.toString());

    // 切换到选择的链
    if (chainId !== chainIdCurrent) {
      try {
        await modal.switchNetwork(getDefaultNetwork(chainId));
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error("切换链失败，请手动切换");
      }
    }
  };

  const faucetBalance = async () => {
    try {
      if (!selectedChainId) return;
      const tokens = getFaucetTokenListByChain(selectedChainId);
      if (tokens.length === 0) {
        setTokenBalance(0);
        setTotalAmount(0);
        return;
      }

      // 使用当前选择的代币，如果为空则使用第一个可用代币
      const selectedToken_ = selectedToken || tokens[0].label;

      // 再次验证代币是否可用（防止状态不同步）
      const tokenExists = tokens.find((t) => t.label === selectedToken_);
      if (!tokenExists) {
        // 如果代币不可用，使用第一个可用代币
        const fallbackToken = tokens[0].label;
        setSelectedToken(fallbackToken);
        if (selectedChainId) {
          localStorage.setItem(
            `faucetTokenName_${selectedChainId}`,
            fallbackToken
          );
        }
        // 先更新 Remaining Supply（不依赖钱包连接）
        const totalAmount = await getTokenTotalClaim(
          fallbackToken,
          selectedChainId
        );
        setTotalAmount(totalAmount);

        // 再更新用户余额（需要钱包连接）
        try {
          const result = await getTokenBalance(fallbackToken, selectedChainId);
          setTokenBalance(result);
        } catch (err) {
          // 如果钱包未连接，用户余额保持为 0
          console.log(
            "Failed to fetch user balance (wallet may not be connected):",
            err
          );
          setTokenBalance(0);
        }
        return;
      }

      // 先更新 Remaining Supply（不依赖钱包连接）
      const totalAmount = await getTokenTotalClaim(
        selectedToken_,
        selectedChainId
      );
      setTotalAmount(totalAmount);

      // 再更新用户余额（需要钱包连接）
      try {
        const result = await getTokenBalance(selectedToken_, selectedChainId);
        setTokenBalance(result);
      } catch (err) {
        // 如果钱包未连接，用户余额保持为 0
        console.log(
          "Failed to fetch user balance (wallet may not be connected):",
          err
        );
        setTokenBalance(0);
      }
    } catch (err) {
      console.error("Failed to fetch balance", err);
      setTokenBalance(0);
      setTotalAmount(0);
    }
  };

  const getTokenBalance = async (tokenName, chainIdParam = null) => {
    let account = localStorage.getItem("userAddress");
    let chainId =
      chainIdParam || selectedChainId || localStorage.getItem("chainId");
    let tokenAddress = getFaucetTokenAddress(chainId, tokenName);
    if (!tokenAddress) {
      console.error(`Token ${tokenName} not found for chain ${chainId}`);
      return 0;
    }
    let contract = await getERC20Contract(tokenAddress);
    let ygioBalance = await contract.balanceOf(account);
    let decimals = await contract.decimals();
    let balanceStandard = getDecimal(ygioBalance, decimals);
    return balanceStandard;
  };

  const getTokenTotalClaim = async (tokenName, chainIdParam = null) => {
    let chainId =
      chainIdParam || selectedChainId || localStorage.getItem("chainId");
    let tokenAddress = getFaucetTokenAddress(chainId, tokenName);
    if (!tokenAddress) {
      console.error(`Token ${tokenName} not found for chain ${chainId}`);
      return 0;
    }
    const contract = await getERC20Contract(tokenAddress);
    const balance1 = await contract.balanceOf(faucetFromAddress);
    const faucetAddress = faucetConfig[chainId]?.faucet;
    if (!faucetAddress) {
      console.error(`Faucet address not found for chain ${chainId}`);
      return 0;
    }
    const balance2 = await contract.allowance(faucetFromAddress, faucetAddress);

    const minBalance = BigNumber.from(balance1).lt(balance2)
      ? balance1
      : balance2;
    let decimals = await contract.decimals();
    let balanceStandard = getDecimal(minBalance, decimals);
    return balanceStandard;
  };

  const updateBalance = async () => {
    try {
      let account = localStorage.getItem("userAddress");

      if (!account || !selectedChainId) return;

      // update faucet balance
      await faucetBalance();
    } catch (error) {
      console.log(error);
    }
  };

  const checkAndSwitchChain = async () => {
    try {
      const targetChainId = selectedChainId || faucetChainIdList[0];
      if (chainId !== targetChainId) {
        console.log("checkAndSwitchChain", getDefaultNetwork(targetChainId));
        await modal.switchNetwork(getDefaultNetwork(targetChainId));
      }
      return targetChainId;
    } catch (error) {
      console.error("Failed to switch chain:", error);
      return null;
    }
  };

  const faucetTokenHandler = async (tokenName, faucetAmount) => {
    setIsTransactionProcessing(true);
    try {
      let chainIdC = await checkAndSwitchChain();
      if (chainIdC === null) {
        console.log("switch failure");
        return;
      }

      let account = currentAccount;
      let tokenAddress = getFaucetTokenAddress(chainIdC, tokenName);
      const decimals = await getERC20Decimals(tokenAddress);

      if (Number(faucetAmount) > totalAmount) {
        toast.error("Insufficient Supply");
        return;
      }

      let tx;

      let faucetContract = await getFaucetContract();
      tx = await faucetContract.faucet(
        tokenAddress,
        faucetFromAddress,
        account,
        getDecimalBigNumber(faucetAmount, decimals)
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
    } catch (error) {
      console.log(error);
    } finally {
      setIsTransactionProcessing(false);
    }
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
      <button
        onClick={config.handler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount || isTransactionProcessing}
      >
        {isTransactionProcessing ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #ffffff",
                borderRightColor: "transparent",
                borderRadius: "50%",
                animation: "rotate 1s linear infinite",
                marginRight: "8px"
              }}
            ></span>
            Processing...
          </>
        ) : (
          `Faucet ${config.amount} ${config.label}`
        )}
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
      <h1>Faucet Token</h1>
      <div className="bordered-div">
        <h2>Select Chain</h2>
        <select
          value={selectedChainId || ""}
          onChange={handleChainSelectChange}
          style={{
            width: "120px",
            height: "30px",
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "center",
            textAlignLast: "center",
            backgroundColor: "green"
          }}
        >
          {faucetChainIdList.map((chainId) => (
            <option key={chainId} value={chainId}>
              {getChainName(chainId)}
            </option>
          ))}
        </select>
        {selectedChainId && (
          <>
            <h3>Current Chain: {getChainName(selectedChainId)}</h3>
            {chainId !== selectedChainId && (
              <p style={{ color: "orange" }}>
                Please switch to {getChainName(selectedChainId)} network
              </p>
            )}
          </>
        )}
      </div>
      <p></p>
      {selectedChainId && (
        <div className="bordered-div">
          <h2>Faucet Token</h2>
          <h3>Remaining Supply: {totalAmount}</h3>

          {availableTokens.length > 0 ? (
            <>
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
                {availableTokens.map((token) => (
                  <option key={token.label} value={token.label}>
                    {token.label}
                  </option>
                ))}
              </select>

              <h3>
                My {selectedToken} Balance: {tokenBalance}
              </h3>

              {currentToken &&
                faucetButton(selectedToken, currentToken.faucetAmount)}
            </>
          ) : (
            <p>No tokens available for this chain</p>
          )}
        </div>
      )}
    </center>
  );
};

export default FaucetTokenPage;
