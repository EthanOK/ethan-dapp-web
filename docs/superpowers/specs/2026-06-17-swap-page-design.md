# Swap Page Design Spec

**Date:** 2026-06-17  
**Status:** Approved (brainstorming)  
**Route:** `/swap`

## Summary

Add an Ethereum Mainnet-only swap page that lets users exchange between **ETH / USDT / USDC** and **RWA tokens** (plus any ERC20 via manual address). Swaps are powered by `@bric-labs/bric-sdk@^0.3.8`. Pay and receive tokens must always differ.

## Goals

- Single-chain swap on Ethereum Mainnet (chainId `1`)
- Bidirectional: stable/ETH ↔ RWA (and stable ↔ ETH)
- Whitelist shortcut list from a **static fixture** (not runtime API)
- Manual contract address for arbitrary ERC20 receive/pay tokens
- Slippage presets: 0.1%, 0.5%, 1%, 3%, 5% (default 0.5%)

## Non-Goals

- Multi-chain swap
- Runtime fetch of whitelist from Bric API
- Token search by name/symbol via external API
- Solana or non-EVM assets

## Architecture

**Recommended approach:** thin page + lib module (matches existing `lib/` + `config/` + `pages/` patterns).

```
src/pages/SwapPage.tsx              # UI only
src/pages/SwapPage.css              # page styles
src/lib/swap/BricSwap.ts          # bric-sdk wrapper (quote, approve, execute)
src/lib/swap/swapTokenRules.ts    # pay/receive eligibility logic
src/config/SwapPayTokens.ts       # ETH / USDT / USDC mainnet config
src/fixtures/SwapTokenWhitelist.ts # static RWA whitelist snapshot
```

### Dependencies

- `@bric-labs/bric-sdk@^0.3.8` from private GitLab npm registry
- Local `.npmrc` with scoped registry + auth token (**gitignored**, not committed)
- Existing wallet hooks: `useEvmWallet`, `useOpenAppKitModal`, `useSwitchAppKitNetwork`, `useWalletChain`
- `ethers` v6 for approve/balance reads
- `sonner` for toasts

> **Implementation note:** Exact bric-sdk method names (`getQuote`, `executeSwap`, etc.) must be verified against installed package types before coding. Wrapper in `BricSwap.ts` isolates SDK API drift.

## Token Configuration

### Pay Tokens (fixed, Mainnet)

