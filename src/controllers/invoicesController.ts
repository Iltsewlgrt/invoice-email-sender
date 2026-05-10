import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { createInvoiceRequest } from "../services/invoiceService";
import { pdfQueue } from "../queues";
import { ERR_CLIENT_NOT_FOUND } from "../constants/errors";

const createInvoiceSchema = z.object({
  email: z.string().email(),
  items: z
    .array(
      z.object({
        description: z.string().min(1),
        amount: z.number().nonnegative()
      })
    )
    .min(1)
});

export async function createInvoiceHandler(req: Request, res: Response): Promise<Response> {
  const parseResult = createInvoiceSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Invalid payload", details: parseResult.error.format() });
  }

  try {
    const { invoiceId } = await createInvoiceRequest(parseResult.data);
    await pdfQueue.add("generate-pdf", { invoiceId });
    return res.status(StatusCodes.ACCEPTED).json({ invoiceId, status: "queued" });
  } catch (error) {
    if (error instanceof Error && error.message === ERR_CLIENT_NOT_FOUND) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: "Client not found" });
    }
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal server error" });
  }
}
