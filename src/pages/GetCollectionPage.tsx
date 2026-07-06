import { useEffect, useState } from "react";
import { stringifyJson } from "@/lib/shared/Format";
import { isAddress } from "@/lib/shared/Utils";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";
import {
  getContractsForOwner,
  getNFTListByOwnerAndContract
} from "@/lib/nft/GetNFTListByOwner";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

const PLACEHOLDER = "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2";

const GetCollectionPage = () => {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [owner, setOwner] = useState("");
  const [contract, setContract] = useState("");
  const [owner2, setOwner2] = useState("");
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);

  const { address, isConnected } = useEvmWallet();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(() => {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }, 2000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
  }, [isMounted]);

  const getCollectionHandler = async () => {
    const o = owner.trim();
    if (!isAddress(o)) {
      toast.error(t("collection.invalidOwner"));
      return;
    }
    try {
      const [, chainId] = await getSignerAndChainId();
      if (chainId == null) return;
      const result = await getContractsForOwner(chainId, o);
      if (result !== null) setMessage(stringifyJson(result, 2));
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  const getNFTListHandler = async () => {
    const c = contract.trim();
    const o = owner2.trim();
    if (!isAddress(c) || !isAddress(o)) {
      toast.error(t("collection.invalidContractOrOwner"));
      return;
    }
    try {
      const [, chainId] = await getSignerAndChainId();
      if (chainId == null) return;
      const result = await getNFTListByOwnerAndContract(chainId, o, c);
      if (result !== null) setMessage(stringifyJson(result, 2));
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("collection.title")}</h1>
        <p>{t("collection.subtitle")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("collection.contractsByOwner")}</h3>
        <div className="feature-field">
          <label htmlFor="getcoll-owner">{t("common.owner")}</label>
          <input
            id="getcoll-owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder={PLACEHOLDER}
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getCollectionHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("collection.getCollection")}
          </button>
        </div>
      </section>
      <section className="feature-panel">
        <h3>{t("collection.nftListSection")}</h3>
        <div className="feature-field">
          <label htmlFor="getcoll-contract">{t("common.contract")}</label>
          <input
            id="getcoll-contract"
            type="text"
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            placeholder="0x709b78b36b7208f668a3823c1d1992c0805e4f4d"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="getcoll-owner2">{t("common.owner")}</label>
          <input
            id="getcoll-owner2"
            type="text"
            value={owner2}
            onChange={(e) => setOwner2(e.target.value)}
            placeholder={PLACEHOLDER}
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getNFTListHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("collection.getNftList")}
          </button>
        </div>
      </section>
      {message && (
        <section className="feature-panel">
          <h3>{t("common.result")}</h3>
          <pre
            style={{
              margin: 0,
              padding: 16,
              background: "var(--w3-bg-elevated)",
              border: "1px solid var(--w3-border)",
              borderRadius: "var(--w3-radius-sm)",
              fontSize: "0.8rem",
              overflow: "auto",
              maxHeight: 400,
              fontFamily: "var(--w3-font-mono)",
              whiteSpace: "pre-wrap"
            }}
          >
            {message}
          </pre>
        </section>
      )}
    </div>
  );
};

export default GetCollectionPage;
