import { useEffect, useState } from "react";
import { getScanURL, isAddress } from "../utils/Utils";
import { getSignerAndChainId } from "../utils/GetProvider";
import { TBVersion, TokenboundClient } from "@tokenbound/sdk";
import { Contract, Signer } from "ethers";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";

const url_iframe = "https://iframe-tokenbound.vercel.app";

const ERC6551Page = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [contract, setContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [contractCreate, setContractCreate] = useState("");
  const [tokenIdCreate, setTokenIdCreate] = useState("");
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

  const updateData = () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  useEffect(() => {
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
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

  const getTBAHandler = async () => {
    const c = contract.trim();
    const t = tokenId.trim();
    if (!isAddress(c)) {
      toast.error("Contract is not a valid address");
      return;
    }
    if (t === "") {
      toast.error("Token ID is required");
      return;
    }
    try {
      const [signer, chainId] = await getSignerAndChainId();
      if (!signer || chainId == null) return;
      const tokenboundClient = await getTokenboundClient(signer, chainId);
      const account = tokenboundClient.getAccount({
        tokenContract: c as `0x${string}`,
        tokenId: t
      });
      setTbAccount(account);
      const isCreate = await tokenboundClient.checkAccountDeployment({
        accountAddress: account
      });
      setCreated(String(isCreate));
      if (isCreate) {
        setSrcIframe(`${url_iframe}/${c}/${t}/${chainId}`);
      } else {
        setSrcIframe(null);
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed");
    }
  };

  const createHandler = async () => {
    const c = contractCreate.trim();
    const t = tokenIdCreate.trim();
    if (!isAddress(c)) {
      toast.error("Contract is not a valid address");
      return;
    }
    if (t === "") {
      toast.error("Token ID is required");
      return;
    }
    try {
      const [signer, chainId] = await getSignerAndChainId();
      if (!signer || chainId == null) return;
      const tokenboundClient = await getTokenboundClient(signer, chainId);
      const account = tokenboundClient.getAccount({
        tokenContract: c as `0x${string}`,
        tokenId: t
      });
      setTbAccount(account);
      const isCreate = await tokenboundClient.checkAccountDeployment({
        accountAddress: account
      });
      if (isCreate) {
        toast("Account already created");
        setSrcIframe(`${url_iframe}/${c}/${t}/${chainId}`);
        return;
      }
      setSrcIframe(null);
      const multiCallTx_data = await tokenboundClient.prepareCreateAccount({
        tokenContract: c as `0x${string}`,
        tokenId: t
      });
      const tx = await signer.sendTransaction(
        multiCallTx_data as Parameters<Signer["sendTransaction"]>[0]
      );
      if (tx?.hash) {
        setTxHash(tx.hash);
        const etherscanURL = await getScanURL();
        setHashURL(`${etherscanURL}/tx/${tx.hash}`);
        const result = await tx.wait();
        if (result?.status === 1) toast.success("Success");
        else toast.error("Failed");
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed");
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>ERC-6551</h1>
        <p>
          <a
            href="https://docs.tokenbound.org/contracts/deployments"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--w3-accent)" }}
          >
            Tokenbound v0.3.1
          </a>
        </p>
      </section>
      <section className="feature-panel">
        <h3>Get TBA</h3>
        <div className="feature-field">
          <label htmlFor="erc6551-contract">Contract</label>
          <input
            id="erc6551-contract"
            type="text"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            placeholder="0x11400ee484355c7bdf804702bf3367ebc7667e54"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="erc6551-tokenid">Token ID</label>
          <input
            id="erc6551-tokenid"
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="1053"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getTBAHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Get TBA
          </button>
        </div>
        {tbAccount != null && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <span className="feature-field-hint">TB Account: </span>
            <span style={{ fontFamily: "var(--w3-font-mono)" }}>
              {tbAccount}
            </span>
          </div>
        )}
        {created != null && (
          <div className="feature-field">
            <span className="feature-field-hint">Created: </span>
            <span>{created}</span>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>Create TBA</h3>
        <div className="feature-field">
          <label htmlFor="erc6551-contract-create">Contract</label>
          <input
            id="erc6551-contract-create"
            type="text"
            value={contractCreate}
            onChange={(e) => setContractCreate(e.target.value)}
            placeholder="0x11400ee484355c7bdf804702bf3367ebc7667e54"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="erc6551-tokenid-create">Token ID</label>
          <input
            id="erc6551-tokenid-create"
            type="text"
            value={tokenIdCreate}
            onChange={(e) => setTokenIdCreate(e.target.value)}
            placeholder="1053"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={createHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Create TBA
          </button>
        </div>
        {tbAccount != null && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <span className="feature-field-hint">TB Account: </span>
            <span style={{ fontFamily: "var(--w3-font-mono)" }}>
              {tbAccount}
            </span>
          </div>
        )}
        {created != null && (
          <div className="feature-field">
            <span className="feature-field-hint">Created: </span>
            <span>{created}</span>
          </div>
        )}
        {txHash && hashURL && (
          <div className="feature-tx-link" style={{ marginTop: 12 }}>
            <p>Tx</p>
            <a href={hashURL} target="_blank" rel="noopener noreferrer">
              {txHash}
            </a>
          </div>
        )}
      </section>
      {srcIframe != null && (
        <section className="feature-panel">
          <h3>Tokenbound</h3>
          <iframe
            style={{
              width: "100%",
              maxWidth: 600,
              height: 600,
              border: "1px solid var(--w3-border)",
              borderRadius: "var(--w3-radius-sm)"
            }}
            src={srcIframe}
            title="Tokenbound"
          />
        </section>
      )}
    </div>
  );
};

export default ERC6551Page;
