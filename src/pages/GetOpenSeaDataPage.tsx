import { useEffect, useState } from "react";
import { isAddress } from "../utils/Utils";
import { getOrderHashSignatureOpenSea } from "../api/GetData";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";

const GetOpenSeaDataPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [contract, setContract] = useState("");
  const [tokenId, setTokenId] = useState("");
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
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
  }, [isMounted]);

  const parseContract = (val: string): string | null => {
    const trimmed = val.trim();
    if (trimmed.length === 44 && trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as string;
        return isAddress(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return isAddress(trimmed) ? trimmed : null;
  };

  const getOrderHashAndSignatureHandler = async () => {
    const c = parseContract(contract);
    if (!c) {
      toast.error("Invalid contract address");
      return;
    }
    const chainId = localStorage.getItem("chainId") ?? "";
    const result = (await getOrderHashSignatureOpenSea(
      chainId,
      c,
      tokenId.trim()
    )) as { code?: number; message?: string; data?: unknown };
    if (result.code !== 200) {
      toast.error(result.message ?? "Request failed");
      return;
    }
    setMessage(JSON.stringify(result.data, null, "\t"));
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>OpenSea Data</h1>
        <p>Get order hash and signature for OpenSea</p>
      </section>
      <section className="feature-panel">
        <h3>Parameters</h3>
        <div className="feature-field">
          <label htmlFor="opensea-contract">Contract</label>
          <input
            id="opensea-contract"
            type="text"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            placeholder="0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="opensea-tokenid">Token ID</label>
          <input
            id="opensea-tokenid"
            type="text"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="100"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getOrderHashAndSignatureHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Get order hash & signature
          </button>
        </div>
        {message && (
          <div className="feature-field" style={{ marginTop: 16 }}>
            <label>Result</label>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: "var(--w3-bg-elevated)",
                border: "1px solid var(--w3-border)",
                borderRadius: "var(--w3-radius-sm)",
                fontSize: "0.8rem",
                overflow: "auto",
                maxHeight: 160,
                fontFamily: "var(--w3-font-mono)",
                whiteSpace: "pre-wrap"
              }}
            >
              {message}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default GetOpenSeaDataPage;
