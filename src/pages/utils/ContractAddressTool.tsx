import { useState } from "react";
import { useI18n } from "@/i18n";
import ResultBlock from "@/pages/utils/ResultBlock";
import {
  getAddressCreate,
  getAddressCreate2,
  isAddress
} from "@/lib/shared/Utils";

/**
 * Two ways to know an address before the contract exists: CREATE derives it
 * from the deployer's nonce, CREATE2 from a salt and the init code. They take
 * different inputs but answer the same question, so they share one panel and a
 * segmented control picks which form is showing — CREATE first, since it is
 * the one that needs no bytecode.
 */
type AddressTab = "create" | "create2";

export default function ContractAddressTool() {
  const { t } = useI18n();

  const [tab, setTab] = useState<AddressTab>("create");

  const [account, setAccount] = useState("");
  const [nonce, setNonce] = useState("");
  const [contractAddress, setContractAddress] = useState<string | null>(null);

  const [factory, setFactory] = useState("");
  const [salt, setSalt] = useState("0x");
  const [initCode, setInitCode] = useState("0x");
  const [create2Address, setCreate2Address] = useState<string | null>(null);

  const predictCreate = () => {
    const value = account.trim();
    if (!isAddress(value)) return;
    setContractAddress(getAddressCreate(value, parseInt(nonce, 10) || 0));
  };

  // Salt and init code are free-form hex, so anything unparseable surfaces as
  // a rejection from ethers rather than a silent empty result.
  const predictCreate2 = () => {
    const value = factory.trim();
    if (!isAddress(value)) return;
    try {
      setCreate2Address(getAddressCreate2(value, salt.trim(), initCode.trim()));
    } catch {
      alert(t("common.invalidArgument"));
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("utils.contractSection")}</h1>
        <p>{t("utils.contractDesc")}</p>
      </section>

      <div className="segmented-wrap">
        <div
          className="segmented"
          role="tablist"
          aria-label={t("utils.contractSection")}
        >
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "create"}
            onClick={() => setTab("create")}
          >
            {t("utils.byCreate")}
          </button>
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "create2"}
            onClick={() => setTab("create2")}
          >
            {t("utils.byCreate2")}
          </button>
        </div>
      </div>

      {tab === "create" ? (
        <section className="feature-panel">
          <div className="feature-field">
            <label htmlFor="account_create">{t("common.account")}</label>
            <input
              id="account_create"
              type="text"
              value={account}
              onChange={(event) => setAccount(event.target.value)}
              placeholder="0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
            />
          </div>
          <div className="feature-field">
            <label htmlFor="nonce_create">{t("utils.nonce")}</label>
            <input
              id="nonce_create"
              type="text"
              value={nonce}
              onChange={(event) => setNonce(event.target.value)}
              placeholder="11"
            />
          </div>
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={predictCreate}
              className="cta-button mint-nft-button"
            >
              {t("utils.getContractAddress")}
            </button>
          </div>
          <ResultBlock value={contractAddress ?? ""} />
        </section>
      ) : (
        <section className="feature-panel">
          <div className="feature-field">
            <label htmlFor="factory_create2">{t("utils.factory")}</label>
            <input
              id="factory_create2"
              type="text"
              value={factory}
              onChange={(event) => setFactory(event.target.value)}
              placeholder="0x4e59b44847b379578588920cA78FbF26c0B4956C"
            />
          </div>
          <div className="feature-field">
            <label htmlFor="salt_create2">{t("utils.salt")}</label>
            <input
              id="salt_create2"
              type="text"
              value={salt}
              onChange={(event) => setSalt(event.target.value)}
              placeholder="0x0000000000000000000000000000000000000000000000000000000000000001"
            />
          </div>
          <div className="feature-field">
            <label htmlFor="initcode_create2">{t("utils.initCode")}</label>
            <textarea
              id="initcode_create2"
              value={initCode}
              onChange={(event) => setInitCode(event.target.value)}
              placeholder="0x6080604052348015600f57600080fd5b50..."
              rows={3}
            />
          </div>
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={predictCreate2}
              className="cta-button mint-nft-button"
            >
              {t("utils.getContractAddress")}
            </button>
          </div>
          <ResultBlock value={create2Address ?? ""} />
        </section>
      )}
    </div>
  );
}
