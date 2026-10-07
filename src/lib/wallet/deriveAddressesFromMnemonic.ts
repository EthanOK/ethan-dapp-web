import { HDKey } from "@scure/bip32";
import {
  entropyToMnemonic,
  mnemonicToSeedSync,
  validateMnemonic
} from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { getAddress, NETWORK } from "@scure/btc-signer";
import { p2sh, p2wpkh } from "@scure/btc-signer/payment.js";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { HDNodeWallet, hexlify } from "ethers";
import { privateKeyToTronAddress } from "@/lib/tron/address";

/** Standard single-signature Bitcoin address formats, in rough wallet-support order. */
export type BitcoinAddressType = "legacy" | "nested" | "native" | "taproot";

export type BitcoinAddresses = Record<BitcoinAddressType, string>;

export type DerivedAddresses = {
  btc: BitcoinAddresses;
  eth: string;
  sol: string;
  tron: string;
};

/** Account-0 paths per address format (BIP44 / BIP49 / BIP84 / BIP86). */
const BTC_PATHS: Record<BitcoinAddressType, string> = {
  legacy: "m/44'/0'/0'/0/0",
  nested: "m/49'/0'/0'/0/0",
  native: "m/84'/0'/0'/0/0",
  taproot: "m/86'/0'/0'/0/0"
};

export const BITCOIN_ADDRESS_TYPES = Object.keys(
  BTC_PATHS
) as BitcoinAddressType[];

const ETH_PATH = "m/44'/60'/0'/0/0";
const SOL_PATH = "m/44'/501'/0'/0'";
const TRON_PATH = "m/44'/195'/0'/0/0";

/** BIP39 entropy size in bits: 128 → 12 words, 256 → 24 words. */
export type MnemonicStrength = 128 | 256;

/**
 * Machine-readable reason a derivation failed. Callers branch on `code`
 * instead of parsing message text, so wording can change freely.
 */
export type DeriveErrorCode = "empty" | "invalid" | "no-crypto";

export class MnemonicDeriveError extends Error {
  readonly code: DeriveErrorCode;

  constructor(code: DeriveErrorCode) {
    super(code);
    this.name = "MnemonicDeriveError";
    this.code = code;
  }
}

function normalizeMnemonic(mnemonic: string): string {
  return mnemonic.trim().split(/\s+/).filter(Boolean).join(" ").toLowerCase();
}

/**
 * Generate a fresh BIP39 mnemonic from entropy sourced on this device.
 *
 * Entropy is read straight from the platform CSPRNG (`crypto.getRandomValues`),
 * so the phrase is created locally and never leaves the browser: no fetch, no
 * worker message, no storage write, no analytics. The caller owns the value and
 * decides whether to keep it.
 */
export function generateMnemonic(strength: MnemonicStrength = 128): string {
  const random = globalThis.crypto;
  if (typeof random?.getRandomValues !== "function") {
    throw new MnemonicDeriveError("no-crypto");
  }
  const entropy = new Uint8Array(strength / 8);
  random.getRandomValues(entropy);
  return entropyToMnemonic(entropy, wordlist);
}

/** Maps the user-facing format to `getAddress`'s script-type tag. */
const BTC_GET_ADDRESS_TYPE: Record<
  Exclude<BitcoinAddressType, "nested">,
  "pkh" | "wpkh" | "tr"
> = {
  legacy: "pkh",
  native: "wpkh",
  taproot: "tr"
};

/**
 * Derive one Bitcoin address format from the master key.
 *
 * `getAddress` covers P2PKH / P2WPKH / P2TR directly (all with the compressed
 * ECDSA or x-only key of the derived path). Nested SegWit is P2WPKH wrapped in
 * P2SH, so it is composed from `p2wpkh` + `p2sh` instead.
 *
 * Takes the master key rather than the seed so callers derive every format
 * (and TRON) from one `fromMasterSeed` instead of re-hashing the seed each time.
 */
function deriveBitcoinAddress(master: HDKey, type: BitcoinAddressType): string {
  const node = master.derive(BTC_PATHS[type]);
  if (!node.privateKey || !node.publicKey) {
    throw new MnemonicDeriveError("invalid");
  }

  if (type === "nested") {
    const nested = p2sh(p2wpkh(node.publicKey, NETWORK), NETWORK).address;
    if (!nested) {
      throw new MnemonicDeriveError("invalid");
    }
    return nested;
  }

  return getAddress(BTC_GET_ADDRESS_TYPE[type], node.privateKey, NETWORK);
}

/**
 * Derive account-0 addresses from a BIP39 mnemonic (empty passphrase).
 * BTC: Legacy + Nested SegWit + Native SegWit + Taproot (BIP44/49/84/86) ·
 * ETH: BIP44 · SOL: Phantom-style ed25519 path · TRON: BIP44 coin type 195.
 */
export function deriveAddressesFromMnemonic(
  mnemonic: string
): DerivedAddresses {
  const normalized = normalizeMnemonic(mnemonic);
  if (!normalized) {
    throw new MnemonicDeriveError("empty");
  }
  if (!validateMnemonic(normalized, wordlist)) {
    throw new MnemonicDeriveError("invalid");
  }

  // BIP39 seed derivation (PBKDF2) is the slowest step here, so it runs once
  // and feeds every tree below — BTC/TRON via `master`, ETH via `fromSeed`
  // instead of `fromPhrase` (which would re-run PBKDF2), and SOL via ed25519.
  const seed = mnemonicToSeedSync(normalized);
  const master = HDKey.fromMasterSeed(seed);

  const btc = Object.fromEntries(
    BITCOIN_ADDRESS_TYPES.map((type) => [
      type,
      deriveBitcoinAddress(master, type)
    ])
  ) as BitcoinAddresses;

  const eth = HDNodeWallet.fromSeed(seed).derivePath(ETH_PATH).address;

  const { key: solSeed } = derivePath(SOL_PATH, hexlify(seed).slice(2));
  const sol = Keypair.fromSeed(solSeed).publicKey.toBase58();

  const tronNode = master.derive(TRON_PATH);
  if (!tronNode.privateKey) {
    throw new MnemonicDeriveError("invalid");
  }
  const tron = privateKeyToTronAddress(tronNode.privateKey);

  return { btc, eth, sol, tron };
}
