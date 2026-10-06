# Tools Page — Mnemonic → Addresses Design Spec

**Date:** 2026-10-06  
**Status:** Approved (brainstorming)  
**Route:** `/tools`

## Summary

Add a new **Tools** page where the user pastes a BIP39 mnemonic and the app derives and displays **BTC** (Native SegWit), **ETH**, and **SOL** addresses for account index `0`. Computation is entirely client-side.

## Goals

- New route `/tools` with sidebar entry (Ethereum section, near existing `/utils`)
- Input: BIP39 mnemonic phrase
- Output: three addresses only (no private keys, no seed display)
- BTC: Native SegWit mainnet (`bc1q…`, BIP84)
- ETH: checksummed address (BIP44)
- SOL: base58 public key (Phantom-style path)
- i18n for `en` / `zh-CN` / `zh-TW`
- Local-only: no upload, no `localStorage` of the mnemonic

## Non-Goals

- Multiple BTC address types (Legacy / Nested / Taproot)
- Address index picker (only index `0`)
- Showing private keys or extended keys
- BIP39 passphrase (empty passphrase only)
- Testnet / other coin types
- Extending the existing `/utils` page

## Architecture

Thin page + pure derivation helper (matches existing `pages/` + `lib/` patterns).

```
src/pages/ToolsPage.tsx                          # UI
src/lib/wallet/deriveAddressesFromMnemonic.ts    # pure derive helper
src/app/App.tsx                                  # lazy route + sidebar link
src/i18n/locales/{en,zh-CN,zh-TW}.ts             # copy
```

### Dependencies (new)

| Package | Role |
|---------|------|
| `@scure/bip39` | Validate mnemonic, mnemonic → seed |
| `@scure/bip32` | secp256k1 HD for BTC |
| `@scure/btc-signer` | P2WPKH address encoding |
| `@scure/slip10` | ed25519 HD for Solana |

Existing packages reused:

- `ethers` v6 — `HDNodeWallet.fromPhrase` for ETH
- `@solana/web3.js` — `Keypair` / `PublicKey` encoding for SOL
- `@noble/ed25519` — available if needed alongside slip10

### Derivation paths (fixed)

| Chain | Path | Format |
|-------|------|--------|
| BTC | `m/84'/0'/0'/0/0` | Native SegWit mainnet (`bc1q…`) |
| ETH | `m/44'/60'/0'/0/0` | EIP-55 checksummed |
| SOL | `m/44'/501'/0'/0'` | base58 |

### Helper API

```ts
export type DerivedAddresses = {
  btc: string;
  eth: string;
  sol: string;
};

export function deriveAddressesFromMnemonic(
  mnemonic: string
): DerivedAddresses;
```

- Normalize input: trim, collapse whitespace to single spaces, lowercase.
- Validate with `@scure/bip39` (English wordlist + checksum).
- On invalid mnemonic: throw `Error` with message `"empty"` or `"invalid"`; the page maps these to i18n keys and clears prior results.

## UI

Follow existing utility page styling (form card, inputs, button).

1. Title + short description
2. Warning: do not paste real mnemonics in untrusted environments
3. Multiline textarea for mnemonic
4. Primary button: Derive
5. Result rows: BTC / ETH / SOL (readonly) with optional copy-to-clipboard
6. Inline error under the form on failure

## Navigation & i18n

- Sidebar: Ethereum section, near `nav.utils`
- Keys (minimum):
  - `nav.tools`
  - `tools.title`, `tools.subtitle`, `tools.warning`
  - `tools.mnemonic`, `tools.mnemonicPlaceholder`
  - `tools.derive`
  - `tools.btc`, `tools.eth`, `tools.sol`
  - `tools.error.empty`, `tools.error.invalid`
  - `tools.copied` (if copy is implemented)

Label for `nav.tools`: **Tools** in all three locales (consistent with other English tool labels).

## Security

- Client-side only; never send mnemonic to backend
- Do not persist mnemonic in `localStorage` / sessionStorage
- Do not render seed bytes or private keys
- Visible warning on the page about untrusted environments

## Error handling

| Case | Behavior |
|------|----------|
| Empty input | Show `tools.error.empty`; clear results |
| Invalid word count / checksum / non-BIP39 | Show `tools.error.invalid`; clear results |
| Success | Show three addresses |

## Acceptance criteria

1. Sidebar link opens `/tools`
2. Valid BIP39 mnemonic yields BTC (`bc1q…`), ETH (`0x…`), SOL (base58) addresses
3. Invalid mnemonic shows a clear error and clears results
4. Same mnemonic matches common wallets: MetaMask (ETH), Phantom (SOL), Sparrow/Electrum BIP84 (BTC) for account 0
5. `bun run typecheck` passes
6. No mnemonic persistence or network calls for derivation

## Implementation notes

- Prefer `@scure/*` over heavy `bitcoinjs-lib` / `bip39` stacks
- Keep derivation logic out of the React component for testability
- Page CSS: reuse global form styles if sufficient; add `ToolsPage.css` only if needed
