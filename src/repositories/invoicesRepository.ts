import dayjs from "dayjs";
import type { Prisma } from "@prisma/client";
import { DbClient, prisma } from "../db";
import { INVOICE_STATUS, InvoiceStatus } from "../constants/invoiceStatus";

export type InvoiceItemInput = {
  description: string;
  amount: number;
};

export type InvoiceDetailsRow = {
  invoiceNumber: string;
  issueDate: string;
  totalAmount: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyTaxId: string | null;
};

export type InvoiceItemRow = {
  description: string;
  amount: string;
};

export type InvoiceEmailRow = {
  pdfPath: string | null;
  invoiceNumber: string;
  email: string;
  firstName: string;
  lastName: string;
};

type InvoiceItemAmount = { toString: () => string };

export async function insertInvoiceRequest(
  client: DbClient,
  requestId: string,
  email: string,
  payload: Prisma.InputJsonValue
): Promise<void> {
  await client.invoiceRequest.create({
    data: {
      id: requestId,
      email,
      payload
    }
  });
}

export async function createInvoice(
  client: DbClient,
  requestId: string,
  clientId: number,
  companyId: number,
  issueDate: string,
  totalAmount: number
): Promise<number> {
  const invoice = await client.invoice.create({
    data: {
      requestId,
      clientId,
      companyId,
      issueDate: new Date(issueDate),
      totalAmount
    },
    select: { id: true }
  });

  return invoice.id;
}

export async function updateInvoiceNumber(
  client: DbClient,
  invoiceId: number,
  invoiceNumber: string
): Promise<void> {
  await client.invoice.update({
    where: { id: invoiceId },
    data: { invoiceNumber }
  });
}

export async function insertInvoiceItem(
  client: DbClient,
  invoiceId: number,
  item: InvoiceItemInput
): Promise<void> {
  await client.invoiceItem.create({
    data: {
      invoiceId,
      description: item.description,
      amount: item.amount
    }
  });
}

export async function getInvoiceDetails(invoiceId: number): Promise<InvoiceDetailsRow | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      company: true
    }
  });

  if (!invoice) {
    return null;
  }

  return {
    invoiceNumber: invoice.invoiceNumber ?? "",
    issueDate: dayjs(invoice.issueDate).format("YYYY-MM-DD"),
    totalAmount: invoice.totalAmount.toString(),
    firstName: invoice.client.firstName,
    lastName: invoice.client.lastName,
    email: invoice.client.email,
    companyName: invoice.company.name,
    companyAddress: invoice.company.address,
    companyCity: invoice.company.city,
    companyCountry: invoice.company.country,
    companyTaxId: invoice.company.taxId
  };
}

export async function getInvoiceItems(invoiceId: number): Promise<InvoiceItemRow[]> {
  const items: Array<{ description: string; amount: InvoiceItemAmount }> =
    await prisma.invoiceItem.findMany({
      where: { invoiceId },
      select: {
        description: true,
        amount: true
      }
    });

  return items.map((item) => ({
    description: item.description,
    amount: item.amount.toString()
  }));
}

export async function updateInvoicePdfPath(
  client: DbClient,
  invoiceId: number,
  pdfPath: string
): Promise<void> {
  await client.invoice.update({
    where: { id: invoiceId },
    data: {
      pdfPath,
      status: INVOICE_STATUS.PDF_GENERATED
    }
  });
}

export async function updateInvoiceStatus(
  client: DbClient,
  invoiceId: number,
  status: InvoiceStatus
): Promise<void> {
  await client.invoice.update({
    where: { id: invoiceId },
    data: { status }
  });
}

export async function getInvoiceEmailInfo(invoiceId: number): Promise<InvoiceEmailRow | null> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true
    }
  });

  if (!invoice) {
    return null;
  }

  return {
    pdfPath: invoice.pdfPath,
    invoiceNumber: invoice.invoiceNumber ?? "",
    email: invoice.client.email,
    firstName: invoice.client.firstName,
    lastName: invoice.client.lastName
  };
}
