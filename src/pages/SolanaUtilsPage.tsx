/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — TODO: 逐步补充类型
import { useEffect, useRef, useState } from "react";
import * as buffer from "buffer";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction
} from "@solana/web3.js";
import {
  signSolanaMessage,
  verifySolanaSignature,
  verifySolanaSignatureV2
} from "../utils/SolanaSignAndVerify";
import { getDevConnection } from "../utils/GetSolanaConnection";
import { getSolBalance } from "../utils/SolanaGetBalance";
import { getAssociatedAddress, stringToArray } from "../utils/Utils";
import base58 from "bs58";
import { toast } from "sonner";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { truncateHash } from "../utils/format";

const SolanaUtilsContent = () => {
  type TxStatus = "pending" | "success" | "failed" | "rejected";
  type TxResult = { link?: string; status: TxStatus };

  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection: appKitConnection } = useAppKitConnection();
  const connection = appKitConnection ?? getDevConnection();
  // const { switchNetwork } = useAppKitNetwork()
  const { isConnected, address } = useAppKitAccount();

  window.Buffer = buffer.Buffer;
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState(null);
  const [currentSolanaAccount, setCurrentSolanaAccount] = useState(null);
  const [accountSOLBalance, setAccountSOLBalance] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [associatedAddress, setAssociatedAddress] = useState("");
  const [solPrivateKey, setSolPrivateKey] = useState("");
  const [solPublicKey, setSolPublicKey] = useState("");
  const [solKeypair, setSolKeypair] = useState("");
  const [solKeypairPublicKey, setSolKeypairPublicKey] = useState("");
  const [transferTx, setTransferTx] = useState<TxResult | null>(null);
  const [isTransferProcessing, setIsTransferProcessing] = useState(false);

  const connected = !!walletProvider?.publicKey;
  const publicKey = walletProvider?.publicKey;
  const signMessage = walletProvider?.signMessage?.bind(walletProvider);
  const disconnect = walletProvider?.disconnect?.bind(walletProvider);
  const sendTransaction = walletProvider?.sendTransaction?.bind(walletProvider);

  const isUserRejected = (err: any) => {
    const code = err?.code ?? err?.error?.code;
    const msg = String(err?.message ?? err?.error?.message ?? "");
    return code === 4001 || /rejected|declined|cancel/i.test(msg);
  };

  const connectionRef = useRef(connection);
  useEffect(() => {
    connectionRef.current = connection;
  }, [connection]);

  useEffect(() => {
    setIsMounted(true);
    const POLL_MS = 15000; // 15s 轮询，减少 WalletConnect RPC 请求频率
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        updateShowData();
      }
    }, POLL_MS);

    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, [connected]);

  useEffect(() => {
    if (isMounted) {
      configData();
    }
  }, [isMounted]);

  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem("currentSolanaAccount", publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const configData = async () => {
    setCurrentAccount("0x");
    let account = localStorage.getItem("userAddress");
    if (account !== null) {
      setCurrentAccount(account);
    }
    if (connected) {
      localStorage.setItem("currentSolanaAccount", publicKey.toBase58());
    }
  };
  const updateShowData = async () => {
    if (!connected) {
      setCurrentSolanaAccount("");
      setAccountSOLBalance(0);
      return;
    }
    try {
      let accountSolana = localStorage.getItem("currentSolanaAccount");
      setCurrentSolanaAccount(accountSolana);

      if (accountSolana === "" || accountSolana === null) {
        return;
      }

      const balance = await getSolBalance(connectionRef.current, accountSolana);

      setAccountSOLBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.log(error);
    }
  };

  // 网络切换（connection 改变）时立刻刷新一次余额
  useEffect(() => {
    if (connected) {
      updateShowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, connection]);

  const PleaseLogin = () => {
    return (
      <button className="cta-button unlogin-nft-button">PleaseLogin</button>
    );
  };

  const signSolanaMessageHandler = async () => {
    if (!publicKey) return;
    const account_Address = publicKey.toBase58();

    console.log(
      "Connected to Phantom wallet. Public key:",
      publicKey.toBase58()
    );

    localStorage.setItem("currentSolanaAccount", account_Address);

    // console.log(provider);
    const loginTime = new Date().toLocaleString();

    const message =
      `Welcome to ${origin} !` +
      "\nAccount: " +
      account_Address +
      "\nLoginTime: " +
      loginTime;
    const message_Uint8Array = new TextEncoder().encode(message);
    let signature_string = null;

    try {
      const signResult = await signMessage(message_Uint8Array);
      signature_string = base58.encode(signResult);
    } catch (error) {
      toast.error("User rejected the signature.");
      return;
    }

    if (signature_string === null) {
      setMessage("");
      toast.error("User rejected the signature.");
    } else {
      setMessage(signature_string);

      console.log(signature_string.length);

      const verifyR = await verifySolanaSignature(
        signature_string,
        message,
        account_Address
      );

      console.log(verifyR);

      const verifyR2 = await verifySolanaSignatureV2(
        signature_string,
        message,
        account_Address
      );

      console.log(verifyR2);
    }
  };

  const disConnectHandler = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }

    await disconnect();

    setMessage("");
    setAccountSOLBalance(0);
  };

  const airDropHandler = async () => {
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (currentSolanaAccount === "" || currentSolanaAccount === null) {
      return;
    }

    const connection = getDevConnection();

    try {
      const signature = await connection.requestAirdrop(
        new PublicKey(currentSolanaAccount),
        2 * LAMPORTS_PER_SOL
      );
      console.log(signature);
      toast.success("AIRDROP Success!");
      updateShowData();
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error("AIRDROP Failure!");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    }
  };

  const isValidSolanaAddress = (s: string): boolean => {
    const t = s.trim();
    if (t.length < 32 || t.length > 44) return false;
    try {
      new PublicKey(t);
      return true;
    } catch {
      return false;
    }
  };

  const transferSOLHandler = async () => {
    if (isTransferProcessing) return;
    if (!connected) {
      toast.error("Please connect your wallet");
      return;
    }
    if (currentSolanaAccount === "" || currentSolanaAccount === null) {
      toast.error("Solana account not connected");
      return;
    }
    setTransferTx(null);
    const toSolAddressInput = document.getElementById(
      "toSolAddress"
    ) as HTMLTextAreaElement | null;
    const raw = toSolAddressInput?.value?.trim() ?? "";
    if (!raw) {
      toast.error("Please enter at least one recipient address");
      return;
    }
    let addressArray: string[];
    // 支持单个地址（不包 JSON 数组）
    if (isValidSolanaAddress(raw)) {
      addressArray = [raw];
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          toast.error(
            'Input must be a Solana address or a non-empty JSON array of addresses, e.g. ["addr1","addr2"]'
          );
          setTransferTx(null);
          return;
        }
        addressArray = parsed.map((a: unknown) =>
          typeof a === "string" ? a.trim() : String(a).trim()
        );
      } catch {
        addressArray = stringToArray(raw);
        if (addressArray.length === 0) {
          toast.error(
            'Invalid format. Use a Solana address or JSON array of addresses, e.g. ["addr1","addr2"]'
          );
          setTransferTx(null);
          return;
        }
      }
    }
    const invalid = addressArray.find((a) => !a || !isValidSolanaAddress(a));
    if (invalid !== undefined) {
      toast.error(`Invalid Solana address: ${invalid.slice(0, 12)}...`);
      setTransferTx(null);
      return;
    }

    try {
      setIsTransferProcessing(true);
      const latestBlockhash = await connection.getLatestBlockhash();

      const items = [];
      addressArray.forEach((toAddress) => {
        items.push(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(toAddress),
            lamports: 0.5 * LAMPORTS_PER_SOL
          })
        );
      });

      const transaction = new Transaction({
        feePayer: publicKey,
        recentBlockhash: latestBlockhash?.blockhash
      }).add(...items);

      const signature = await walletProvider.sendTransaction(
        transaction,
        connection
      );

      console.log(signature);
      if (signature === null) {
        toast.error("send Sol Failure!");
        setTransferTx({ status: "failed" });
      } else {
        const sig =
          typeof signature === "string" ? signature : String(signature);
        const link = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
        setTransferTx({ link, status: "pending" });

        const confirm = await connection.confirmTransaction(sig, "confirmed");
        const ok = !confirm?.value?.err;
        setTransferTx({ link, status: ok ? "success" : "failed" });
        if (ok) toast.success("Transaction successful");
        else toast.error("Transaction failed");
        updateShowData();
      }

      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      const rejected = isUserRejected(error);
      if (rejected) {
        toast("Transaction rejected");
        setTransferTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error("send Sol Failure!");
        setTransferTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } finally {
      setIsTransferProcessing(false);
    }
  };

  const getAssociatedAddressHandler = async () => {
    const ownerEl = document.getElementById(
      "ownerAddress"
    ) as HTMLInputElement | null;
    const mintEl = document.getElementById(
      "mintAddress"
    ) as HTMLInputElement | null;
    const ownerAddress = ownerEl?.value?.trim() ?? "";
    const mintAddress = mintEl?.value?.trim() ?? "";
    if (!ownerAddress || !mintAddress) {
      toast.error("Please fill in both owner and mint address");
      return;
    }
    if (!isValidSolanaAddress(ownerAddress)) {
      toast.error("Invalid owner address");
      return;
    }
    if (!isValidSolanaAddress(mintAddress)) {
      toast.error("Invalid mint address");
      return;
    }
    try {
      const associatedAddress = await getAssociatedAddress(
        mintAddress,
        ownerAddress
      );
      setAssociatedAddress(associatedAddress);
    } catch (err) {
      toast.error(
        (err as Error)?.message ?? "Failed to get associated address"
      );
    }
  };

  const getSOLPrivatekeyHandler = async () => {
    const el = document.getElementById("keypair") as HTMLTextAreaElement | null;
    const keypair = el?.value?.trim() ?? "";
    if (!keypair) {
      toast.error("Please paste a keypair JSON array (64 numbers)");
      return;
    }
    let pair: number[];
    try {
      const parsed = JSON.parse(keypair);
      if (!Array.isArray(parsed) || parsed.length !== 64) {
        toast.error(
          "Keypair must be a JSON array of exactly 64 numbers (0–255)"
        );
        return;
      }
      pair = parsed;
      if (
        pair.some(
          (n) =>
            typeof n !== "number" || n < 0 || n > 255 || !Number.isInteger(n)
        )
      ) {
        toast.error("Each keypair element must be an integer 0–255");
        return;
      }
    } catch {
      toast.error("Invalid JSON. Paste keypair as array, e.g. [38,109,...]");
      return;
    }
    try {
      setSolPrivateKey(base58.encode(pair));
      setSolPublicKey(
        Keypair.fromSecretKey(new Uint8Array(pair)).publicKey.toString()
      );
    } catch (err) {
      toast.error((err as Error)?.message ?? "Invalid keypair");
    }
  };

  const getSOLKeypairHandler = async () => {
    const el = document.getElementById(
      "privateKey"
    ) as HTMLTextAreaElement | null;
    const privateKey = (el?.value?.trim() ?? "").replace(/\s/g, "");
    if (!privateKey) {
      toast.error("Please paste a base58 private key");
      return;
    }
    let decoded: Uint8Array;
    try {
      decoded = base58.decode(privateKey);
    } catch {
      toast.error("Invalid base58 private key");
      return;
    }
    if (decoded.length !== 64) {
      toast.error("Private key must decode to 64 bytes");
      return;
    }
    try {
      const keypair = Keypair.fromSecretKey(decoded);
      setSolKeypair("[" + keypair.secretKey.toString() + "]");
      setSolKeypairPublicKey(keypair.publicKey.toString());
    } catch (err) {
      toast.error((err as Error)?.message ?? "Invalid private key");
    }
  };

  const loginSolanaButton = () => {
    return (
      <button
        onClick={signSolanaMessageHandler}
        className="cta-button mint-nft-button"
      >
        Sign Solana Message
      </button>
    );
  };

  const disConnectButton = () => {
    return (
      <button
        onClick={disConnectHandler}
        className="cta-button mint-nft-button"
      >
        DisConnect
      </button>
    );
  };

  const transferSOLButton = () => {
    return (
      <button
        onClick={transferSOLHandler}
        className="cta-button mint-nft-button"
        disabled={!currentSolanaAccount || isTransferProcessing}
      >
        {isTransferProcessing ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "12px",
                height: "12px",
                border: "2px solid #ffffff",
                borderRightColor: "transparent",
                borderRadius: "50%",
                animation: "rotate 1s linear infinite",
                marginRight: "8px"
              }}
            ></span>
            Processing...
          </>
        ) : (
          "Everyone transfer 0.5 SOL"
        )}
      </button>
    );
  };

  const getAssociatedAddressButton = () => {
    return (
      <button
        onClick={getAssociatedAddressHandler}
        className="cta-button mint-nft-button"
      >
        getAssociatedAddress
      </button>
    );
  };

  const getSOLPrivatekeyButton = () => {
    return (
      <button
        onClick={getSOLPrivatekeyHandler}
        className="cta-button mint-nft-button"
      >
        getSolPrivatekey
      </button>
    );
  };

  const getSOLKeypairButton = () => {
    return (
      <button
        onClick={getSOLKeypairHandler}
        className="cta-button mint-nft-button"
      >
        getSOLKeypair
      </button>
    );
  };

  const airDropButton = () => {
    return (
      <button onClick={airDropHandler} className="cta-button mint-nft-button">
        AirDrop 2 SOL
      </button>
    );
  };

  return (
    <div className="feature-page main-app">
      {showAlert && <div className="feature-alert" />}
      <section className="feature-hero">
        <h1>Solana Utils</h1>
        <p>Sign message, airdrop, batch transfer, and keypair tools</p>
        <div className="solana-hero-stats">
          <span className="solana-hero-account-row">
            Account:{" "}
            <strong className="solana-hero-value">
              {currentSolanaAccount
                ? `${currentSolanaAccount.slice(0, 8)}…${currentSolanaAccount.slice(-8)}`
                : "—"}
            </strong>
            {currentSolanaAccount && (
              <button
                type="button"
                className="solana-hero-copy"
                onClick={() => {
                  navigator.clipboard.writeText(currentSolanaAccount).then(
                    () => toast.success("Address copied"),
                    () => toast.error("Copy failed")
                  );
                }}
                title="Copy full address"
              >
                Copy
              </button>
            )}
          </span>
          <span>
            Balance:{" "}
            <strong className="solana-hero-value">
              {accountSOLBalance != null
                ? `${Number(accountSOLBalance).toFixed(4)} SOL`
                : "—"}
            </strong>
          </span>
        </div>
        <div className="feature-actions" style={{ marginTop: 16 }}>
          {currentSolanaAccount ? loginSolanaButton() : PleaseLogin()}
          {currentSolanaAccount ? airDropButton() : null}
          {currentSolanaAccount ? disConnectButton() : null}
        </div>
      </section>
      {message && (
        <section className="feature-panel">
          <h3>Signature / Output</h3>
          <pre className="solana-output-pre">{message}</pre>
        </section>
      )}
      <section className="feature-panel">
        <h3>Batch Transfer SOL</h3>
        <p className="feature-field-hint">
          Send 0.5 SOL to each address. Input a single base58 address or a JSON
          array of addresses.
        </p>
        <div className="feature-field">
          <label htmlFor="toSolAddress">To address(es)</label>
          <textarea
            id="toSolAddress"
            placeholder='["address1","address2"]'
            rows={4}
            spellCheck={false}
          />
        </div>
        <div className="feature-actions feature-actions--inline">
          {currentSolanaAccount ? transferSOLButton() : PleaseLogin()}
          {transferTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${transferTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${transferTx.status}`}
              >
                {transferTx.status === "pending" && "Pending"}
                {transferTx.status === "success" && "Success"}
                {transferTx.status === "failed" && "Failed"}
                {transferTx.status === "rejected" && "Rejected"}
              </span>
              {transferTx.link && (
                <a
                  href={transferTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={transferTx.link.split("/").pop()?.split("?")[0] ?? ""}
                >
                  {truncateHash(
                    transferTx.link.split("/").pop()?.split("?")[0] ?? ""
                  )}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="feature-panel">
        <h3>Get Associated Address</h3>
        <p className="feature-field-hint">
          Compute SPL token associated token account address for owner + mint.
        </p>
        <div className="feature-field">
          <label htmlFor="ownerAddress">Owner address</label>
          <input
            id="ownerAddress"
            type="text"
            placeholder="2xuEyZoSkiiNBAgL21XobUCraojPUZ82GHuWpCPgpyXF"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-field">
          <label htmlFor="mintAddress">Mint address</label>
          <input
            id="mintAddress"
            type="text"
            placeholder="2xuEyZoSkiiNBAgL21XobUCraojPUZ82GHuWpCPgpyXF"
            className="estimate-address-input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="feature-actions">{getAssociatedAddressButton()}</div>
        {associatedAddress && (
          <div className="feature-field solana-result-box">
            <span className="feature-field-hint">Associated address</span>
            <span className="solana-result-value">{associatedAddress}</span>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>Keypair → Private key</h3>
        <p className="feature-field-hint">
          Paste keypair as JSON array (e.g. from Phantom export), get base58
          private key and public key.
        </p>
        <div className="feature-field">
          <label htmlFor="keypair">Keypair (JSON array)</label>
          <textarea
            id="keypair"
            placeholder="[38,109,228,83,...]"
            rows={3}
            spellCheck={false}
          />
        </div>
        <div className="feature-actions">{getSOLPrivatekeyButton()}</div>
        {(solPrivateKey || solPublicKey) && (
          <div className="solana-result-grid">
            <div className="feature-field solana-result-box">
              <span className="feature-field-hint">Private key (base58)</span>
              <span className="solana-result-value solana-result-mono">
                {solPrivateKey || "—"}
              </span>
            </div>
            <div className="feature-field solana-result-box">
              <span className="feature-field-hint">Public key</span>
              <span className="solana-result-value solana-result-mono">
                {solPublicKey || "—"}
              </span>
            </div>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>Private key → Keypair</h3>
        <p className="feature-field-hint">
          Paste base58 private key, get keypair array and public key.
        </p>
        <div className="feature-field">
          <label htmlFor="privateKey">Private key (base58)</label>
          <textarea
            id="privateKey"
            placeholder="mZeFbFsK1Ezt29Z9pA5ZbSMbw8PZyB4DPTtSEPwHqYr5..."
            rows={2}
            spellCheck={false}
          />
        </div>
        <div className="feature-actions">{getSOLKeypairButton()}</div>
        {(solKeypair || solKeypairPublicKey) && (
          <div className="solana-result-grid">
            <div className="feature-field solana-result-box">
              <span className="feature-field-hint">Keypair (JSON)</span>
              <pre className="solana-output-pre solana-result-pre">
                {solKeypair || "—"}
              </pre>
            </div>
            <div className="feature-field solana-result-box">
              <span className="feature-field-hint">Public key</span>
              <span className="solana-result-value solana-result-mono">
                {solKeypairPublicKey || "—"}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const SolanaUtilsPage = () => {
  return <SolanaUtilsContent />;
};

export default SolanaUtilsPage;
