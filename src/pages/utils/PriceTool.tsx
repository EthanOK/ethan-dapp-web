import { useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import ResultBlock from "@/pages/utils/ResultBlock";
import { getTokenPrice, type TokenPrice } from "@/lib/price/GetLpTokenPrice";
import { caculatePriceBySqrtPriceX96 } from "@/lib/shared/Utils";
import { SupportChains } from "@/config/ChainsConfig";

/**
 * Two ways of getting at a price: pricing a Uniswap V2 / PancakeSwap V2 LP
 * token from its pair, and decoding a Uniswap V3 `sqrtPriceX96`. They answer
 * the same question for different pool versions, so they share one panel and
 * a segmented control picks which one is showing — V2 first, matching the
 * order the page title promises.
 */
type PriceTab = "lp" | "sqrt";

/**
 * Each chain here has a V2 router wired up in the price helper, so picking a
 * chain is all the user has to tell us — the router follows from it.
 */
const V2_CHAIN_IDS = ["1", "56", "8453"];

const v2Chains = SupportChains.filter((chain) =>
  V2_CHAIN_IDS.includes(chain.id)
);

/**
 * What the pair fields start with: the wrapped native token priced in the
 * chain's USDT. Every chain in the picker has an entry here, so switching
 * chains never leaves an address behind that belongs to the previous one.
 */
const DEFAULT_PAIRS: Record<string, { token0: string; token1: string }> = {
  "1": {
    token0: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    token1: "0xdAC17F958D2ee523a2206206994597C13D831ec7" // USDT
  },
  "56": {
    token0: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
    token1: "0x55d398326f99059fF775485246999027B3197955" // USDT
  },
  "8453": {
    token0: "0x4200000000000000000000000000000000000006", // WETH
    token1: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" // USDC
  }
};

export default function PriceTool() {
  const { t } = useI18n();

  const [tab, setTab] = useState<PriceTab>("lp");

  const [sqrtPriceX96, setSqrtPriceX96] = useState("");
  const [sqrtResult, setSqrtResult] = useState<string | null>(null);

  const [chainId, setChainId] = useState("1");
  const [token0, setToken0] = useState(DEFAULT_PAIRS["1"].token0);
  const [token1, setToken1] = useState(DEFAULT_PAIRS["1"].token1);
  const [lpPrice, setLpPrice] = useState<TokenPrice | null>(null);
  // Which way round the rate is shown. The helper hands back both directions,
  // so flipping is a local re-render instead of another request.
  const [lpFlipped, setLpFlipped] = useState(false);

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
      // The helper reports failure as null; say so instead of putting the
      // word "error" in the result frame.
      if (!pairPrice) {
        setLpPrice(null);
        toast.error(t("common.invalidArgument"));
        return;
      }
      setLpPrice(pairPrice);
      // A freshly calculated pair starts from its own natural direction.
      setLpFlipped(false);
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
            <label htmlFor="utils-chain">{t("common.chain")}</label>
            <select
              id="utils-chain"
              value={chainId}
              onChange={(event) => {
                const nextChain = event.target.value;
                setChainId(nextChain);
                const pair = DEFAULT_PAIRS[nextChain];
                if (pair) {
                  setToken0(pair.token0);
                  setToken1(pair.token1);
                }
              }}
              aria-label={t("common.selectChain")}
            >
              {v2Chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label htmlFor="token0">{t("utils.token0")}</label>
            <input
              id="token0"
              type="text"
              value={token0}
              onChange={(event) => setToken0(event.target.value)}
              placeholder={DEFAULT_PAIRS[chainId]?.token0}
            />
          </div>
          <div className="field-row">
            <label htmlFor="token1">{t("utils.token1")}</label>
            <input
              id="token1"
              type="text"
              value={token1}
              onChange={(event) => setToken1(event.target.value)}
              placeholder={DEFAULT_PAIRS[chainId]?.token1}
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
          <ResultBlock
            value={
              lpPrice ? (lpFlipped ? lpPrice.reversePrice : lpPrice.price) : ""
            }
            onToggle={
              lpPrice ? () => setLpFlipped((previous) => !previous) : undefined
            }
            toggleTitle={t("utils.flipRate")}
            emphasis
          />
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
