import { useState } from "react";
import { useI18n } from "@/i18n";

const GATEWAYS = [
  "https://ipfs.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://dweb.link/ipfs/",
  "https://ipfs.filebase.io/ipfs/"
];

export default function IpfsTool() {
  const { t } = useI18n();
  const [cid, setCid] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  const buildUrls = () => {
    const value = cid.trim();
    setUrls(value ? GATEWAYS.map((base) => base + value) : []);
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("utils.ipfsSection")}</h1>
        <p>{t("utils.ipfsDesc")}</p>
      </section>

      <section className="feature-panel">
        <div className="feature-field">
          <label htmlFor="cid">{t("ipfs.cid")}</label>
          <textarea
            id="cid"
            value={cid}
            onChange={(event) => setCid(event.target.value)}
            placeholder="QmSFZ84W8uNjoZJMkGkVDuJR5PBNtsHorDBmcHCjzACdXY"
            rows={2}
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={buildUrls}
            className="cta-button mint-nft-button"
          >
            {t("utils.getIpfsUrl")}
          </button>
        </div>
        {urls.length > 0 && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>{t("common.gateways")}</p>
            {urls.map((url) => (
              <div key={url}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  {new URL(url).hostname}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
