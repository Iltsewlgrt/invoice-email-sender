import { PoolClient } from "pg";
import { query } from "../db";

export type InvoiceItemInput = {
  description: string;
  amount: number;
};

export type InvoiceDetailsRow = {
  invoice_number: string;
  issue_date: string;
  total_amount: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  company_address: string;
  company_city: string;
  company_country: string;
  company_tax_id: string | null;
};

export type InvoiceItemRow = {
  description: string;
  amount: string;
};

export type InvoiceEmailRow = {
  pdf_path: string | null;
  invoice_number: string;
  email: string;
  first_name: string;
  last_name: string;
};

export async function insertInvoiceRequest(
  client: PoolClient,
  requestId: string,
  email: string,
  payload: unknown
): Promise<void> {
  await client.query(
    "INSERT INTO invoice_requests (id, email, payload) VALUES ($1, $2, $3)",
    [requestId, email, payload]
  );
}

export async function createInvoice(
  client: PoolClient,
  requestId: string,
  clientId: number,
  companyId: number,
  issueDate: string,
  totalAmount: number
): Promise<number> {
  const invoiceResult = await client.query<{ id: number }>(
    `INSERT INTO invoices (request_id, client_id, company_id, issue_date, total_amount)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [requestId, clientId, companyId, issueDate, totalAmount]
  );

  return invoiceResult.rows[0].id;
}

export async function updateInvoiceNumber(
  client: PoolClient,
  invoiceId: number,
  invoiceNumber: string
): Promise<void> {
  await client.query("UPDATE invoices SET invoice_number = $1 WHERE id = $2", [
    invoiceNumber,
    invoiceId
  ]);
}

export async function insertInvoiceItem(
  client: PoolClient,
  invoiceId: number,
  item: InvoiceItemInput
): Promise<void> {
  await client.query(
    "INSERT INTO invoice_items (invoice_id, description, amount) VALUES ($1, $2, $3)",
    [invoiceId, item.description, item.amount]
  );
}

export async function getInvoiceDetails(invoiceId: number): Promise<InvoiceDetailsRow | null> {
  const invoice = await query<InvoiceDetailsRow>(
    `SELECT i.invoice_number, i.issue_date, i.total_amount,
            c.first_name, c.last_name, c.email,
            co.name as company_name, co.address as company_address,
            co.city as company_city, co.country as company_country,
            co.tax_id as company_tax_id
     FROM invoices i
     JOIN clients c ON c.id = i.client_id
     JOIN companies co ON co.id = i.company_id
     WHERE i.id = $1`,
    [invoiceId]
  );

  return invoice.rows[0] ?? null;
}

export async function getInvoiceItems(invoiceId: number): Promise<InvoiceItemRow[]> {
  const items = await query<InvoiceItemRow>(
    "SELECT description, amount FROM invoice_items WHERE invoice_id = $1",
    [invoiceId]
  );

  return items.rows;
}

export async function updateInvoicePdfPath(invoiceId: number, pdfPath: string): Promise<void> {
  await query("UPDATE invoices SET pdf_path = $1, status = $2 WHERE id = $3", [
    pdfPath,
    "pdf_generated",
    invoiceId
  ]);
}

export async function updateInvoiceStatus(invoiceId: number, status: string): Promise<void> {
  await query("UPDATE invoices SET status = $1 WHERE id = $2", [status, invoiceId]);
}

export async function getInvoiceEmailInfo(invoiceId: number): Promise<InvoiceEmailRow | null> {
  const result = await query<InvoiceEmailRow>(
    `SELECT i.pdf_path, i.invoice_number, c.email, c.first_name, c.last_name
     FROM invoices i
     JOIN clients c ON c.id = i.client_id
     WHERE i.id = $1`,
    [invoiceId]
  );

  return result.rows[0] ?? null;
}
