import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { getPriceBaseUSDT, getPriceBaseUSDTByBinance } from "../api/GetData.js";
import {
  caculatePriceBySqrtPriceX96,
  getAddressCreate,
  isAddress
} from "../utils/Utils.js";
import { getTokenPrice } from "../utils/GetLpTokenPrice.js";
import { signHexDataMessage } from "../utils/SignFunc.js";
import { getSigner } from "../utils/GetProvider.js";
import { useAppKitAccount } from "@reown/appkit/react";

const UtilsPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [signatureHex, setSignatureHex] = useState("");
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [message3, setMessage3] = useState("");
  const [message4, setMessage4] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transactionFee, setTransactionFee] = useState("");
  const [etherPrice, setEtherPrice] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(null);

  const [contractCreate, setContractCreate] = useState(null);

  const [lpTokenPrice, setLpTokenPrice] = useState(null);
  const [selectedValue, setSelectedValue] = useState("1");

  const { address, isConnected } = useAppKitAccount();
  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
    }
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      configData();
    }
  }, [isMounted]);

  const configData = async () => {
    try {
      let account = localStorage.getItem("userAddress");
      if (account !== null) {
        setCurrentAccount(account);
      }

      let result = await getPriceBaseUSDTByBinance();
      console.log(result);
      if (result.code === 200) {
        let data = result.data;
        setEtherPrice(data.ethPrice);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // caculatePriceBySqrtPriceX96

  const getPriceHandler = async () => {
    const sqrtPriceX96Input = document.getElementById("sqrtPriceX96");
    const sqrtPriceX96Value = sqrtPriceX96Input.value;
    let price = caculatePriceBySqrtPriceX96(sqrtPriceX96Value);
    setTokenPrice(price);
  };

  const getAddressByCreatHandler = async () => {
    const accountInput = document.getElementById("account_create");
    const accountValue = accountInput.value;
    const nonceInput = document.getElementById("nonce_create");
    const nonceValue = nonceInput.value;
    console.log(accountValue, nonceValue);

    if (isAddress(accountValue)) {
      let address_ = getAddressCreate(accountValue, nonceValue);
      setContractCreate(address_);
    } else {
      console.log("error address");
    }
  };

  const getTokenPriceHandler = async () => {
    const token0Input = document.getElementById("token0");
    const token0Value = token0Input.value;
    const token1Input = document.getElementById("token1");
    const token1Value = token1Input.value;
    console.log(selectedValue);

    console.log(token0Value, token1Value);

    try {
      let pairPrice = await getTokenPrice(
        selectedValue,
        token0Value,
        token1Value
      );
      setLpTokenPrice(pairPrice);
    } catch (error) {
      console.log(error);
    }
  };

  const getIPFSURLHandler = async () => {
    const contractInput = document.getElementById("cid");
    const contractValue = contractInput.value;
    setMessage("https://ipfs.io/ipfs/" + contractValue);
    setMessage1("https://gateway.pinata.cloud/ipfs/" + contractValue);
    setMessage2("https://cloudflare-ipfs.com/ipfs/" + contractValue);
    setMessage3("https://dweb.link/ipfs/" + contractValue);
    setMessage4("https://ipfs.filebase.io/ipfs/" + contractValue);
  };
  const getSignatureHandler = async () => {
    const contractInput = document.getElementById("hexData");
    const contractValue = contractInput.value;
    const signer = await getSigner();
    try {
      const signatureHex_ = await signHexDataMessage(signer, contractValue);
      setSignatureHex(signatureHex_);
    } catch (error) {
      console.log(error);
      alert("INVALID_ARGUMENT");
    }
  };

  const calculateTxFeeHandler = async () => {
    const gasUsedInput = document.getElementById("gasUsed");
    const gasUsedValue = gasUsedInput.value;
    const gasPriceInput = document.getElementById("gasPrice");
    const gasPriceValue = gasPriceInput.value;
    // Gwei to Wei
    const gasPrice = ethers.utils.parseUnits(gasPriceValue, "gwei");
    // calculate Transaction Fee

    const txFee = BigNumber.from(gasUsedValue).mul(gasPrice);
    // wei to ether
    const txFeeEther = ethers.utils.formatEther(txFee);
    setTransactionFee(txFeeEther);
  };

  const handleChangeValue = (event) => {
    setSelectedValue(event.target.value);
  };

  const getIPFSURLButton = () => {
    return (
      <button
        onClick={getIPFSURLHandler}
        className="cta-button mint-nft-button"
      >
        getIPFSURL
      </button>
    );
  };

  const getSignatureButton = () => {
    return (
      <button
        onClick={getSignatureHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        Sign Hex Data
      </button>
    );
  };

  const getPriceButton = () => {
    return (
      <button onClick={getPriceHandler} className="cta-button mint-nft-button">
        getPrice
      </button>
    );
  };
  const getAddressByCreate = () => {
    return (
      <button
        onClick={getAddressByCreatHandler}
        className="cta-button mint-nft-button"
      >
        getContractAddress
      </button>
    );
  };

  const getTokenPriceButton = () => {
    return (
      <button
        onClick={getTokenPriceHandler}
        className="cta-button mint-nft-button"
      >
        getTokenPrice
      </button>
    );
  };

  const calculateTxFeeButton = () => {
    return (
      <button
        onClick={calculateTxFeeHandler}
        className="cta-button mint-nft-button"
      >
        calculate TxFee
      </button>
    );
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>Utils</h1>
        <p>
          Sign hex data, IPFS URLs, gas, SqrtPriceX96, LP price, contract
          address
        </p>
      </section>

      <section className="feature-panel">
        <h3>Sign Hex Data</h3>
        <div className="feature-field">
          <label htmlFor="hexData">Hex Data</label>
          <textarea
            id="hexData"
            placeholder="0xc0e8f831a90406f3a15e808f3f1ec26ea4bc214cfb986cdb4b0623b22bbf8ed3"
            rows={2}
          />
        </div>
        <div className="feature-actions">{getSignatureButton()}</div>
        <div className="feature-field">
          <label>Signature</label>
          <textarea value={signatureHex} readOnly rows={3} />
        </div>
      </section>

      <section className="feature-panel">
        <h3>IPFS</h3>
        <div className="feature-field">
          <label htmlFor="cid">CID</label>
          <textarea
            id="cid"
            placeholder="QmSFZ84W8uNjoZJMkGkVDuJR5PBNtsHorDBmcHCjzACdXY"
            rows={2}
          />
        </div>
        <div className="feature-actions">{getIPFSURLButton()}</div>
        {(message || message1) && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>Gateways</p>
            {message && (
              <a href={message} target="_blank" rel="noopener noreferrer">
                {message.substring(0, message.lastIndexOf("/") + 2)}
              </a>
            )}
            {message1 && (
              <>
                <br />
                <a href={message1} target="_blank" rel="noopener noreferrer">
                  {message1.substring(0, message1.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
            {message2 && (
              <>
                <br />
                <a href={message2} target="_blank" rel="noopener noreferrer">
                  {message2.substring(0, message2.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
            {message3 && (
              <>
                <br />
                <a href={message3} target="_blank" rel="noopener noreferrer">
                  {message3.substring(0, message3.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
            {message4 && (
              <>
                <br />
                <a href={message4} target="_blank" rel="noopener noreferrer">
                  {message4.substring(0, message4.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
          </div>
        )}
      </section>

      <section className="feature-panel">
        <h3>计算 Gas</h3>
        <div className="feature-field">
          <label htmlFor="gasUsed">Gas Used</label>
          <input id="gasUsed" type="text" placeholder="158170" />
        </div>
        <div className="feature-field">
          <label htmlFor="gasPrice">Gas Price (Gwei)</label>
          <input id="gasPrice" type="text" placeholder="1.5" />
        </div>
        <div className="feature-actions">{calculateTxFeeButton()}</div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          TxFee:{" "}
          <strong style={{ color: "var(--w3-text)" }}>{transactionFee}</strong>{" "}
          ether
          {" · "}
          {etherPrice
            ? (
                parseFloat(transactionFee || 0) * parseFloat(etherPrice)
              ).toFixed(4)
            : "—"}{" "}
          USD
        </p>
      </section>

      <section className="feature-panel">
        <h3>SqrtPriceX96</h3>
        <div className="feature-field">
          <label htmlFor="sqrtPriceX96">sqrtPriceX96</label>
          <input
            id="sqrtPriceX96"
            type="text"
            placeholder="5379665721256550655574226248"
          />
        </div>
        <div className="feature-actions">{getPriceButton()}</div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          Price:{" "}
          <strong style={{ color: "var(--w3-text)" }}>
            {tokenPrice ?? "—"}
          </strong>
        </p>
      </section>

      <section className="feature-panel">
        <h3>LP Token Price V2</h3>
        <div className="feature-field">
          <label htmlFor="utils-platform">Platform</label>
          <select
            id="utils-platform"
            value={selectedValue}
            onChange={handleChangeValue}
          >
            <option value="1">UniSwap V2 (ETH)</option>
            <option value="56">PancakeSwap V2 (BSC)</option>
          </select>
        </div>
        <div className="feature-field">
          <label htmlFor="token0">Token0</label>
          <input
            id="token0"
            type="text"
            placeholder="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="token1">Token1</label>
          <input
            id="token1"
            type="text"
            placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7"
          />
        </div>
        <div className="feature-actions">{getTokenPriceButton()}</div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          LP Price:{" "}
          <strong style={{ color: "var(--w3-text)" }}>
            {lpTokenPrice ?? "—"}
          </strong>
        </p>
      </section>

      <section className="feature-panel">
        <h3>Get Contract Address (By Create)</h3>
        <div className="feature-field">
          <label htmlFor="account_create">Account</label>
          <input
            id="account_create"
            type="text"
            placeholder="0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="nonce_create">Nonce</label>
          <input id="nonce_create" type="text" placeholder="11" />
        </div>
        <div className="feature-actions">{getAddressByCreate()}</div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          Contract Address:{" "}
          <strong
            style={{
              color: "var(--w3-text)",
              fontFamily: "var(--w3-font-mono)"
            }}
          >
            {contractCreate ?? "—"}
          </strong>
        </p>
      </section>
    </div>
  );
};

export default UtilsPage;
