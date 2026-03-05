import { useEffect, useState } from "react";
import { mintNFT, signEIP712MessageMintNft } from "../utils/CallnftMint";
import { useAppKitAccount } from "@reown/appkit/react";

const MintNFTPage = () => {
  const [selectedAmount, setSelectedAmount] = useState("1");
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  const handleChangeAmount = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAmount(event.target.value);
  };

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

  const mintNftHandler = async () => {
    try {
      const result = await mintNFT(selectedAmount);
      const message_ = result[0];
      const tx = result[1];
      if (message_ !== null && typeof message_ === "string") {
        setMessage(message_);
        if (
          tx &&
          typeof (tx as { wait?: () => Promise<{ status: number }> }).wait ===
            "function"
        ) {
          const r = await (
            tx as { wait: () => Promise<{ status: number }> }
          ).wait();
          if (r.status === 1) console.log("Success!");
          else console.log("Failure!");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const signEIP712MessageMintNftHandler = async () => {
    try {
      const result = await signEIP712MessageMintNft(selectedAmount);
      const message_ = result[0];
      const tx = result[1];
      if (message_ !== null && typeof message_ === "string") {
        setMessage(message_);
        if (
          tx &&
          typeof (tx as { wait?: () => Promise<{ status: number }> }).wait ===
            "function"
        ) {
          const r = await (
            tx as { wait: () => Promise<{ status: number }> }
          ).wait();
          if (r.status === 1) console.log("Success!");
          else console.log("Failure!");
        }
      }
    } catch (error) {
      console.log(error);
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
          <button
            onClick={mintNftHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Mint NFT
          </button>
          <button
            onClick={signEIP712MessageMintNftHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            signEIP712 Message and Mint NFT
          </button>
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
