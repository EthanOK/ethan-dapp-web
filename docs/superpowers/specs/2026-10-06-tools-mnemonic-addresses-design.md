# Mnemonic Page (Tools section) — BIP39 → Addresses Design Spec

**Date:** 2026-10-06  
**Status:** Approved (brainstorming)  
**Route:** `/mnemonic`

## Summary

Add a new **Mnemonic** page (under the top-level **Tools** section) where the user either pastes a BIP39 mnemonic or generates a fresh one on-device, and the app derives and displays **BTC** (Legacy / Nested SegWit / Native SegWit / Taproot), **ETH**, **SOL**, and **TRON** addresses for account index `0`. Computation is entirely client-side.

## Goals

- New route `/mnemonic` with sidebar entry (item **Mnemonic** inside the top-level **Tools** section, which is a sibling of Ethereum / Solana)
- Input: BIP39 mnemonic phrase — typed/pasted by the user, or generated locally
- Generate: 12-word (128-bit) or 24-word (256-bit) phrase from `crypto.getRandomValues`
- Output: one address row per chain (no private keys, no seed display)
- BTC: all four single-sig formats selectable inline — Legacy (`1…`, BIP44), Nested SegWit (`3…`, BIP49), Native SegWit (`bc1q…`, BIP84), Taproot (`bc1p…`, BIP86); default Native SegWit
- ETH: checksummed address (BIP44)
- SOL: base58 public key (Phantom-style path)
- TRON: Base58Check address (`T…`, BIP44 coin type 195)
- i18n for `en` / `zh-CN` / `zh-TW`
- Local-only: no upload, no `localStorage` of the mnemonic

## Non-Goals

- Address index picker (only index `0`)
- Showing private keys or extended keys
- BIP39 passphrase (empty passphrase only)
- Testnet / other coin types
- TRON testnet (Nile/Shasta) addresses, TRC-10/TRC-20 balances
- Extending the existing `/utils` page
- User-supplied entropy (dice rolls, hardware wallets, camera/QR scanning)
- Importing or exporting the phrase to a wallet / keystore file
- Uncompressed P2PKH, multisig, or script-tree (non-key-path) Taproot

## Architecture

Thin page + pure derivation helper (matches existing `pages/` + `lib/` patterns).

```
src/pages/MnemonicPage.tsx                          # UI
src/lib/wallet/deriveAddressesFromMnemonic.ts    # derive + generate helpers (pure)
src/app/App.tsx                                  # lazy route + sidebar link
src/i18n/locales/{en,zh-CN,zh-TW}.ts             # copy
```

### Dependencies (new)

| Package | Role |
|---------|------|
| `@scure/bip39` | Validate mnemonic, mnemonic → seed |
| `@scure/bip32` | secp256k1 HD for BTC |
| `@scure/btc-signer` | P2PKH / P2WPKH / P2TR address encoding (+ `p2sh` for Nested SegWit) |
| `ed25519-hd-key` | ed25519 HD for Solana (Phantom-compatible; `@scure/slip10` is unavailable on npm) |

Existing packages reused:

- `ethers` v6 — `HDNodeWallet.fromPhrase` for ETH; `hexlify` for seed hex; `SigningKey` + `computeAddress` + `sha256` + `encodeBase58` + `concat` for TRON (no extra dependency needed)
- `@scure/bip32` — also used for the TRON `m/44'/195'/0'/0/0` node
- `@solana/web3.js` — `Keypair` / `PublicKey` encoding for SOL
- `@scure/btc-signer/payment.js` — `p2wpkh` + `p2sh` for Nested SegWit (root entry only re-exports `getAddress`, which handles `pkh` / `wpkh` / `tr`)

### Derivation paths (fixed)

| Chain | Type | Path | Format |
|-------|------|------|--------|
| BTC | Legacy | `m/44'/0'/0'/0/0` | P2PKH (`1…`) |
| BTC | Nested SegWit | `m/49'/0'/0'/0/0` | P2SH-P2WPKH (`3…`) |
| BTC | Native SegWit | `m/84'/0'/0'/0/0` | P2WPKH (`bc1q…`) — **default** |
| BTC | Taproot | `m/86'/0'/0'/0/0` | P2TR key-path (`bc1p…`) |
| ETH | — | `m/44'/60'/0'/0/0` | EIP-55 checksummed |
| SOL | — | `m/44'/501'/0'/0'` | base58 |
| TRON | — | `m/44'/195'/0'/0/0` | Base58Check (`T…`) |

