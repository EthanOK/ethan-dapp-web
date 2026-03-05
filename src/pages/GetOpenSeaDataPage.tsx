import { useEffect, useState } from "react";
import { isAddress } from "../utils/Utils";
import { getOrderHashSignatureOpenSea } from "../api/GetData";
import { useAppKitAccount } from "@reown/appkit/react";

const GetOpenSeaDataPage = () => {
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

  const getOrderHashAndSignatureHandler = async () => {
    const contractInput = document.getElementById(
      "contract"
    ) as HTMLTextAreaElement | null;
    const tokenIdInput = document.getElementById(
      "tokenId"
    ) as HTMLTextAreaElement | null;
    if (!contractInput || !tokenIdInput) return;
    const contractValue = contractInput.value;
    const tokenIdValue = tokenIdInput.value;
    const res =
      contractValue.length === 44 && contractValue.startsWith("[")
        ? isAddress(JSON.parse(contractValue) as string)
        : isAddress(contractValue);
    if (!res) {
      alert("地址错误");
      return;
    }
    const chainId = localStorage.getItem("chainId");
    const result = (await getOrderHashSignatureOpenSea(
      chainId ?? "",
      contractValue,
      tokenIdValue
    )) as { code?: number; message?: string; data?: unknown };
    if (result.code !== 200) {
      alert(result.message);
      return;
    }
    setMessage(JSON.stringify(result.data, null, "\t"));
  };

  return (
    <center>
      <div>
        <h2>OpenSea Data</h2>
        <div className="container">
          <div className="input-container">
            <label className="label" htmlFor="contract">
              contract:
            </label>
            <textarea
              className="textarea"
              id="contract"
              placeholder="0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b"
            />
          </div>
          <div className="input-container">
            <label className="label" htmlFor="tokenId">
              tokenId:
            </label>
            <textarea className="textarea" id="tokenId" placeholder="100" />
          </div>
        </div>
        <p />
        <button
          onClick={getOrderHashAndSignatureHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          getOrderHashAndSignature
        </button>
      </div>
      <div>
        <h2>
          Please See:
          <p />
          <textarea
            value={message}
            readOnly
            style={{ width: "1200px", height: "100px" }}
          />
        </h2>
      </div>
    </center>
  );
};

export default GetOpenSeaDataPage;
