import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { getClient } from "../db";
import { ERR_CLIENT_NOT_FOUND } from "../constants/errors";
import { findClientByEmail } from "../repositories/clientsRepository";
import {
  createInvoice,
  insertInvoiceItem,
  insertInvoiceRequest,
  updateInvoiceNumber
} from "../repositories/invoicesRepository";

type InvoiceItemInput = {
  description: string;
  amount: number;
};

type CreateInvoiceInput = {
  email: string;
  items: InvoiceItemInput[];
};

export async function createInvoiceRequest(input: CreateInvoiceInput): Promise<{ invoiceId: number }>
{
  const client = await getClient();
  const requestId = uuidv4();
  const issueDate = dayjs().format("YYYY-MM-DD");

  try {
    await client.query("BEGIN");

    await insertInvoiceRequest(client, requestId, input.email, input);

    const clientRow = await findClientByEmail(client, input.email);
    if (!clientRow) {
      throw new Error(ERR_CLIENT_NOT_FOUND);
    }
    const total = input.items.reduce((sum, item) => sum + item.amount, 0);

    const invoiceId = await createInvoice(
      client,
      requestId,
      clientRow.id,
      clientRow.company_id,
      issueDate,
      total
    );
    const invoiceNumber = `INV-${issueDate.replace(/-/g, "")}-${invoiceId}`;

    await updateInvoiceNumber(client, invoiceId, invoiceNumber);

    for (const item of input.items) {
      await insertInvoiceItem(client, invoiceId, item);
    }

    await client.query("COMMIT");
    return { invoiceId };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
