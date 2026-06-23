import { ERC20Helper, resolveBricMulticallAddress } from "@bric-labs/bric-sdk";
import { Interface, ZeroAddress, getAddress, type Provider } from "ethers";
import {
  decodeMulticallResult,
  MULTICALL3_ADDRESS,
  multicall3Aggregate3StaticCall
} from "@/lib/evm/Multicall3";
import {
  getDefaultReadonlyProvider,
  getProvider,
  getReadonlyProviderForChain
} from "@/lib/wallet/GetProvider";
import { isAddress } from "@/lib/shared/Utils";
import { tokenBalanceKey, type TokenSide } from "@/lib/swap/swapTokenRules";

export type ResolvedTokenMeta = {
  symbol: string;
  name: string;
  decimals: number;
};

const ERC20_READ_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)"
];

const erc20Iface = new Interface(ERC20_READ_ABI);

/** Accept any valid hex address; ethers rejects mixed-case with wrong checksum. */
function normalizeEvmAddress(address: string): string {
  return getAddress(address.toLowerCase());
}

function toBricBalanceTokenAddress(address: string): string {
  return address.toLowerCase() === ZeroAddress.toLowerCase()
    ? ZeroAddress
    : normalizeEvmAddress(address);
}

function resolveBricMulticallForBalances(
  chainId?: number,
  multicallAddress?: string
): string {
  if (multicallAddress) return multicallAddress;
  if (chainId != null) return resolveBricMulticallAddress(chainId);
  return MULTICALL3_ADDRESS;
}

async function resolveReadProvider(chainId?: number): Promise<Provider | null> {
  if (chainId != null) {
    const chainProvider = getReadonlyProviderForChain(chainId);
    if (chainProvider) return chainProvider;
  }
  return (await getProvider()) ?? getDefaultReadonlyProvider();
}

async function fetchBalanceViaBricMulticall(
  account: string,
  side: TokenSide,
  provider: Provider,
  multicallAddress: string
): Promise<bigint> {
  const erc20Helper = new ERC20Helper(provider, multicallAddress, false);
  return erc20Helper.balanceOf(
    toBricBalanceTokenAddress(side.tokenAddress),
    normalizeEvmAddress(account)
  );
}

const inflightBalanceFetches = new Map<
  string,
  Promise<Record<string, bigint>>
>();

function buildBalanceFetchKey(
  account: string,
  chainId: number | undefined,
  tokens: TokenSide[]
): string {
  const addresses = tokens
    .map((side) => tokenBalanceKey(side.tokenAddress))
    .sort()
    .join(",");
  return `${chainId ?? "unknown"}:${normalizeEvmAddress(account)}:${addresses}`;
}

async function fetchTokenBalancesMulticallInternal(
  account: string,
  tokens: TokenSide[],
  chainId?: number,
  multicallAddress?: string
): Promise<Record<string, bigint>> {
  if (tokens.length === 0) return {};

  const provider = await resolveReadProvider(chainId);
  if (!provider) return {};

  const normalizedAccount = normalizeEvmAddress(account);
  const bricMulticall = resolveBricMulticallForBalances(
    chainId,
    multicallAddress
  );
  const tokenAddresses = tokens.map((side) =>
    toBricBalanceTokenAddress(side.tokenAddress)
  );

  try {
    const erc20Helper = new ERC20Helper(provider, bricMulticall, false);
    const rows = await erc20Helper.batchBalances(
      tokenAddresses,
      normalizedAccount
    );
    const results: Record<string, bigint> = {};
    rows.forEach((row, index) => {
      const side = tokens[index];
      results[tokenBalanceKey(side.tokenAddress)] = row.balance ?? 0n;
    });
    return results;
  } catch {
    const entries = await Promise.all(
      tokens.map(async (side) => {
        const bal = await fetchBalanceViaBricMulticall(
          account,
          side,
          provider,
          bricMulticall
        );
        return [tokenBalanceKey(side.tokenAddress), bal] as const;
      })
    );
    const results: Record<string, bigint> = {};
    for (const [key, bal] of entries) {
      results[key] = bal;
    }
    return results;
  }
}

/**
 * Batch token balances via BricMulticall / Multicall3.
 * Native ETH/BNB uses Multicall3 `getEthBalance` inside the same batch (not `eth_getBalance`).
 */
export async function fetchTokenBalancesMulticall(
  account: string,
  tokens: TokenSide[],
  chainId?: number,
  multicallAddress?: string
): Promise<Record<string, bigint>> {
  const key = buildBalanceFetchKey(account, chainId, tokens);
  const inflight = inflightBalanceFetches.get(key);
  if (inflight) return inflight;

  const task = fetchTokenBalancesMulticallInternal(
    account,
    tokens,
    chainId,
    multicallAddress
  ).finally(() => {
    if (inflightBalanceFetches.get(key) === task) {
      inflightBalanceFetches.delete(key);
    }
  });
  inflightBalanceFetches.set(key, task);
  return task;
}

/** Read ERC20 symbol / name / decimals in one Multicall3 round-trip. */
export async function resolveTokenMetaFromChain(
  address: string,
  chainId?: number,
  multicallAddress: string = MULTICALL3_ADDRESS
): Promise<ResolvedTokenMeta | null> {
  const trimmed = address.trim();
  if (!isAddress(trimmed)) return null;

  const tokenAddress = normalizeEvmAddress(trimmed);

  if (tokenAddress.toLowerCase() === ZeroAddress.toLowerCase()) {
    return { symbol: "ETH", name: "Ethereum", decimals: 18 };
  }

  const provider = await resolveReadProvider(chainId);
  if (!provider) return null;

  const calls = [
    {
      target: tokenAddress,
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData("decimals", [])
    },
    {
      target: tokenAddress,
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData("symbol", [])
    },
    {
      target: tokenAddress,
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData("name", [])
    }
  ];

  try {
    const res = await multicall3Aggregate3StaticCall(
      provider,
      calls,
      multicallAddress
    );

    const decimalsRaw = decodeMulticallResult<number>(
      erc20Iface,
      "decimals",
      res[0]
    );
    const symbolRaw = decodeMulticallResult<string>(
      erc20Iface,
      "symbol",
      res[1]
    );

    if (!symbolRaw) return null;

    const nameRaw = decodeMulticallResult<string>(erc20Iface, "name", res[2]);
    const symbol = String(symbolRaw);
    const name = String(nameRaw ?? "").trim() || symbol;

    return {
      symbol,
      name,
      decimals: Number.isFinite(Number(decimalsRaw)) ? Number(decimalsRaw) : 18
    };
  } catch {
    return null;
  }
}

/** Meta + balance for a single custom address (picker address search). */
export async function resolveTokenFromAddressMulticall(
  address: string,
  account?: string,
  chainId?: number,
  multicallAddress?: string
): Promise<{ meta: ResolvedTokenMeta; balance: bigint } | null> {
  const meta = await resolveTokenMetaFromChain(address, chainId);
  if (!meta) return null;

  let balance = 0n;
  if (account && isAddress(account)) {
    const side: TokenSide = {
      kind: "custom",
      key: address.toLowerCase(),
      tokenAddress: address,
      symbol: meta.symbol,
      decimals: meta.decimals,
      name: meta.name
    };
    const balances = await fetchTokenBalancesMulticall(
      account,
      [side],
      chainId,
      multicallAddress
    );
    balance = balances[tokenBalanceKey(address)] ?? 0n;
  }

  return { meta, balance };
}
