import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { createInvoiceRequest } from "../services/invoiceService";
import { ERR_INVALID_PAYLOAD } from "../constants/errors";
import { AppError } from "../errors/appError";
import { INVOICE_STATUS } from "../constants/invoiceStatus";

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

export async function createInvoiceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> {
  try {
    const parseResult = createInvoiceSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw new AppError(
        ERR_INVALID_PAYLOAD,
        StatusCodes.BAD_REQUEST,
        "Invalid payload",
        parseResult.error.format()
      );
    }

    const { invoiceId } = await createInvoiceRequest(parseResult.data);
    return res.status(StatusCodes.ACCEPTED).json({ invoiceId, status: INVOICE_STATUS.QUEUED });
  } catch (error) {
    next(error);
  }
}
