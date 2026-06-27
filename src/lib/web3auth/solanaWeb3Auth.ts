import type { Web3Auth } from "@web3auth/modal";
import { WEB3AUTH_CLIENT_ID } from "@/lib/web3auth/constants";

const SOLANA_CHAIN_CONFIG = {
  chainNamespace: "solana" as const,
  chainId: "0x3",
  rpcTarget: "https://api.devnet.solana.com",
  displayName: "Solana Testnet",
  blockExplorerUrl: "https://explorer.solana.com",
  ticker: "SOL",
  tickerName: "Solana",
  logo: "https://images.toruswallet.io/solana.svg"
};

let web3auth: Web3Auth | null = null;
let initPromise: Promise<Web3Auth> | null = null;

/** Lazy-load @web3auth/modal and initialize the Solana modal once. */
export async function initSolanaWeb3Auth(): Promise<Web3Auth> {
  if (web3auth) return web3auth;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [
      { Web3Auth },
      { CHAIN_NAMESPACES, WEB3AUTH_NETWORK },
      { SolanaPrivateKeyProvider }
    ] = await Promise.all([
      import("@web3auth/modal"),
      import("@web3auth/base"),
      import("@web3auth/solana-provider")
    ]);

    const privateKeyProvider = new SolanaPrivateKeyProvider({
      config: {
        chainConfig: {
          ...SOLANA_CHAIN_CONFIG,
          chainNamespace: CHAIN_NAMESPACES.SOLANA
        }
      }
    });

    const instance = new Web3Auth({
      clientId: WEB3AUTH_CLIENT_ID,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      privateKeyProvider
    });

    await instance.initModal();
    web3auth = instance;
    return instance;
  })();

  return initPromise;
}

/** Lazy-load SolanaWallet from @web3auth/solana-provider. */
export async function createSolanaWallet(provider: unknown) {
  const { SolanaWallet } = await import("@web3auth/solana-provider");
  return new SolanaWallet(provider as never);
}
