import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";

const GetIPFSPage = () => {
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

  const getIPFSURLHandler = async () => {
    const contractInput = document.getElementById(
      "cid"
    ) as HTMLTextAreaElement | null;
    if (!contractInput) return;
    const contractValue = contractInput.value;
    setMessage("https://ipfs.io/ipfs/" + contractValue);
  };

  return (
    <center>
      <div>
        <h2>IPFS</h2>
        <div className="container">
          <div className="input-container">
            <label className="label">CID:</label>
            <textarea
              className="textarea"
              id="cid"
              placeholder="QmSFZ84W8uNjoZJMkGkVDuJR5PBNtsHorDBmcHCjzACdXY"
            />
          </div>
        </div>
        <p />
        {currentAccount ? (
          <button
            onClick={getIPFSURLHandler}
            className="cta-button mint-nft-button"
          >
            getIPFSURL
          </button>
        ) : (
          <h2>UnLogin, Please Login</h2>
        )}
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

export default GetIPFSPage;
