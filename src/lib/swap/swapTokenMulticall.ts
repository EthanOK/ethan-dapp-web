import { Interface, ZeroAddress, Contract } from "ethers";
import erc20ABI from "@/abis/evm/erc20ABI.json";
import {
  decodeMulticallResult,
  MULTICALL3_ADDRESS,
  multicall3Aggregate3StaticCall
} from "@/lib/evm/Multicall3";
import {
  getDefaultReadonlyProvider,
  getProvider
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

async function getReadProvider() {
  return (await getProvider()) ?? getDefaultReadonlyProvider();
}

async function fetchBalanceDirect(
  account: string,
  side: TokenSide
): Promise<bigint> {
  const provider = await getReadProvider();
  if (!provider) return 0n;
  if (side.tokenAddress.toLowerCase() === ZeroAddress.toLowerCase()) {
    return provider.getBalance(account);
  }
  const contract = new Contract(side.tokenAddress, erc20ABI, provider);
  return contract.balanceOf(account);
}

/** Batch ERC20 balanceOf via standard Multicall3; ETH via provider.getBalance. */
export async function fetchTokenBalancesMulticall(
  account: string,
  tokens: TokenSide[],
  multicallAddress: string = MULTICALL3_ADDRESS
): Promise<Record<string, bigint>> {
  const provider = await getReadProvider();
  if (!provider) return {};

  const results: Record<string, bigint> = {};
  const erc20Tokens = tokens.filter(
    (t) => t.tokenAddress.toLowerCase() !== ZeroAddress.toLowerCase()
  );
  const needsEth = tokens.some(
    (t) => t.tokenAddress.toLowerCase() === ZeroAddress.toLowerCase()
  );

  if (needsEth) {
    results[tokenBalanceKey(ZeroAddress)] = await provider.getBalance(account);
  }

  if (erc20Tokens.length === 0) return results;

  const calls = erc20Tokens.map((side) => ({
    target: side.tokenAddress,
    allowFailure: true,
    callData: erc20Iface.encodeFunctionData("balanceOf", [account])
  }));

  try {
    const res = await multicall3Aggregate3StaticCall(
      provider,
      calls,
      multicallAddress
    );

    erc20Tokens.forEach((side, i) => {
      const row = res[i];
      const bal = row?.success
        ? decodeMulticallResult<bigint>(erc20Iface, "balanceOf", row)
        : undefined;
      results[tokenBalanceKey(side.tokenAddress)] = bal ?? 0n;
    });
  } catch {
    const entries = await Promise.all(
      erc20Tokens.map(async (side) => {
        const bal = await fetchBalanceDirect(account, side);
        return [tokenBalanceKey(side.tokenAddress), bal] as const;
      })
    );
    for (const [key, bal] of entries) {
      results[key] = bal;
    }
  }

  return results;
}

/** Read ERC20 symbol / name / decimals in one Multicall3 round-trip. */
export async function resolveTokenMetaFromChain(
  address: string,
  multicallAddress: string = MULTICALL3_ADDRESS
): Promise<ResolvedTokenMeta | null> {
  const trimmed = address.trim();
  if (!isAddress(trimmed)) return null;

  if (trimmed.toLowerCase() === ZeroAddress.toLowerCase()) {
    return { symbol: "ETH", name: "Ethereum", decimals: 18 };
  }

  const provider = await getReadProvider();
  if (!provider) return null;

  const calls = [
    {
      target: trimmed,
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData("decimals", [])
    },
    {
      target: trimmed,
      allowFailure: true,
      callData: erc20Iface.encodeFunctionData("symbol", [])
    },
    {
      target: trimmed,
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
  multicallAddress: string = MULTICALL3_ADDRESS
): Promise<{ meta: ResolvedTokenMeta; balance: bigint } | null> {
  const meta = await resolveTokenMetaFromChain(address, multicallAddress);
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
      multicallAddress
    );
    balance = balances[tokenBalanceKey(address)] ?? 0n;
  }

  return { meta, balance };
}
