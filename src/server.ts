import "dotenv/config";
import { createApp } from "./app";
import { pool } from "./db/pool";

const PORT = Number(process.env.PORT ?? 4000);

async function start() {
  await pool.query("SELECT 1");
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