Nested SegWit has no `getAddress` shortcut: it is composed as `p2sh(p2wpkh(compressedPubKey, NETWORK), NETWORK).address`. `getAddress("tr", …)` derives the BIP86 key-path output key (single key, no script tree), which is what the standard vector below pins down.

### TRON address encoding

TRON reuses the EVM address body but not the EVM representation:

```
body    = keccak256(uncompressedPubKey[1..65])[12..32]   // 20 bytes, same as an ETH address
payload = 0x41 ‖ body                                     // 21 bytes, 0x41 = TRON mainnet prefix
address = base58check(payload)                            // 34 chars, starts with "T"
```

`0x41` is the mainnet byte; testnet (Nile/Shasta) uses `0xa0` — out of scope here.

### Known-answer tests

Canonical BIP39 mnemonic (`abandon` ×11 + `about`), account 0 — a **reference vector** for verifying derivation only; it is no longer used as a prefilled value anywhere in the UI:

| Chain | Expected |
|-------|----------|
| BTC · Legacy (`m/44'/0'/0'/0/0`) | `1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA` |
| BTC · Nested SegWit (`m/49'/0'/0'/0/0`) | `37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf` |
| BTC · Native SegWit (`m/84'/0'/0'/0/0`) | `bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu` |
| BTC · Taproot (`m/86'/0'/0'/0/0`) | `bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr` |
| ETH | `0x9858EfFD232B4033E47d90003D41EC34EcaEda94` |
| SOL | `HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk` |
| TRON | `TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH` |

BTC rows are the BIP44 / BIP49 / BIP84 / BIP86 published vectors for this mnemonic. The TRON value matches TronLink / `gotron-sdk` for path `m/44'/195'/0'/0/0`. All seven are asserted together in a single verification run.

### Helper API

```ts
/** Standard single-signature Bitcoin address formats, in rough wallet-support order. */
export type BitcoinAddressType = "legacy" | "nested" | "native" | "taproot";

export type BitcoinAddresses = Record<BitcoinAddressType, string>;

export type DerivedAddresses = {
  btc: BitcoinAddresses;
  eth: string;
  sol: string;
  tron: string;
};

export const BITCOIN_ADDRESS_TYPES: BitcoinAddressType[];

/** BIP39 entropy size in bits: 128 → 12 words, 256 → 24 words. */
export type MnemonicStrength = 128 | 256;

export function deriveAddressesFromMnemonic(
  mnemonic: string
): DerivedAddresses;

export function generateMnemonic(strength?: MnemonicStrength): string;
```

- Normalize input: trim, collapse whitespace to single spaces, lowercase.
- Validate with `@scure/bip39` (English wordlist + checksum).
- On invalid mnemonic: throw `Error` with message `"empty"` or `"invalid"`; the page maps these to i18n keys and clears prior results.
- `generateMnemonic` fills a `strength / 8`-byte buffer with `crypto.getRandomValues` and converts it via `entropyToMnemonic` (same English wordlist). If the platform exposes no CSPRNG it throws `Error("no-crypto")` rather than falling back to `Math.random`.

## UI

Follow existing utility page styling (form card, inputs, button).

1. Title + short description
2. Warning: do not paste real mnemonics in untrusted environments
3. Field head: label + word-count select (`12` / `24`)
4. Multiline textarea for mnemonic — starts **empty** and is filled on mount by a **locally generated random phrase** (12 words by default), derived immediately so the result list is visible without any user action. Nothing hard-coded and nothing persisted
5. Action row (centered): **Random mnemonic** (secondary) + **Derive addresses** (primary). Generating writes the phrase into the textarea and derives immediately, so the list always matches the field
6. Word-count select re-rolls the phrase **only while the field still holds a phrase the page generated itself**; a user-typed/edited phrase is always preserved
7. Local-only note under the actions: random words come from this device's CSPRNG, never uploaded, never saved
8. Result rows (icon + chain name + **full address** + copy + QR buttons) — addresses are shown in full, monospace, wrapping with `word-break: break-all` (never truncated/ellipsized): BTC / ETH / SOL / TRON. The Bitcoin row carries an extra **inline format select** (Legacy / Nested SegWit / Native SegWit / Taproot, default Native SegWit); its address, copy button and QR all follow the current selection, so the list still has exactly one row per chain
9. QR button opens a modal with a title line naming the chain (plus the format for Bitcoin), the styled QR (`AddressStyledQR`, one at a time — singleton), the full address, and a copy button
10. Inline error under the form on failure

