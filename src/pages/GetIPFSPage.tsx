import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";
import { useEffect, useState } from "react";

const GetIPFSPage = () => {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [cid, setCid] = useState("");
  const [ipfsUrl, setIpfsUrl] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useEvmWallet();

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
        <h1>{t("ipfs.title")}</h1>
        <p>{t("ipfs.subtitle")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("ipfs.cid")}</h3>
        <div className="feature-field">
          <label htmlFor="ipfs-cid">{t("ipfs.cidLabel")}</label>
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
            {t("ipfs.getUrl")}
          </button>
        </div>
        {ipfsUrl && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>{t("common.url")}</p>
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
