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
    <center>
      <div>
        <h2>
          ETH Price:&nbsp;
          <span style={{ color: "red" }}>{ethPrice}</span>
          &nbsp;USD
          <p />
          BNB Price:&nbsp;
          <span style={{ color: "red" }}>{bnbPrice}</span>
          &nbsp;USD
        </h2>
      </div>
      <div>
        <div>
          <h1>Data Table</h1>
          <DataTable data={tableData} />
        </div>
      </div>
    </center>
  );
};

export default DataDisplayPage;
