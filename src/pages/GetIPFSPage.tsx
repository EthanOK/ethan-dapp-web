import { useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useState } from "react";

const GetIPFSPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [cid, setCid] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
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

  const getIPFSURLHandler = () => {
    const trimmed = cid.trim();
    if (!trimmed) return;
    setIpfsUrl("https://ipfs.io/ipfs/" + trimmed);
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>IPFS</h1>
        <p>Resolve IPFS CID to gateway URL</p>
      </section>
      <section className="feature-panel">
        <h3>CID</h3>
        <div className="feature-field">
          <label htmlFor="ipfs-cid">Content ID (CID)</label>
          <input
            id="ipfs-cid"
            type="text"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="QmSFZ84W8uNjoZJMkGkVDuJR5PBNtsHorDBmcHCjzACdXY"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getIPFSURLHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || !cid.trim()}
          >
            Get IPFS URL
          </button>
        </div>
        {ipfsUrl && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>URL</p>
            <a href={ipfsUrl} target="_blank" rel="noopener noreferrer">
              {ipfsUrl}
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default GetIPFSPage;
