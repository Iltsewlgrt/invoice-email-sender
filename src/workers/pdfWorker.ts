import { Worker } from "bullmq";
import { z } from "zod";
import { connection, PDF_QUEUE, emailQueue } from "../queues";
import { generateInvoicePdf } from "../services/pdfService";
import { updateInvoicePdfPath } from "../repositories/invoicesRepository";
import { prisma } from "../db";
import { logger } from "../logger";

const pdfJobSchema = z.object({
  invoiceId: z.number().int().positive()
});

const worker = new Worker(
  PDF_QUEUE,
  async (job) => {
    const { invoiceId } = pdfJobSchema.parse(job.data);

    const pdfPath = await generateInvoicePdf(invoiceId);

    await updateInvoicePdfPath(prisma, invoiceId, pdfPath);

    await emailQueue.add("send-email", { invoiceId });
  },
  { connection }
);

worker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "PDF worker failed");
});
