import { useEffect, useState } from "react";
import { SupportChains } from "@/config/ChainsConfig";
import { getScanURL, isAddress } from "@/lib/shared/Utils";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";
import { TBVersion, TokenboundClient } from "@tokenbound/sdk";
import { Signer } from "ethers";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";
import { toast } from "sonner";

const url_iframe = "https://iframe-tokenbound.vercel.app";

const tokenboundIframeSrc = (
  contract: string,
  tokenId: string,
  chainId: number
) => `${url_iframe}/${contract}/${tokenId}/${chainId}?disableloading=true`;

const isUserRejected = (error: unknown): boolean => {
  const e = error as {
    code?: number | string;
    shortMessage?: string;
    message?: string;
    info?: { error?: { code?: number | string } };
  };
  const code = e.code ?? e.info?.error?.code;
  if (code === 4001 || code === "ACTION_REJECTED" || String(code) === "4001") {
    return true;
  }
  return /user rejected|denied transaction|user denied|ethers-user-denied/i.test(
    `${e.shortMessage ?? ""} ${e.message ?? ""}`
  );
};

const ERC6551Page = () => {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [contract, setContract] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [tbAccount, setTbAccount] = useState<string | null>(null);
  const [created, setCreated] = useState<boolean | null>(null);
  const [srcIframe, setSrcIframe] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hashURL, setHashURL] = useState("");
  const { address, isConnected } = useEvmWallet();

  useEffect(() => {
    setTbAccount(null);
    setCreated(null);
    setSrcIframe(null);
    setTxHash(null);
    setHashURL("");
  }, [contract, tokenId]);

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
    // Use SupportChains RPC so getBytecode doesn't hit viem's broken cloudflare default.
    const rpcUrl = SupportChains.find((c) => Number(c.id) === chainId)
      ?.rpcUrls?.[0];

    return new TokenboundClient({
      signer,
      chainId,
      version: isV2 ? TBVersion.V2 : TBVersion.V3,
      ...(rpcUrl ? { publicClientRPCUrl: rpcUrl } : {})
    });
  };

  const validateInputs = (): { contract: string; tokenId: string } | null => {
    const c = contract.trim();
    const tokenIdTrimmed = tokenId.trim();
    if (!isAddress(c)) {
      toast.error(t("erc6551.invalidContract"));
      return null;
    }
    if (tokenIdTrimmed === "") {
      toast.error(t("erc6551.tokenIdRequired"));
      return null;
    }
    return { contract: c, tokenId: tokenIdTrimmed };
  };

  const getTBAHandler = async () => {
    const inputs = validateInputs();
    if (!inputs) return;
    try {
      const [signer, chainId] = await getSignerAndChainId();
      if (!signer || chainId == null) return;
      const tokenboundClient = await getTokenboundClient(signer, chainId);
      const account = tokenboundClient.getAccount({
        tokenContract: inputs.contract as `0x${string}`,
        tokenId: inputs.tokenId
      });
      setTbAccount(account);
      const isCreate = await tokenboundClient.checkAccountDeployment({
        accountAddress: account
      });
      setCreated(isCreate);
      if (isCreate) {
        setSrcIframe(
          tokenboundIframeSrc(inputs.contract, inputs.tokenId, chainId)
        );
      } else {
        setSrcIframe(null);
      }
    } catch (error) {
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  const createHandler = async () => {
    const inputs = validateInputs();
    if (!inputs) return;
    try {
      const [signer, chainId] = await getSignerAndChainId();
      if (!signer || chainId == null) return;
      const tokenboundClient = await getTokenboundClient(signer, chainId);
      const account = tokenboundClient.getAccount({
        tokenContract: inputs.contract as `0x${string}`,
        tokenId: inputs.tokenId
      });
      setTbAccount(account);
      const isCreate = await tokenboundClient.checkAccountDeployment({
        accountAddress: account
      });
      setCreated(isCreate);
      if (isCreate) {
        toast(t("erc6551.accountAlreadyCreated"));
        setSrcIframe(
          tokenboundIframeSrc(inputs.contract, inputs.tokenId, chainId)
        );
        return;
      }
      setSrcIframe(null);
      const multiCallTx_data = await tokenboundClient.prepareCreateAccount({
        tokenContract: inputs.contract as `0x${string}`,
        tokenId: inputs.tokenId
      });
      const tx = await signer.sendTransaction(
        multiCallTx_data as Parameters<Signer["sendTransaction"]>[0]
      );
      if (tx?.hash) {
        setTxHash(tx.hash);
        const etherscanURL = await getScanURL();
        setHashURL(`${etherscanURL}/tx/${tx.hash}`);
        const result = await tx.wait();
        if (result?.status === 1) {
          toast.success(t("common.success"));
          setCreated(true);
          setSrcIframe(
            tokenboundIframeSrc(inputs.contract, inputs.tokenId, chainId)
          );
        } else toast.error(t("common.failed"));
      }
    } catch (error) {
      if (isUserRejected(error)) {
        toast.error(t("common.txRejected"));
        return;
      }
      toast.error((error as Error)?.message ?? t("common.failedGeneric"));
    }
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("erc6551.title")}</h1>
        <p>
          <a
            href="https://docs.tokenbound.org/contracts/deployments"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--w3-accent)" }}
          >
            {t("erc6551.tokenboundVersion")}
          </a>
        </p>
      </section>
      <section className="feature-panel">
        <h3>{t("erc6551.title")}</h3>
        <div className="feature-field">
          <label htmlFor="erc6551-contract">{t("common.contract")}</label>
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
          <label htmlFor="erc6551-tokenid">{t("common.tokenId")}</label>
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
        <div className="feature-actions feature-actions--inline">
          <button
            type="button"
            onClick={getTBAHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("erc6551.getTba")}
          </button>
          <button
            type="button"
            onClick={createHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount || created === true}
          >
            {t("erc6551.createTba")}
          </button>
        </div>
        {tbAccount != null && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <span className="feature-field-hint">
              {t("erc6551.tbAccount")}{" "}
            </span>
            <span style={{ fontFamily: "var(--w3-font-mono)" }}>
              {tbAccount}
            </span>
          </div>
        )}
        {created != null && (
          <div className="feature-field">
            <span className="feature-field-hint">{t("erc6551.created")} </span>
            <span>{String(created).toUpperCase()}</span>
          </div>
        )}
        {txHash && hashURL && (
          <div className="feature-tx-link" style={{ marginTop: 12 }}>
            <p>{t("common.tx")}</p>
            <a href={hashURL} target="_blank" rel="noopener noreferrer">
              {txHash}
            </a>
          </div>
        )}
      </section>
      {srcIframe != null && (
        <section className="feature-panel">
          <h3>{t("erc6551.tokenbound")}</h3>
          <iframe
            style={{
              width: "100%",
              maxWidth: 600,
              height: 600,
              border: "1px solid var(--w3-border)",
              borderRadius: "var(--w3-radius-sm)"
            }}
            src={srcIframe}
            title={t("erc6551.tokenbound")}
          />
        </section>
      )}
    </div>
  );
};

export default ERC6551Page;
