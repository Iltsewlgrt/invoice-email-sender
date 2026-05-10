import { Worker } from "bullmq";
import { connection, EMAIL_QUEUE } from "../queues";
import { sendEmail } from "../services/emailService";
import { ERR_INVOICE_NOT_FOUND, ERR_PDF_NOT_READY } from "../constants/errors";
import { getInvoiceEmailInfo, updateInvoiceStatus } from "../repositories/invoicesRepository";

const worker = new Worker(
  EMAIL_QUEUE,
  async (job) => {
    const { invoiceId } = job.data as { invoiceId: number };

    const invoice = await getInvoiceEmailInfo(invoiceId);
    if (!invoice) {
      throw new Error(ERR_INVOICE_NOT_FOUND);
    }
    if (!invoice.pdf_path) {
      throw new Error(ERR_PDF_NOT_READY);
    }

    await sendEmail({
      to: invoice.email,
      subject: `Invoice ${invoice.invoice_number}`,
      text: `Hello ${invoice.first_name} ${invoice.last_name}, your invoice is attached.`,
      attachmentPath: invoice.pdf_path
    });

    await updateInvoiceStatus(invoiceId, "sent");
  },
  { connection }
);

worker.on("failed", (job, err) => {
  console.error("Email worker failed", job?.id, err);
});
