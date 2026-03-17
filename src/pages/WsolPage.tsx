/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-nocheck — TODO: 逐步补充类型
import { useEffect, useRef, useState } from "react";
import * as buffer from "buffer";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { getDevConnection } from "../utils/GetSolanaConnection";
import { getSolBalance } from "../utils/SolanaGetBalance";
import {
  getMetadataPDA,
  getWethMintAddress,
  getWethProgram,
  getWethBalance,
  getDestinationAddress,
  getStoragePDA
} from "../utils/GetWsolProgram";
import { BN } from "@coral-xyz/anchor";
import { toast } from "sonner";

import type { Provider } from "@reown/appkit-adapter-solana/react";
import { useAppKitProvider } from "@reown/appkit/react";
import { useAppKitConnection } from "@reown/appkit-adapter-solana/react";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { truncateHash } from "../utils/format";

const WsolPageContent = () => {
  const { walletProvider } = useAppKitProvider<Provider>("solana");
  const { connection: appKitConnection } = useAppKitConnection();
  const connection = appKitConnection ?? getDevConnection();

  window.Buffer = buffer.Buffer;
  const [isMounted, setIsMounted] = useState(false);
  const [currentSolanaAccount, setCurrentSolanaAccount] = useState(null);
  const [accountSOLBalance, setAccountSOLBalance] = useState(null);
  const [accountWethBalance, setAccountWethBalance] = useState(null);
  const [isDepositProcessing, setIsDepositProcessing] = useState(false);
  const [isWithdrawProcessing, setIsWithdrawProcessing] = useState(false);

  const getSigFromTxLink = (link: string): string => {
    const last = link.split("/").pop() ?? "";
    return last.split("?")[0] ?? "";
  };
  type TxStatus = "pending" | "success" | "failed" | "rejected";
  type TxResult = { link?: string; status: TxStatus };
  const [depositTx, setDepositTx] = useState<TxResult | null>(null);
  const [withdrawTx, setWithdrawTx] = useState<TxResult | null>(null);

  const connected = !!walletProvider?.publicKey;
  const publicKey = walletProvider?.publicKey;
  const disconnect = walletProvider?.disconnect?.bind(walletProvider);
  const sendTransaction = walletProvider?.sendTransaction?.bind(walletProvider);
  const wallet = walletProvider;

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
      // no-op (reserved)
    }
  }, [isMounted]);

  useEffect(() => {
    if (connected && publicKey) {
      localStorage.setItem("currentSolanaAccount", publicKey.toBase58());
    }
  }, [connected, publicKey]);

  const updateShowData = async () => {
    if (!connected) {
      setCurrentSolanaAccount("");
      setAccountSOLBalance(0);
      setAccountWethBalance(0);
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

      setAccountWethBalance(
        (await getWethBalance(connectionRef.current, accountSolana)) /
          LAMPORTS_PER_SOL
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendPreparedTransaction = async (
    txTransaction: Transaction,
    connection: Connection
  ) => {
    const latestBlockhash = await connection.getLatestBlockhash();
    txTransaction.feePayer = wallet.publicKey;
    txTransaction.recentBlockhash = latestBlockhash.blockhash;
    return sendTransaction(txTransaction, connection);
  };

  // 网络切换（connection 改变）时立刻刷新一次余额
  useEffect(() => {
    if (connected) {
      updateShowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, connection]);

  const initializeHandler = async () => {
    const program = getWethProgram(connection, wallet);

    const wsol_mint = PublicKey.findProgramAddressSync(
      [Buffer.from("wsol_mint")],
      program.programId
    )[0];

    const wsol_mint_metadata = getMetadataPDA(wsol_mint);

    let state = false;

    try {
      const accountinfo = await connection.getAccountInfo(wsol_mint);

      if (accountinfo) {
        state = true;
      }
    } catch (error) {
      state = false;
    }

    if (state) {
      toast.error("Already initialized");
    } else {
      try {
        const txTransaction = await program.methods
          .initialize()
          .accountsPartial({
            signer: wallet.publicKey,
            wethMetadata: wsol_mint_metadata
          })
          .transaction();
        const tx = await sendPreparedTransaction(txTransaction, connection);
        console.log(tx);
        toast.success("initialize success");
        updateShowData();
      } catch (error) {
        console.log(error);
        toast.error("initialize failed");
      }
    }
  };

  const depositHandler = async () => {
    setIsDepositProcessing(true);
    setDepositTx(null);
    const program = getWethProgram(connection, wallet);

    try {
      const storage_PDA = getStoragePDA();

      const wsol_mint = getWethMintAddress();

      const destination = getDestinationAddress(wsol_mint, wallet.publicKey);
      const txTransaction = await program.methods
        .deposit(new BN(LAMPORTS_PER_SOL))
        .accountsStrict({
          signer: wallet.publicKey,
          storageAccount: storage_PDA,
          wsolMint: wsol_mint,
          destination: destination,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId
        })
        .transaction();
      const tx = await sendPreparedTransaction(txTransaction, connection);
      const signature = String(tx ?? "");
      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      setDepositTx({ link, status: "pending" });

      const confirm = await connection.confirmTransaction(
        signature,
        "confirmed"
      );
      const ok = !confirm?.value?.err;
      setDepositTx({ link, status: ok ? "success" : "failed" });
      if (ok) toast.success("Transaction successful");
      else toast.error("Transaction failed");
      updateShowData();
    } catch (err: unknown) {
      const e = err as { code?: number | string; message?: string };
      const rejected =
        String(e?.code) === "4001" ||
        /rejected|denied|user rejected/i.test(String(e?.message ?? ""));
      if (rejected) {
        toast("Transaction rejected");
        setDepositTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(String(e?.message ?? "Error"));
        setDepositTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
    } finally {
      setIsDepositProcessing(false);
    }
  };

  const withdrwaHandler = async () => {
    setIsWithdrawProcessing(true);
    setWithdrawTx(null);
    const program = getWethProgram(connection, wallet);

    try {
      const txTransaction = await program.methods
        .withdraw(new BN(LAMPORTS_PER_SOL))
        .accountsPartial({
          signer: wallet.publicKey
        })
        .transaction();
      const tx = await sendPreparedTransaction(txTransaction, connection);
      const signature = String(tx ?? "");
      const link = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
      setWithdrawTx({ link, status: "pending" });

      const confirm = await connection.confirmTransaction(
        signature,
        "confirmed"
      );
      const ok = !confirm?.value?.err;
      setWithdrawTx({ link, status: ok ? "success" : "failed" });
      if (ok) toast.success("Transaction successful");
      else toast.error("Transaction failed");
      updateShowData();
    } catch (err: unknown) {
      const e = err as { code?: number | string; message?: string };
      const rejected =
        String(e?.code) === "4001" ||
        /rejected|denied|user rejected/i.test(String(e?.message ?? ""));
      if (rejected) {
        toast("Transaction rejected");
        setWithdrawTx((prev) =>
          prev ? { ...prev, status: "rejected" } : { status: "rejected" }
        );
      } else {
        toast.error(String(e?.message ?? "Error"));
        setWithdrawTx((prev) =>
          prev ? { ...prev, status: "failed" } : { status: "failed" }
        );
      }
    } finally {
      setIsWithdrawProcessing(false);
    }
  };

  const disConnectHandler = async () => {
    await disconnect();
    localStorage.removeItem("currentSolanaAccount");
    setAccountSOLBalance(0);
    setCurrentSolanaAccount("");
  };

  const initializeButton = () => {
    return (
      <button
        onClick={initializeHandler}
        className="cta-button mint-nft-button"
      >
        initialize
      </button>
    );
  };

  const depositButton = () => {
    return (
      <button
        onClick={depositHandler}
        className="cta-button mint-nft-button"
        disabled={!currentSolanaAccount || isDepositProcessing}
      >
        {isDepositProcessing ? (
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
          "deposit 1 SOL"
        )}
      </button>
    );
  };

  const withdrawButton = () => {
    return (
      <button
        onClick={withdrwaHandler}
        className="cta-button mint-nft-button"
        disabled={!currentSolanaAccount || isWithdrawProcessing}
      >
        {isWithdrawProcessing ? (
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
          "withdraw 1 WSOL"
        )}
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

  return (
    <div className="feature-page main-app">
      <section className="feature-hero">
        <h1>WSOL (Solana)</h1>
        <p>Wrap SOL and manage WSOL balance</p>
      </section>
      <section className="feature-panel">
        <h3>SOL</h3>
        <div className="solana-hero-stats" style={{ marginTop: 0 }}>
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
        {/* Optional: keep disconnect control accessible */}
        {/* <div className="feature-actions">{disConnectButton()}</div> */}
      </section>
      <section className="feature-panel">
        <h3>WSOL</h3>
        <p className="feature-field-hint">Mint: {getWethMintAddress()}</p>
        <p className="feature-field-hint">
          Balance: {accountWethBalance != null ? accountWethBalance : "—"} WSOL
        </p>
      </section>
      <section className="feature-panel">
        <h3>Initialize</h3>
        <div className="feature-actions">{initializeButton()}</div>
      </section>
      <section className="feature-panel">
        <h3>Deposit</h3>
        <div className="feature-actions feature-actions--inline">
          {depositButton()}
          {depositTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${depositTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${depositTx.status}`}
              >
                {depositTx.status === "pending" && "Pending"}
                {depositTx.status === "success" && "Success"}
                {depositTx.status === "failed" && "Failed"}
                {depositTx.status === "rejected" && "Rejected"}
              </span>
              {depositTx.link && (
                <a
                  href={depositTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={getSigFromTxLink(depositTx.link)}
                >
                  {truncateHash(getSigFromTxLink(depositTx.link))}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
      <section className="feature-panel">
        <h3>Withdraw</h3>
        <div className="feature-actions feature-actions--inline">
          {withdrawButton()}
          {withdrawTx && (
            <div
              className={`feature-tx-result feature-tx-result--inline feature-tx-result--${withdrawTx.status}`}
            >
              <span
                className={`feature-tx-result-badge feature-tx-result-badge--${withdrawTx.status}`}
              >
                {withdrawTx.status === "pending" && "Pending"}
                {withdrawTx.status === "success" && "Success"}
                {withdrawTx.status === "failed" && "Failed"}
                {withdrawTx.status === "rejected" && "Rejected"}
              </span>
              {withdrawTx.link && (
                <a
                  href={withdrawTx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feature-tx-result-link"
                  title={getSigFromTxLink(withdrawTx.link)}
                >
                  {truncateHash(getSigFromTxLink(withdrawTx.link))}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const WsolPage = () => {
  return <WsolPageContent />;
};

export default WsolPage;
