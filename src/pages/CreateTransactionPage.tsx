import { useEffect, useState } from "react";
import {
  isAddress,
  utf8ToHexBytes,
  getScanURL,
  getDecimalBigNumber
} from "../utils/Utils";
import { getSigner } from "../utils/GetProvider";
import { toast } from "sonner";
import { useAppKitAccount } from "@reown/appkit/react";

const CreateTransactionPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
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
    if (account !== null) setCurrentAccount(account);
  };

  const transferNativeHandler = async () => {
    const url = await getScanURL();
    const inputDataInput = document.getElementById(
      "inputData"
    ) as HTMLTextAreaElement | null;
    const toInput = document.getElementById("to") as HTMLTextAreaElement | null;
    const amountInput = document.getElementById(
      "amount"
    ) as HTMLTextAreaElement | null;
    if (!inputDataInput || !toInput || !amountInput) return;
    const inputDataValue = inputDataInput.value;
    const toValue = toInput.value;
    const amountValue = amountInput.value;
    const amount = amountValue === "" ? "0" : amountValue;
    const amountBigNumber = getDecimalBigNumber(amount, 18);
    if (!isAddress(toValue)) {
      toast.error("To address is not valid");
      return;
    }
    const hexInputData = inputDataValue.startsWith("0x")
      ? inputDataValue
      : utf8ToHexBytes(inputDataValue);
    try {
      const signer = await getSigner();
      if (!signer) return;
      const tx = await signer.sendTransaction({
        to: toValue,
        data: hexInputData,
        value: amountBigNumber
      });
      setMessage(`${url}/tx/${tx.hash}`);
      const txReceipt = await tx.wait();
      if (txReceipt.status === 1) toast.success("Transaction Successful!");
      else toast.error("TransactionFailure!");
    } catch (err: unknown) {
      const e = err as { reason?: string };
      toast.error(e?.reason ?? "Error");
    }
  };

  const createTxHandler = async () => {
    const url = await getScanURL();
    const signer = await getSigner();
    if (!signer) return;
    const toEl = document.getElementById("to_tx") as HTMLTextAreaElement | null;
    const valueEl = document.getElementById(
      "value_tx"
    ) as HTMLTextAreaElement | null;
    const dataEl = document.getElementById(
      "data_tx"
    ) as HTMLTextAreaElement | null;
    if (!toEl || !valueEl || !dataEl) return;
    const to = toEl.value;
    const value_ = valueEl.value;
    const data = dataEl.value;
    const value = getDecimalBigNumber(value_ === "" ? "0" : value_, 18);
    if (to !== "" && !isAddress(to)) {
      toast.error("To address is not valid");
      return;
    }
    if (!data.startsWith("0x") || data.length % 2 !== 0) {
      toast.error("data is not valid");
      return;
    }
    try {
      const tx = await signer.sendTransaction({
        to: to === "" ? undefined : to,
        data,
        value
      });
      setMessage(`${url}/tx/${tx.hash}`);
      const txReceipt = await tx.wait();
      if (txReceipt.status === 1) toast.success("Transaction Successful!");
      else toast.error("TransactionFailure!");
    } catch (err: unknown) {
      const e = err as { reason?: string };
      toast.error(e?.reason ?? "Error");
    }
  };

  return (
    <center>
      {showAlert && (
        <div className="alert">
          <h1>&quot;transfer success&quot;</h1>
        </div>
      )}
      <div className="bordered-div">
        <h2>Transfer Native Coin</h2>
        <div className="container">
          <div>
            <label className="label-6">To:</label>
            <textarea
              className="textarea"
              id="to"
              placeholder="0xe698a7917eEE4fDf03296add549eE4A7167DD406"
            />
          </div>
          <p />
          <div>
            <label className="label-6">Value:</label>
            <textarea className="textarea" id="amount" placeholder="0.1" />
          </div>
          <p />
          <div>
            <label className="label-6">Data: </label>
            <textarea
              id="inputData"
              placeholder="你已经被我盯上了，小心点！"
              style={{ height: "60px", width: "400px", fontSize: "14px" }}
            />
          </div>
        </div>
        <p />
        <button
          onClick={transferNativeHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          transfer
        </button>
      </div>
      <p />
      <div className="bordered-div">
        <h2>Create Transaction/Deploy Contract</h2>
        <div className="container">
          <div>
            <label className="label-6">To:</label>
            <textarea
              className="textarea"
              id="to_tx"
              placeholder="0xe698a7917eEE4fDf03296add549eE4A7167DD406"
            />
          </div>
          <p />
          <div>
            <label className="label-6">Value:</label>
            <textarea className="textarea" id="value_tx" placeholder="0.1" />
          </div>
          <p />
          <div>
            <label className="label-6">Data: </label>
            <textarea
              id="data_tx"
              placeholder="0x"
              style={{ height: "60px", width: "400px", fontSize: "14px" }}
            />
          </div>
        </div>
        <p />
        <button
          onClick={createTxHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          create Tx
        </button>
      </div>
      <div>
        <h2>
          Please See:
          <p />
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        </h2>
      </div>
    </center>
  );
};

export default CreateTransactionPage;
