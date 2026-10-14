import { getAddress, Interface, isAddress, ZeroAddress } from "ethers";
import {
  decodeMulticallResult,
  MULTICALL3_ADDRESS,
  multicall3Aggregate3StaticCall,
  type Multicall3Call
} from "@/lib/evm/Multicall3";
import {
  getDefaultReadonlyProvider,
  getReadonlyProviderForChain
} from "@/lib/wallet/GetProvider";

/**
 * `getEthBalance` belongs to the Multicall3 contract itself, which is why the
 * native coin can ride along in the same call as the ERC20s. Checked against
 * `eth_getBalance` on mainnet and Sepolia, and the canonical Multicall3 is
 * deployed on every chain the app supports (3809 bytes, same contract address).
 */
const READ_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function getEthBalance(address addr) view returns (uint256)"
];

const readIface = new Interface(READ_ABI);

export type PickerTokenRead = {
  /** Lowercase address → balance. `ZeroAddress` holds the native coin. */
  balances: Record<string, bigint>;
  /** Lowercase address → symbol / decimals, for the addresses that asked. */
  metas: Record<string, { symbol: string; decimals: number }>;
};

type ReadSlot =
  | { kind: "native"; at: number }
  | { kind: "balance"; key: string; at: number }
  | { kind: "meta"; key: string; symbolAt: number; decimalsAt: number };

/**
 * Everything the token picker shows, from a single Multicall3 `aggregate3`
 * static call: the native balance, every ERC20 balance, and symbol / decimals
 * for the contracts that were just discovered.
 *
 * A sub-call that reverts is skipped rather than zeroed, so a token that cannot
 * answer reads as "unknown" instead of "empty".
 */
export async function readPickerTokens(opts: {
  owner: string;
  chainId: number;
  /** Balances wanted; pass `ZeroAddress` for the native coin. */
  balanceAddresses: string[];
  /** Addresses whose symbol / decimals are wanted as well. */
  metaAddresses: string[];
  multicallAddress?: string;
}): Promise<PickerTokenRead> {
  const empty: PickerTokenRead = { balances: {}, metas: {} };
  if (!isAddress(opts.owner)) return empty;

  const owner = getAddress(opts.owner.toLowerCase());
  const multicallAddress = opts.multicallAddress ?? MULTICALL3_ADDRESS;

  const calls: Multicall3Call[] = [];
  const slots: ReadSlot[] = [];
  const askedBalances = new Set<string>();

  for (const raw of opts.balanceAddresses) {
    if (!isAddress(raw)) continue;
    const address = getAddress(raw.toLowerCase());
    const key = address.toLowerCase();
    if (askedBalances.has(key)) continue;
    askedBalances.add(key);

    if (key === ZeroAddress.toLowerCase()) {
      calls.push({
        target: multicallAddress,
        allowFailure: true,
        callData: readIface.encodeFunctionData("getEthBalance", [owner])
      });
      slots.push({ kind: "native", at: calls.length - 1 });
      continue;
    }

    calls.push({
      target: address,
      allowFailure: true,
      callData: readIface.encodeFunctionData("balanceOf", [owner])
    });
    slots.push({ kind: "balance", key, at: calls.length - 1 });
  }

  for (const raw of opts.metaAddresses) {
    if (!isAddress(raw)) continue;
    const address = getAddress(raw.toLowerCase());
    const key = address.toLowerCase();
    if (key === ZeroAddress.toLowerCase()) continue;
    if (slots.some((slot) => slot.kind === "meta" && slot.key === key))
      continue;

    calls.push({
      target: address,
      allowFailure: true,
      callData: readIface.encodeFunctionData("symbol", [])
    });
    const symbolAt = calls.length - 1;
    calls.push({
      target: address,
      allowFailure: true,
      callData: readIface.encodeFunctionData("decimals", [])
    });
    const decimalsAt = calls.length - 1;
    slots.push({ kind: "meta", key, symbolAt, decimalsAt });
  }

  if (calls.length === 0) return empty;

  const provider =
    getReadonlyProviderForChain(opts.chainId) ?? getDefaultReadonlyProvider();
  if (!provider) return empty;

  const res = await multicall3Aggregate3StaticCall(
    provider,
    calls,
    multicallAddress
  );

  const read: PickerTokenRead = { balances: {}, metas: {} };
  for (const slot of slots) {
    if (slot.kind === "native") {
      const value = decodeMulticallResult<bigint>(
        readIface,
        "getEthBalance",
        res[slot.at]
      );
      if (typeof value === "bigint")
        read.balances[ZeroAddress.toLowerCase()] = value;
      continue;
    }

    if (slot.kind === "balance") {
      const value = decodeMulticallResult<bigint>(
        readIface,
        "balanceOf",
        res[slot.at]
      );
      if (typeof value === "bigint") read.balances[slot.key] = value;
      continue;
    }

    const symbol = decodeMulticallResult<string>(
      readIface,
      "symbol",
      res[slot.symbolAt]
    );
    // A contract that will not name itself is not worth a row in the picker.
    if (!symbol) continue;

    const decimals = decodeMulticallResult<number>(
      readIface,
      "decimals",
      res[slot.decimalsAt]
    );
    read.metas[slot.key] = {
      symbol: String(symbol).trim(),
      decimals: Number.isFinite(Number(decimals)) ? Number(decimals) : 18
    };
  }

  return read;
}
