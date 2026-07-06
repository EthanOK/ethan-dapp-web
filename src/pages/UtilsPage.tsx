import {
  Contract,
  Interface,
  concat,
  formatEther,
  formatUnits,
  hexlify,
  parseUnits,
  toUtf8Bytes,
  Wallet,
  type TransactionResponse
} from "ethers";
import { useEffect, useState } from "react";
import { getPriceBaseUSDTByBinance } from "@/services/GetData";
import {
  caculatePriceBySqrtPriceX96,
  getAddressCreate,
  isAddress
} from "@/lib/shared/Utils";
import { getTokenPrice } from "@/lib/price/GetLpTokenPrice";
import { signHexDataMessage } from "@/lib/signing/SignFunc";
import { getSigner } from "@/lib/wallet/GetProvider";
import { useEvmWallet } from "@/hooks";
import { useI18n } from "@/i18n";

const UtilsPage = () => {
  const { t } = useI18n();
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [signatureHex, setSignatureHex] = useState("");
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [message3, setMessage3] = useState("");
  const [message4, setMessage4] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [transactionFee, setTransactionFee] = useState("");
  const [etherPrice, setEtherPrice] = useState<string | number>(0);
  const [tokenPrice, setTokenPrice] = useState<string | null>(null);
  const [contractCreate, setContractCreate] = useState<string | null>(null);
  const [lpTokenPrice, setLpTokenPrice] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState("1");

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
    try {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
      const result = await getPriceBaseUSDTByBinance();
      if (result.code === 200 && result.data?.ethPrice) {
        setEtherPrice(result.data.ethPrice);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getPriceHandler = async () => {
    const sqrtPriceX96Input = document.getElementById(
      "sqrtPriceX96"
    ) as HTMLInputElement | null;
    if (!sqrtPriceX96Input) return;
    const price = caculatePriceBySqrtPriceX96(sqrtPriceX96Input.value);
    setTokenPrice(price);
  };

  const getAddressByCreatHandler = async () => {
    const accountInput = document.getElementById(
      "account_create"
    ) as HTMLInputElement | null;
    const nonceInput = document.getElementById(
      "nonce_create"
    ) as HTMLInputElement | null;
    if (!accountInput || !nonceInput) return;
    const accountValue = accountInput.value;
    const nonceValue = nonceInput.value;
    if (isAddress(accountValue)) {
      const address_ = getAddressCreate(
        accountValue,
        parseInt(nonceValue, 10) || 0
      );
      setContractCreate(address_);
    }
  };

  const getTokenPriceHandler = async () => {
    const token0Input = document.getElementById(
      "token0"
    ) as HTMLInputElement | null;
    const token1Input = document.getElementById(
      "token1"
    ) as HTMLInputElement | null;
    if (!token0Input || !token1Input) return;
    try {
      const pairPrice = await getTokenPrice(
        selectedValue,
        token0Input.value,
        token1Input.value
      );
      setLpTokenPrice(String(pairPrice ?? ""));
    } catch (error) {
      console.log(error);
    }
  };

  const getIPFSURLHandler = async () => {
    const contractInput = document.getElementById(
      "cid"
    ) as HTMLTextAreaElement | null;
    if (!contractInput) return;
    const contractValue = contractInput.value;
    setMessage("https://ipfs.io/ipfs/" + contractValue);
    setMessage1("https://gateway.pinata.cloud/ipfs/" + contractValue);
    setMessage2("https://cloudflare-ipfs.com/ipfs/" + contractValue);
    setMessage3("https://dweb.link/ipfs/" + contractValue);
    setMessage4("https://ipfs.filebase.io/ipfs/" + contractValue);
  };

  const getSignatureHandler = async () => {
    const contractInput = document.getElementById(
      "hexData"
    ) as HTMLTextAreaElement | null;
    if (!contractInput) return;
    const signer = await getSigner();
    if (!signer) return;
    try {
      const signatureHex_ = await signHexDataMessage(
        signer,
        contractInput.value
      );
      setSignatureHex(signatureHex_ ?? "");
    } catch {
      alert(t("common.invalidArgument"));
    }
  };

  const calculateTxFeeHandler = async () => {
    const gasUsedInput = document.getElementById(
      "gasUsed"
    ) as HTMLInputElement | null;
    const gasPriceInput = document.getElementById(
      "gasPrice"
    ) as HTMLInputElement | null;
    if (!gasUsedInput || !gasPriceInput) return;
    const gasPrice = parseUnits(gasPriceInput.value || "0", "gwei");
    const txFee = BigInt(gasUsedInput.value || "0") * gasPrice;
    setTransactionFee(formatEther(txFee));
  };

  const handleChangeValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("utils.title")}</h1>
        <p>{t("utils.subtitle")}</p>
      </section>

      <section className="feature-panel">
        <h3>{t("utils.signHex")}</h3>
        <div className="feature-field">
          <label htmlFor="hexData">{t("utils.hexData")}</label>
          <textarea
            id="hexData"
            placeholder="0xc0e8f831a90406f3a15e808f3f1ec26ea4bc214cfb986cdb4b0623b22bbf8ed3"
            rows={2}
          />
        </div>
        <div className="feature-actions">
          <button
            onClick={getSignatureHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            {t("utils.signButton")}
          </button>
        </div>
        <div className="feature-field">
          <label>{t("common.signature")}</label>
          <textarea value={signatureHex} readOnly rows={3} />
        </div>
      </section>

      <section className="feature-panel">
        <h3>{t("utils.ipfsSection")}</h3>
        <div className="feature-field">
          <label htmlFor="cid">{t("ipfs.cid")}</label>
          <textarea
            id="cid"
            placeholder="QmSFZ84W8uNjoZJMkGkVDuJR5PBNtsHorDBmcHCjzACdXY"
            rows={2}
          />
        </div>
        <div className="feature-actions">
          <button
            onClick={getIPFSURLHandler}
            className="cta-button mint-nft-button"
          >
            {t("utils.getIpfsUrl")}
          </button>
        </div>
        {(message || message1) && (
          <div className="feature-tx-link" style={{ marginTop: 16 }}>
            <p>{t("common.gateways")}</p>
            {message && (
              <a href={message} target="_blank" rel="noopener noreferrer">
                {message.substring(0, message.lastIndexOf("/") + 2)}
              </a>
            )}
            {message1 && (
              <>
                <br />
                <a href={message1} target="_blank" rel="noopener noreferrer">
                  {message1.substring(0, message1.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
            {message2 && (
              <>
                <br />
                <a href={message2} target="_blank" rel="noopener noreferrer">
                  {message2.substring(0, message2.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
            {message3 && (
              <>
                <br />
                <a href={message3} target="_blank" rel="noopener noreferrer">
                  {message3.substring(0, message3.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
            {message4 && (
              <>
                <br />
                <a href={message4} target="_blank" rel="noopener noreferrer">
                  {message4.substring(0, message4.lastIndexOf("/") + 2)}
                </a>
              </>
            )}
          </div>
        )}
      </section>

      <section className="feature-panel">
        <h3>{t("utils.gasSection")}</h3>
        <div className="feature-field">
          <label htmlFor="gasUsed">{t("utils.gasUsed")}</label>
          <input id="gasUsed" type="text" placeholder="158170" />
        </div>
        <div className="feature-field">
          <label htmlFor="gasPrice">{t("utils.gasPrice")}</label>
          <input id="gasPrice" type="text" placeholder="1.5" />
        </div>
        <div className="feature-actions">
          <button
            onClick={calculateTxFeeHandler}
            className="cta-button mint-nft-button"
          >
            {t("utils.calculateTxFee")}
          </button>
        </div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          {t("utils.txFee")}{" "}
          <strong style={{ color: "var(--w3-text)" }}>{transactionFee}</strong>{" "}
          {t("utils.ether")}
          {" · "}
          {etherPrice
            ? (
                parseFloat(transactionFee || "0") *
                parseFloat(String(etherPrice))
              ).toFixed(4)
            : "—"}{" "}
          {t("utils.usd")}
        </p>
      </section>

      <section className="feature-panel">
        <h3>{t("utils.sqrtPriceSection")}</h3>
        <div className="feature-field">
          <label htmlFor="sqrtPriceX96">{t("utils.sqrtPriceX96")}</label>
          <input
            id="sqrtPriceX96"
            type="text"
            placeholder="5379665721256550655574226248"
          />
        </div>
        <div className="feature-actions">
          <button
            onClick={getPriceHandler}
            className="cta-button mint-nft-button"
          >
            {t("utils.getPrice")}
          </button>
        </div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          {t("common.price")}:{" "}
          <strong style={{ color: "var(--w3-text)" }}>
            {tokenPrice ?? "—"}
          </strong>
        </p>
      </section>

      <section className="feature-panel">
        <h3>{t("utils.lpSection")}</h3>
        <div className="feature-field">
          <label htmlFor="utils-platform">{t("common.platform")}</label>
          <select
            id="utils-platform"
            value={selectedValue}
            onChange={handleChangeValue}
          >
            <option value="1">{t("utils.uniswapEth")}</option>
            <option value="56">{t("utils.pancakeBsc")}</option>
          </select>
        </div>
        <div className="feature-field">
          <label htmlFor="token0">{t("utils.token0")}</label>
          <input
            id="token0"
            type="text"
            placeholder="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="token1">{t("utils.token1")}</label>
          <input
            id="token1"
            type="text"
            placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7"
          />
        </div>
        <div className="feature-actions">
          <button
            onClick={getTokenPriceHandler}
            className="cta-button mint-nft-button"
          >
            {t("utils.getTokenPrice")}
          </button>
        </div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          {t("utils.lpPrice")}{" "}
          <strong style={{ color: "var(--w3-text)" }}>
            {lpTokenPrice ?? "—"}
          </strong>
        </p>
      </section>

      <section className="feature-panel">
        <h3>{t("utils.contractSection")}</h3>
        <div className="feature-field">
          <label htmlFor="account_create">{t("common.account")}</label>
          <input
            id="account_create"
            type="text"
            placeholder="0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="nonce_create">{t("utils.nonce")}</label>
          <input id="nonce_create" type="text" placeholder="11" />
        </div>
        <div className="feature-actions">
          <button
            onClick={getAddressByCreatHandler}
            className="cta-button mint-nft-button"
          >
            {t("utils.getContractAddress")}
          </button>
        </div>
        <p style={{ color: "var(--w3-text-muted)", marginTop: 12 }}>
          {t("utils.contractAddress")}{" "}
          <strong
            style={{
              color: "var(--w3-text)",
              fontFamily: "var(--w3-font-mono)"
            }}
          >
            {contractCreate ?? "—"}
          </strong>
        </p>
      </section>
    </div>
  );
};

export default UtilsPage;
