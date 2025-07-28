import { useEffect, useState } from "react";

import { getChainId } from "../utils/GetProvider.js";
import {
  createAuthorization,
  createEIP7702Account,
  getDelegationAddress,
  revokeEIP7702Account
} from "../utils/EIP7702Utils.js";
import {
  ALCHEMY_KEY_V3,
  EIP7702Delegator_Metamask
} from "../common/SystemConfiguration.js";
import { Wallet } from "ethers-v6";
import { getScanURL } from "../utils/Utils.js";
import { AlchemyProvider } from "ethers-v6";
import { useAppKitAccount } from "@reown/appkit/react";

const EIP7702Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showAlert, setShowAlert] = useState(false);

  const { address, isConnected } = useAppKitAccount();
  useEffect(() => {
    if (isConnected && address) {
      setCurrentAccount(address);
    }
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      configData();
    }
  }, [isMounted]);

  const configData = async () => {
    let account = localStorage.getItem("userAddress");
    if (account !== null) {
      setCurrentAccount(account);
    }
  };

  const createEIP7702AccountHandler = async () => {
    try {
      const url = await getScanURL();
      const privateKey = document.getElementById("privateKey").value;

      const chainId = await getChainId();
      const provider = new AlchemyProvider(chainId, ALCHEMY_KEY_V3);
      const signer = new Wallet(privateKey, provider);
      const paySigner = signer;

      let currentNonce = await signer.getNonce();

      const delegationAddress = await getDelegationAddress(signer);
      let logger;
      if (delegationAddress === null) {
        logger = "Create EIP-7702 account";
      } else {
        logger = "Update EIP-7702 account";
      }
      // console.log(logger);
      alert(logger);
      if (signer.address.toLowerCase() === paySigner.address.toLowerCase()) {
        currentNonce++;
      }

      const auth = await createAuthorization(
        signer,
        currentNonce,
        EIP7702Delegator_Metamask
      );

      console.log("Authorization created:", auth);
      const hash = await createEIP7702Account(signer, auth);
      setMessage(`${url}/tx/${hash}`);
      let txReceipt = await paySigner.provider.waitForTransaction(hash);
      if (txReceipt.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const revokeEIP7702AccountHandler = async () => {
    try {
      const url = await getScanURL();
      const privateKey = document.getElementById("privateKey").value;

      const chainId = await getChainId();
      const provider = new AlchemyProvider(chainId, ALCHEMY_KEY_V3);
      const signer = new Wallet(privateKey, provider);
      const paySigner = signer;

      const delegationAddress = await getDelegationAddress(signer);

      if (delegationAddress === null) {
        alert("Not EIP-7702 account");
        return;
      } else {
        console.log("Revoke EIP-7702 account");
        alert("Revoke EIP-7702 account");
      }

      const hash = await revokeEIP7702Account(signer);
      setMessage(`${url}/tx/${hash}`);
      let txReceipt = await paySigner.provider.waitForTransaction(hash);
      if (txReceipt.status === 1) {
        console.log("Success!");
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 3000);
      } else {
        console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
      return;
    }
  };

  const createEIP7702AccountButton = () => {
    return (
      <button
        onClick={createEIP7702AccountHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        createEIP7702Account
      </button>
    );
  };

  const revokeEIP7702AccountButton = () => {
    return (
      <button
        onClick={revokeEIP7702AccountHandler}
        className="cta-button mint-nft-button"
        disabled={!currentAccount}
      >
        revokeEIP7702Account
      </button>
    );
  };

  return (
    <center>
      {showAlert && (
        <div className="alert">
          <h1>"EIP7702 success"</h1>
        </div>
      )}
      <div>
        <h2>EIP 7702</h2>
        <div className="container">
          <div>
            <textarea
              className="textarea"
              id="privateKey"
              placeholder="privateKey"
              style={{ width: "600px", height: "40px" }}
            ></textarea>
          </div>
        </div>

        <p></p>
        {createEIP7702AccountButton()}

        <p></p>
        {revokeEIP7702AccountButton()}
      </div>
      <div>
        <h2>
          Please See:
          <p></p>
          <a href={message} target="_blank" rel="noopener noreferrer">
            {message}
          </a>
        </h2>
      </div>
    </center>
  );
};

export default EIP7702Page;
