# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

| Command | Description |
|---------|-------------|
| `bun start` | Dev server (Vite) at localhost:3000 |
| `bun run build` | Production build → `build/` |
| `bun run typecheck` | TypeScript check (no emit) |
| `bun run prettier` | Format source files |
| `bun run release` | Patch version bump (standard-version) |

Pre-commit hook runs Prettier on staged files and `bun run build`.

## Architecture

Multi-chain Web3 dApp dashboard (EVM, Solana, Bitcoin) built with **React 18 + TypeScript**.

**Entry:** `src/index.tsx` → `src/app/App.tsx`

**Import alias:** `@/` → `src/` (e.g. `@/lib/wallet/GetProvider`)

### Key directories

- `src/app/` — App shell: `App.tsx` (routes/layout), `Wallet.ts` (Reown AppKit init), `App.css`
- `src/pages/` — One route page per file, all lazy-imported in `App.tsx`
- `src/i18n/` — Locale provider (`I18nProvider.tsx`), `useI18n()` hook, `tGlobal()` for lib/hooks; locale files in `locales/` (`en`, `zh-CN`, `zh-TW`)
- `src/hooks/` — Wallet state (`useReownWalletSync`, `useEvmWallet`), theme, sidebar, network switching
- `src/lib/wallet/` — `GetProvider.ts` (provider resolution), `ConnectWallet.ts`, `Suscribers.ts` (AppKit event subscribers)
- `src/lib/evm/` — Contract interactions, LayerZero, multicall, EIP-7702, **`GasStrategy.ts`** (header gas snapshot + tx gas overrides)
- `src/lib/nft/` — OpenSea, mint, orders
- `src/lib/solana/` — Connection, WSOL, sign/verify
- `src/lib/swap/` — BricSwap (`BricSwap.ts`): quote, Permit2 approval/sign, execute via `@bric-labs/bric-sdk`; **`swapPermit2Cache.ts`** reuses EIP-712 signatures when swap is cancelled after signing
- `src/lib/price/` — CoinGecko market ticker (`marketTicker.ts`), chart data
- `src/config/` — `SystemConfiguration.ts` (env vars, API URLs), `ChainsConfig.ts`, `FaucetConfig.ts`
- `src/abis/` — Contract ABIs (evm/, solana/)
- `src/services/` — Backend API fetch helpers (`GetData.ts`, `AuthApi.ts` login/health)

### Wallet integration

Uses **Reown AppKit** (formerly WalletConnect) with three adapters:
- `EthersAdapter` for EVM chains (ethers v6)
- `SolanaAdapter` for Solana
- `BitcoinAdapter` for Bitcoin

Network switching and wallet state are managed via custom hooks in `src/hooks/`. The `useReownWalletSync` hook is the primary wallet state hook.

### i18n

Header locale menu switches **English**, **简体中文**, and **繁體中文**. Preference is stored in `localStorage` (`app-locale`).

- **Pages / components:** `import { useI18n } from "@/i18n"` → `const { t } = useI18n()` → `t("some.key")`
- **Non-React code** (lib, hooks): `import { tGlobal } from "@/i18n"` → `tGlobal("some.key")`
- **New copy:** add the same key to `src/i18n/locales/en.ts`, `zh-CN.ts`, and `zh-TW.ts`
- **Exceptions:** header **Network** label and chain names in the network `<select>` stay English (not translated); gas fee row labels (**Base Fee**, **Priority Fee**, **Max Base Fee**, **Max Base Fee + Priority**) stay English

### Network gas (header)

- **Badge:** `HeaderGasStatus.tsx` in `WalletControls`; polls every 30s via `useNetworkGas` → `fetchNetworkGasSnapshot()` (`GasStrategy.ts`, public RPC via `getReadonlyProviderForChain`)
- **EIP-1559 display:** Base Fee, Priority Fee, Max Base Fee (`base × 1.05`), badge total = **Max Base Fee + Priority** (matches tx `maxFeePerGas`)
- **Priority fee:** derived from `gasPrice − baseFee` on public RPC (avoids MetaMask-inflated `maxPriorityFeePerGas`)
- **Tx overrides:** `withCustomGasPrice(signer, chainId)` wraps BricSwap sends; reuses polled gas cache when fresh (`resolveGasPriceOverrides`)
- **Mobile (≤768px):** compact badge (icon + value); tap opens fee breakdown; locale/gas popovers use edge-aware positioning; logo hidden to save header space

### Markets

- `/markets` — Binance-style market list (top 250 by market cap from CoinGecko, 50 rows/page, local sort/search)
- `/market` — Single-coin chart (K-line / area, navigated from list rows)
- Sidebar includes **Markets** (`nav.markets`) under Ethereum section
- Long token full names in the list are truncated with `...` (hover `title` shows full name)

### BricSwap

- Route: `/swap` (`SwapPage.tsx`); SDK wrapper in `src/lib/swap/BricSwap.ts`
- BRIC dex proxy base URL defaults to `${REACT_APP_API_URL}/api` (`SystemConfiguration.ts`; override with `REACT_APP_BRIC_DEX_PROXY_BASE_URL`)
- **ERC20:** one-time `approve(Permit2, max)` when allowance is low → EIP-712 `signPermitTransferFromWithPermit2` → `swapExactInputWithPermit2` (no direct approve to BricSwap router)
- **Native ETH** (`0x000…000`): plain `previewSwapExactInput` / `swapExactInput` (no Permit2)
- **Gas:** swaps use `withCustomGasPrice` (same fees as header badge; SDK `autoGasBuffer` still applies to gas limit)
- **Permit2 cache:** if user signs Permit2 then cancels the final wallet tx, retry with the same token/amount reuses the signature until deadline or success (`swapPermit2Cache.ts`)
- Chain/token config: `SwapChainConfig.ts`, `BricConfig.ts`; USDT-style tokens may require allowance reset before Permit2 approve (`tokensRequiringAllowanceReset`)

### ethers

EVM code uses **ethers v6** (`ethers` package). Amounts on-chain use native `bigint` where applicable.

## Environment

Copy `.env.example` to `.env`. Required variables:

- `REACT_APP_WALLETCONNECT_PROJECTID` — Reown/WalletConnect project ID
- `REACT_APP_ALCHEMY_KEY_V3` — Alchemy RPC / NFT API key
- `REACT_APP_API_URL` — Backend base URL (also used for BRIC dex proxy at `{API_URL}/api` unless overridden)

Backend API base URL is in `src/config/SystemConfiguration.ts` (`React_Serve_Back`, default `https://ethan-dapp.onrender.com`). The backend is not in this repo.
