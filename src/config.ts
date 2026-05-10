import dotenv from "dotenv";
import env from "env-var";

dotenv.config();

export const config = {
  port: env.get("PORT").default("3000").asPortNumber(),
  nodeEnv: env.get("NODE_ENV").default("development").asString(),
  db: {
    host: env.get("DB_HOST").required().asString(),
    port: env.get("DB_PORT").default("5432").asPortNumber(),
    user: env.get("DB_USER").required().asString(),
    password: env.get("DB_PASSWORD").required().asString(),
    database: env.get("DB_NAME").required().asString()
  },
  redis: {
    host: env.get("REDIS_HOST").required().asString(),
    port: env.get("REDIS_PORT").default("6379").asPortNumber()
  },
  mail: {
    smtpHost: env.get("SMTP_HOST").default("localhost").asString(),
    smtpPort: env.get("SMTP_PORT").default("1025").asPortNumber(),
    smtpUser: env.get("SMTP_USER").default("").asString(),
    smtpPassword: env.get("SMTP_PASSWORD").default("").asString(),
    smtpSecure: env.get("SMTP_SECURE").default("false").asBoolStrict(),
    smtpRequireTls: env.get("SMTP_REQUIRE_TLS").default("true").asBoolStrict()
  },
  sender: {
    name: env.get("SENDER_NAME").default("Invoice Sender").asString(),
    email: env.get("SENDER_EMAIL").default("billing@example.com").asString(),
    address: env.get("SENDER_ADDRESS").default("").asString(),
    phone: env.get("SENDER_PHONE").default("").asString()
  }
};
