import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";
import htmlPdf from "html-pdf-node";
import { config } from "../config";
import { ERR_INVOICE_NOT_FOUND } from "../constants/errors";
import { getInvoiceDetails, getInvoiceItems } from "../repositories/invoicesRepository";

export async function generateInvoicePdf(invoiceId: number): Promise<string> {
  const invoice = await getInvoiceDetails(invoiceId);
  if (!invoice) {
    throw new Error(ERR_INVOICE_NOT_FOUND);
  }

  const items = await getInvoiceItems(invoiceId);

  const distTemplatePath = path.join(process.cwd(), "dist", "templates", "invoice.hbs");
  const srcTemplatePath = path.join(process.cwd(), "src", "templates", "invoice.hbs");
  let templateSource: string;

  // Prefer dist template in production builds, fallback to src for dev.
  try {
    templateSource = await fs.readFile(distTemplatePath, "utf-8");
  } catch {
    templateSource = await fs.readFile(srcTemplatePath, "utf-8");
  }
  const template = handlebars.compile(templateSource);

  const html = template({
    invoice,
    items,
    sender: config.sender
  });

  const file = { content: html };
  const pdfBuffer = await htmlPdf.generatePdf(file, { format: "A4" });

  const dir = path.join(process.cwd(), "storage", "invoices");
  await fs.mkdir(dir, { recursive: true });

  const filename = `${invoice.invoiceNumber}.pdf`;
  const filePath = path.join(dir, filename);

  await fs.writeFile(filePath, pdfBuffer);

  return filePath;
}
