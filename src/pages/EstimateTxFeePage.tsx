import { useEffect, useState } from "react";
import { isAddress, getDecimalBigNumber } from "../utils/Utils";
import { getProvider } from "../utils/GetProvider";
import { estimateTxFee } from "../utils/EstimateTxFee";
import { toast } from "sonner";
import { useAppKitAccount } from "@reown/appkit/react";

const PLACEHOLDER_ADDRESS = "0xe698a7917eEE4fDf03296add549eE4A7167DD406";

const EstimateTxFeePage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [from, setFrom] = useState(
    "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
  );
  const [to, setTo] = useState("0xe698a7917eEE4fDf03296add549eE4A7167DD406");
  const [value, setValue] = useState("0");
  const [data, setData] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
  }, [isMounted]);

  const estimateTxFeeHandler = async () => {
    if (!isAddress(from)) {
      toast.error("from address is not valid");
      return;
    }
    if (to.length !== 0 && !isAddress(to)) {
      toast.error("to address is not valid");
      return;
    }
    const dataTrimmed = data.trim();
    if (dataTrimmed.length > 0 && !dataTrimmed.startsWith("0x")) {
      toast.error("data must be hex (0x...) or empty");
      return;
    }

    const valueBN = getDecimalBigNumber(value === "" ? "0" : value, 18);
    const dataToUse = dataTrimmed === "" ? undefined : dataTrimmed;
    setResult(null);
    setIsLoading(true);

    try {
      const provider = await getProvider();
      if (!provider) {
        toast.error("Provider not available");
        return;
      }
      const res = await estimateTxFee(
        provider,
        from,
        to,
        dataToUse ?? "",
        valueBN
      );
      setResult(JSON.stringify(res, null, 2));
    } catch (err: unknown) {
      const e = err as { code?: string | number };
      toast.error(String(e?.code ?? "Error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>Estimate TxFee</h1>
        <p>Estimate gas and fee for a transaction before sending</p>
      </section>

      <section className="feature-panel">
        <h3>Transaction parameters</h3>
        <div className="feature-field">
          <label htmlFor="estimate-from">From (sender address)</label>
          <input
            id="estimate-from"
            type="text"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={PLACEHOLDER_ADDRESS}
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="estimate-to">To (receiver address, optional)</label>
          <input
            id="estimate-to"
            type="text"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={PLACEHOLDER_ADDRESS}
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="estimate-value">Value (ETH)</label>
          <input
            id="estimate-value"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0.1"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="estimate-data">Data (hex, e.g. 0x)</label>
          <textarea
            id="estimate-data"
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="0x"
            rows={4}
            spellCheck={false}
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={estimateTxFeeHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || isLoading}
          >
            {isLoading ? "Estimating…" : "Estimate tx fee"}
          </button>
        </div>
      </section>

      {result !== null && (
        <section className="feature-panel estimate-result-panel">
          <h3>Result</h3>
          <pre className="estimate-result-json">{result}</pre>
        </section>
      )}
    </div>
  );
};

export default EstimateTxFeePage;
