import mysql from "mysql";

const getResultSelectDB = async (sql: string): Promise<string | null> => {
  try {
    const connection = mysql.createConnection({
      host: "192.168.0.173",
      user: "root",
      password: "root",
      port: "3306",
      database: "aggregator_ethan"
    });

    const queryPromise = (): Promise<unknown> => {
      return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
          if (err) {
            console.log("[SELECT ERROR] - ", err.message);
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    };

    connection.connect();
    const result = await queryPromise();
    connection.end();
    return JSON.stringify(result);
  } catch (err) {
    console.log(err);
    return null;
  }
};

export { getResultSelectDB };
