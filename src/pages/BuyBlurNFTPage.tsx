import { useEffect, useState } from "react";
import { isAddress } from "../utils/Utils";
import {
  getBlurLoginMessageByNFTGO,
  getBlurAccessTokenByNFTGO
} from "../api/GetData";
import { signBlurLoginMessage } from "../utils/SignFunc";
import { getSignerAndAccountAndChainId } from "../utils/GetProvider";
import { onlyBuyBlurNFT } from "../utils/BlurFunc";
import { useAppKitAccount } from "@reown/appkit/react";

const BuyBlurNFTPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [message, setMessage] = useState("");
  const [currentAccount, setCurrentAccount] = useState<string | null>(null);
  const [blurAccessToken, setBlurAccessToken] = useState<string | null>(null);
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    if (isConnected && address) setCurrentAccount(address);
  }, [isConnected, address]);

  useEffect(() => {
    setIsMounted(true);
    const intervalId = setInterval(updateData, 2000);
    return () => {
      clearInterval(intervalId);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    if (isMounted) configData();
  }, [isMounted]);

  const updateData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
    const token = localStorage.getItem("blurAccessToken");
    setBlurAccessToken(token);
  };

  const configData = async () => {
    const account = localStorage.getItem("userAddress");
    if (account !== null) setCurrentAccount(account);
  };

  const loginBlurHandler = async () => {
    const res = await getSignerAndAccountAndChainId();
    const [signer, account, chainId] = res;
    if (!signer || account == null || chainId == null) return;
    const loginData = await getBlurLoginMessageByNFTGO(
      await signer.getAddress()
    );
    if (loginData === null) {
      alert("获取登陆信息是失败");
      return;
    }
    const login = loginData as {
      message?: string;
      walletAddress?: string;
      expiresOn?: string;
      hmac?: string;
    };
    const messageString = login.message ?? "";
    const result = await signBlurLoginMessage(signer, messageString);
    if (result === null || result === false) return;
    const requestData = {
      message: login.message,
      walletAddress: login.walletAddress,
      expiresOn: login.expiresOn,
      hmac: login.hmac,
      signature: result
    };
    const blurToken = await getBlurAccessTokenByNFTGO(requestData);
    if (blurToken === null) {
      alert("登陆失败");
      return;
    }
    localStorage.setItem("userAddress", account);
    localStorage.setItem("chainId", String(chainId));
    localStorage.setItem("blurAccessToken", blurToken);
    setMessage(JSON.stringify(result, null, "\t"));
  };

  const buyBlurNFTHandler = async () => {
    const contractEl = document.getElementById(
      "contract"
    ) as HTMLTextAreaElement | null;
    const tokenIdEl = document.getElementById(
      "tokenId"
    ) as HTMLTextAreaElement | null;
    if (!contractEl || !tokenIdEl) return;
    const contract = contractEl.value;
    const tokenId = tokenIdEl.value;
    if (!isAddress(contract)) {
      alert("contract is not address");
      return;
    }
    if (tokenId === "") {
      alert("tokenId is empty");
      return;
    }
    try {
      const blurToken = localStorage.getItem("blurAccessToken");
      const result = await onlyBuyBlurNFT(
        contract,
        tokenId,
        currentAccount,
        blurToken
      );
      const message_ = result?.[0];
      const tx = result?.[1];
      if (message_ != null && typeof message_ === "string") {
        setMessage(message_);
      }
      if (
        tx &&
        typeof (tx as { wait?: () => Promise<{ status: number }> }).wait ===
          "function"
      ) {
        const rsult = await (
          tx as { wait: () => Promise<{ status: number }> }
        ).wait();
        if (rsult?.status === 1) console.log("Success!");
        else console.log("Failure!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <center>
      <div>
        <h2>Blur</h2>
        <div>
          <p />
          <button
            onClick={loginBlurHandler}
            className="cta-button mint-nft-button"
          >
            Login Blur
          </button>
          <p />
        </div>
        <div className="bordered-div">
          <h4>Buy One NFT</h4>
          <div className="container">
            <div className="input-container">
              <label className="label" htmlFor="contract">
                contract:
              </label>
              <textarea
                className="textarea"
                id="contract"
                placeholder="0x11400ee484355c7bdf804702bf3367ebc7667e54"
              />
            </div>
            <div className="input-container">
              <label className="label" htmlFor="tokenId">
                tokenId:
              </label>
              <textarea className="textarea" id="tokenId" placeholder="1053" />
            </div>
          </div>
          <p />
          {blurAccessToken ? (
            <button
              onClick={buyBlurNFTHandler}
              className="cta-button mint-nft-button"
            >
              Buy One NFT
            </button>
          ) : (
            <button className="cta-button unlogin-nft-button">
              PleaseLoginBlur
            </button>
          )}
        </div>
        <div className="bordered-div">
          <h4>Buy Multiple NFT</h4>
          <div className="container">
            <div className="input-container">
              <label className="label" htmlFor="contracts">
                contracts:
              </label>
              <textarea
                className="textarea"
                id="contracts"
                placeholder="[0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b,0xEAAfcC17f28Afe5CdA5b3F76770eFb7ef162D20b]"
                style={{ height: "100px", width: "400px" }}
              />
            </div>
            <div className="input-container">
              <label className="label" htmlFor="tokenIds">
                tokenIds:
              </label>
              <textarea
                className="textarea"
                id="tokenIds"
                placeholder="[100,101]"
                style={{ height: "100px", width: "400px" }}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2>
          Please See:
          <p />
          <textarea
            value={message}
            readOnly
            style={{ width: "1200px", height: "100px" }}
          />
        </h2>
      </div>
    </center>
  );
};

export default BuyBlurNFTPage;
