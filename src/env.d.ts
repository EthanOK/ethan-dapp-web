/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly REACT_APP_VERSION: string;
  readonly REACT_APP_WALLETCONNECT_PROJECTID: string;
  readonly REACT_APP_ALCHEMY_KEY_V3: string;
  readonly REACT_APP_API_URL: string;
  readonly REACT_APP_BRIC_DEX_PROXY_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
