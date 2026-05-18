import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

const nodeEnv = env.get("NODE_ENV").default("development").asString();
const isProduction = nodeEnv === "production";

export const config = {
  port: env.get("PORT").default("3000").asPortNumber(),
  nodeEnv,
  redis: {
    host: env.get("REDIS_HOST").required().asString(),
    port: env.get("REDIS_PORT").default("6379").asPortNumber()
  },
  mail: {
    smtpHost: isProduction
      ? env.get("SMTP_HOST").required().asString()
      : env.get("SMTP_HOST").default("localhost").asString(),
    smtpPort: isProduction
      ? env.get("SMTP_PORT").required().asPortNumber()
      : env.get("SMTP_PORT").default("1025").asPortNumber(),
    smtpUser: env.get("SMTP_USER").default("").asString(),
    smtpPassword: env.get("SMTP_PASSWORD").default("").asString(),
    smtpSecure: env.get("SMTP_SECURE").default("false").asBoolStrict(),
    smtpRequireTls: env.get("SMTP_REQUIRE_TLS").default("true").asBoolStrict()
  },
  sender: {
    name: isProduction
      ? env.get("SENDER_NAME").required().asString()
      : env.get("SENDER_NAME").default("Invoice Sender").asString(),
    email: isProduction
      ? env.get("SENDER_EMAIL").required().asString()
      : env.get("SENDER_EMAIL").default("billing@example.com").asString(),
    address: env.get("SENDER_ADDRESS").default("").asString(),
    phone: env.get("SENDER_PHONE").default("").asString()
  }
};
