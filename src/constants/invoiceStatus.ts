export const INVOICE_STATUS = {
    PENDING: "pending",
    QUEUED: "queued",
    PDF_GENERATED: "pdf_generated",
    SENT: "sent"
} as const;

export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];
