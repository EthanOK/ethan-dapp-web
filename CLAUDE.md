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
- `src/hooks/` — Wallet state (`useReownWalletSync`, `useEvmWallet`), theme, sidebar, network switching
- `src/lib/wallet/` — `GetProvider.ts` (provider resolution), `ConnectWallet.ts`, `Suscribers.ts` (AppKit event subscribers)
- `src/lib/evm/` — Contract interactions, LayerZero, multicall, EIP-7702
- `src/lib/nft/` — OpenSea, mint, orders
- `src/lib/solana/` — Connection, WSOL, sign/verify
- `src/lib/signing/` — EIP-712, bulk orders
- `src/config/` — `SystemConfiguration.ts` (env vars, API URLs), `ChainsConfig.ts`, `FaucetConfig.ts`
- `src/abis/` — Contract ABIs (evm/, solana/)
- `src/services/` — Backend API fetch helpers

### Wallet integration

Uses **Reown AppKit** (formerly WalletConnect) with three adapters:
- `EthersAdapter` for EVM chains (ethers v6)
- `SolanaAdapter` for Solana
- `BitcoinAdapter` for Bitcoin

Network switching and wallet state are managed via custom hooks in `src/hooks/`. The `useReownWalletSync` hook is the primary wallet state hook.

### ethers

EVM code uses **ethers v6** (`ethers` package). Amounts on-chain use native `bigint` where applicable.

## Environment

Copy `.env.example` to `.env`. Required variables:

- `REACT_APP_WALLETCONNECT_PROJECTID` — Reown/WalletConnect project ID
- `REACT_APP_ALCHEMY_MAINNET_URL`, `REACT_APP_ALCHEMY_KEY_V3` — Alchemy RPC
- `REACT_APP_MAINNET_RPC`, `REACT_APP_SEPOLIA_RPC` — Fallback RPCs

Backend API base URL is in `src/config/SystemConfiguration.ts` (`React_Serve_Back`). The backend is not in this repo.
