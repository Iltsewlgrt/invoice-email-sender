import { DbClient } from "../db";

export type ClientRow = {
  id: number;
  firstName: string;
  lastName: string;
  companyId: number;
};

export async function findClientByEmail(
  client: DbClient,
  email: string
): Promise<ClientRow | null> {
  const result = await client.client.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyId: true
    }
  });

  if (!result) {
    return null;
  }

  return {
    id: result.id,
    firstName: result.firstName,
    lastName: result.lastName,
    companyId: result.companyId
  };
}
