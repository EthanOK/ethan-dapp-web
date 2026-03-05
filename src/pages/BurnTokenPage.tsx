import { useEffect, useState } from "react";
import { getERC20Contract } from "../utils/GetContract";
import { getDecimalBigNumber, isAddress } from "../utils/Utils";
import { BigNumber } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";

const BurnTokenPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [tokenAddress, setTokenAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | number>(0);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
    }
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) configData();
  }, [isMounted]);

  const configData = async () => {
    const account = localStorage.getItem("userAddress");
    setCurrentAccount(account);
  };

  const burnTokenHandler = async () => {
    try {
      if (tokenAddress === null) return;
      const erc20contract = await getERC20Contract(tokenAddress);
      if (!erc20contract) return;
      const burnAccount = "0x0000000000000000000000000000000000000001";
      const amount =
        typeof tokenBalance === "string"
          ? BigNumber.from(tokenBalance)
          : BigNumber.from(String(tokenBalance));
      const tx = await erc20contract.transfer(burnAccount, amount);
      const result = await tx.wait();
      if (result.status === 1) {
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
        await getBalanceHandler();
      }
    } catch {
      // ignore
    }
  };

  const getBalanceHandler = async () => {
    const account = localStorage.getItem("userAddress");
    const addressInput = document.getElementById(
      "addressString"
    ) as HTMLTextAreaElement | null;
    if (!addressInput) return;
    const addressValue = addressInput.value;
    const res =
      addressValue.length === 44 && addressValue.startsWith("[")
        ? isAddress(JSON.parse(addressValue) as string)
        : isAddress(addressValue);
    if (!res) {
      alert("地址错误");
      return;
    }
    const erc20contract = await getERC20Contract(addressValue);
    if (!erc20contract || !account) return;
    const balance = await erc20contract.balanceOf(account);
    setTokenAddress(addressValue);
    setTokenBalance(balance);
  };

  return (
    <center>
      {showAlert && (
        <div className="alert">
          <h1>Claim Successful!</h1>
        </div>
      )}
      <h1>Please Switch To Goerli OR TBSC</h1>
      <h2>Burn Token</h2>
      <div className="bordered-div">
        <div>
          <label>ERC20 Token:&nbsp;</label>
          <textarea
            id="addressString"
            placeholder="0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b"
            style={{ height: "24px", width: "400px", fontSize: "16px" }}
          />
        </div>
        <p />
        <button
          onClick={getBalanceHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          Import
        </button>
        <p />
        <div>
          <label>balance: &nbsp;</label>
          <textarea
            value={String(tokenBalance)}
            readOnly
            style={{
              width: "400px",
              height: "20px",
              color: "red",
              fontSize: "16px",
              textAlign: "center"
            }}
          />
          <p />
        </div>
        <button
          onClick={burnTokenHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          Burn Token
        </button>
      </div>
      <p />
    </center>
  );
};

export default BurnTokenPage;
