import { useEffect, useState } from "react";
import { mintNFT, signEIP712MessageMintNft } from "../utils/CallnftMint.js";
import { useAppKitAccount } from "@reown/appkit/react";

const MintNFTPage = () => {
  //   const [tableData, setTableData] = useState([]);
  const [selectedAmount, setSelectedAmount] = useState("1");
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);

  const { address, isConnected } = useAppKitAccount();
  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
    }
  }, [isConnected, address]);

  const handleChangeAmount = (event) => {
    setSelectedAmount(event.target.value);
  };

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
    let account = localStorage.getItem("userAddress");
    setCurrentAccount(account);
  };
  const mintNftHandler = async () => {
    try {
      console.log("mint amount: " + selectedAmount);
      let [message_, tx] = await mintNFT(selectedAmount);
      if (message_ !== null) {
        setMessage(message_);
        let rsult = await tx.wait();
        if (rsult.status === 1) {
          console.log("Success!");
        } else {
          console.log("Failure!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  // signEIP712Message MintNftHandler
  const signEIP712MessageMintNftHandler = async () => {
    try {
      console.log("mint amount: " + selectedAmount);
      let [message_, tx] = await signEIP712MessageMintNft(selectedAmount);
      if (message_ !== null) {
        setMessage(message_);
        let rsult = await tx.wait();
        if (rsult.status === 1) {
          console.log("Success!");
        } else {
          console.log("Failure!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const mintNftButton = (type) => {
    if (type === 1) {
      return (
        <button
          onClick={mintNftHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          Mint NFT
        </button>
      );
    }

    if (type === 2) {
      return (
        <button
          onClick={signEIP712MessageMintNftHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          signEIP712 Message and Mint NFT
        </button>
      );
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>Mint YGME</h1>
        <p>Mint or sign EIP712 and mint NFT</p>
      </section>

      <section className="feature-panel">
        <h3>Mint Amount</h3>
        <div className="feature-field">
          <label htmlFor="mintAmount">Amount</label>
          <select
            id="mintAmount"
            value={selectedAmount}
            onChange={handleChangeAmount}
            aria-label="Mint amount"
          >
            <option value="1">1</option>
            <option value="5">5</option>
            <option value="10">10</option>
          </select>
        </div>
        <div className="feature-actions">
          {mintNftButton(1)}
          {mintNftButton(2)}
        </div>
      </section>

      {message && (
        <div className="feature-tx-link">
          <p>Transaction</p>
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        </div>
      )}
    </div>
  );
};

export default MintNFTPage;
