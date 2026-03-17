import { useState } from "react";
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
import { toast } from "sonner";

const EIP7702Page = () => {
  const [privateKey, setPrivateKey] = useState("");
  const [txLink, setTxLink] = useState("");

  const { address } = useAppKitAccount();

  const createEIP7702AccountHandler = async () => {
    const pk = privateKey.trim();
    if (!pk) {
      toast.error("Please enter private key");
      return;
    }
    try {
      const url = await getScanURL();
      const chainId = await getChainId();
      if (chainId === null) {
        toast.error("无法获取链 ID，请先连接钱包");
        return;
      }
      const provider = new AlchemyProvider(chainId, ALCHEMY_KEY_V3 ?? "");
      const signer = new Wallet(pk, provider);
      let currentNonce = await signer.getNonce();
      const delegationAddress = await getDelegationAddress(signer);
      const logger =
        delegationAddress === null
          ? "Create EIP-7702 account"
          : "Update EIP-7702 account";
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
        if (txReceipt?.status === 1) toast.success("EIP-7702 success");
        else toast.error("Transaction failed");
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed");
    }
  };

  const revokeEIP7702AccountHandler = async () => {
    const pk = privateKey.trim();
    if (!pk) {
      toast.error("Please enter private key");
      return;
    }
    try {
      const url = await getScanURL();
      const chainId = await getChainId();
      if (chainId === null) {
        toast.error("无法获取链 ID，请先连接钱包");
        return;
      }
      const provider = new AlchemyProvider(chainId, ALCHEMY_KEY_V3 ?? "");
      const signer = new Wallet(pk, provider);
      const delegationAddress = await getDelegationAddress(signer);
      if (delegationAddress === null) {
        toast.error("Not EIP-7702 account");
        return;
      }
      const hash = await revokeEIP7702Account(signer);
      setTxLink(`${url}/tx/${hash}`);
      const prov = signer.provider;
      if (prov) {
        const txReceipt = await prov.waitForTransaction(hash);
        if (txReceipt?.status === 1) toast.success("Revoke success");
        else toast.error("Transaction failed");
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? "Failed");
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>EIP-7702</h1>
        <p>Delegation and revoke for EOA</p>
      </section>
      <section className="feature-panel">
        <h3>Private key (delegator)</h3>
        <div className="feature-field">
          <label htmlFor="eip7702-pk">Private key</label>
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
            Create EIP-7702 account
          </button>
          <button
            type="button"
            onClick={revokeEIP7702AccountHandler}
            className="cta-button mint-nft-button"
            disabled={!address}
          >
            Revoke EIP-7702 account
          </button>
        </div>
        {txLink && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>Transaction</p>
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
