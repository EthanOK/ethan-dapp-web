import mysql from "mysql";
import type { Pool } from "mysql";

const getPoolMysql = (): Pool | null => {
  try {
    return mysql.createPool({
      connectionLimit: 10,
      host: "192.168.0.173",
      user: "root",
      password: "root",
      port: "3306",
      database: "aggregator_ethan"
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export { getPoolMysql };
