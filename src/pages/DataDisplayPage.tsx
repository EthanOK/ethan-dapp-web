import { useEffect, useState } from "react";
import DataTable from "../utils/table/DataTable";
import { getSystemData, getPriceBaseUSDT } from "../api/GetData";
import { useAppKitAccount } from "@reown/appkit/react";

const DataDisplayPage = () => {
  const [tableData, setTableData] = useState<unknown[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [ethPrice, setEthPrice] = useState("");
  const [bnbPrice, setBnbPrice] = useState("");

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updatePrices, 5000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      configData();
      updatePrices();
    }
  }, [isMounted]);

  const updatePrices = async () => {
    try {
      const result = (await getPriceBaseUSDT()) as {
        code?: number;
        data?: { ethPrice?: string; bnbPrice?: string };
      };
      if (result?.code === 200 && result.data) {
        setEthPrice(result.data.ethPrice ?? "");
        setBnbPrice(result.data.bnbPrice ?? "");
      }
    } catch {}
  };

  const configData = async () => {
    try {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
      const data = await getSystemData();
      setTableData(Array.isArray(data) ? data : []);
    } catch {}
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>Data Display</h1>
        <p>System data and price feed</p>
      </section>
      <section className="feature-panel">
        <h3>Prices (USDT)</h3>
        <div
          className="feature-field"
          style={{ display: "flex", gap: 24, flexWrap: "wrap" }}
        >
          <div>
            <span className="feature-field-hint">ETH</span>
            <span style={{ color: "var(--w3-accent)", fontWeight: 600 }}>
              {ethPrice || "—"}
            </span>
          </div>
          <div>
            <span className="feature-field-hint">BNB</span>
            <span style={{ color: "var(--w3-accent)", fontWeight: 600 }}>
              {bnbPrice || "—"}
            </span>
          </div>
        </div>
      </section>
      <section className="feature-panel">
        <h3>Data Table</h3>
        <DataTable data={tableData} />
      </section>
    </div>
  );
};

export default DataDisplayPage;
