const { getPoolMysql } = require("./ConnectMysql");
const { getResultSelectDB } = require("./OperateMysql");

let pool = getPoolMysql();
let sql = "SELECT * FROM system";
async function main() {
  let result = await getResultSelectDB(sql);
  console.log(result);
}
main();
