import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import ResultBlock from "@/pages/utils/ResultBlock";
import { getTokenPrice } from "@/lib/price/GetLpTokenPrice";
import { caculatePriceBySqrtPriceX96 } from "@/lib/shared/Utils";

/**
 * Two ways of getting at a price: pricing a Uniswap V2 / PancakeSwap V2 LP
 * token from its pair, and decoding a Uniswap V3 `sqrtPriceX96`. They answer
 * the same question for different pool versions, so they share one panel and
 * a segmented control picks which one is showing — V2 first, matching the
 * order the page title promises.
 */
type PriceTab = "lp" | "sqrt";

export default function PriceTool() {
  const { t } = useI18n();

  const [tab, setTab] = useState<PriceTab>("lp");

  const [sqrtPriceX96, setSqrtPriceX96] = useState("");
  const [sqrtResult, setSqrtResult] = useState<string | null>(null);

  const [chainId, setChainId] = useState("1");
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [lpPrice, setLpPrice] = useState<string | null>(null);

  const getSqrtPrice = () => {
    setSqrtResult(caculatePriceBySqrtPriceX96(sqrtPriceX96.trim()));
  };

  const getLpPrice = async () => {
    try {
      const pairPrice = await getTokenPrice(
        chainId,
        token0.trim(),
        token1.trim()
      );
      // The helper reports failure as the string "error"; say so instead of
      // putting that word in the result frame.
      if (
        pairPrice === null ||
        pairPrice === undefined ||
        pairPrice === "error"
      ) {
        setLpPrice(null);
        toast.error(t("common.invalidArgument"));
        return;
      }
      setLpPrice(pairPrice);
    } catch {
      setLpPrice(null);
      toast.error(t("common.invalidArgument"));
    }
  };

  // The helper returns "y per x or x per y" — the first rate leads, the
  // reverse one sits underneath it.
  const [sqrtMain, sqrtReverse] = (sqrtResult ?? "").split(" or ");

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>{t("utils.priceSection")}</h1>
        <p>{t("utils.priceDesc")}</p>
      </section>

      <div className="segmented-wrap">
        <div
          className="segmented"
          role="tablist"
          aria-label={t("utils.priceSection")}
        >
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "lp"}
            onClick={() => setTab("lp")}
          >
            {t("utils.lpSection")}
          </button>
          <button
            type="button"
            role="tab"
            className="segmented-item"
            aria-selected={tab === "sqrt"}
            onClick={() => setTab("sqrt")}
          >
            {t("utils.sqrtPriceSection")}
          </button>
        </div>
      </div>

      {tab === "lp" ? (
        <section className="feature-panel">
          <p className="feature-field-hint">{t("utils.lpHint")}</p>
          <div className="field-row">
            <label htmlFor="utils-platform">{t("common.platform")}</label>
            <select
              id="utils-platform"
              value={chainId}
              onChange={(event) => setChainId(event.target.value)}
            >
              <option value="1">{t("utils.uniswapEth")}</option>
              <option value="56">{t("utils.pancakeBsc")}</option>
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="token0">{t("utils.token0")}</label>
            <input
              id="token0"
              type="text"
              value={token0}
              onChange={(event) => setToken0(event.target.value)}
              placeholder="0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
            />
          </div>
          <div className="field-row">
            <label htmlFor="token1">{t("utils.token1")}</label>
            <input
              id="token1"
              type="text"
              value={token1}
              onChange={(event) => setToken1(event.target.value)}
              placeholder="0xdAC17F958D2ee523a2206206994597C13D831ec7"
            />
          </div>
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={getLpPrice}
              className="cta-button mint-nft-button"
            >
              {t("utils.getPrice")}
            </button>
          </div>
          <ResultBlock value={lpPrice ?? ""} emphasis />
        </section>
      ) : (
        <section className="feature-panel">
          <p className="feature-field-hint">{t("utils.sqrtPriceHint")}</p>
          <div className="field-row">
            <label htmlFor="sqrtPriceX96">{t("utils.sqrtPriceX96")}</label>
            <input
              id="sqrtPriceX96"
              type="text"
              value={sqrtPriceX96}
              onChange={(event) => setSqrtPriceX96(event.target.value)}
              placeholder="5379665721256550655574226248"
            />
          </div>
          <div className="feature-actions feature-actions--end">
            <button
              type="button"
              onClick={getSqrtPrice}
              className="cta-button mint-nft-button"
            >
              {t("utils.getPrice")}
            </button>
          </div>
          <ResultBlock
            value={sqrtMain ?? ""}
            sub={sqrtReverse ? `or ${sqrtReverse}` : undefined}
            emphasis
          />
        </section>
      )}
    </div>
  );
}
