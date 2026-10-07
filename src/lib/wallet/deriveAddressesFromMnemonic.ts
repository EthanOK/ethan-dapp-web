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
import {
  HDNodeWallet,
  SigningKey,
  computeAddress,
  concat,
  encodeBase58,
  hexlify,
  sha256
} from "ethers";

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

const SOL_PATH = "m/44'/501'/0'/0'";
const TRON_PATH = "m/44'/195'/0'/0/0";

/** BIP39 entropy size in bits: 128 → 12 words, 256 → 24 words. */
export type MnemonicStrength = 128 | 256;

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
    throw new Error("no-crypto");
  }
  const entropy = new Uint8Array(strength / 8);
  random.getRandomValues(entropy);
  return entropyToMnemonic(entropy, wordlist);
}

/**
 * TRON address = base58check(0x41 ‖ keccak256(uncompressedPubKey[1..])[12..32])
 *
 * Same 20-byte body as an Ethereum address (EVM-style keccak of the uncompressed
 * public key), but prefixed with the TRON mainnet byte `0x41` and Base58Check
 * encoded instead of hex.
 */
function toTronAddress(privateKey: Uint8Array): string {
  // computeAddress() == keccak256(uncompressedPubKey[1..]).slice(-20), EIP-55 checksummed
  const body = computeAddress(new SigningKey(hexlify(privateKey)))
    .slice(2)
    .toLowerCase();

  const payload = concat(["0x41", `0x${body}`]);
  const checksum = sha256(sha256(payload)).slice(2, 10);

  return encodeBase58(concat([payload, `0x${checksum}`]));
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
 * Derive one Bitcoin address format from the master seed.
 *
 * `getAddress` covers P2PKH / P2WPKH / P2TR directly (all with the compressed
 * ECDSA or x-only key of the derived path). Nested SegWit is P2WPKH wrapped in
 * P2SH, so it is composed from `p2wpkh` + `p2sh` instead.
 */
function deriveBitcoinAddress(
  seed: Uint8Array,
  type: BitcoinAddressType
): string {
  const node = HDKey.fromMasterSeed(seed).derive(BTC_PATHS[type]);
  if (!node.privateKey || !node.publicKey) {
    throw new Error("invalid");
  }

  if (type === "nested") {
    const nested = p2sh(p2wpkh(node.publicKey, NETWORK), NETWORK).address;
    if (!nested) {
      throw new Error("invalid");
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
    throw new Error("empty");
  }
  if (!validateMnemonic(normalized, wordlist)) {
    throw new Error("invalid");
  }

  const seed = mnemonicToSeedSync(normalized);

  const btc = Object.fromEntries(
    BITCOIN_ADDRESS_TYPES.map((type) => [
      type,
      deriveBitcoinAddress(seed, type)
    ])
  ) as BitcoinAddresses;

  const ethWallet = HDNodeWallet.fromPhrase(normalized);
  const eth = ethWallet.address;

  const { key: solSeed } = derivePath(SOL_PATH, hexlify(seed).slice(2));
  const sol = Keypair.fromSeed(solSeed).publicKey.toBase58();

  const tronNode = HDKey.fromMasterSeed(seed).derive(TRON_PATH);
  if (!tronNode.privateKey) {
    throw new Error("invalid");
  }
  const tron = toTronAddress(tronNode.privateKey);

  return { btc, eth, sol, tron };
}
