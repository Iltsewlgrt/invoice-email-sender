import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { ERR_CLIENT_NOT_FOUND } from "../constants/errors";
import { AppError } from "../errors/appError";
import { StatusCodes } from "http-status-codes";
import { findClientByEmail } from "../repositories/clientsRepository";
import {
  createInvoice,
  insertInvoiceItem,
  insertInvoiceRequest,
  updateInvoiceNumber,
  updateInvoiceStatus,
  InvoiceItemInput
} from "../repositories/invoicesRepository";
import { pdfQueue } from "../queues";
import { INVOICE_STATUS } from "../constants/invoiceStatus";

type CreateInvoiceInput = {
  email: string;
  items: InvoiceItemInput[];
};

export async function createInvoiceRequest(input: CreateInvoiceInput): Promise<{ invoiceId: number }> {
  const requestId = uuidv4();
  const issueDate = dayjs().format("YYYY-MM-DD");

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await insertInvoiceRequest(tx, requestId, input.email, input);

    const clientRow = await findClientByEmail(tx, input.email);
    if (!clientRow) {
      throw new AppError(ERR_CLIENT_NOT_FOUND, StatusCodes.NOT_FOUND, "Client not found");
    }

    const total = input.items.reduce((sum, item) => sum + item.amount, 0);

    const invoiceId = await createInvoice(
      tx,
      requestId,
      clientRow.id,
      clientRow.companyId,
      issueDate,
      total
    );
    const invoiceNumber = `INV-${issueDate.replace(/-/g, "")}-${invoiceId}`;

    await updateInvoiceNumber(tx, invoiceId, invoiceNumber);

    for (const item of input.items) {
      await insertInvoiceItem(tx, invoiceId, item);
    }

    await updateInvoiceStatus(tx, invoiceId, INVOICE_STATUS.QUEUED);

    return { invoiceId };
  });

  await pdfQueue.add("generate-pdf", { invoiceId: result.invoiceId });
  return result;
}
