import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";
if (!process.env.DATABASE_URL)
  throw new Error("Configura DATABASE_URL en .env.");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
});
try {
  await pool.query(
    await readFile(
      new URL("../prisma/categories.sql", import.meta.url),
      "utf8",
    ),
  );
  console.log("Catálogo de categorías preparado. No se crearon reportes.");
} finally {
  await pool.end();
}
