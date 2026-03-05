import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import nodemailer from "nodemailer";
import fs from "fs";
import { GMAIL_CONFIG_FILE } from "../lib/paths";

interface GmailConfig {
  email: string;
  appPassword: string;
}

function loadConfig(): GmailConfig {
  if (!fs.existsSync(GMAIL_CONFIG_FILE)) {
    throw new Error("Gmail not configured. Set up Gmail in the claude-schedule UI first.");
  }
  return JSON.parse(fs.readFileSync(GMAIL_CONFIG_FILE, "utf-8"));
}

const config = loadConfig();

const server = new McpServer(
  { name: "gmail", version: "1.0.0" },
  { instructions: `This server sends emails via Gmail SMTP. The sender/user email is: ${config.email}. When the user says "send to me" or "나에게 보내줘", use ${config.email} as the recipient.` },
);

server.tool(
  "send_email",
  `Send an email via Gmail SMTP. Sender email is ${config.email}. If no recipient specified or user says "to me"/"나에게", send to ${config.email}.`,
  {
    to: z.string().optional().describe(`Recipient email address. Defaults to ${config.email} (the user) if not specified.`),
    subject: z.string().describe("Email subject"),
    body: z.string().describe("Plain text email body"),
    html: z.string().optional().describe("Optional HTML email body"),
  },
  async ({ to, subject, body, html }) => {
    const recipient = to || config.email;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: config.email, pass: config.appPassword },
    });

    try {
      const info = await transporter.sendMail({
        from: config.email,
        to: recipient,
        subject,
        text: body,
        html: html || undefined,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Email sent successfully to ${recipient}. Message ID: ${info.messageId}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to send email: ${(err as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Gmail MCP server error:", err);
  process.exit(1);
});