| Symbol | Address | Decimals |
|--------|---------|----------|
| ETH | native (SDK sentinel) | 18 |
| USDT | `0xdac17f958d2ee523a2206206994597c13d831ec7` | 6 |
| USDC | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` | 6 |

Stored in `src/config/SwapPayTokens.ts`.

### RWA Whitelist (static fixture)

Source snapshot: [Bric whitelist API](https://new-test.bric.one/bric-api/api/v1/secondary/rwa/whitelist?chainIndex=1) (fetched once at spec time; **not** called at runtime).

Each entry stores only:

```ts
interface SwapWhitelistToken {
  symbol: string;
  underlyingAsset: string;
  tokenAddress: string;
  decimals: number;
  chainIndex: string; // "1"
}
```

**13 tokens** (chainIndex `"1"`):

| symbol | underlyingAsset | tokenAddress | decimals |
|--------|-----------------|--------------|----------|
| BMNRon | BitMine Immersion Technologies | `0x33483a58079b4225b10e57958ca28ad7b9cdbaf7` | 18 |
| PAXG | Paxos Gold | `0x45804880de22913dafe09f4980848ece6ecbaf78` | 18 |
| XAUT | Tether Gold | `0x68749665ff8d2d112fa859aa293f07a622782f38` | 6 |
| CRCLon | Circle Internet Group | `0x3632dea96a953c11dac2f00b4a05a32cd1063fae` | 18 |
| COINon | Coinbase | `0xf042cfa86cf1d598a75bdb55c3507a1f39f9493b` | 18 |
| NVDAon | NVIDIA | `0x2d1f7226bd1f780af6b9a49dcc0ae00e8df4bdee` | 18 |
| GOOGLon | Alphabet Class A | `0xba47214edd2bb43099611b208f75e4b42fdcfedc` | 18 |
| AAPLon | Apple | `0x14c3abf95cb9c93a8b82c1cdcb76d72cb87b2d4c` | 18 |
| METAon | Meta Platforms | `0x59644165402b611b350645555b50afb581c71eb2` | 18 |
| TSLAon | Tesla | `0xf6b1117ec07684d3958cad8beb1b302bfd21103f` | 18 |
| AMZNon | Amazon | `0xbb8774fb97436d23d74c1b882e8e9a69322cfd31` | 18 |
| MSFTon | Microsoft | `0xb812837b81a3a6b81d7cd74cfb19a7f2784555e5` | 18 |
| SLVon | iShares Silver Trust | `0xf3e4872e6a4cf365888d93b6146a2baa7348f1a4` | 18 |

Stored in `src/fixtures/SwapTokenWhitelist.ts`.

### Manual Address

- User may enter any valid ERC20 contract address for pay or receive (depending on direction).
- Validate with `isAddress()`; fetch `symbol`, `decimals`, `balanceOf` on-chain.
- **No whitelist enforcement** for manual entries — whitelist is convenience only.

## Token Selection Rules

Pay and receive must **never** be the same token.

### Mode: Buy (Pay = ETH / USDT / USDC)

| Pay selected | Receive options |
|--------------|-----------------|
| USDT or USDC | **ETH**, whitelist RWA, manual ERC20 |
| ETH | **USDT**, **USDC**, whitelist RWA, manual ERC20 (not ETH) |

Examples:
- ✅ Pay USDC → Receive ETH
- ✅ Pay USDC → Receive XAUT
- ✅ Pay ETH → Receive USDT
- ❌ Pay USDT → Receive USDT

### Mode: Sell (Pay = RWA or manual ERC20)

| Pay selected | Receive options |
|--------------|-----------------|
| Whitelist RWA or manual ERC20 | **ETH**, **USDT**, **USDC** only |

When user picks a whitelist token or custom address on the Pay side, Receive dropdown is limited to ETH / USDT / USDC.

### Direction Toggle (↕)

Swaps Pay ↔ Receive sides and re-applies eligibility filters. If current Receive becomes invalid after toggle, reset Receive to first valid option.

Logic lives in `src/lib/swap/swapTokenRules.ts`.

## User Flow

1. Navigate to `/swap`.
2. If wallet not connected → show Connect (AppKit).
3. If `chainId !== 1` → banner + button to switch to Ethereum Mainnet.
4. User selects Pay token and amount (with Max button).
5. User selects Receive token (whitelist dropdown, or Custom Address input).
6. Slippage: radio/select among 0.1%, 0.5% (default), 1%, 3%, 5%.
7. Debounced quote (500ms) after amount + token changes.
8. Display estimated receive amount and quote details.
9. On Swap:
   - Re-validate chain, token pair, balance, slippage.
   - If ERC20 pay token needs allowance → prompt approve tx first.
   - Execute swap via bric-sdk + connected signer.
10. Success → toast + Etherscan link. Failure → toast with reason.

## UI Layout

Follow existing `feature-panel` styling (consistent with `FaucetTokenPage`, `LayerZeroOFTBridgePage`).

```
┌─────────────────────────────────┐
│  Swap                           │
├─────────────────────────────────┤
│  You Pay                        │
│  [token ▾]              [Max]   │
│  Balance: …                     │
│  [amount input]                 │
├─────────────────────────────────┤
│            [ ↕ Swap ]           │
├─────────────────────────────────┤
│  You Receive                    │
│  [token ▾ / Custom address]     │
│  ≈ estimated output             │
├─────────────────────────────────┤
│  Slippage: 0.1% 0.5% 1% 3% 5%  │
│  [ Swap ]                       │
└─────────────────────────────────┘
```

- Whitelist dropdown shows `symbol` (subtitle: `underlyingAsset`).
- Custom Address mode shows text input below dropdown.
- Swap button disabled when: same token, invalid address, insufficient balance, no quote, wrong chain, tx in flight.

## Swap Execution (`BricSwap.ts`)

```
Input change → debounce 500ms
  → getQuote({ fromToken, toToken, amountIn, slippageBps, chainId: 1, userAddress })
  → setQuote(result)

User clicks Swap:
  → assert chainId === 1
  → assert fromToken !== toToken
  → assert balance >= amountIn
  → if ERC20 && allowance < amountIn → approve(spender, amount)
  → executeSwap({ quote, signer })
  → await receipt
  → return txHash
```

Spender/router address comes from quote response or SDK config — confirm during implementation.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Wrong chain | Banner + switch network CTA; disable Swap |
| Same pay/receive token | Inline error; disable Swap |
| Invalid address | Inline error on custom input |
| Quote API failure | Toast with message; clear estimate |
| Insufficient balance | Disable Swap; show balance hint |
| User rejects approve/swap | Toast "Transaction cancelled" |
| Tx reverted | Toast error + Etherscan link |

## Routing & Navigation

- Add route in `src/app/App.tsx`: `<Route path="/swap" element={<SwapPage />} />`
- Add sidebar nav item under ETH section (near Faucet): **Swap** → `/swap`

## Testing Plan (manual)

1. Connect wallet on Mainnet; verify chain guard on Sepolia.
2. Pay USDC → Receive ETH: quote + swap (or quote-only if no test funds).
3. Pay ETH → Receive USDT: quote displays.
4. Pay USDT → Receive XAUT (whitelist): dropdown works.
5. Custom address (non-whitelist ERC20): quote allowed.
6. Same token pair: Swap disabled.
7. Slippage change triggers re-quote.
8. Direction toggle preserves valid pair rules.
9. Approve flow for ERC20 pay tokens.

## Security & Config

- `.npmrc` with GitLab auth token is **gitignored**; never commit tokens.
- Rotate any token exposed in chat before production use.
- No secrets in frontend bundle beyond public contract addresses.

## Open Items (resolve at implementation)

1. Confirm bric-sdk 0.3.8 API surface after `npm install`.
2. Confirm native ETH sentinel address format expected by SDK.
3. Confirm approve spender address source (quote vs static config).
