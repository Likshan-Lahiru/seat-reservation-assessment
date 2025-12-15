import { pool } from "../db/pool";
import type { PoolClient } from "pg";

export type SeatRow = {
    id: string;
    theatre_id: string;
    label: string;
    created_at: string;
};

export type SeatWithStatusRow = {
    id: string;
    theatre_id: string;
    label: string;
    created_at: string;
    reservation_status: boolean;
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

export async function createSeat(input: { theatreId: string; label: string }): Promise<SeatRow> {
    const q = `
        INSERT INTO seats (theatre_id, label)
        VALUES ($1, $2)
            RETURNING *;
    `;
    const { rows } = await pool.query<SeatRow>(q, [input.theatreId, input.label]);
    return rows[0];
}

export async function validateSeatsBelongToTheatre(
    client: PoolClient,
    theatreId: string,
    seatIds: string[]
): Promise<void> {
    const { rows } = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
         FROM seats
         WHERE theatre_id = $1 AND id = ANY($2::uuid[])`,
        [theatreId, seatIds]
    );

    const count = Number(rows[0]?.count ?? 0);
    if (count !== seatIds.length) {
        throw new Error("One or more seats are invalid for this theatre.");
    }
}

/**
 * Returns ALL seats in the theatre of the given showId,
 * with reservation status (true if already booked for that show).
 */
export async function listSeatsWithReservationStatusByShow(
    client: PoolClient,
    showId: string
): Promise<SeatWithStatusRow[]> {
    const q = `
        SELECT
            s.id,
            s.theatre_id,
            s.label,
            s.created_at,
            EXISTS (
                SELECT 1
                FROM reservation_items ri
                WHERE ri.show_id = $1 AND ri.seat_id = s.id
            ) AS reservation_status
        FROM shows sh
                 JOIN seats s ON s.theatre_id = sh.theatre_id
        WHERE sh.id = $1
        ORDER BY s.label ASC;
    `;

    const { rows } = await client.query<SeatWithStatusRow>(q, [showId]);
    return rows;
}
