import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import { invoicesRouter } from "./routes/invoices";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";

export const app = express();

app.use(express.json({ limit: "1mb" }));

if (config.nodeEnv !== "production") {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
app.use("/invoices", invoicesRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);
