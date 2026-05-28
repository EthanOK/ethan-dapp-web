import type { Pool, MysqlConnection } from "mysql";

const getResultSelectDB = async (
  pool: Pool,
  sql: string
): Promise<string | null> => {
  try {
    const connection = await new Promise<MysqlConnection>((resolve, reject) => {
      pool.getConnection((err, conn) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(conn);
      });
    });

    console.log("Connected!");

    const result = await new Promise<unknown>((resolve, reject) => {
      connection.query(sql, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });

    connection.release();
    return JSON.stringify(result);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export { getResultSelectDB };
