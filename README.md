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
├── components/    Shared UI
├── hooks/         React hooks (wallet, theme, sidebar, network switch)
├── lib/           Domain logic
│   ├── wallet/    Provider, ConnectWallet, AppKit subscribers
│   ├── evm/       Contracts, LayerZero, multicall, EIP-7702
│   ├── nft/       OpenSea, mint, orders
│   ├── solana/    Connection, WSOL, sign/verify
│   ├── signing/   EIP-712, bulk orders
│   ├── price/     CoinGecko, LP price
│   └── shared/    Utils, format helpers
├── config/        Chains, faucet, system constants
├── services/      Backend API fetch helpers (GetData.ts)
├── abis/          Contract ABIs (evm/, solana/)
├── fixtures/      Sample order data for signing demos
└── types/         Ambient type declarations
```

Import alias: `@/` → `src/` (e.g. `@/lib/wallet/GetProvider`).

Entry: `src/index.tsx` → `src/app/App.tsx`.

## Features (sidebar)

**Ethereum:** Home, tx fee estimate, raw tx builder, ERC20 allowance, LayerZero OFT bridge, faucet, burn, ENS, mint NFT, EIP-712 sign, EIP-7702, utils, ERC-6551, Web3Auth.

**Solana:** Solana utils, WSOL wrap/unwrap.

Additional routes (not in sidebar): `/market`, OpenSea buy/data, YunGou aggregators, IPFS, collection lookup, etc.

## Environment

Copy `.env.example` to `.env`. Common variables:

- `REACT_APP_WALLETCONNECT_PROJECTID` — Reown / WalletConnect project id
- `REACT_APP_ALCHEMY_MAINNET_URL`, `REACT_APP_ALCHEMY_KEY_V3` — Alchemy RPC
- `REACT_APP_MAINNET_RPC`, `REACT_APP_SEPOLIA_RPC` — fallback RPCs

Backend API base URL is configured in `src/config/SystemConfiguration.ts` (`React_Serve_Back`). The backend service is not in this repo.

## Docker

### Pull and run

```shell
docker pull 0xethan/ethan-dapp-web:latest
docker run -p 8888:3000 --name ethan-dapp-web --env-file .env 0xethan/ethan-dapp-web:latest
```

### Build image

Local (single platform):

```shell
docker buildx build -t 0xethan/ethan-dapp-web:latest . --platform linux/arm64 --load
```

Push multi-platform:

```shell
docker buildx build -t 0xethan/ethan-dapp-web:latest . --platform linux/amd64,linux/arm64 --push
```

### docker-compose

```shell
docker-compose up -d
```

## Notes

- Pre-commit runs Prettier on staged files and `bun run build`; `build/` is committed.
- EVM code uses **ethers v6** only (`ethers` package).
- NFTGO / Blur aggregator integration has been removed (service discontinued).
