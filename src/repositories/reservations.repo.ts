import type { PoolClient } from "pg";

export type ReservationRow = {
    id: string;
    show_id: string;
    user_id: string;
    created_at: string;
};

export async function createReservationHeader(
    client: PoolClient,
    input: { showId: string; userId: string }
): Promise<ReservationRow> {
    const q = `
        INSERT INTO reservations (show_id, user_id)
        VALUES ($1, $2)
            RETURNING *;
    `;
    const { rows } = await client.query<ReservationRow>(q, [input.showId, input.userId]);
    return rows[0];
}

export async function insertReservationItems(
    client: PoolClient,
    input: { reservationId: string; showId: string; seatIds: string[] }
): Promise<void> {
    const q = `
        INSERT INTO reservation_items (reservation_id, show_id, seat_id)
        SELECT $1, $2, seat_id
        FROM unnest($3::uuid[]) AS seat_id;
    `;
    await client.query(q, [input.reservationId, input.showId, input.seatIds]);
}

export async function deleteReservationById(client: PoolClient, reservationId: string): Promise<number> {
    const { rowCount } = await client.query(`DELETE FROM reservations WHERE id = $1`, [reservationId]);
    return rowCount ?? 0;
}

export async function getReservationById(client: PoolClient, reservationId: string): Promise<ReservationRow | null> {
    const { rows } = await client.query<ReservationRow>(`SELECT * FROM reservations WHERE id = $1`, [reservationId]);
    return rows[0] ?? null;
}

export async function listReservations(
    client: PoolClient,
    input: { showId?: string; seatId?: string; limit: number; offset: number }
): Promise<
    Array<{
        reservation_id: string;
        show_id: string;
        user_id: string;
        created_at: string;
        user: { name: string; email: string; nic: string };
        movie: { title: string; image_url: string | null };
        show: { start_time: string; end_time: string; theatre_id: string };
        seats: Array<{ seat_id: string; label: string }>;
    }>
> {
    const where: string[] = [];
    const args: any[] = [];

    if (input.showId) {
        args.push(input.showId);
        where.push(`r.show_id = $${args.length}`);
    }

    if (input.seatId) {
        args.push(input.seatId);
        where.push(`
      EXISTS (
        SELECT 1 FROM reservation_items ri2
        WHERE ri2.reservation_id = r.id AND ri2.seat_id = $${args.length}
      )
    `);
    }

    args.push(input.limit);
    const limitIdx = args.length;
    args.push(input.offset);
    const offsetIdx = args.length;

    const q = `
        SELECT
            r.id AS reservation_id,
            r.show_id,
            r.user_id,
            r.created_at,
            u.name AS user_name,
            u.email AS user_email,
            u.nic AS user_nic,
            m.title AS movie_title,
            m.image_url AS movie_image_url,
            s.start_time AS show_start_time,
            s.end_time AS show_end_time,
            s.theatre_id AS show_theatre_id,
            json_agg(json_build_object('seat_id', seat.id, 'label', seat.label) ORDER BY seat.label) AS seats
        FROM reservations r
                 JOIN users u ON u.id = r.user_id
                 JOIN shows s ON s.id = r.show_id
                 JOIN movies m ON m.id = s.movie_id
                 JOIN reservation_items ri ON ri.reservation_id = r.id
                 JOIN seats seat ON seat.id = ri.seat_id
            ${where.length ? "WHERE " + where.join(" AND ") : ""}
        GROUP BY r.id, u.id, s.id, m.id
        ORDER BY r.created_at DESC
            LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const { rows } = await client.query<any>(q, args);

    return rows.map((row: any) => ({
        reservation_id: row.reservation_id,
        show_id: row.show_id,
        user_id: row.user_id,
        created_at: row.created_at,
        user: { name: row.user_name, email: row.user_email, nic: row.user_nic },
        movie: { title: row.movie_title, image_url: row.movie_image_url },
        show: {
            start_time: row.show_start_time,
            end_time: row.show_end_time,
            theatre_id: row.show_theatre_id
        },
        seats: row.seats ?? []
    }));
}
