import { useEffect, useState } from "react";
import {
  getSystemData,
  getENSUniversalResolver,
  getAddressOfENSTheGraph,
  getENSByTokenId,
  getPriceBaseUSDT
} from "../api/GetData";
import { isAddress } from "../utils/Utils";
import { BigNumber } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";

const ENSPage = () => {
  const [, setTableData] = useState<unknown[]>([]);
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [messageENS, setMessageENS] = useState("");
  const [messageAddress, setMessageAddress] = useState("");
  const [messageName, setMessageName] = useState("");
  const [, setEthPrice] = useState("");
  const [, setBnbPrice] = useState("");

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

  const getENSHandler = async () => {
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
    const result = await getENSUniversalResolver(addressValue);
    if (result.code !== 200) {
      alert((result as { message?: string }).message);
      return;
    }
    setMessageENS(result.data === null ? "null" : result.data);
  };

  const getAddressHandler = async () => {
    const ensInput = document.getElementById(
      "ensString"
    ) as HTMLTextAreaElement | null;
    if (!ensInput) return;
    const ensValue = ensInput.value;
    if (ensValue.length < 4) {
      alert("输入错误");
      return;
    }
    const result = (await getAddressOfENSTheGraph(ensValue)) as {
      code?: number;
      message?: string;
      data?: string | null;
    };
    if (result.code !== 200) {
      alert(result.message);
      return;
    }
    setMessageAddress(result.data === null ? "null" : (result.data ?? "null"));
  };

  const getNameByTokenIdHandler = async () => {
    const tokenIdInput = document.getElementById(
      "enstokenId"
    ) as HTMLTextAreaElement | null;
    if (!tokenIdInput) return;
    const tokenIdValue = tokenIdInput.value;
    if (tokenIdValue.length < 64) {
      alert("输入错误");
      return;
    }
    const result = (await getENSByTokenId(tokenIdValue)) as {
      code?: number;
      message?: string;
      data?: string | null;
    };
    if (result.code !== 200) {
      alert(result.message);
      return;
    }
    setMessageName(result.data === null ? "null" : (result.data ?? "null"));
  };

  return (
    <center>
      <div>
        <div>
          <h1>ENS Service</h1>
          <div className="bordered-div">
            <div>
              <label>address:</label>
              <textarea
                id="addressString"
                placeholder="0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b"
                style={{ height: "24px", width: "400px", fontSize: "16px" }}
              />
            </div>
            <p />
            <div>
              <button
                onClick={getENSHandler}
                className="cta-button mint-nft-button"
                disabled={!currentAccount}
              >
                get ENS
              </button>
              <p />
              Result ENS:
              <textarea
                value={messageENS}
                readOnly
                style={{
                  width: "160px",
                  height: "20px",
                  color: "red",
                  fontSize: "16px",
                  textAlign: "center"
                }}
              />
            </div>
          </div>
          <p />
          <p />
          <div className="bordered-div">
            <div>
              <label>ENS: </label>
              <textarea
                id="ensString"
                placeholder="abc.eth"
                style={{ height: "24px", width: "400px", fontSize: "16px" }}
              />
            </div>
            <p />
            <div>
              <button
                onClick={getAddressHandler}
                className="cta-button mint-nft-button"
                disabled={!currentAccount}
              >
                get Address
              </button>
              <p />
              Result Address:
              <textarea
                value={messageAddress}
                readOnly
                style={{
                  width: "400px",
                  height: "24px",
                  color: "red",
                  fontSize: "16px",
                  textAlign: "center"
                }}
              />
              <p />
            </div>
          </div>
          <p />
          <p />
          <div className="bordered-div">
            <div>
              <label>ENS TokenId: </label>
              <textarea
                id="enstokenId"
                placeholder="79233663829379634837589865448569342784712482819484549289560981379859480642508"
                style={{ height: "24px", width: "660px", fontSize: "16px" }}
              />
            </div>
            <p />
            <div>
              <button
                onClick={getNameByTokenIdHandler}
                className="cta-button mint-nft-button"
                disabled={!currentAccount}
              >
                get Name By TokenId
              </button>
              <p />
              Result Name:
              <textarea
                value={messageName}
                readOnly
                style={{
                  width: "400px",
                  height: "24px",
                  color: "red",
                  fontSize: "16px",
                  textAlign: "center"
                }}
              />
              <p />
            </div>
          </div>
          <p />
          <p />
        </div>
      </div>
    </center>
  );
};

export default ENSPage;
