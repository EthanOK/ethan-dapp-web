import { useEffect, useState } from "react";
import { stringifyJson } from "@/lib/shared/Format";
import { isAddress, stringToArray } from "@/lib/shared/Utils";
import { getOrderHashSignatureOpenSea } from "@/services/GetData";
import {
  fulfillBasicOrder,
  fulfillOrder,
  fulfillBasicOrder_efficient,
  fulfillAvailableAdvancedOrders,
  fulfillAvailableOrders
} from "@/lib/nft/OpenseaFunc";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";

const BuyNFTPage = () => {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
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
    if (isMounted) configData();
  }, [isMounted]);

  const configData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const getOrderHashAndSignatureHandler = async () => {
    const contractInput = document.getElementById(
      "contract"
    ) as HTMLTextAreaElement | null;
    const tokenIdInput = document.getElementById(
      "tokenId"
    ) as HTMLTextAreaElement | null;
    if (!contractInput || !tokenIdInput) return;
    const contractValue = contractInput.value;
    const tokenIdValue = tokenIdInput.value;
    const res =
      contractValue.length === 44 && contractValue.startsWith("[")
        ? isAddress(JSON.parse(contractValue) as string)
        : isAddress(contractValue);
    if (!res) {
      alert(t("buyNft.invalidAddress"));
      return;
    }
    const chainId = localStorage.getItem("chainId");
    const result = (await getOrderHashSignatureOpenSea(
      chainId ?? "",
      contractValue,
      tokenIdValue
    )) as { code?: number; message?: string; data?: unknown };
    if (result.code !== 200) {
      alert(result.message);
      return;
    }
    setMessage(stringifyJson(result.data, "\t"));
  };

  const runFulfill = async (
    fn: (a: string, b: string, c: string) => Promise<unknown>
  ) => {
    const contractEl = document.getElementById(
      "contract"
    ) as HTMLTextAreaElement | null;
    const tokenIdEl = document.getElementById(
      "tokenId"
    ) as HTMLTextAreaElement | null;
    if (!contractEl || !tokenIdEl) return;
    if (!currentAccount) {
      alert(t("buyNft.connectWallet"));
      return;
    }
    const contractValue = contractEl.value;
    const tokenIdValue = tokenIdEl.value;
    const res =
      contractValue.length === 44 && contractValue.startsWith("[")
        ? isAddress(JSON.parse(contractValue) as string)
        : isAddress(contractValue);
    if (!res) {
      alert(t("buyNft.invalidAddress"));
      return;
    }
    try {
      const result = (await fn(contractValue, tokenIdValue, currentAccount)) as
        | [string | null, { wait?: () => Promise<{ status: number }> }?]
        | undefined;
      const message_ = result?.[0];
      const tx = result?.[1];
      if (message_ != null) setMessage(message_);
      if (tx?.wait) {
        const rsult = await tx.wait();
        if (rsult?.status === 1) console.log("Success!");
        else console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
      alert(String(error));
    }
  };

  const fulfillBasicOrderHandler = () => runFulfill(fulfillBasicOrder);
  const fulfillOrderHandler = () => runFulfill(fulfillOrder);
  const fulfillBasicOrder_efficientHandler = () =>
    runFulfill(fulfillBasicOrder_efficient);

  const runFulfillMultiple = async (
    fn: (a: string[], b: string[], c: string) => Promise<unknown>
  ) => {
    const contractsEl = document.getElementById(
      "contracts"
    ) as HTMLTextAreaElement | null;
    const tokenIdsEl = document.getElementById(
      "tokenIds"
    ) as HTMLTextAreaElement | null;
    if (!contractsEl || !tokenIdsEl) return;
    if (!currentAccount) {
      alert(t("buyNft.connectWallet"));
      return;
    }
    const contractsValue = stringToArray(contractsEl.value);
    const tokenIdsValue = stringToArray(tokenIdsEl.value);
    try {
      const result = (await fn(
        contractsValue,
        tokenIdsValue,
        currentAccount
      )) as
        | [string | null, { wait?: () => Promise<{ status: number }> }?]
        | undefined;
      const message_ = result?.[0];
      const tx = result?.[1];
      if (message_ != null) setMessage(message_);
      if (tx?.wait) {
        const rsult = await tx.wait();
        if (rsult?.status === 1) console.log("Success!");
        else console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fulfillAvailableOrdersHandler = () =>
    runFulfillMultiple(fulfillAvailableOrders);
  const fulfillAvailableAdvancedOrdersHandler = () =>
    runFulfillMultiple(fulfillAvailableAdvancedOrders);

  return (
    <center>
      <div>
        <h2>{t("buyNft.title")}</h2>
        <div className="bordered-div">
          <h4>{t("buyNft.buyOne")}</h4>
          <div className="container">
            <div className="input-container">
              <label className="label" htmlFor="contract">
                {t("buyNft.contractLabel")}
              </label>
              <textarea
                className="textarea"
                id="contract"
                placeholder="0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b"
              />
            </div>
            <div className="input-container">
              <label className="label" htmlFor="tokenId">
                {t("buyNft.tokenIdLabel")}
              </label>
              <textarea className="textarea" id="tokenId" placeholder="100" />
            </div>
          </div>
          <p />
          <button
            onClick={fulfillBasicOrderHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("buyNft.fulfillBasicOrder")}
          </button>
          <p />
          <button
            onClick={fulfillOrderHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("buyNft.fulfillOrder")}
          </button>
          <p />
          <button
            onClick={fulfillBasicOrder_efficientHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("buyNft.fulfillBasicEfficient")}
          </button>
        </div>
        <div className="bordered-div">
          <h4>{t("buyNft.buyMultiple")}</h4>
          <div className="container">
            <div className="input-container">
              <label className="label" htmlFor="contracts">
                {t("buyNft.contractsLabel")}
              </label>
              <textarea
                className="textarea"
                id="contracts"
                placeholder="[0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b,0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b]"
                style={{ height: "100px", width: "400px" }}
              />
            </div>
            <div className="input-container">
              <label className="label" htmlFor="tokenIds">
                {t("buyNft.tokenIdsLabel")}
              </label>
              <textarea
                className="textarea"
                id="tokenIds"
                placeholder="[100,101]"
                style={{ height: "100px", width: "400px" }}
              />
            </div>
          </div>
          <p />
          <button
            onClick={fulfillAvailableOrdersHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("buyNft.fulfillAvailableOrders")}
          </button>
          <p />
          <button
            onClick={fulfillAvailableAdvancedOrdersHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("buyNft.fulfillAvailableAdvanced")}
          </button>
        </div>
      </div>
      <div>
        <h2>
          {t("buyNft.pleaseSee")}
          <p />
          <textarea
            value={message}
            readOnly
            style={{ width: "1200px", height: "100px" }}
          />
        </h2>
      </div>
    </center>
  );
};

export default BuyNFTPage;
