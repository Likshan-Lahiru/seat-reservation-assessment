import { pool } from "../db/pool";
import type { PoolClient } from "pg";

export type MovieRow = {
    id: string;
    title: string;
    image_url: string | null;
    created_at: string;
};

export type ShowRow = {
    id: string;
    movie_id: string;
    theatre_id: string;
    start_time: string;
    end_time: string;
    created_at: string;
};

export async function createMovie(
    client: PoolClient,
    input: { title: string; imageUrl?: string }
): Promise<MovieRow> {
    const q = `
        INSERT INTO movies (title, image_url)
        VALUES ($1, $2)
            RETURNING *;
    `;
    const { rows } = await client.query<MovieRow>(q, [input.title, input.imageUrl ?? null]);
    return rows[0];
}

export async function createShowsBulk(
    client: PoolClient,
    input: { movieId: string; theatreId: string; starts: string[]; ends: string[] }
): Promise<ShowRow[]> {
    const q = `
        INSERT INTO shows (movie_id, theatre_id, start_time, end_time)
        SELECT $1, $2, s, e
        FROM unnest($3::timestamptz[], $4::timestamptz[]) AS t(s, e)
            RETURNING *;
    `;
    const { rows } = await client.query<ShowRow>(q, [input.movieId, input.theatreId, input.starts, input.ends]);
    return rows;
}

export async function listShowsByMovie(movieId: string): Promise<ShowRow[]> {
    const { rows } = await pool.query<ShowRow>(
        `SELECT * FROM shows WHERE movie_id = $1 ORDER BY start_time ASC`,
        [movieId]
    );
    return rows;
}

export async function getShowById(client: PoolClient, showId: string): Promise<ShowRow | null> {
    const { rows } = await client.query<ShowRow>(`SELECT * FROM shows WHERE id = $1`, [showId]);
    return rows[0] ?? null;
}

export async function listMoviesWithShows(): Promise<
    Array<{
        id: string;
        title: string;
        image_url: string | null;
        created_at: string;
        shows: Array<{
            id: string;
            theatre_id: string;
            start_time: string;
            end_time: string;
        }>;
    }>
> {
    const q = `
    SELECT
      m.id,
      m.title,
      m.image_url,
      m.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'theatre_id', s.theatre_id,
            'start_time', s.start_time,
            'end_time', s.end_time
          )
          ORDER BY s.start_time ASC
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS shows
    FROM movies m
    LEFT JOIN shows s ON s.movie_id = m.id
    GROUP BY m.id
    ORDER BY m.created_at DESC;
  `;

    const { rows } = await pool.query<any>(q);
    return rows;
}
