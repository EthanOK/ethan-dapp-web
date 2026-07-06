/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — TODO: add types incrementally
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
} from "@/lib/solana/SolanaSignAndVerify";
import { getDevConnection } from "@/lib/solana/GetSolanaConnection";
import { getSolBalance } from "@/lib/solana/SolanaGetBalance";
import { getAssociatedAddress, stringToArray } from "@/lib/shared/Utils";
import base58 from "bs58";
import { toast } from "sonner";
import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import { truncateHash } from "@/lib/shared/Format";
import { useI18n } from "@/i18n";

const SolanaUtilsContent = () => {
  const { t } = useI18n();
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
    const POLL_MS = 15000; // Poll every 15s to reduce WalletConnect RPC load
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

  // Refresh balance immediately when network (connection) changes
  useEffect(() => {
    if (connected) {
      updateShowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, connection]);

  const PleaseLogin = () => {
    return (
      <button className="cta-button unlogin-nft-button">
        {t("common.pleaseLogin")}
      </button>
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

    const loginTime = new Date().toLocaleString();

    const message =
      t("solana.signWelcome", { origin }) +
      t("solana.signAccountPrefix") +
      account_Address +
      t("solana.signLoginTimePrefix") +
      loginTime;
    const message_Uint8Array = new TextEncoder().encode(message);
    let signature_string = null;

    try {
      const signResult = await signMessage(message_Uint8Array);
      signature_string = base58.encode(signResult);
    } catch (error) {
      toast.error(t("solana.rejectedSignature"));
      return;
    }

    if (signature_string === null) {
      setMessage("");
      toast.error(t("solana.rejectedSignature"));
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
      toast.error(t("solana.connectWallet"));
      return;
    }

    await disconnect();

    setMessage("");
    setAccountSOLBalance(0);
  };

  const airDropHandler = async () => {
    if (!connected) {
      toast.error(t("solana.connectWallet"));
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
      toast.success(t("solana.airdropSuccess"));
      updateShowData();
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    } catch (error) {
      console.log(error);
      toast.error(t("solana.airdropFailure"));
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
      toast.error(t("solana.connectWallet"));
      return;
    }
    if (currentSolanaAccount === "" || currentSolanaAccount === null) {
      toast.error(t("solana.accountNotConnected"));
      return;
    }
    setTransferTx(null);
    const toSolAddressInput = document.getElementById(
      "toSolAddress"
    ) as HTMLTextAreaElement | null;
    const raw = toSolAddressInput?.value?.trim() ?? "";
    if (!raw) {
      toast.error(t("solana.enterRecipient"));
      return;
    }
    let addressArray: string[];
    // Support a single address (not wrapped in a JSON array)
    if (isValidSolanaAddress(raw)) {
      addressArray = [raw];
    } else {
      try {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          toast.error(t("solana.invalidArray"));
          setTransferTx(null);
          return;
        }
        addressArray = parsed.map((a: unknown) =>
          typeof a === "string" ? a.trim() : String(a).trim()
        );
      } catch {
        addressArray = stringToArray(raw);
        if (addressArray.length === 0) {
          toast.error(t("solana.invalidFormat"));
          setTransferTx(null);
          return;
        }
      }
    }
    const invalid = addressArray.find((a) => !a || !isValidSolanaAddress(a));
    if (invalid !== undefined) {
      toast.error(t("solana.invalidAddress", { addr: invalid.slice(0, 12) }));
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
        toast.error(t("solana.sendFailure"));
        setTransferTx({ status: "failed" });
      } else {
        const sig =
          typeof signature === "string" ? signature : String(signature);
        const link = `https://explorer.solana.com/tx/${sig}?cluster=devnet`;
        setTransferTx({ link, status: "pending" });

        const confirm = await connection.confirmTransaction(sig, "confirmed");
        const ok = !confirm?.value?.err;
        setTransferTx({ link, status: ok ? "success" : "failed" });
        if (ok) toast.success(t("common.txSuccessful"));
        else toast.error(t("common.txFailed"));
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
        toast(t("common.txRejected"));
        setTransferTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(t("solana.sendFailure"));
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
      toast.error(t("solana.fillOwnerMint"));
      return;
    }
    if (!isValidSolanaAddress(ownerAddress)) {
      toast.error(t("solana.invalidOwner"));
      return;
    }
    if (!isValidSolanaAddress(mintAddress)) {
      toast.error(t("solana.invalidMint"));
      return;
    }
    try {
      const associatedAddress = await getAssociatedAddress(
        mintAddress,
        ownerAddress
      );
      setAssociatedAddress(associatedAddress);
    } catch (err) {
      toast.error((err as Error)?.message ?? t("solana.associatedFailed"));
    }
  };

  const getSOLPrivatekeyHandler = async () => {
    const el = document.getElementById("keypair") as HTMLTextAreaElement | null;
    const keypair = el?.value?.trim() ?? "";
    if (!keypair) {
      toast.error(t("solana.pasteKeypair"));
      return;
    }
    let pair: number[];
    try {
      const parsed = JSON.parse(keypair);
      if (!Array.isArray(parsed) || parsed.length !== 64) {
        toast.error(t("solana.keypairMustBe64"));
        return;
      }
      pair = parsed;
      if (
        pair.some(
          (n) =>
            typeof n !== "number" || n < 0 || n > 255 || !Number.isInteger(n)
        )
      ) {
        toast.error(t("solana.keypairElementRange"));
        return;
      }
    } catch {
      toast.error(t("solana.invalidKeypairJson"));
      return;
    }
    try {
      setSolPrivateKey(base58.encode(pair));
      setSolPublicKey(
        Keypair.fromSecretKey(new Uint8Array(pair)).publicKey.toString()
      );
    } catch (err) {
      toast.error((err as Error)?.message ?? t("solana.invalidKeypair"));
    }
  };

  const getSOLKeypairHandler = async () => {
    const el = document.getElementById(
      "privateKey"
    ) as HTMLTextAreaElement | null;
    const privateKey = (el?.value?.trim() ?? "").replace(/\s/g, "");
    if (!privateKey) {
      toast.error(t("solana.pastePrivateKey"));
      return;
    }
    let decoded: Uint8Array;
    try {
      decoded = base58.decode(privateKey);
    } catch {
      toast.error(t("solana.invalidBase58"));
      return;
    }
    if (decoded.length !== 64) {
      toast.error(t("solana.privateKey64Bytes"));
      return;
    }
    try {
      const keypair = Keypair.fromSecretKey(decoded);
      setSolKeypair("[" + keypair.secretKey.toString() + "]");
      setSolKeypairPublicKey(keypair.publicKey.toString());
    } catch (err) {
      toast.error((err as Error)?.message ?? t("solana.invalidPrivateKey"));
    }
  };

  const loginSolanaButton = () => {
    return (
      <button
        onClick={signSolanaMessageHandler}
        className="cta-button mint-nft-button"
      >
        {t("solana.signMessage")}
      </button>
    );
  };

  const disConnectButton = () => {
    return (
      <button
        onClick={disConnectHandler}
        className="cta-button mint-nft-button"
      >
        {t("common.disConnect")}
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
            {t("common.processingDots")}
          </>
        ) : (
          t("solana.transferButton")
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
        {t("solana.getAssociatedAddress")}
      </button>
    );
  };

  const getSOLPrivatekeyButton = () => {
    return (
      <button
        onClick={getSOLPrivatekeyHandler}
        className="cta-button mint-nft-button"
      >
        {t("solana.getSolPrivatekey")}
      </button>
    );
  };

  const getSOLKeypairButton = () => {
    return (
      <button
        onClick={getSOLKeypairHandler}
        className="cta-button mint-nft-button"
      >
        {t("solana.getSolKeypair")}
      </button>
    );
  };

  const airDropButton = () => {
    return (
      <button onClick={airDropHandler} className="cta-button mint-nft-button">
        {t("solana.airdropButton")}
      </button>
    );
  };

  return (
    <div className="feature-page main-app">
      {showAlert && <div className="feature-alert" />}
      <section className="feature-hero">
        <h1>{t("solana.title")}</h1>
        <p>{t("solana.subtitle")}</p>
        <div className="solana-hero-stats">
          <span className="solana-hero-account-row">
            {t("common.account")}:{" "}
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
                    () => toast.success(t("common.addressCopied")),
                    () => toast.error(t("common.copyFailed"))
                  );
                }}
                title={t("common.copyFullAddress")}
              >
                {t("common.copy")}
              </button>
            )}
          </span>
          <span>
            {t("common.balance")}:{" "}
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
          <h3>{t("solana.signatureOutput")}</h3>
          <pre className="solana-output-pre">{message}</pre>
        </section>
      )}
      <section className="feature-panel">
        <h3>{t("solana.batchTransfer")}</h3>
        <p className="feature-field-hint">{t("solana.batchTransferHint")}</p>
        <div className="feature-field">
          <label htmlFor="toSolAddress">{t("solana.toAddresses")}</label>
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
                {transferTx.status === "pending" && t("common.pending")}
                {transferTx.status === "success" && t("common.success")}
                {transferTx.status === "failed" && t("common.failed")}
                {transferTx.status === "rejected" && t("common.rejected")}
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
        <h3>{t("solana.associatedSection")}</h3>
        <p className="feature-field-hint">{t("solana.associatedHint")}</p>
        <div className="feature-field">
          <label htmlFor="ownerAddress">{t("solana.ownerAddress")}</label>
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
          <label htmlFor="mintAddress">{t("solana.mintAddress")}</label>
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
            <span className="feature-field-hint">
              {t("solana.associatedAddress")}
            </span>
            <span className="solana-result-value">{associatedAddress}</span>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>{t("solana.keypairToPrivate")}</h3>
        <p className="feature-field-hint">{t("solana.keypairToPrivateHint")}</p>
        <div className="feature-field">
          <label htmlFor="keypair">{t("solana.keypairJson")}</label>
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
              <span className="feature-field-hint">
                {t("solana.privateKeyBase58")}
              </span>
              <span className="solana-result-value solana-result-mono">
                {solPrivateKey || "—"}
              </span>
            </div>
            <div className="feature-field solana-result-box">
              <span className="feature-field-hint">
                {t("solana.publicKey")}
              </span>
              <span className="solana-result-value solana-result-mono">
                {solPublicKey || "—"}
              </span>
            </div>
          </div>
        )}
      </section>
      <section className="feature-panel">
        <h3>{t("solana.privateToKeypair")}</h3>
        <p className="feature-field-hint">{t("solana.privateToKeypairHint")}</p>
        <div className="feature-field">
          <label htmlFor="privateKey">
            {t("solana.privateKeyBase58Label")}
          </label>
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
              <span className="feature-field-hint">
                {t("solana.keypairJsonResult")}
              </span>
              <pre className="solana-output-pre solana-result-pre">
                {solKeypair || "—"}
              </pre>
            </div>
            <div className="feature-field solana-result-box">
              <span className="feature-field-hint">
                {t("solana.publicKey")}
              </span>
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
