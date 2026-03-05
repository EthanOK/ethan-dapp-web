import { BigNumber } from "ethers";

const orderType = 0;
const offerer = "0x6278a1e803a76796a3a1f7f6344fe874ebfe94b2";
const offerToken = "0xeaafcc17f28afe5cda5b3f76770efb7ef162d20b";
const offerTokenId = BigNumber.from("65");
const unitPrice = BigNumber.from("10000000000000000");
const sellAmount = 1;
const startTime = 1686286200;
const endTime = 1718608600;
const paymentToken = "0x0000000000000000000000000000000000000000";
const paymentTokenId = 0;
const salt = 7;
const royaltyFee = BigNumber.from("250000000000000");
const platformFee = BigNumber.from("250000000000000");
const afterTaxPrice = BigNumber.from("9500000000000000");

const parameters = {
  orderType,
  offerer,
  offerToken,
  offerTokenId,
  unitPrice,
  sellAmount,
  startTime,
  endTime,
  paymentToken,
  paymentTokenId,
  salt,
  royaltyFee,
  platformFee,
  afterTaxPrice
};

const orderSignature =
  "0xa4d4172625469ebfaca424241bc57f025ff061368397f35aa5fa0f75d06bf69738016da2051552e293d1c43b760d6a4c7ee37bf397c1271ed14fe2c3f419bb531c";
const buyAmount = 1;
const totalRoyaltyFee = BigNumber.from("250000000000000");
const totalPlatformFee = BigNumber.from("250000000000000");
const totalAfterTaxIncome = BigNumber.from("9500000000000000");
const totalPayment = BigNumber.from("10000000000000000");
const expiryDate = 1718608600;
const systemSignature =
  "0x7a1df88f3e0a03975c685031bce2aa9635cc176984e5774d93d5ddc1903a9857568611530825359bfc1849bed44c31a2b3d8299ff141e42e2ed27f1ae4bbb7e51c";

const order_data = {
  parameters,
  orderSignature,
  buyAmount,
  totalRoyaltyFee,
  totalPlatformFee,
  totalAfterTaxIncome,
  totalPayment,
  expiryDate,
  systemSignature
};

const parameters_tbsc = {
  orderType,
  offerer,
  offerToken: "0xF0D6CC43Ff6E35344120c27cB76Cc80E9706803c",
  offerTokenId: "8",
  unitPrice,
  sellAmount,
  startTime,
  endTime,
  paymentToken,
  paymentTokenId,
  salt: "8",
  royaltyFee,
  platformFee,
  afterTaxPrice
};

const order_data_tbsc = {
  parameters: parameters_tbsc,
  orderSignature:
    "0xce212daad93cc3f9aefc7097e80df689ed3d01bccb7b28f4d39babfc54ba714577ca83979875cddea8b4a290e0d87af54b94e6b4926c9b16f2a4a9ba4effa3c91c",
  buyAmount,
  totalRoyaltyFee,
  totalPlatformFee,
  totalAfterTaxIncome,
  totalPayment,
  expiryDate,
  systemSignature:
    "0xfc9220d8c74f8c0ff27d88b370aacf15e8ad281699cbc08641b80166bdc6c14674324fc1d798351d4fc20c325f47f1762b39dcf807355a1715c32201134f7b211c"
};

export { order_data, order_data_tbsc };
