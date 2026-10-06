import { HDKey } from "@scure/bip32";
import { mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { getAddress, NETWORK } from "@scure/btc-signer";
import { Keypair } from "@solana/web3.js";
import { derivePath } from "ed25519-hd-key";
import { HDNodeWallet, hexlify } from "ethers";

export type DerivedAddresses = {
  btc: string;
  eth: string;
  sol: string;
};

const BTC_PATH = "m/84'/0'/0'/0/0";
const SOL_PATH = "m/44'/501'/0'/0'";

function normalizeMnemonic(mnemonic: string): string {
  return mnemonic.trim().split(/\s+/).filter(Boolean).join(" ").toLowerCase();
}

/**
 * Derive account-0 addresses from a BIP39 mnemonic (empty passphrase).
 * BTC: BIP84 Native SegWit · ETH: BIP44 · SOL: Phantom-style ed25519 path.
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

  const btcNode = HDKey.fromMasterSeed(seed).derive(BTC_PATH);
  if (!btcNode.privateKey) {
    throw new Error("invalid");
  }
  const btc = getAddress("wpkh", btcNode.privateKey, NETWORK);
  if (!btc) {
    throw new Error("invalid");
  }

  const ethWallet = HDNodeWallet.fromPhrase(normalized);
  const eth = ethWallet.address;

  const { key: solSeed } = derivePath(SOL_PATH, hexlify(seed).slice(2));
  const sol = Keypair.fromSeed(solSeed).publicKey.toBase58();

  return { btc, eth, sol };
}
