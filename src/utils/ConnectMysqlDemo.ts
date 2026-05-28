import { getPoolMysql } from "./ConnectMysql";
import { getResultSelectDB } from "./OperateMysql";

/** Local script: query system table via mysql pool. */
async function main(): Promise<void> {
  const pool = getPoolMysql();
  if (!pool) return;
  const sql = "SELECT * FROM system";
  const result = await getResultSelectDB(sql);
  console.log(result);
}

void main();
