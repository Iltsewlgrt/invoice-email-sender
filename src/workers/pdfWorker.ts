import { Worker } from "bullmq";
import { connection, PDF_QUEUE, emailQueue } from "../queues";
import { generateInvoicePdf } from "../services/pdfService";
import { updateInvoicePdfPath } from "../repositories/invoicesRepository";

const worker = new Worker(
  PDF_QUEUE,
  async (job) => {
    const { invoiceId } = job.data as { invoiceId: number };

    const pdfPath = await generateInvoicePdf(invoiceId);

    await updateInvoicePdfPath(invoiceId, pdfPath);

    await emailQueue.add("send-email", { invoiceId });
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error("PDF worker failed", job?.id, err);
});
