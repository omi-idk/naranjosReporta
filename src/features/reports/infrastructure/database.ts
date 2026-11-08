import { Pool, type PoolClient } from "pg";
import { AppError } from "../application/errors";

const globalDatabase = globalThis as typeof globalThis & { reportPool?: Pool };
export function database(): Pool {
  if (!process.env.DATABASE_URL)
    throw new AppError(
      503,
      "SERVICE_UNAVAILABLE",
      "El servicio de reportes no está configurado.",
    );
  if (!globalDatabase.reportPool)
    globalDatabase.reportPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      connectionTimeoutMillis: 4000,
      statement_timeout: 5000,
    });
  return globalDatabase.reportPool;
}
export async function transaction<T>(
  action: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
