import { useEffect, useState } from "react";
import { getScanURL, isAddress } from "../utils/Utils";
import { getSignerAndChainId } from "../utils/GetProvider";
import { TBVersion, TokenboundClient } from "@tokenbound/sdk";
import { Contract, Signer } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";

const url_iframe = "https://iframe-tokenbound.vercel.app";

const ERC6551Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [tbAccount, setTbAccount] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [srcIframe, setSrcIframe] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hashURL, setHashURL] = useState("");
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

  const getTokenboundClient = async (
    signer: unknown,
    chainId: number,
    isV2 = false
  ): Promise<TokenboundClient> => {
    return new TokenboundClient({
      signer,
      chainId,
      version: isV2 ? TBVersion.V2 : TBVersion.V3
    });
  };

  const ERC6551_Is_V3 = async (
    signer: unknown,
    account: string
  ): Promise<boolean> => {
    const abi = [
      "function supportsInterface(bytes4 interfaceId) external view returns (bool)"
    ];
    const erc6551 = new Contract(account, abi, signer as Signer);
    return await erc6551.supportsInterface("0x6faff5f1");
  };

  const updateData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const configData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const getTBAHandler = async () => {
    const contractEl = document.getElementById(
      "contract"
    ) as HTMLTextAreaElement | null;
    const tokenIdEl = document.getElementById(
      "tokenId"
    ) as HTMLTextAreaElement | null;
    if (!contractEl || !tokenIdEl) return;
    const contract = contractEl.value;
    const tokenId = tokenIdEl.value;
    if (!isAddress(contract)) {
      alert("contract is not address");
      return;
    }
    if (tokenId === "") {
      alert("tokenId is empty");
      return;
    }
    try {
      const [signer, chainId] = await getSignerAndChainId();
      if (!signer || chainId == null) return;
      const tokenboundClient = await getTokenboundClient(signer, chainId);
      const account = tokenboundClient.getAccount({
        tokenContract: contract as `0x${string}`,
        tokenId
      });
      setTbAccount(account);
      const isCreate = await tokenboundClient.checkAccountDeployment({
        accountAddress: account
      });
      setCreated(String(isCreate));
      if (isCreate) {
        const iframe = `${url_iframe}/${contract}/${tokenId}/${chainId}`;
        setSrcIframe(iframe);
      } else {
        setSrcIframe(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const createHandler = async () => {
    const contractEl = document.getElementById(
      "contract_create"
    ) as HTMLTextAreaElement | null;
    const tokenIdEl = document.getElementById(
      "tokenId_create"
    ) as HTMLTextAreaElement | null;
    if (!contractEl || !tokenIdEl) return;
    const contract = contractEl.value;
    const tokenId = tokenIdEl.value;
    if (!isAddress(contract)) {
      alert("contract is not address");
      return;
    }
    if (tokenId === "") {
      alert("tokenId is empty");
      return;
    }
    try {
      const [signer, chainId] = await getSignerAndChainId();
      if (!signer || chainId == null) return;
      const tokenboundClient = await getTokenboundClient(signer, chainId);
      const account = tokenboundClient.getAccount({
        tokenContract: contract as `0x${string}`,
        tokenId
      });
      setTbAccount(account);
      const isCreate = await tokenboundClient.checkAccountDeployment({
        accountAddress: account
      });
      setCreated(String(isCreate));
      if (isCreate) {
        alert("Account is already created");
        setSrcIframe(`${url_iframe}/${contract}/${tokenId}/${chainId}`);
        return;
      }
      setSrcIframe(null);
      const multiCallTx_data = await tokenboundClient.prepareCreateAccount({
        tokenContract: contract as `0x${string}`,
        tokenId
      });
      const tx = await signer.sendTransaction(
        multiCallTx_data as Parameters<Signer["sendTransaction"]>[0]
      );
      if (tx?.hash) {
        setTxHash(tx.hash);
        const etherscanURL = await getScanURL();
        setHashURL(`${etherscanURL}/tx/${tx.hash}`);
        const result = await tx.wait();
        if (result?.status === 1) console.log("Success!");
        else console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <center>
      <div>
        <h2>ERC6551</h2>
        <h3>
          <a
            href="https://docs.tokenbound.org/contracts/deployments"
            target="_blank"
            rel="noreferrer"
          >
            tokenbound v0.3.1
          </a>
        </h3>
        <div className="bordered-div">
          <div className="container">
            <div className="input-container">
              <label className="label" htmlFor="contract">
                contract:
              </label>
              <textarea
                className="textarea"
                id="contract"
                placeholder="0x11400ee484355c7bdf804702bf3367ebc7667e54"
              />
            </div>
            <div className="input-container">
              <label className="label" htmlFor="tokenId">
                tokenId:
              </label>
              <textarea className="textarea" id="tokenId" placeholder="1053" />
            </div>
          </div>
          <p />
          {currentAccount ? (
            <button
              onClick={getTBAHandler}
              className="cta-button mint-nft-button"
            >
              get TBA
            </button>
          ) : (
            <button className="cta-button unlogin-nft-button">
              Please Login DApp
            </button>
          )}
          <div className="container">TB Account: {tbAccount}</div>
          <div className="container">Created: {created}</div>
        </div>
        <p />
        <p />
        <div className="bordered-div">
          <div className="container">
            <div className="input-container">
              <label className="label" htmlFor="contract_create">
                contract:
              </label>
              <textarea
                className="textarea"
                id="contract_create"
                placeholder="0x11400ee484355c7bdf804702bf3367ebc7667e54"
              />
            </div>
            <div className="input-container">
              <label className="label" htmlFor="tokenId_create">
                tokenId:
              </label>
              <textarea
                className="textarea"
                id="tokenId_create"
                placeholder="1053"
              />
            </div>
          </div>
          <p />
          {currentAccount ? (
            <button
              onClick={createHandler}
              className="cta-button mint-nft-button"
            >
              Create TBA
            </button>
          ) : (
            <button className="cta-button unlogin-nft-button">
              Please Login DApp
            </button>
          )}
          <div className="container">TB Account: {tbAccount}</div>
          <div className="container">Created: {created}</div>
          {txHash && (
            <div className="container" style={{ display: "inline" }}>
              TxHash:{" "}
              <a href={hashURL} target="_blank" rel="noopener noreferrer">
                {txHash}
              </a>
            </div>
          )}
        </div>
        <p />
        <div>
          {srcIframe != null && (
            <iframe
              style={{ width: "600px", height: "600px" }}
              src={srcIframe}
              title="Tokenbound"
            />
          )}
        </div>
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

export default ERC6551Page;
