import { pool } from "../db/pool";

export type TheatreRow = {
    id: string;
    name: string;
    image_url: string | null;
    rating: string | null;
    location: string | null;
    created_at: string;
};

export async function listTheatres(): Promise<TheatreRow[]> {
    const { rows } = await pool.query<TheatreRow>(
        `SELECT * FROM theatres ORDER BY created_at DESC`
    );
    return rows;
}

export async function createTheatre(input: {
    name: string;
    imageUrl?: string;
    rating?: number;
    location?: string;
}): Promise<TheatreRow> {
    const q = `
    INSERT INTO theatres (name, image_url, rating, location)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

    const { rows } = await pool.query<TheatreRow>(q, [
        input.name,
        input.imageUrl ?? null,
        input.rating ?? null,
        input.location ?? null
    ]);

    return rows[0];
}
