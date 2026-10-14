import { getAddress, isAddress } from "ethers";
import { ALCHEMY_KEY } from "@/config/SystemConfiguration";

/**
 * Alchemy network slug per chain id.
 *
 * Every entry was checked against the live endpoint: the slug resolves, reports
 * the chain id in the comment, and answers `alchemy_getTokenBalances`. That
 * last part is the real filter — Alchemy serves plain JSON-RPC on many more
 * chains than it serves this Enhanced API, and on the rest the call comes back
 * as "EAPIs not enabled on specified network", which turns into `null` here and
 * a silent fallback in the picker.
 *
 * Verified to exist but deliberately absent because the Enhanced API is off:
 * X Layer (196 / `xlayer-mainnet`), Hoodi (560048 / `eth-hoodi`), Mantle,
 * Sonic, Kaia, Sei, opBNB, Mode, Metis, Plasma, Astar.
 */
const ALCHEMY_NETWORK_BY_CHAIN: Record<number, string> = {
  // Ethereum
  1: "eth-mainnet",
  11155111: "eth-sepolia",
  // BNB Smart Chain
  56: "bnb-mainnet",
  97: "bnb-testnet",
  // Base
  8453: "base-mainnet",
  84532: "base-sepolia",
  // Polygon
  137: "polygon-mainnet",
  80002: "polygon-amoy",
  // Arbitrum
  42161: "arb-mainnet",
  421614: "arb-sepolia",
  // Optimism
  10: "opt-mainnet",
  11155420: "opt-sepolia",
  // zk rollups
  59144: "linea-mainnet",
  59141: "linea-sepolia",
  534352: "scroll-mainnet",
  324: "zksync-mainnet",
  300: "zksync-sepolia",
  // other L1s
  43114: "avax-mainnet",
  43113: "avax-fuji",
  42220: "celo-mainnet",
  100: "gnosis-mainnet",
  10200: "gnosis-chiado",
  81457: "blast-mainnet",
  168587887: "blast-sepolia",
  143: "monad-mainnet",
  10143: "monad-testnet",
  80094: "berachain-mainnet",
  // other L2s
  130: "unichain-mainnet",
  1301: "unichain-sepolia",
  2741: "abstract-mainnet",
  11124: "abstract-testnet",
  57073: "ink-mainnet",
  763373: "ink-sepolia",
  480: "worldchain-mainnet",
  4801: "worldchain-sepolia",
  360: "shape-mainnet",
  1868: "soneium-mainnet",
  7777777: "zora-mainnet",
  999: "hyperliquid-mainnet",
  2020: "ronin-mainnet",
  30: "rootstock-mainnet",
  232: "lens-mainnet"
};

/** `alchemy_getTokenBalances` categories: "erc20" | "erc721" | "DEFAULT_TOKENS". */
const TOKEN_CATEGORY = "erc20";

/**
 * How many contracts to name on chain. Matches one page of
 * `alchemy_getTokenBalances` (100 rows), so a single request covers every
 * contract Alchemy would have reported on the first page.
 */
const MAX_CANDIDATES = 100;

const REQUEST_TIMEOUT_MS = 10_000;

type AlchemyTokenBalanceRow = {
  contractAddress?: string;
};

type AlchemyTokenBalancesResult = {
  tokenBalances?: AlchemyTokenBalanceRow[];
};

function alchemyRpcUrl(chainId: number, key: string): string | null {
  const network = ALCHEMY_NETWORK_BY_CHAIN[chainId];
  if (!network) return null;
  return `https://${network}.g.alchemy.com/v2/${key}`;
}

/**
 * Contract addresses Alchemy reports for the account, in the order it returns
 * them, cut off at `maxCandidates`.
 *
 * Alchemy is the address book and nothing else: the address is the only field
 * taken from the response. No balance, no ordering by balance, no opinion about
 * which contracts are worth showing — the chain answers all of that in the
 * caller's single batched read. `null` means "could not ask" (no key,
 * unsupported chain, request failed) and the caller falls back to its own list.
 */
async function fetchErc20Candidates(
  url: string,
  owner: string,
  maxCandidates: number
): Promise<string[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res: Response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [owner, TOKEN_CATEGORY]
      }),
      signal: controller.signal
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      result?: AlchemyTokenBalancesResult;
      error?: { message?: string };
    };
    if (data.error || !data.result?.tokenBalances) return null;

    const addresses: string[] = [];
    for (const row of data.result.tokenBalances) {
      const contract = row.contractAddress;
      if (!contract || !isAddress(contract)) continue;
      addresses.push(getAddress(contract.toLowerCase()));
      if (addresses.length >= maxCandidates) break;
    }
    return addresses;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * ERC20 contract addresses the account may hold, for the picker to name and
 * price in its own batched read — nothing is read on chain here.
 *
 * `null` means "could not ask" so the caller keeps its built-in list; `[]`
 * means "asked, holds nothing".
 */
export async function discoverHeldErc20TokenAddresses(
  owner: string,
  chainId: number,
  opts: { maxCandidates?: number } = {}
): Promise<string[] | null> {
  const key = ALCHEMY_KEY?.trim();
  if (!key || !isAddress(owner)) return null;

  const url = alchemyRpcUrl(chainId, key);
  if (!url) return null;

  return fetchErc20Candidates(
    url,
    getAddress(owner.toLowerCase()),
    opts.maxCandidates ?? MAX_CANDIDATES
  );
}
