import { Queue } from "bullmq";
import IORedis from "ioredis";
import { config } from "../config";

export const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null
});

export const PDF_QUEUE = "pdf-queue";
export const EMAIL_QUEUE = "email-queue";

export const pdfQueue = new Queue(PDF_QUEUE, { connection });
export const emailQueue = new Queue(EMAIL_QUEUE, { connection });
