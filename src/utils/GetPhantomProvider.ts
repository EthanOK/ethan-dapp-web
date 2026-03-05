import type { PublicKey } from "@solana/web3.js";

type PhantomPublicKey = PublicKey & {
  toBase58: () => string;
};

type PhantomProvider = {
  isPhantom?: boolean;
  connect: () => Promise<void>;
  on: (
    event: "disconnect" | "accountChanged",
    handler: (publicKey: PhantomPublicKey | null) => void
  ) => void;
};

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomProvider;
    };
  }
}

export const getPhantomProvider = async (): Promise<
  PhantomProvider | undefined
> => {
  if ("phantom" in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      await provider.connect();

      provider.on("disconnect", () => {
        console.log("Disconnected from Phantom wallet");
        localStorage.removeItem("currentSolanaAccount");
      });

      provider.on("accountChanged", (publicKey) => {
        if (publicKey) {
          const address = publicKey.toBase58();
          console.log(`Switched to account ${address}`);
          localStorage.setItem("currentSolanaAccount", address);
        } else {
          provider.connect().catch(() => {
            // ignore reconnect error
          });
        }
      });

      return provider;
    }
  }

  window.open("https://phantom.app/", "_blank");
  return undefined;
};
