import { PoolClient } from "pg";

export type ClientRow = {
  id: number;
  first_name: string;
  last_name: string;
  company_id: number;
};

export async function findClientByEmail(
  client: PoolClient,
  email: string
): Promise<ClientRow | null> {
  const result = await client.query<ClientRow>(
    "SELECT id, first_name, last_name, company_id FROM clients WHERE email = $1",
    [email]
  );

  return result.rows[0] ?? null;
}
