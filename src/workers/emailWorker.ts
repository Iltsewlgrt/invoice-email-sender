import { Worker } from "bullmq";
import { z } from "zod";
import { connection, EMAIL_QUEUE } from "../queues";
import { sendEmail } from "../services/emailService";
import { ERR_INVOICE_NOT_FOUND, ERR_PDF_NOT_READY } from "../constants/errors";
import { getInvoiceEmailInfo, updateInvoiceStatus } from "../repositories/invoicesRepository";
import { prisma } from "../db";
import { INVOICE_STATUS } from "../constants/invoiceStatus";
import { logger } from "../logger";

const emailJobSchema = z.object({
  invoiceId: z.number().int().positive()
});

const worker = new Worker(
  EMAIL_QUEUE,
  async (job) => {
    const { invoiceId } = emailJobSchema.parse(job.data);

    const invoice = await getInvoiceEmailInfo(invoiceId);
    if (!invoice) {
      throw new Error(ERR_INVOICE_NOT_FOUND);
    }
    if (!invoice.pdfPath) {
      throw new Error(ERR_PDF_NOT_READY);
    }

    await sendEmail({
      to: invoice.email,
      subject: `Invoice ${invoice.invoiceNumber}`,
      text: `Hello ${invoice.firstName} ${invoice.lastName}, your invoice is attached.`,
      attachmentPath: invoice.pdfPath
    });

    await updateInvoiceStatus(prisma, invoiceId, INVOICE_STATUS.SENT);
  },
  { connection }
);

worker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "Email worker failed");
});
