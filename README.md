# ethan-dapp-web

Multi-chain Web3 dApp dashboard (EVM, Solana, Bitcoin) built with **React 18 + TypeScript**. Wallet connection via [Reown AppKit](https://docs.reown.com/) and Web3Auth. Deployed on Vercel and Docker.

**Bun:** latest recommended

## Quick start

```bash
cp .env.example .env   # fill in RPC / WalletConnect keys
bun install
bun start              # http://localhost:3000
```

| Command | Description |
|---------|-------------|
| `bun start` | Dev server (Vite) at localhost:3000 |
| `bun run build` | Production build → `build/` |
| `bun run preview` | Serve `build/` locally |
| `bun run typecheck` | TypeScript check |
| `bun run prettier` | Format source |
| `bun run release` | Patch version bump (standard-version) |

`start` / `build` inject `REACT_APP_VERSION` from `package.json` automatically.

## Project layout

```
src/
├── app/           App shell (App.tsx, App.css, Wallet.ts — AppKit init)
├── pages/         Route pages (one feature per file)
├── i18n/          Locale provider, useI18n hook, en / zh-CN / zh-TW strings
├── components/    Shared UI
├── hooks/         React hooks (wallet, theme, sidebar, network switch)
├── lib/           Domain logic
│   ├── wallet/    Provider, ConnectWallet, AppKit subscribers
│   ├── evm/       Contracts, LayerZero, multicall, EIP-7702
│   ├── nft/       OpenSea, mint, orders
│   ├── solana/    Connection, WSOL, sign/verify
│   ├── signing/   EIP-712, bulk orders
│   ├── swap/      BricSwap (Permit2 quote / approve / execute via bric-sdk)
│   ├── price/     CoinGecko, LP price
│   └── shared/    Utils, format helpers
├── config/        Chains, faucet, system constants
├── services/      Backend API fetch helpers (GetData, AuthApi)
├── abis/          Contract ABIs (evm/, solana/)
├── fixtures/      Sample order data for signing demos
└── types/         Ambient type declarations
```

Import alias: `@/` → `src/` (e.g. `@/lib/wallet/GetProvider`).

Entry: `src/index.tsx` → `src/app/App.tsx`.

## Features (sidebar)

**Ethereum:** Home, **Markets** (`/markets`), **BricSwap** (`/swap`), tx fee estimate, raw tx builder, ERC20 allowance, LayerZero OFT bridge, faucet, burn, ENS, mint NFT, EIP-712 sign, EIP-7702, utils, ERC-6551, Web3Auth.

**BricSwap:** Aggregated swap via `@bric-labs/bric-sdk`. ERC20 path uses Uniswap **Permit2** — approve Permit2 once per token if needed, sign EIP-712, then swap (no approve to the BricSwap router). Native ETH swaps skip Permit2. BRIC API defaults to `{REACT_APP_API_URL}/api`.

**Solana:** Solana utils, WSOL wrap/unwrap.

**Markets:** Top 250 coins (CoinGecko), sortable table, 50 per page. Row click opens `/market` chart. Token names truncate with `...` when too long.

**i18n:** Header globe menu — English, 简体中文, 繁體中文. All tool pages and swap UI follow the selected locale. The header **Network** label is always English.

Additional routes (not in sidebar): OpenSea buy/data, YunGou aggregators, IPFS, collection lookup, etc.

## Environment

Copy `.env.example` to `.env`. Common variables:

- `REACT_APP_WALLETCONNECT_PROJECTID` — Reown / WalletConnect project id
- `REACT_APP_ALCHEMY_KEY_V3` — Alchemy RPC / NFT API key
- `REACT_APP_API_URL` — Backend base URL (BricSwap dex proxy uses `{API_URL}/api` by default)

Backend API base URL is configured in `src/config/SystemConfiguration.ts` (`React_Serve_Back`, default `https://ethan-dapp.onrender.com`). The backend service is not in this repo.

## Docker

### Pull and run

```shell
docker pull 0xethan/ethan-dapp-web:latest
docker run -p 8888:3000 --name ethan-dapp-web --env-file .env 0xethan/ethan-dapp-web:latest
```

### Build image

Local (single platform). Enable BuildKit and pass `.npmrc` as a secret (token is **not** in the final image). **`--secret id=npmrc,src=.npmrc` is required** for `@bric-labs/bric-sdk`.

```shell
DOCKER_BUILDKIT=1 docker buildx build -t 0xethan/ethan-dapp-web:latest . \
  --platform linux/arm64 \
  --secret id=npmrc,src=.npmrc \
  --load
```

Push multi-platform:

```shell
DOCKER_BUILDKIT=1 docker buildx build -t 0xethan/ethan-dapp-web:latest . \
  --platform linux/amd64,linux/arm64 \
  --secret id=npmrc,src=.npmrc \
  --push
```

If `bun install` fails with exit code 1: ensure `.npmrc` exists with a valid GitLab token; scroll up in the log for 401/404 (registry) or husky errors (Dockerfile sets `HUSKY=0` to skip git hooks).

If you see `auth.docker.io ... i/o timeout`, configure a Docker Hub mirror or VPN, then retry.

### docker-compose

```shell
docker-compose up -d
```

## Notes

- Pre-commit runs Prettier on staged files and `bun run build`; `build/` is committed.
- EVM code uses **ethers v6** only (`ethers` package).
- NFTGO / Blur aggregator integration has been removed (service discontinued).
