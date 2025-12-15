import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "../src/db/pool";

async function run() {
    const sqlPath = path.resolve(process.cwd(), "migrations/001_init.sql");
    const sql = await readFile(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("Migration applied:", sqlPath);
}

run()
    .then(() => pool.end())
    .catch(async (err) => {
        console.error("Migration failed:", err);
        await pool.end();
        process.exit(1);
    });

