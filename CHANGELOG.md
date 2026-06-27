# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.0.0](https://github.com/EthanOK/ethan-bric-web/compare/v2.2.12...v3.0.0) (2026-06-27)


### Features

* **bricswap:** cache swap data, refresh prices, and add chain icons. ([c76aa6f](https://github.com/EthanOK/ethan-bric-web/commit/c76aa6f5aa28120e1a9b2035a52f6d5b28d0218b))
* **bricswap:** enhance token picker, balances, and swap defaults. ([d90dd5b](https://github.com/EthanOK/ethan-bric-web/commit/d90dd5b7e81fdb49eb38447657c4c1344e4c2b8d))
* **bricswap:** improve market info contract address row. ([f88ee36](https://github.com/EthanOK/ethan-bric-web/commit/f88ee36bb4e44d7900f3758b8148df9500e22e91))
* **bricswap:** polish swap success toast and flip amount swap. ([59cc755](https://github.com/EthanOK/ethan-bric-web/commit/59cc7555373e3c36f1bc11809a5cfc393330150b))
* migrate from CRACO/Webpack to Bun + Vite ([c513032](https://github.com/EthanOK/ethan-bric-web/commit/c513032a683f5e0242d38542d21ae487934a5937))


### Bug Fixes

* **bricswap:** refresh quote after approve before executing swap. ([dae252d](https://github.com/EthanOK/ethan-bric-web/commit/dae252d3ed9741b040d1f0bd6671e8df3e1ef9a7))
* **build:** keep vendor chunks whole + strict order to fix reown runtime crash ([3f2706a](https://github.com/EthanOK/ethan-bric-web/commit/3f2706a3fd052044f348c278925d10b913860f56))
* **build:** use rolldown auto code-splitting to fix 'PublicKey is not defined' crash ([ae2e605](https://github.com/EthanOK/ethan-bric-web/commit/ae2e605c6bed39455466bdd82ed93a8410125f04))
* **build:** use rolldown auto code-splitting to fix 'PublicKey is not defined' crash ([fa6e0d6](https://github.com/EthanOK/ethan-bric-web/commit/fa6e0d6178f2493ca450f37f88771a8208d10392))
* **release:** stamp version from package.json + commitAll so release includes build ([69672e1](https://github.com/EthanOK/ethan-bric-web/commit/69672e1ac44edf478a10aed736c71f7ebc9e37a8))
* update Dockerfile, git hooks, and cleanup for Bun + Vite ([2f12df0](https://github.com/EthanOK/ethan-bric-web/commit/2f12df0c77e4d29f76419721614c94f0ea5f5a02))

### [2.2.12](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.11...v2.2.12) (2026-06-22)


### Features

* **bricswap:** guard swap when bricSwapAddress is unset ([303d4c0](https://github.com/EthanOK/ethan-dapp-web/commit/303d4c064d291e7536b25abb1752456e956315a1))

### [2.2.11](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.10...v2.2.11) (2026-06-18)


### Features

* add understand-anything ([d89c6e2](https://github.com/EthanOK/ethan-dapp-web/commit/d89c6e20d95dacacfe45b79dfbe9cd7e064dd941))
* **bricswap:** add Ethereum BricSwap page at /bricswap ([0343efb](https://github.com/EthanOK/ethan-dapp-web/commit/0343efbbaee9be7b9ba9b7cafd34855e16193a96))
* **bricswap:** CoinGecko swap pricing, fetch dedupe, and disable BSC ([e1f65c9](https://github.com/EthanOK/ethan-dapp-web/commit/e1f65c98bd4626b0172f9dcbe23188c416a75bb0))
* **bricswap:** enable BSC swap with SDK 0.3.10 and chain-aware token picker. ([b9102ed](https://github.com/EthanOK/ethan-dapp-web/commit/b9102edcf5f28936a0295d5d254b65acdcd39163))
* **bricswap:** guest quotes, Kyber prices, and gentler wallet disconnect ([1bbd9a2](https://github.com/EthanOK/ethan-dapp-web/commit/1bbd9a2f7de3c49abc6947b7a298e435a1593615))


### Bug Fixes

* **bricswap:** reset mainnet USDT allowance before exact approve ([e605188](https://github.com/EthanOK/ethan-dapp-web/commit/e6051881a302c48dd48d3a38947dd1c2b1df833f))
* **bricswap:** restore last swap pair after refresh and chain switch ([e2cac95](https://github.com/EthanOK/ethan-dapp-web/commit/e2cac95e8c6b7f5f278885e3e21169a63c6cf351))

### [2.2.10](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.9...v2.2.10) (2026-05-28)


### Features

* **market:** add 6M chart range and ignore local docs ([8a80385](https://github.com/EthanOK/ethan-dapp-web/commit/8a803853dfb081cb721f437ad6e4e267f179a976))
* **market:** add K-line chart and rename route to /market ([775da83](https://github.com/EthanOK/ethan-dapp-web/commit/775da8390df24b5d895b5ad4ccba61db4bdbc5e5))

### [2.2.9](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.8...v2.2.9) (2026-05-22)


### Features

* add batch transfer native coin in create transaction page ([9defdaa](https://github.com/EthanOK/ethan-dapp-web/commit/9defdaa85b8da85cb1797de9e94218a32f86e1e3))
* add cancel transaction feature ([658c774](https://github.com/EthanOK/ethan-dapp-web/commit/658c774a0ac88bfbb749ba0842acc56ebcb0c552))
* add CoinGecko Kline page with dual-axis price/volume chart ([160b231](https://github.com/EthanOK/ethan-dapp-web/commit/160b2318747f8234d3ac254d6b55daaa76fbcea2))
* add hoodi into layerzero oft bridge ([34b0ec9](https://github.com/EthanOK/ethan-dapp-web/commit/34b0ec95fa415b454f5382f25c2cceec8a6f1ce9))
* add LayerZero OFT Bridge page ([00595b9](https://github.com/EthanOK/ethan-dapp-web/commit/00595b905c10cbabdc71673cc6b97d790bcc4499))
* add mobile landscape fullscreen mode for market chart ([1b885bf](https://github.com/EthanOK/ethan-dapp-web/commit/1b885bfbc4f28b711ac713b2999d5b06cdadb434))
* add multicall3 and ERC20AllowancePage ([c3e9625](https://github.com/EthanOK/ethan-dapp-web/commit/c3e96250f5c44f0a276b6cd686329d6c04bbe787))
* add USDC-Circle to faucet config in sepolia ([94d56ce](https://github.com/EthanOK/ethan-dapp-web/commit/94d56ceee9efe6efdad90a84f0c1758d74515fa5))
* improve mobile nav, market UX, and live price updates ([465cb86](https://github.com/EthanOK/ethan-dapp-web/commit/465cb8650cf56f67b45c19223c2cac5f9b48b8ec))
* **LayerZero:** connect/switch/load flow, wallet-gated metadata, fee UI defaults to 0 ([6178a18](https://github.com/EthanOK/ethan-dapp-web/commit/6178a18bf41ff46d39d09f3bcb140056957d26ea))


### Bug Fixes

* FaucetTokenPage connect button ([8fe8ee7](https://github.com/EthanOK/ethan-dapp-web/commit/8fe8ee7332fbff13f973328c429aceb8adff02da))
* **marketchart:** do not reset zoom on spot price poll ([299639b](https://github.com/EthanOK/ethan-dapp-web/commit/299639bb641a659bac48ba20336b9a79aaa4ab0d))

### [2.2.8](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.7...v2.2.8) (2026-04-07)


### Features

* add address styled qr code ([e16810b](https://github.com/EthanOK/ethan-dapp-web/commit/e16810b6d378fa43b00658a8db98ee86ebb545be))
* add bitcoin support to home page ([baec00f](https://github.com/EthanOK/ethan-dapp-web/commit/baec00fe9bce03b0b0d11be253b5c0abe7fc7e14))
* add eth-url-parser for ethereum encoded uri ([4a58e8d](https://github.com/EthanOK/ethan-dapp-web/commit/4a58e8d6f5f6b96723ff079da8823da199079652))
* add umami analytics ([c5ccbe8](https://github.com/EthanOK/ethan-dapp-web/commit/c5ccbe82f184ac03023db653a9de0fe4b9a46ac1))
* add version footer ([5f30597](https://github.com/EthanOK/ethan-dapp-web/commit/5f30597780a1fa046d9e91ec954214507fc6560d))
* refactor solana utils page and burn token page ([77adc9d](https://github.com/EthanOK/ethan-dapp-web/commit/77adc9dcf1ebea1ac58bb0ae57823f3a62f1156b))
* update faucet config and page ([e1782ae](https://github.com/EthanOK/ethan-dapp-web/commit/e1782ae7cbd23bfc10b547ea66b4b46dc6c9779d))
* update translation status and UI for SolanaUtilsPage ([a1eac3f](https://github.com/EthanOK/ethan-dapp-web/commit/a1eac3fb70a67865d4d1fe48c19875470673f7d5))


### Bug Fixes

* fix get bitcoin balance in home page ([639ad0e](https://github.com/EthanOK/ethan-dapp-web/commit/639ad0ee6546a74064fd869a484fa185d91c0add))
* fixed left menu problem ([6bcfc69](https://github.com/EthanOK/ethan-dapp-web/commit/6bcfc69373cc655a2abe95140f05c20f120ebb08))
* update chainId in HomePage ([6bc8ae8](https://github.com/EthanOK/ethan-dapp-web/commit/6bc8ae813ab9e401ac8b00978d8aa09a884030ed))
* update placeholder addresses and data in EstimateTxFeePage and CreateTransactionPage ([25093ce](https://github.com/EthanOK/ethan-dapp-web/commit/25093ced332682620b096c7b1ef106451201cb75))

### [2.2.7](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.6...v2.2.7) (2026-03-06)


### Features

* add OKB price to home page ([1102cbb](https://github.com/EthanOK/ethan-dapp-web/commit/1102cbbe37980884fa6ab693206703ee9fa5c095))


### Bug Fixes

* optimize homepage and use craco build ([cc881d7](https://github.com/EthanOK/ethan-dapp-web/commit/cc881d7f753eaa260aea7c34e9e3c4cfe454a159))

### [2.2.6](https://github.com/EthanOK/ethan-dapp-web/compare/v2.2.5...v2.2.6) (2026-03-05)


### Features

* add PrivateKeyToKeypair in SolanaLoginPage ([3311dee](https://github.com/EthanOK/ethan-dapp-web/commit/3311dee82eb9a8f2aed8c9b0b94526fedfc0ebfa))
* add USDe in Hoodi FaucetConfig ([1fe2f7f](https://github.com/EthanOK/ethan-dapp-web/commit/1fe2f7f21c255c777163eb10c47de95a2adaf8e5))
* Added Dark Mode ([d7f3de4](https://github.com/EthanOK/ethan-dapp-web/commit/d7f3de40da724fb0c9418a0e760aefac588934d1))
* disable faucet button during transaction processing ([e6f9646](https://github.com/EthanOK/ethan-dapp-web/commit/e6f9646f0b6caadbd4336d355f446d02f4035bb1))
* faucet USDe ([2d6d26c](https://github.com/EthanOK/ethan-dapp-web/commit/2d6d26c52d725cfd65cf4779e842d77d58b9d2a1))
* support hoodi testnet in faucetTokenPage ([dba2f00](https://github.com/EthanOK/ethan-dapp-web/commit/dba2f003f893efe8a8323358c610bc0477502e5b))
* use @solana/wallet-adapter-react get wallet in solana utils page ([b694249](https://github.com/EthanOK/ethan-dapp-web/commit/b694249cfcd53a9d171fac382503628a0899db35))
* use @solana/wallet-adapter-react get wallet in wsol page ([7ac2528](https://github.com/EthanOK/ethan-dapp-web/commit/7ac2528b3e3ca520f8fc85d07faa2c7965fd6c79))


### Bug Fixes

* add vercel.json and build directory ([572417a](https://github.com/EthanOK/ethan-dapp-web/commit/572417a577659ee457b9d9f1fdf0aee60af1387a))
* update balance when connect wallet in FaucetTokenPage ([b15f9d4](https://github.com/EthanOK/ethan-dapp-web/commit/b15f9d467de2355f836728d684a88d3a46f0df5f))
* update Wsol config ([b690146](https://github.com/EthanOK/ethan-dapp-web/commit/b69014632c0ceb9bea5cb2932597a950916cfa4b))

### [2.2.5](https://github.com/EthanOK/ethan-bric-web/compare/v2.2.4...v2.2.5) (2025-09-12)


### Features

* add `APPL-B` and `META-B` ([a96a47c](https://github.com/EthanOK/ethan-bric-web/commit/a96a47c845e8c35eec5b687b19490b2d4df23a52))
* add Faucet BRIC Token ([c9a70e4](https://github.com/EthanOK/ethan-bric-web/commit/c9a70e4ebb04562c3cbfbed74d9928a2674ab9eb))
* add Faucet TSLA-B and NVDA-B ([55885d9](https://github.com/EthanOK/ethan-bric-web/commit/55885d95f7b73338b3ac7e3ed3598392fd1af38d))
* add faucet usdc in sepolia ([125489d](https://github.com/EthanOK/ethan-bric-web/commit/125489d79c9b7eb943e8f46787b0543f1c4eb6d9))
* add hoodi testnet ([b580c40](https://github.com/EthanOK/ethan-bric-web/commit/b580c4086ea4185cb223d5b2dc7fc572589843ec))
* faucet TokenList add stETH ([011255e](https://github.com/EthanOK/ethan-bric-web/commit/011255e5acbade18078d26ce0d35be41d7eb3a65))
* publish docker version latest ([e283a01](https://github.com/EthanOK/ethan-bric-web/commit/e283a01ac5767cc391b7bbaa2411fbb3301abcda))
* update faucetAmount ([f42cb3b](https://github.com/EthanOK/ethan-bric-web/commit/f42cb3b148f679d2b2ed19259b458b5bed79391e))
* use `useAppKitAccount` Hooks get account ([ed332c9](https://github.com/EthanOK/ethan-bric-web/commit/ed332c9e55f91d157385a50fccc8194fe95e2f5e))


### Bug Fixes

* checkAndSwitchChain in faucetTokenHandler ([078f75d](https://github.com/EthanOK/ethan-bric-web/commit/078f75d64bbf4a68371c4c4beeb7d2ac5bb62d78))
* checkAndSwitchChain in FaucetTokenPage ([69f1d52](https://github.com/EthanOK/ethan-bric-web/commit/69f1d52b416916c3b800c76857b97a8bd06dc2f4))
* login in must sign message ([1ba0ce3](https://github.com/EthanOK/ethan-bric-web/commit/1ba0ce3216d6ebb0bf2d37ce92f2065bb0aed99d))
* remove signSiweMessage ([0f1a43f](https://github.com/EthanOK/ethan-bric-web/commit/0f1a43f1e1de79ca418db0fc46a5d24a9a8f6d2b))
* setCurrentAccount(address) ([882181d](https://github.com/EthanOK/ethan-bric-web/commit/882181deb55e1cefca3c43fb919c686df3dc7e95))
* update SelectedToken ([8468798](https://github.com/EthanOK/ethan-bric-web/commit/8468798db6b1f9283d5420f4f390c2b939277ae9))

### [2.2.4](https://github.com/EthanOK/ethan-bric-web/compare/v2.2.3...v2.2.4) (2025-07-22)


### Features

* add login webhooks ([7de4fad](https://github.com/EthanOK/ethan-bric-web/commit/7de4fad8cf24cbb0fdf3645ea7f0b411022adffd))
* add toast message ([127a901](https://github.com/EthanOK/ethan-bric-web/commit/127a90194e97c286ca7af34db638d8d6d6110731))
* initializeSubscribers reown's modal ([3f144bf](https://github.com/EthanOK/ethan-bric-web/commit/3f144bf48f983078c496027ae5912382f0ac0f3b))


### Bug Fixes

* add DISCORD_WEBHOOK_URL in env ([80d426f](https://github.com/EthanOK/ethan-bric-web/commit/80d426f17b8f5dd15528b642ea317ca2ef7d8f0f))
* connnect metamask wrong chainId ([806a56a](https://github.com/EthanOK/ethan-bric-web/commit/806a56ab2af0218e34cddc28faa1edc33d6290a0))
* update balance ([2041ce3](https://github.com/EthanOK/ethan-bric-web/commit/2041ce3e8f45a56ffebe476c7d4211f306bc2a0e))

### [2.2.3](https://github.com/EthanOK/ethan-bric-web/compare/v2.2.2...v2.2.3) (2025-07-08)


### Features

* add EIP7702Page (only privateKey, JSON-RPC is not supported) ([6926670](https://github.com/EthanOK/ethan-bric-web/commit/6926670d6545f2c48501b892bb1d35a0a14e9aa4))
* use reown/appkit connect wallet ([8a41392](https://github.com/EthanOK/ethan-bric-web/commit/8a41392f7151ce1857256b80269b25016c3870a2))

### [2.2.2](https://github.com/EthanOK/ethan-bric-web/compare/v2.2.1...v2.2.2) (2025-06-26)


### Features

* login dapp use `ERC-4361` ([cb97580](https://github.com/EthanOK/ethan-bric-web/commit/cb9758055a065c2702eda33d2afc0d1aadc1f4d3))
* publish docker ([a85b78b](https://github.com/EthanOK/ethan-bric-web/commit/a85b78bcf6f2ac8f5c088bac71bc8d5b85f6721c))


### Bug Fixes

* alert error reason in CreateTransactionPage ([ed48924](https://github.com/EthanOK/ethan-bric-web/commit/ed48924f50c2af94d49f14ac9da08992e2411dca))
* string eq ([d7b0a16](https://github.com/EthanOK/ethan-bric-web/commit/d7b0a166f8b85672a4c55f8bc6c2f3aad5bec47e))

### [2.2.1](https://github.com/EthanOK/ethan-yungou-web/compare/v2.2.0...v2.2.1) (2025-06-14)


### Bug Fixes

* add FaucetConfig ([62eead2](https://github.com/EthanOK/ethan-yungou-web/commit/62eead2714810d6c7896522aa7a1e2b2028b834e))

## [2.2.0](https://github.com/EthanOK/ethan-yungou-web/compare/v2.1.6...v2.2.0) (2025-06-14)


### Features

* add sign snapshot ([32dbcf6](https://github.com/EthanOK/ethan-yungou-web/commit/32dbcf65568fc734b1f80e2509e5a5b6a7fbffd7))
* add Web3AuthSolanaPage ([8a71f82](https://github.com/EthanOK/ethan-yungou-web/commit/8a71f82cb45fb4f984884b8e86f2dcabfc758efb))
* compatible ethersV6 and ethersV5 ([30deab9](https://github.com/EthanOK/ethan-yungou-web/commit/30deab95156adec5247e5e1e2a34948d93a870bb))
* faucet wstETH in Sepolia ([2098d91](https://github.com/EthanOK/ethan-yungou-web/commit/2098d919d46323682bf6a0e72830a7f7b63e90d7))
* publish docker ([ffb8715](https://github.com/EthanOK/ethan-yungou-web/commit/ffb8715d0a3f6902da860b8003b59fcc72be8633))


### Bug Fixes

* add YunGouAggregators_sepolia ([a966b77](https://github.com/EthanOK/ethan-yungou-web/commit/a966b7795e88cd626234d4591dd61576cf6a232b))
* FaucetTokenPage ([54e661c](https://github.com/EthanOK/ethan-yungou-web/commit/54e661c00489c9451cd878b37e58dad0dbda9615))
* prettier code ([98f8c7b](https://github.com/EthanOK/ethan-yungou-web/commit/98f8c7b3e22a9539eddfefe6c8e09e570f5e06b8))
* remove Goerli ([cdecb43](https://github.com/EthanOK/ethan-yungou-web/commit/cdecb43db1a8f378f2e8a0cfde62bf7bb6d777be))
* signBulkOrderOpenSeaMessage ([265e826](https://github.com/EthanOK/ethan-yungou-web/commit/265e82643de8c79d73cd056165173917995a37fe))
* signCustomBulkOrders ([04146c9](https://github.com/EthanOK/ethan-yungou-web/commit/04146c930e9dce4668a8fdef1ea472715f1dc300))
* string eq ([8f4c5c0](https://github.com/EthanOK/ethan-yungou-web/commit/8f4c5c0256695547cd0a468ad2b0c0c6f89646a7))
