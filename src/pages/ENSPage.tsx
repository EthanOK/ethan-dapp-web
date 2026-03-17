import { useEffect, useState } from "react";
import {
  getENSUniversalResolver,
  getAddressOfENSTheGraph,
  getENSByTokenId
} from "../api/GetData";
import { isAddress } from "../utils/Utils";
import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";

const ENSPage = () => {
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [ensInput, setEnsInput] = useState("");
  const [tokenIdInput, setTokenIdInput] = useState("");
  const [messageENS, setMessageENS] = useState("");
  const [messageAddress, setMessageAddress] = useState("");
  const [messageName, setMessageName] = useState("");

  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updatePrices, 5000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  const updatePrices = async () => {
    // keep for any future price display
  };

  useEffect(() => {
    if (isMounted) {
      const account = localStorage.getItem("userAddress");
      if (account !== null) setCurrentAccount(account);
    }
  }, [isMounted]);

  const parseAddress = (val: string): string | null => {
    const trimmed = val.trim();
    if (trimmed.length === 44 && trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed) as string;
        return isAddress(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }
    return isAddress(trimmed) ? trimmed : null;
  };

  const getENSHandler = async () => {
    const addr = parseAddress(addressInput);
    if (!addr) {
      toast.error("Invalid address");
      return;
    }
    const result = await getENSUniversalResolver(addr);
    if (result.code !== 200) {
      toast.error((result as { message?: string }).message);
      return;
    }
    setMessageENS(result.data === null ? "null" : String(result.data));
  };

  const getAddressHandler = async () => {
    const ens = ensInput.trim();
    if (ens.length < 4) {
      toast.error("ENS name too short");
      return;
    }
    const result = (await getAddressOfENSTheGraph(ens)) as {
      code?: number;
      message?: string;
      data?: string | null;
    };
    if (result.code !== 200) {
      toast.error(result.message);
      return;
    }
    setMessageAddress(result.data === null ? "null" : (result.data ?? "null"));
  };

  const getNameByTokenIdHandler = async () => {
    const tokenId = tokenIdInput.trim();
    if (tokenId.length < 64) {
      toast.error("Token ID must be at least 64 chars");
      return;
    }
    const result = (await getENSByTokenId(tokenId)) as {
      code?: number;
      message?: string;
      data?: string | null;
    };
    if (result.code !== 200) {
      toast.error(result.message);
      return;
    }
    setMessageName(result.data === null ? "null" : (result.data ?? "null"));
  };

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>ENS Service</h1>
        <p>Resolve ENS names and addresses</p>
      </section>
      <section className="feature-panel">
        <h3>Get ENS by address</h3>
        <div className="feature-field">
          <label htmlFor="ens-address">Address</label>
          <input
            id="ens-address"
            type="text"
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
            placeholder="0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getENSHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Get ENS
          </button>
        </div>
        {messageENS && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <label>Result</label>
            <div
              style={{
                padding: "10px 12px",
                background: "var(--w3-bg-elevated)",
                borderRadius: "var(--w3-radius-sm)",
                border: "1px solid var(--w3-border)",
                fontFamily: "var(--w3-font-mono)",
                color: "var(--w3-accent)"
              }}
            >
              {messageENS}
            </div>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>Get address by ENS</h3>
        <div className="feature-field">
          <label htmlFor="ens-name">ENS name</label>
          <input
            id="ens-name"
            type="text"
            value={ensInput}
            onChange={(e) => setEnsInput(e.target.value)}
            placeholder="abc.eth"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getAddressHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Get address
          </button>
        </div>
        {messageAddress && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <label>Result</label>
            <div
              style={{
                padding: "10px 12px",
                background: "var(--w3-bg-elevated)",
                borderRadius: "var(--w3-radius-sm)",
                border: "1px solid var(--w3-border)",
                fontFamily: "var(--w3-font-mono)",
                color: "var(--w3-accent)",
                wordBreak: "break-all"
              }}
            >
              {messageAddress}
            </div>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>Get name by token ID</h3>
        <div className="feature-field">
          <label htmlFor="ens-tokenid">ENS token ID</label>
          <input
            id="ens-tokenid"
            type="text"
            value={tokenIdInput}
            onChange={(e) => setTokenIdInput(e.target.value)}
            placeholder="79233663829379634837589865448569342784712482819484549289560981379859480642508"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">
          <button
            type="button"
            onClick={getNameByTokenIdHandler}
            className="cta-button mint-nft-button"
            disabled={!currentAccount}
          >
            Get name by token ID
          </button>
        </div>
        {messageName && (
          <div className="feature-field" style={{ marginTop: 12 }}>
            <label>Result</label>
            <div
              style={{
                padding: "10px 12px",
                background: "var(--w3-bg-elevated)",
                borderRadius: "var(--w3-radius-sm)",
                border: "1px solid var(--w3-border)",
                fontFamily: "var(--w3-font-mono)",
                color: "var(--w3-accent)"
              }}
            >
              {messageName}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ENSPage;
