/** Local shim for optional mysql scripts (not bundled for browser). */
declare module "mysql" {
  export interface MysqlConnection {
    query(
      sql: string,
      callback: (err: Error | null, result: unknown) => void
    ): void;
    release(): void;
  }

  export interface Pool {
    getConnection(
      callback: (err: Error | null, connection: MysqlConnection) => void
    ): void;
  }

  export function createPool(config: Record<string, unknown>): Pool;
  export function createConnection(
    config: Record<string, unknown>
  ): MysqlConnection & {
    connect(): void;
    end(): void;
  };
}
