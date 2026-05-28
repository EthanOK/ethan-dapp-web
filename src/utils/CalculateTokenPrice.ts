import { BigNumber } from "ethers";

/** Local AMM math scratch script (not used by the app). */
function main(): void {
  const x0 = BigNumber.from("40838764680979833756826");
  const y0 = BigNumber.from("8753640031136548150776930");
  const k = x0.mul(y0);
  const gtx = BigNumber.from("10000").mul(10000).div(10000);
  const gty = y0.sub(k.div(x0.add(gtx)));
  console.log(gty.toString());
}

main();
