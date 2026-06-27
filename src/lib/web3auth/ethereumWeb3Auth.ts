import type { Web3Auth } from "@web3auth/modal";
import {
  WEB3AUTH_CLIENT_ID,
  WEB3AUTH_ETH_CHAIN_CONFIG
} from "@/lib/web3auth/constants";

let web3auth: Web3Auth | null = null;
let initPromise: Promise<Web3Auth> | null = null;

/** Lazy-load @web3auth/modal and initialize the Ethereum modal once. */
export async function initEthereumWeb3Auth(): Promise<Web3Auth> {
  if (web3auth) return web3auth;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [{ Web3Auth }, { WEB3AUTH_NETWORK }, { EthereumPrivateKeyProvider }] =
      await Promise.all([
        import("@web3auth/modal"),
        import("@web3auth/base"),
        import("@web3auth/ethereum-provider")
      ]);

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig: WEB3AUTH_ETH_CHAIN_CONFIG }
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
