import { Pool } from "pg";

function buildConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  return {
    host: process.env.PGHOST ?? "localhost",
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER ?? "root",
    password: process.env.PGPASSWORD ?? "LahiruDev123",
    database: process.env.PGDATABASE ?? "reservation_db"
  };
}

export const pool = new Pool(buildConfig());

pool.on("error", (err: any) => {
  console.error("Unexpected PG pool error:", err);
});
