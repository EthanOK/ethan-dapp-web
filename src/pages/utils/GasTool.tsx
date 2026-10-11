import { useEffect, useState } from "react";
import { formatEther, parseUnits } from "ethers";
import { useI18n } from "@/i18n";
import ResultBlock from "@/pages/utils/ResultBlock";
import { getPriceBaseUSDTByBinance } from "@/services/GetData";

export default function GasTool() {
  const { t } = useI18n();
  const [gasUsed, setGasUsed] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [txFee, setTxFee] = useState("");
  const [etherPrice, setEtherPrice] = useState(0);

  useEffect(() => {
    let active = true;
    getPriceBaseUSDTByBinance()
      .then((result) => {
        if (active && result.code === 200 && result.data?.ethPrice) {
          setEtherPrice(Number(result.data.ethPrice));
        }
      })
      .catch(() => {
        /* the fee still renders, just without the USD estimate */
      });
    return () => {
      active = false;
    };
  }, []);

  const calculate = () => {
    try {
      const price = parseUnits(gasPrice.trim() || "0", "gwei");
      setTxFee(formatEther(BigInt(gasUsed.trim() || "0") * price));
    } catch {
      setTxFee("");
    }
  };

  const usd =
    txFee && etherPrice ? (parseFloat(txFee) * etherPrice).toFixed(4) : "—";

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("utils.gasSection")}</h1>
        <p>{t("utils.gasDesc")}</p>
      </section>

      <section className="feature-panel">
        <div className="feature-field">
          <label htmlFor="gasUsed">{t("utils.gasUsed")}</label>
          <input
            id="gasUsed"
            type="text"
            value={gasUsed}
            onChange={(event) => setGasUsed(event.target.value)}
            placeholder="158170"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="gasPrice">{t("utils.gasPrice")}</label>
          <input
            id="gasPrice"
            type="text"
            value={gasPrice}
            onChange={(event) => setGasPrice(event.target.value)}
            placeholder="1.5"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={calculate}
            className="cta-button mint-nft-button"
          >
            {t("utils.calculateTxFee")}
          </button>
        </div>
        <ResultBlock
          value={
            txFee
              ? `${txFee} ${t("utils.ether")} · ${usd} ${t("utils.usd")}`
              : ""
          }
        />
      </section>
    </div>
  );
}
