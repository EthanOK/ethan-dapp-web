import {
  AbiCoder,
  TypedDataEncoder,
  Wallet,
  getBytes,
  hexlify,
  keccak256,
  randomBytes,
  verifyMessage,
  verifyTypedData,
  type Signer
} from "ethers";
import { getYunGouAddressAndParameters } from "@/lib/shared/Utils";
import { PRIVATEKEY_VERIFYER } from "@/config/SystemConfiguration";
import { getSignerAndChainId } from "@/lib/wallet/GetProvider";
import { order_data } from "@/fixtures/OrderDataYungou";
import { Seaport } from "@opensea/seaport-js";
import type {
  Order as SeaportOrder,
  OrderComponents
} from "@opensea/seaport-js/lib/types";
import { BulkOrder } from "bulkorder-sdk";
import type { Order as BulkSignedOrder } from "bulkorder-sdk";
import { SiweMessage } from "siwe";
import { toast } from "sonner";

type WalletError = { code?: number | string; message?: string };
type YunGouOrderData = typeof order_data;

const isUserRejected = (error: unknown): boolean => {
  const e = error as WalletError;
  return e.code === 4001 || e.code === "ACTION_REJECTED";
};

async function getSeaportDomainData(seaport: Seaport, chainId: number) {
  return {
    name: "Seaport",
    version: "1.5",
    chainId,
    verifyingContract: await seaport.contract.getAddress()
  };
}

