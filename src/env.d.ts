/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_VERSION: string;
  readonly REACT_APP_WALLETCONNECT_PROJECTID: string;
  readonly REACT_APP_ALCHEMY_MAINNET_URL: string;
  readonly REACT_APP_ALCHEMY_KEY_V3: string;
  readonly REACT_APP_MAINNET_RPC: string;
  readonly REACT_APP_SEPOLIA_RPC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
