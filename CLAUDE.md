# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-chain Web3 dApp dashboard (EVM, Solana, Bitcoin) built with React 18 + TypeScript. Wallet connection via Reown AppKit (formerly WalletConnect) and Web3Auth. Deployed on Vercel and Docker.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm start` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Type check | `npm run typecheck` |
| Format code | `npm run prettier` |
| Run tests | `npm test` (Jest via CRACO — test coverage is minimal) |
| Version bump | `npm run release` (standard-version, patch bump) |

All `start`/`build` commands inject `REACT_APP_VERSION` from package.json automatically.

## Build System

**CRA + CRACO** (not Vite). `craco.config.js` overrides Webpack to:
- Disable Node.js polyfill fallbacks for `crypto`, `stream`, `assert`, `http`, `https`, `os`, `url`, `zlib`
- Provide `process` and `Buffer` globals via `ProvidePlugin`
- Use absolute imports from `src/` (tsconfig `baseUrl: "src"`)

`.npmrc` sets `legacy-peer-deps=true` to work around peer dependency conflicts.

## Pre-commit Hook

Every commit runs: `lint-staged` (Prettier on staged files) -> `npm run build` -> `git add build/`. The `build/` directory is committed to git (production artifacts are version-controlled).

## Code Style

- **Prettier**: semicolons, double quotes, 2-space indent, no trailing commas
- **ESLint**: extends `react-app`; unused vars and exhaustive-deps rules are disabled
- **Import style**: absolute imports from `src/` (e.g., `import { getProvider } from "utils/GetProvider"`)

## Architecture

**Single shell component**: `src/EthanDapp.tsx` (~560 lines) contains the header, sidebar nav, routing, wallet connection, and theme management. All routes are defined here.

**Pages**: `src/pages/` — one component per route, each managing its own state and blockchain interactions independently. No shared state management library; state lives in `useState`/`useEffect` and `localStorage`.

**Key localStorage keys**: `chainId`, `LoginType` (reown/metamask/walletconnect), `userAddress`, `token`, `app-theme`.

**Critical utility files**:
- `src/utils/GetProvider.ts` — wallet provider abstraction over MetaMask, Reown AppKit, WalletConnect. Imported by nearly every page. Provides `getProvider()` (ethers v5) and `getProviderV6()` (ethers v6).
- `src/utils/Suscribers.ts` — global store object holding Reown AppKit subscription state (account, network, provider).
- `src/utils/GetContract.ts` — creates contract instances from signer + ABI + address.
- `src/common/ChainsConfig.ts` — chain definitions and RPC URLs.
- `src/common/FaucetConfig.ts` — faucet token configuration.

**Contract ABIs**: JSON files in `src/contracts/` (ERC20, ERC721, Seaport, Uniswap, etc.).

**Backend API**: `src/api/` — fetch calls to a separate backend (default `localhost:3001`, configurable via `React_Serve_Back` env var). The backend is not in this repository.

## Multi-chain / Dual ethers

Both ethers v5 and v6 coexist. v5 is the default import (`ethers`); v6 is aliased as `ethers-v6` in package.json. Use `getProvider()` for v5, `getProviderV6()` for v6. EIP-7702 features use ethers v6's `Signer.authorize()`.

Supported chains: Ethereum, Sepolia, Hoodi, BSC, Base, X Layer (EVM); Solana mainnet + devnet; Bitcoin mainnet + testnet.

## Styling

Plain CSS with CSS custom properties for dark/light theming. Theme toggled via `data-theme` attribute on `<html>`. Variables defined in `src/index.css`. Each page has its own CSS file.

## Environment Variables

Copy `.env.example` to `.env`. Key variables: `REACT_APP_ALCHEMY_MAINNET_URL`, `REACT_APP_WALLETCONNECT_PROJECTID`, `REACT_APP_ALCHEMY_KEY_V3`, `REACT_APP_SEPOLIA_RPC`, `REACT_APP_MAINNET_RPC`.

## Versioning

Uses `standard-version` with conventional commits. Run `npm run release` to bump the patch version and generate CHANGELOG entries.
