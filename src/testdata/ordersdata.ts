import { BigNumber } from "ethers";

const orderType = 0;
const offerer = "0x6278a1e803a76796a3a1f7f6344fe874ebfe94b2";
const offerToken = "0xeaafcc17f28afe5cda5b3f76770efb7ef162d20b";
const offerTokenId = BigNumber.from("8");
const unitPrice = BigNumber.from("10000000000000000");
const sellAmount = 1;
const startTime = 1686286200;
const endTime = 1686986200;
const paymentToken = "0x0000000000000000000000000000000000000000";
const paymentTokenId = 0;
const royaltyFee = BigNumber.from("250000000000000");
const platformFee = BigNumber.from("250000000000000");
const afterTaxPrice = BigNumber.from("9500000000000000");

const parameters_8 = {
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
  salt: 88,
  royaltyFee,
  platformFee,
  afterTaxPrice
};

const parameters_7 = {
  orderType,
  offerer,
  offerToken,
  offerTokenId: BigNumber.from("7"),
  unitPrice,
  sellAmount,
  startTime,
  endTime,
  paymentToken,
  paymentTokenId,
  salt: 77,
  royaltyFee,
  platformFee,
  afterTaxPrice
};

const orderSignature_7 =
  "0x20eb8fcfe0991b0aa4441e250c9c51d42c65eae9c44389e02b9a45f771d640f01dab7b92f660e0f0c77e9baeb6e0bc088b557957c987c1e1ac32f4379d9fd31c1b";
const orderSignature_8 =
  "0xab3048141c5f3afbeacf507aed5cfbd4627729b53c633f9728dbc9bc88b4a5416378e64b7fb82eed1b6cdca294ecb45c8975e59fca8f60871a8817e2fc98d7891b";
const buyAmount = 1;
const totalRoyaltyFee = BigNumber.from("250000000000000");
const totalPlatformFee = BigNumber.from("250000000000000");
const totalAfterTaxIncome = BigNumber.from("9500000000000000");
const totalPayment = BigNumber.from("10000000000000000");
const expiryDate = 1686986400;
const systemSignature_7 =
  "0xb55b71bbb4599d2cb68da7311aff64ee9398f994ffd15e7bc65d95b280f9cf8460d161ee426d360bc14b2c67ed4c9c334d337d37c508197bb83b87dab0ee0b321b";
const systemSignature_8 =
  "0x34039be325e3461375c05ffcf1dd7d63588ff71b31179b7f0ac91edcae1c86fa6a85c458bfac3f4e17776dc4df55f2b1c42b0baf58f5cc88765ef562bde1cb1e1c";

const order_7 = {
  parameters: parameters_7,
  orderSignature: orderSignature_7,
  buyAmount,
  totalRoyaltyFee,
  totalPlatformFee,
  totalAfterTaxIncome,
  totalPayment,
  expiryDate,
  systemSignature: systemSignature_7
};

const order_8 = {
  parameters: parameters_8,
  orderSignature: orderSignature_8,
  buyAmount,
  totalRoyaltyFee,
  totalPlatformFee,
  totalAfterTaxIncome,
  totalPayment,
  expiryDate,
  systemSignature: systemSignature_8
};

const orders = [order_7];
// orders.push(order_8);

export default { orders };
