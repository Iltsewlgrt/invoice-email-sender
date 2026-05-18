import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Job } from "bullmq";
import { createInvoiceRequest } from "./invoiceService";
import { ERR_CLIENT_NOT_FOUND } from "../constants/errors";
import { AppError } from "../errors/appError";
import { INVOICE_STATUS } from "../constants/invoiceStatus";
import { pdfQueue } from "../queues";
import { findClientByEmail } from "../repositories/clientsRepository";
import {
    createInvoice,
    insertInvoiceItem,
    insertInvoiceRequest,
    updateInvoiceNumber,
    updateInvoiceStatus
} from "../repositories/invoicesRepository";

vi.mock("../db", () => ({
    prisma: {
        $transaction: async <T>(fn: (tx: unknown) => Promise<T>) => fn({})
    }
}));

vi.mock("../queues", () => ({
    pdfQueue: {
        add: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock("../repositories/clientsRepository", () => ({
    findClientByEmail: vi.fn()
}));

vi.mock("../repositories/invoicesRepository", () => ({
    createInvoice: vi.fn(),
    insertInvoiceItem: vi.fn(),
    insertInvoiceRequest: vi.fn(),
    updateInvoiceNumber: vi.fn(),
    updateInvoiceStatus: vi.fn()
}));

const mockedFindClientByEmail = vi.mocked(findClientByEmail);
const mockedCreateInvoice = vi.mocked(createInvoice);
const mockedInsertInvoiceItem = vi.mocked(insertInvoiceItem);
const mockedInsertInvoiceRequest = vi.mocked(insertInvoiceRequest);
const mockedUpdateInvoiceNumber = vi.mocked(updateInvoiceNumber);
const mockedUpdateInvoiceStatus = vi.mocked(updateInvoiceStatus);
const mockedPdfQueueAdd = vi.mocked(pdfQueue.add);

beforeEach(() => {
    vi.clearAllMocks();
});

describe("createInvoiceRequest", () => {
    it("throws AppError when client is missing", async () => {
        mockedFindClientByEmail.mockResolvedValue(null);

        try {
            await createInvoiceRequest({
                email: "missing@example.com",
                items: [{ description: "Work", amount: 100 }]
            });
            throw new Error("Expected createInvoiceRequest to throw");
        } catch (error) {
            expect(error).toBeInstanceOf(AppError);
            expect(error).toMatchObject({ code: ERR_CLIENT_NOT_FOUND });
        }
    });

    it("creates invoice and enqueues PDF job", async () => {
        mockedFindClientByEmail.mockResolvedValue({
            id: 1,
            firstName: "Alice",
            lastName: "Smith",
            companyId: 2
        });
        mockedCreateInvoice.mockResolvedValue(42);
        mockedInsertInvoiceRequest.mockResolvedValue(undefined);
        mockedUpdateInvoiceNumber.mockResolvedValue(undefined);
        mockedInsertInvoiceItem.mockResolvedValue(undefined);
        mockedUpdateInvoiceStatus.mockResolvedValue(undefined);
        mockedPdfQueueAdd.mockResolvedValue({} as unknown as Job);

        const result = await createInvoiceRequest({
            email: "client@example.com",
            items: [{ description: "Design", amount: 150 }]
        });

        expect(result).toEqual({ invoiceId: 42 });
        expect(mockedUpdateInvoiceStatus).toHaveBeenCalledWith(
            expect.anything(),
            42,
            INVOICE_STATUS.QUEUED
        );
        expect(mockedPdfQueueAdd).toHaveBeenCalledWith("generate-pdf", { invoiceId: 42 });
    });
});
