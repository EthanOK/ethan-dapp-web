import { useEffect, useState } from "react";
import { isAddress } from "../utils/Utils";
import { getSignerAndChainId } from "../utils/GetProvider";
import {
  getContractsForOwner,
  getNFTListByOwnerAndContract
} from "../utils/GetNFTListByOwner";
import { useAppKitAccount } from "@reown/appkit/react";

const GetCollectionPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updateData, 2000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) configData();
  }, [isMounted]);

  const updateData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const configData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const getCollectionHandler = async () => {
    const ownerEl = document.getElementById(
      "owner"
    ) as HTMLTextAreaElement | null;
    if (!ownerEl) return;
    const owner = ownerEl.value;
    if (!isAddress(owner)) {
      alert("owner is not address");
      return;
    }
    try {
      const [, chainId] = await getSignerAndChainId();
      if (chainId == null) return;
      const result = await getContractsForOwner(chainId, owner);
      if (result !== null) setMessage(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log(error);
    }
  };

  const getNFTListHandler = async () => {
    const contractEl = document.getElementById(
      "contract_2"
    ) as HTMLTextAreaElement | null;
    const ownerEl = document.getElementById(
      "owner_2"
    ) as HTMLTextAreaElement | null;
    if (!contractEl || !ownerEl) return;
    const contract = contractEl.value;
    const owner = ownerEl.value;
    if (!isAddress(contract) || !isAddress(owner)) {
      alert("contract or owner is not address");
      return;
    }
    try {
      const [, chainId] = await getSignerAndChainId();
      if (chainId == null) return;
      const result = await getNFTListByOwnerAndContract(
        chainId,
        owner,
        contract
      );
      if (result !== null) setMessage(JSON.stringify(result, null, 2));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <center>
      <div>
        <h2>GetCollection</h2>
        <div className="bordered-div">
          <div className="container">
            <div className="input-container">
              <label className="label-6" htmlFor="owner">
                owner:
              </label>
              <textarea
                className="textarea"
                id="owner"
                placeholder="0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
              />
            </div>
          </div>
          <p />
          {currentAccount ? (
            <button
              onClick={getCollectionHandler}
              className="cta-button mint-nft-button"
            >
              get Collection
            </button>
          ) : (
            <button className="cta-button unlogin-nft-button">
              Please Login DApp
            </button>
          )}
        </div>
        <p />
        <p />
        <div className="bordered-div">
          <div className="container">
            <div className="input-container">
              <label className="label-6" htmlFor="contract">
                contract:
              </label>
              <textarea
                className="textarea"
                id="contract_2"
                placeholder="0x709b78b36b7208f668a3823c1d1992c0805e4f4d"
              />
            </div>
            <div className="input-container">
              <label className="label-6" htmlFor="owner_2">
                owner:
              </label>
              <textarea
                className="textarea"
                id="owner_2"
                placeholder="0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
              />
            </div>
          </div>
          <p />
          {currentAccount ? (
            <button
              onClick={getNFTListHandler}
              className="cta-button mint-nft-button"
            >
              Get NFTList
            </button>
          ) : (
            <button className="cta-button unlogin-nft-button">
              Please Login DApp
            </button>
          )}
        </div>
        <p />
      </div>
      <div>
        <h2>
          Please See:
          <p />
          <textarea
            value={message}
            readOnly
            style={{ width: "1200px", height: "400px" }}
          />
        </h2>
      </div>
    </center>
  );
};

export default GetCollectionPage;
