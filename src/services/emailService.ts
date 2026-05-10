import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { config } from "../config";

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  attachmentPath: string;
};

export async function sendEmail(payload: EmailPayload): Promise<void> {
  await sendWithSmtp(payload);
}

async function sendWithSmtp(payload: EmailPayload): Promise<void> {
  const transportOptions: SMTPTransport.Options = {
    host: config.mail.smtpHost,
    port: config.mail.smtpPort,
    secure: config.mail.smtpSecure,
    requireTLS: config.mail.smtpRequireTls,
    auth: config.mail.smtpUser
      ? {
          user: config.mail.smtpUser,
          pass: config.mail.smtpPassword
        }
      : undefined
  };

  const transport = nodemailer.createTransport(transportOptions);

  await transport.sendMail({
    from: `${config.sender.name} <${config.sender.email}>`,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    attachments: [
      {
        filename: "invoice.pdf",
        path: payload.attachmentPath
      }
    ]
  });
}