export const signSiweMessage = async () => {
  try {
    const [signer_, chainId_] = await getSignerAndChainId();
    if (!signer_ || !chainId_) return null;
    const signerAddress = await signer_.getAddress();
    const domain = window.location.host;
    const origin = window.location.origin;

    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}`;
    const randomPart = Math.floor(Math.random() * 1e16).toString();
    const nonce = datePart + randomPart;

    // Build ERC-4361: Sign-In with Ethereum
    const msg = new SiweMessage({
      domain: domain,
      address: signerAddress,
      statement: "Welcome To Ethan DApp",
      uri: origin,
      version: "1",
      chainId: chainId_,
      nonce,
      issuedAt: now.toISOString()
    });

    const prepared = msg.prepareMessage();
    const signature = await signer_.signMessage(prepared);
    return { message: prepared, signature, siweMessage: msg };
  } catch (error: unknown) {
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
    return null;
  }
};

const signEIP712Message = async (_signer: Signer, _chainId: number) => {
  try {
    const [signer_, chainId_] = await getSignerAndChainId();
    if (!signer_ || chainId_ == null) return null;
    const types = {
      VerifyClaim: [
        { name: "userAddress", type: "address" },
        { name: "randNo", type: "uint256" },
        { name: "amount", type: "uint256" }
      ]
    };
    const domainData = {
      name: "YunGou DApp",
      version: "2",
      chainId: chainId_,
      verifyingContract: "0x0000006c517ed32ff128b33f137bb4ac31b0c6dd"
    };
    const randNo = hexlify(randomBytes(8));
    const amount = hexlify(randomBytes(1));
    // Get signer address
    console.log(signer_);
    const signerAddress = await signer_.getAddress();

    var message = {
      userAddress: signerAddress,
      randNo: randNo,
      amount: amount
    };

    // TODO:_signTypedData
    console.log("_signTypedData");
    const signature = await signer_.signTypedData(domainData, types, message);

    const recoveredAddress = verifyTypedData(
      domainData,
      types,
      message,
      signature
    );

    if (recoveredAddress === signerAddress) {
      console.log("签名验证成功！");
    } else {
      console.log("签名验证失败！");
    }
    const params = { domainData, message, signature };
    return params;
  } catch (error: unknown) {
    console.log(error);
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
    return null;
  }
};
const signStringMessage = async (signer: Signer) => {
  // TODO: signMessage String
  console.log("signMessage String");
  let messageString = "Hello, this is a String Message.";

  try {
    const signatureM = await signer.signMessage(messageString);
    console.log(signatureM);
    const recoveredAddressString = verifyMessage(messageString, signatureM);
    const signerAddress = await signer.getAddress();
    if (recoveredAddressString === signerAddress) {
      console.log("签名验证成功！");
    } else {
      console.log("签名验证失败！");
    }
    return true;
  } catch (error: unknown) {
    console.log(error);
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
    const e = error as WalletError;
    if (e.code === -32000) {
      alert(e.message);
    }
    return false;
  }
};
const signHexDataMessage = async (signer: Signer, hexData: string) => {
  // TODO: signMessage with hex data
  console.log("signMessage Hex data");
  // Convert hex data to byte array
  console.log(hexData);
  // const hexData =
  //   "0xf6896007477ab25a659f87c4f8c5e3baac32547bf305e77aa57743046e10578b";
  const data = getBytes(hexData);

  try {
    const signatureHex = await signer.signMessage(data);
    console.log(signatureHex);
    const signerAddress = await signer.getAddress();
    const recoveredAddressHex = verifyMessage(data, signatureHex);
    if (recoveredAddressHex === signerAddress) {
      console.log("签名验证成功！");
    } else {
      console.log("签名验证失败！");
    }
    return signatureHex;
  } catch (error: unknown) {
    console.log(error);
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
    const e = error as WalletError;
    if (e.code === -32000) {
      alert(e.message);
    }
    return null;
  }
};
const signEIP712YunGouMessage = async (signer: Signer, chainId: number) => {
  const [YG_Address, message] = await getYunGouAddressAndParameters(chainId);

  const domainData = {
    name: "YunGou",
    version: "2.0",
    chainId: chainId,
    verifyingContract: YG_Address as string
  };

  const types = {
    BasicOrderParameters: [
      { name: "orderType", type: "uint8" },
      { name: "offerer", type: "address" },
      { name: "offerToken", type: "address" },
      { name: "offerTokenId", type: "uint256" },
      { name: "unitPrice", type: "uint256" },
      { name: "sellAmount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "paymentToken", type: "address" },
      { name: "paymentTokenId", type: "uint256" },
      { name: "salt", type: "uint256" },
      { name: "royaltyFee", type: "uint256" },
      { name: "platformFee", type: "uint256" },
      { name: "afterTaxPrice", type: "uint256" }
    ]
  };

  console.log(message);

  // TODO:_signTypedData
  console.log("_signTypedData");

  try {
    const orderSignature = await signer.signTypedData(
      domainData,
      types,
      message as Record<string, unknown>
    );

    console.log("orderSignature:" + orderSignature);
    let data = order_data;

    let systemSignature = await getSystemSignature(orderSignature, data);
    console.log("systemSignature:" + systemSignature);

    // _hashTypedDataV4(keccak256(abi.encode(TYPE_HASH, parameters)))
    // let hash_ = TypedDataEncoder.hash(domainData, types, message);

    // keccak256(abi.encode(TYPE_HASH, parameters))
    let orderHash = TypedDataEncoder.from(types).hash(
      message as Record<string, unknown>
    );

    console.log("orderHash: " + orderHash);
    let result = {
      orderHash: orderHash,
      orderSignature: orderSignature,
      systemSignature: systemSignature
    };
    return result;
  } catch (error: unknown) {
    console.log(error);

    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    } else {
      const e = error as WalletError;
      if (e.code === -32000) {
        alert(e.message);
      }
    }
    return false;
  }
};

const signEIP712OpenSeaMessage = async (signer: Signer, chainId: number) => {
  const domainData = {
    name: "Seaport",
    version: "1.5",
    chainId: chainId,
    verifyingContract: "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC"
  };

  console.log(domainData);
  //   struct BasicOrderParameters {
  //     OrderType orderType;
  //     address payable offerer;
  //     address offerToken;
  //     uint256 offerTokenId;
  //     uint256 unitPrice;
  //     uint256 sellAmount;
  //     uint256 startTime;
  //     uint256 endTime;
  //     address paymentToken;
  //     uint256 paymentTokenId;
  //     uint256 salt;
  //     uint256 royaltyFee;
  //     uint256 platformFee;
  //     uint256 afterTaxPrice;
  // }
  const types = {
    OrderComponents: [
      {
        name: "offerer",
        type: "address"
      },
      {
        name: "zone",
        type: "address"
      },
      {
        name: "offer",
        type: "OfferItem[]"
      },
      {
        name: "consideration",
        type: "ConsiderationItem[]"
      },
      {
        name: "orderType",
        type: "uint8"
      },
      {
        name: "startTime",
        type: "uint256"
      },
      {
        name: "endTime",
        type: "uint256"
      },
      {
        name: "zoneHash",
        type: "bytes32"
      },
      {
        name: "salt",
        type: "uint256"
      },
      {
        name: "conduitKey",
        type: "bytes32"
      },
      {
        name: "counter",
        type: "uint256"
      }
    ],
    OfferItem: [
      {
        name: "itemType",
        type: "uint8"
      },
      {
        name: "token",
        type: "address"
      },
      {
        name: "identifierOrCriteria",
        type: "uint256"
      },
      {
        name: "startAmount",
        type: "uint256"
      },
      {
        name: "endAmount",
        type: "uint256"
      }
    ],
    ConsiderationItem: [
      {
        name: "itemType",
        type: "uint8"
      },
      {
        name: "token",
        type: "address"
      },
      {
        name: "identifierOrCriteria",
        type: "uint256"
      },
      {
        name: "startAmount",
        type: "uint256"
      },
      {
        name: "endAmount",
        type: "uint256"
      },
      {
        name: "recipient",
        type: "address"
      }
    ]
  };

  let message = {
    offerer: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
    zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
    offer: [
      {
        itemType: 2,
        token: "0x97f236E644db7Be9B8308525e6506E4B3304dA7B",
        identifierOrCriteria: BigInt("111"),
        startAmount: BigInt("1"),
        endAmount: BigInt("1")
      }
    ],
    consideration: [
      {
        itemType: 0,
        token: "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: BigInt("0"),
        startAmount: BigInt("1082250000000000000"),
        endAmount: BigInt("1082250000000000000"),
        recipient: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
      },
      {
        itemType: 0,
        token: "0x0000000000000000000000000000000000000000",
        identifierOrCriteria: BigInt("0"),
        startAmount: BigInt("27750000000000000"),
        endAmount: BigInt("27750000000000000"),
        recipient: "0x0000a26b00c1F0DF003000390027140000fAa719"
      }
    ],
    orderType: 0,
    startTime: BigInt("1686193412"),
    endTime: BigInt("1688785412"),
    zoneHash:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    salt: BigInt(
      "24446860302761739304752683030156737591518664810215442929818227897836383814680"
    ),
    conduitKey:
      "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
    counter: BigInt("0")
  };
  console.log(message);

  // TODO:_signTypedData
  console.log("_signTypedData");

  try {
    const orderSignature = await signer.signTypedData(
      domainData,
      types,
      message
    );

    console.log("orderSignature:" + orderSignature);

    let orderHash = TypedDataEncoder.from(types).hash(message);

    console.log("orderHash: " + orderHash);
    let result = {
      orderHash: orderHash,
      orderSignature: orderSignature
    };
    return result;
  } catch (error: unknown) {
    console.log(error);
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
    const e = error as WalletError;
    if (e.code === -32000) {
      alert(e.message);
    }
    return false;
  }
};

// TODO: OpenSea bulk order signing
const signBulkOrderOpenSeaMessage = async (signer: Signer, chainId: number) => {
  const seaport = new Seaport(signer as any);
  const domainData = await getSeaportDomainData(seaport, chainId);

  console.log(domainData);

  const orders: OrderComponents[] = [];

  for (let i = 1; i <= 3; i++) {
    const order = {
      offerer: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
      zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
      offer: [
        {
          itemType: 2,
          token: "0x97f236E644db7Be9B8308525e6506E4B3304dA7B",
          identifierOrCriteria: BigInt("111"),
          startAmount: BigInt("1"),
          endAmount: BigInt("1")
        }
      ],
      consideration: [
        {
          itemType: 0,
          token: "0x0000000000000000000000000000000000000000",
          identifierOrCriteria: BigInt("0"),
          startAmount: BigInt("1082250000000000000"),
          endAmount: BigInt("1082250000000000000"),
          recipient: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
        },
        {
          itemType: 0,
          token: "0x0000000000000000000000000000000000000000",
          identifierOrCriteria: BigInt("0"),
          startAmount: BigInt("27750000000000000"),
          endAmount: BigInt("27750000000000000"),
          recipient: "0x0000a26b00c1F0DF003000390027140000fAa719"
        }
      ],
      orderType: 0,
      startTime: BigInt("1686193412"),
      endTime: BigInt("1688785412"),
      zoneHash:
        "0x0000000000000000000000000000000000000000000000000000000000000000",
      salt: BigInt(
        "24446860302761739304752683030156737591518664810215442929818227897836383814680"
      ),
      conduitKey:
        "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
      counter: BigInt("0"),
      totalOriginalConsiderationItems: 2
    };
    order.offer[0].identifierOrCriteria = BigInt(i);
    orders.push(order as unknown as OrderComponents);
  }

  let ordersWithSign: SeaportOrder[] = [];
  try {
    ordersWithSign = await seaport.signBulkOrder(orders);
  } catch (error: unknown) {
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
  }

  return ordersWithSign;
};

// TODO: Custom Bulk Order Signature
const signCustomBulkOrderMessage = async (signer: Signer, chainId: number) => {
  const seaport = new Seaport(signer as any);
  const domainData = await getSeaportDomainData(seaport, chainId);

  const eip712BulkOrderType = {
    BulkOrder: [{ name: "tree", type: "OrderComponents[2][2][2][2][2][2][2]" }],
    OrderComponents: [
      { name: "offerer", type: "address" },
      { name: "offer", type: "OfferItem[]" },
      { name: "consideration", type: "ConsiderationItem[]" },
      { name: "orderType", type: "uint8" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "salt", type: "uint256" },
      { name: "counter", type: "uint256" }
    ],
    OfferItem: [
      { name: "itemType", type: "uint8" },
      { name: "token", type: "address" },
      { name: "identifierOrCriteria", type: "uint256" },
      { name: "startAmount", type: "uint256" },
      { name: "endAmount", type: "uint256" }
    ],
    ConsiderationItem: [
      { name: "itemType", type: "uint8" },
      { name: "token", type: "address" },
      { name: "identifierOrCriteria", type: "uint256" },
      { name: "startAmount", type: "uint256" },
      { name: "endAmount", type: "uint256" },
      { name: "recipient", type: "address" }
    ]
  };
  const bulkOrder = new BulkOrder(
    signer as ConstructorParameters<typeof BulkOrder>[0],
    domainData,
    eip712BulkOrderType
  );

  const orders = [];
  for (let i = 1; i <= 4; i++) {
    const order = {
      offerer: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2",
      offer: [
        {
          itemType: 2,
          token: "0x97f236E644db7Be9B8308525e6506E4B3304dA7B",
          identifierOrCriteria: "111",
          startAmount: "1",
          endAmount: "1"
        }
      ],
      consideration: [
        {
          itemType: 0,
          token: "0x0000000000000000000000000000000000000000",
          identifierOrCriteria: "0",
          startAmount: "1082250000000000000",
          endAmount: "1082250000000000000",
          recipient: "0x6278A1E803A76796a3A1f7F6344fE874ebfe94B2"
        },
        {
          itemType: 0,
          token: "0x0000000000000000000000000000000000000000",
          identifierOrCriteria: "0",
          startAmount: "27750000000000000",
          endAmount: "27750000000000000",
          recipient: "0x0000a26b00c1F0DF003000390027140000fAa719"
        }
      ],
      orderType: 0,
      startTime: "1686193412",
      endTime: "1688785412",
      salt: "24446860302761739304752683030156737591518664810215442929818227897836383814680",
      counter: "0"
    };
    order.offer[0].identifierOrCriteria = String(i);
    orders.push(order);
  }

  let ordersWithSign: BulkSignedOrder[] = [];
  try {
    ordersWithSign = await bulkOrder.signBulkOrder(orders);

    // verify the signature
    const account = await signer.getAddress();
    const verified = await bulkOrder.verifyBulkOrder(ordersWithSign, account);
    console.log("verified:", verified);
  } catch (error: unknown) {
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
  }

  return ordersWithSign;
};

// getSystemSignature_YunGou
const getSystemSignature = async (
  orderSignature: string,
  data: YunGouOrderData
): Promise<string | false> => {
  try {
    const privateKey = PRIVATEKEY_VERIFYER;
    if (!privateKey) {
      throw new Error("REACT_APP_PRIVATEKEY_VERIFYER is not configured");
    }
    const signer = new Wallet(privateKey);

    const type = [
      "bytes",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256",
      "uint256"
    ];
    const args = [
      orderSignature,
      data.buyAmount,
      data.totalRoyaltyFee,
      data.totalPlatformFee,
      data.totalAfterTaxIncome,
      data.totalPayment,
      data.expiryDate
    ];

    const encodedData = AbiCoder.defaultAbiCoder().encode(type, args);
    console.log("encodedData:" + encodedData);
    const hashData = keccak256(encodedData);
    let binaryData_ = getBytes(hashData);
    console.log("systemMassageHash:" + hashData);
    let signPromise_ = await signer.signMessage(binaryData_);
    return signPromise_;
  } catch (error: unknown) {
    console.log(error);
    if (isUserRejected(error)) {
      toast.error("User rejected request!");
    }
    const e = error as WalletError;
    if (e.code === -32000) {
      alert(e.message);
    }
    return false;
  }
};

export {
  signEIP712Message,
  signStringMessage,
  signHexDataMessage,
  getSystemSignature,
  signEIP712YunGouMessage,
  signEIP712OpenSeaMessage,
  signBulkOrderOpenSeaMessage,
  signCustomBulkOrderMessage
};