## Navigation & i18n

- Sidebar: top-level **Tools** section (sibling of Ethereum / Solana), not nested under Ethereum; its single item links to `/mnemonic`
- Keys (minimum):
  - `nav.tools` (section title), `nav.mnemonic` (sidebar item)
  - `tools.title`, `tools.subtitle`, `tools.warning`
  - `tools.mnemonic`, `tools.mnemonicPlaceholder`
  - `tools.derive`, `tools.generate`, `tools.wordCount`, `tools.localNote`
  - `tools.btc`, `tools.eth`, `tools.sol`, `tools.tron`
  - `tools.btcTypeLabel`, `tools.btcType.{legacy,nested,native,taproot}`
  - `tools.qrCode`, `tools.qrHint`
  - `tools.error.empty`, `tools.error.invalid`, `tools.error.noCrypto`
  - `tools.copied` (if copy is implemented)

Labels: section title `nav.tools` is **Tools** in all three locales (consistent with other English tool labels). Item `nav.mnemonic` is localized — `Mnemonic` / `助记词` / `助記詞` — and `tools.title` matches it, so the page heading and the sidebar entry always read the same.

## Security

- Client-side only; never send mnemonic to backend
- Do not persist mnemonic in `localStorage` / sessionStorage
- Do not render seed bytes or private keys
- Visible warning on the page about untrusted environments
- The page never prefills a canned or example phrase. The default value is generated on the device at mount, so two visits never show the same words
- Generation entropy comes exclusively from `crypto.getRandomValues`. `Math.random` is never a fallback; if no CSPRNG is available the action fails loudly instead of producing a weak phrase
- Generated phrases live only in component state (textarea + derive call). No storage, no logging, no analytics payload, no worker/network hop — this is enforced by keeping generation in the pure helper, which imports nothing network-capable

## Error handling

| Case | Behavior |
|------|----------|
| Empty input | Show `tools.error.empty`; clear results |
| Invalid word count / checksum / non-BIP39 | Show `tools.error.invalid`; clear results |
| No CSPRNG on the platform | Show `tools.error.noCrypto`; clear results, leave the textarea untouched |
| Success | Show four address rows |

## Acceptance criteria

1. Sidebar link opens `/mnemonic`
2. Valid BIP39 mnemonic yields one address per chain: BTC in the selected format, ETH (`0x…`), SOL (base58), TRON (`T…`)
3. Invalid mnemonic shows a clear error and clears results
4. Same mnemonic matches common wallets: MetaMask (ETH), Phantom (SOL), TronLink (TRON), and for BTC — Electrum/`bitcoinjs-lib` for Legacy, Nested SegWit, Native SegWit, and Taproot account 0
5. `bun run typecheck` passes
6. No mnemonic persistence or network calls for derivation
7. All seven derived addresses match the known-answer table above
8. **Random mnemonic** produces a valid phrase of the selected length (12 / 24 words), all words from the English wordlist, and deriving it succeeds immediately
9. Repeating the action yields different phrases (no cached/reused entropy)
10. The module graph of `MnemonicPage` + `deriveAddressesFromMnemonic` contains no `fetch` / `XMLHttpRequest` / storage call
11. On first load the textarea already holds a valid locally generated phrase (12 words) with results shown, with no user action required
12. Switching between `12` and `24` re-rolls the phrase to the new length while the field holds a page-generated phrase, and leaves an edited phrase untouched
13. Changing the Bitcoin format select swaps the row's address, its copy value and its QR payload together; the row prefix matches the format (`1` / `3` / `bc1q` / `bc1p`)

## Implementation notes

- Prefer `@scure/*` over heavy `bitcoinjs-lib` / `bip39` stacks
- Keep derivation logic out of the React component for testability
- Page CSS: reuse global form styles if sufficient; add `MnemonicPage.css` only if needed
