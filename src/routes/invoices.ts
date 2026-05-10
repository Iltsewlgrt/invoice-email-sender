import { Router } from "express";
import { createInvoiceHandler } from "../controllers/invoicesController";

export const invoicesRouter = Router();

/**
 * @openapi
 * /invoices:
 *   post:
 *     summary: Create invoice and send email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: client@example.com
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     amount:
 *                       type: number
 *             required:
 *               - email
 *               - items
 *     responses:
 *       202:
 *         description: Accepted
 *       404:
 *         description: Client not found
 */
invoicesRouter.post("/", async (req, res) => {
  await createInvoiceHandler(req, res);
});
