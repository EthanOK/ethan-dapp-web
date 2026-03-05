import { useEffect, useState } from "react";
import { getChainId } from "../utils/GetProvider";
import {
  createAuthorization,
  createEIP7702Account,
  getDelegationAddress,
  revokeEIP7702Account
} from "../utils/EIP7702Utils";
import {
  ALCHEMY_KEY_V3,
  EIP7702Delegator_Metamask
} from "../common/SystemConfiguration";
import { Wallet } from "ethers-v6";
import { getScanURL } from "../utils/Utils";
import { AlchemyProvider } from "ethers-v6";
import { useAppKitAccount } from "@reown/appkit/react";

const EIP7702Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);

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

  const createEIP7702AccountHandler = async () => {
    try {
      const url = await getScanURL();
      const el = document.getElementById(
        "privateKey"
      ) as HTMLTextAreaElement | null;
      if (!el?.value) return;
      const privateKey = el.value;
      const chainId = await getChainId();
      if (chainId === null) {
        alert("无法获取链 ID，请先连接钱包");
        return;
      }
      const provider = new AlchemyProvider(chainId, ALCHEMY_KEY_V3 ?? "");
      const signer = new Wallet(privateKey, provider);
      let currentNonce = await signer.getNonce();
      const delegationAddress = await getDelegationAddress(signer);
      const logger =
        delegationAddress === null
          ? "Create EIP-7702 account"
          : "Update EIP-7702 account";
      alert(logger);
      currentNonce++;
      const delegator: string | null = EIP7702Delegator_Metamask;
      if (!delegator) return;
      const auth = await createAuthorization(
        signer,
        currentNonce,
        delegator as string
      );
      const hash = await createEIP7702Account(signer, auth);
      if (!hash) return;
      setMessage(`${url}/tx/${hash}`);
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const revokeEIP7702AccountHandler = async () => {
    try {
      const url = await getScanURL();
      const el = document.getElementById(
        "privateKey"
      ) as HTMLTextAreaElement | null;
      if (!el?.value) return;
      const privateKey = el.value;
      const chainId = await getChainId();
      if (chainId === null) {
        alert("无法获取链 ID，请先连接钱包");
        return;
      }
      const provider = new AlchemyProvider(chainId, ALCHEMY_KEY_V3 ?? "");
      const signer = new Wallet(privateKey, provider);
      const delegationAddress = await getDelegationAddress(signer);
      if (delegationAddress === null) {
        alert("Not EIP-7702 account");
        return;
      }
      const hash = await revokeEIP7702Account(signer);
      setMessage(`${url}/tx/${hash}`);
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <center>
      {showAlert && (
        <div className="alert">
          <h1>&quot;EIP7702 success&quot;</h1>
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
            />
          </div>
        </div>
        <p />
        <button
          onClick={createEIP7702AccountHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          createEIP7702Account
        </button>
        <p />
        <button
          onClick={revokeEIP7702AccountHandler}
          className="cta-button mint-nft-button"
          disabled={!currentAccount}
        >
          revokeEIP7702Account
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

export default EIP7702Page;
