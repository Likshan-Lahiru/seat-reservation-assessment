import cron from "node-cron";
import { pool } from "../db/pool";

export function startCleanupExpiredReservationsJob() {
    cron.schedule("5 0 * * *", async () => {
        try {
            const { rowCount } = await pool.query(`
        DELETE FROM reservations r
        USING shows s
        WHERE r.show_id = s.id
          AND s.end_time < NOW()
      `);

            console.log(`[cleanup] Deleted expired reservations: ${rowCount ?? 0}`);
        } catch (err) {
            console.error("[cleanup] Failed:", err);
        }
    });
}
