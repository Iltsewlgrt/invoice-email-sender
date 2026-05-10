import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";
import { config } from "./config";

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database
});

export function query<T extends QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  return pool.query(text, params);
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}
