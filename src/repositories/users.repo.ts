import type { PoolClient } from "pg";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  nic: string;
  created_at: string;
};

export async function findOrCreateUser(
  client: PoolClient,
  input: { name: string; email: string; nic: string }
): Promise<UserRow> {
  const q = `
    WITH existing AS (
      SELECT * FROM users WHERE email = $1 OR nic = $2 LIMIT 1
    ),
    ins AS (
      INSERT INTO users (name, email, nic)
      SELECT $3, $1, $2
      WHERE NOT EXISTS (SELECT 1 FROM existing)
      RETURNING *
    )
    SELECT * FROM ins
    UNION ALL
    SELECT * FROM existing
    LIMIT 1;
  `;
  const { rows } = await client.query<UserRow>(q, [input.email, input.nic, input.name]);
  return rows[0];
}
