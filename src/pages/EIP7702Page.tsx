import { useState } from "react";
import { getChainId } from "@/lib/wallet/GetProvider";
import {
  createAuthorization,
  createEIP7702Account,
  getDelegationAddress,
  revokeEIP7702Account
} from "@/lib/evm/EIP7702Utils";
import {
  ALCHEMY_KEY_V3,
  EIP7702Delegator_Metamask
} from "@/config/SystemConfiguration";
import { JsonRpcProvider, Wallet } from "ethers";
import { getScanURL } from "@/lib/shared/Utils";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

const EIP7702Page = () => {
  const { t } = useI18n();
  const [privateKey, setPrivateKey] = useState("");
  const [txLink, setTxLink] = useState("");

  const { address } = useEvmWallet();

  const createEIP7702AccountHandler = async () => {
    const pk = privateKey.trim();
    if (!pk) {
      toast.error(t("eip7702.enterPrivateKey"));
      return;
    }
    try {
      const url = await getScanURL();
      const chainId = await getChainId();
      if (chainId === null) {
        toast.error(t("error.chainIdRequired"));
        return;
      }
      const provider = new JsonRpcProvider(
        `https://eth-${chainId === 1 ? "mainnet" : "sepolia"}.g.alchemy.com/v2/${ALCHEMY_KEY_V3 ?? ""}`,
        chainId
      );
      const signer = new Wallet(pk, provider);
      let currentNonce = await signer.getNonce();
      const delegationAddress = await getDelegationAddress(signer);
      const logger =
        delegationAddress === null
          ? t("eip7702.createLog")
          : t("eip7702.updateLog");
      toast(logger);
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
      setTxLink(`${url}/tx/${hash}`);
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) toast.success(t("eip7702.success"));
        else toast.error(t("common.txFailed"));
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  const revokeEIP7702AccountHandler = async () => {
    const pk = privateKey.trim();
    if (!pk) {
      toast.error(t("eip7702.enterPrivateKey"));
      return;
    }
    try {
      const url = await getScanURL();
      const chainId = await getChainId();
      if (chainId === null) {
        toast.error(t("error.chainIdRequired"));
        return;
      }
      const provider = new JsonRpcProvider(
        `https://eth-${chainId === 1 ? "mainnet" : "sepolia"}.g.alchemy.com/v2/${ALCHEMY_KEY_V3 ?? ""}`,
        chainId
      );
      const signer = new Wallet(pk, provider);
      const delegationAddress = await getDelegationAddress(signer);
      if (delegationAddress === null) {
        toast.error(t("eip7702.notAccount"));
        return;
      }
      const hash = await revokeEIP7702Account(signer);
      setTxLink(`${url}/tx/${hash}`);
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) toast.success(t("eip7702.revokeSuccess"));
        else toast.error(t("common.txFailed"));
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("eip7702.title")}</h1>
        <p>{t("eip7702.subtitle")}</p>
      </section>
      <section className="feature-panel">
        <h3>{t("eip7702.privateKeySection")}</h3>
        <div className="feature-field">
          <label htmlFor="eip7702-pk">{t("eip7702.privateKey")}</label>
          <input
            id="eip7702-pk"
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={createEIP7702AccountHandler}
            className="cta-button mint-nft-button"
            disabled={!address}
          >
            {t("eip7702.createAccount")}
          </button>
          <button
            type="button"
            onClick={revokeEIP7702AccountHandler}
            className="cta-button mint-nft-button"
            disabled={!address}
          >
            {t("eip7702.revokeAccount")}
          </button>
        </div>
        {txLink && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>{t("common.transaction")}</p>
            <a href={txLink} target="_blank" rel="noopener noreferrer">
              {txLink}
            </a>
          </div>
        )}
      </section>
    </div>
  );
};

export default EIP7702Page;
