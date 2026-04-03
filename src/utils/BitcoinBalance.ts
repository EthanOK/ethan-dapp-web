export type BitcoinUtxo = {
  txid: string;
  vout: number;
  value: number;
  status?: { confirmed?: boolean; block_height?: number };
};

/** 根据地址前缀推断是否为测试网风格地址（tb1 / m / n / 2） */
export function isBitcoinTestnetAddress(address: string): boolean {
  const a = address.trim();
  if (/^tb1/i.test(a)) return true;
  if (/^[mn][a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(a)) return true;
  if (/^2[a-km-zA-HJ-NP-Z1-9]{25,34}$/u.test(a)) return true;
  return false;
}

function apiRoots(testnet: boolean): { blockstream: string; mempool: string } {
  if (testnet) {
    return {
      blockstream: "https://blockstream.info/testnet/api",
      mempool: "https://mempool.space/testnet/api"
    };
  }
  return {
    blockstream: "https://blockstream.info/api",
    mempool: "https://mempool.space/api"
  };
}

async function fetchUtxosFromBase(
  baseUrl: string,
  address: string
): Promise<BitcoinUtxo[] | null> {
  const url = `${baseUrl}/address/${encodeURIComponent(address.trim())}/utxo`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`UTXO fetch non-OK (${res.status}):`, url);
      return null;
    }
    return (await res.json()) as BitcoinUtxo[];
  } catch (e) {
    console.warn("UTXO fetch error:", url, e);
    return null;
  }
}

export async function getUTXOs(
  address: string,
  testnet: boolean
): Promise<BitcoinUtxo[]> {
  const { blockstream, mempool } = apiRoots(testnet);

  const fromBlockstream = await fetchUtxosFromBase(blockstream, address);
  if (fromBlockstream) return fromBlockstream;

  const fromMempool = await fetchUtxosFromBase(mempool, address);
  if (fromMempool) return fromMempool;

  console.warn("getUTXOs: blockstream.info 与 mempool.space 均失败");
  return [];
}

export async function getBitCoinBalance(
  address: string,
  options?: { testnet?: boolean }
): Promise<number> {
  const testnet = options?.testnet ?? isBitcoinTestnetAddress(address);
  const utxos = await getUTXOs(address, testnet);
  return utxos.reduce((sum, utxo) => sum + utxo.value, 0);
}
