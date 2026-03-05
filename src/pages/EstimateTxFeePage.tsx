import { useEffect, useState } from "react";
import { isAddress, getDecimalBigNumber } from "../utils/Utils";
import { getProvider } from "../utils/GetProvider";
import { estimateTxFee } from "../utils/EstimateTxFee";
import { toast } from "sonner";
import { useAppKitAccount } from "@reown/appkit/react";

const EstimateTxFeePage = () => {
  const [isMounted, setIsMounted] = useState(false);
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

  const estimateTxFeeHandler = async () => {
    const fromEl = document.getElementById(
      "from"
    ) as HTMLTextAreaElement | null;
    const toEl = document.getElementById("to") as HTMLTextAreaElement | null;
    const valueEl = document.getElementById(
      "value"
    ) as HTMLTextAreaElement | null;
    const dataEl = document.getElementById(
      "data"
    ) as HTMLTextAreaElement | null;
    if (!fromEl || !toEl || !valueEl || !dataEl) return;

    const from = fromEl.value;
    const to = toEl.value;
    const value = valueEl.value;
    const data = dataEl.value;
    const value_ = getDecimalBigNumber(value === "" ? "0" : value, 18);

    if (!isAddress(from)) {
      toast.error("from address is not valid");
      return;
    }
    if (to.length !== 0 && !isAddress(to)) {
      toast.error("to address is not valid");
      return;
    }
    if (!data.startsWith("0x")) {
      toast.error("data is not valid");
      return;
    }

    try {
      const provider = await getProvider();
      if (!provider) {
        toast.error("Provider not available");
        return;
      }
      const result = await estimateTxFee(provider, from, to, data, value_);
      setMessage(JSON.stringify(result));
    } catch (err: unknown) {
      const e = err as { code?: string | number };
      toast.error(String(e?.code ?? "Error"));
    }
  };

  return (
    <center>
      <div>
        <h2>EstimateTxFee</h2>
        <div className="container">
          <div>
            <label className="label-6">from:</label>
            <textarea
              className="textarea"
              id="from"
              placeholder="0xe698a7917eEE4fDf03296add549eE4A7167DD406"
            />
          </div>
          <p />
          <div>
            <label className="label-6">to:</label>
            <textarea
              className="textarea"
              id="to"
              placeholder="0xe698a7917eEE4fDf03296add549eE4A7167DD406"
            />
          </div>
          <p />
          <div>
            <label className="label-6">value:</label>
            <textarea className="textarea" id="value" placeholder="0.1" />
          </div>
          <p />
          <div>
            <label className="label-6">data:</label>
            <textarea
              id="data"
              placeholder="0x"
              style={{ height: "100px", width: "400px", fontSize: "14px" }}
            />
          </div>
        </div>
        <p />
        <button
          onClick={estimateTxFeeHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          estimate txFee
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

export default EstimateTxFeePage;
