import { pool } from "../db/pool";
import type { PoolClient } from "pg";

export type SeatRow = {
    id: string;
    theatre_id: string;
    label: string;
    created_at: string;
};

export async function listSeats(theatreId?: string): Promise<SeatRow[]> {
    if (theatreId) {
        const { rows } = await pool.query<SeatRow>(
            `SELECT * FROM seats WHERE theatre_id = $1 ORDER BY label ASC`,
            [theatreId]
        );
        return rows;
    }

    const { rows } = await pool.query<SeatRow>(
        `SELECT * FROM seats ORDER BY created_at DESC`
    );
    return rows;
}

export async function validateSeatsBelongToTheatre(
    client: PoolClient,
    theatreId: string,
    seatIds: string[]
): Promise<void> {
    const { rows } = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM seats WHERE theatre_id = $1 AND id = ANY($2::uuid[])`,
        [theatreId, seatIds]
    );

    const count = Number(rows[0]?.count ?? 0);
    if (count !== seatIds.length) {
        throw new Error("One or more seats are invalid for this theatre.");
    }
}

export async function createSeat(input: { theatreId: string; label: string }): Promise<SeatRow> {
    const q = `
        INSERT INTO seats (theatre_id, label)
        VALUES ($1, $2)
            RETURNING *;
    `;
    const { rows } = await pool.query<SeatRow>(q, [input.theatreId, input.label]);
    return rows[0];
}
