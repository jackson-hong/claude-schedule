import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import { CONFIG_DIR, GMAIL_CONFIG_FILE, MCP_CONFIG_FILE } from "./paths";

export interface GmailConfig {
  email: string;
  appPassword: string;
}

export function saveGmailConfig(email: string, appPassword: string): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const config: GmailConfig = { email, appPassword };
  fs.writeFileSync(GMAIL_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");

  // Generate mcp.json for claude --mcp-config
  const mcpConfig = {
    mcpServers: {
      gmail: {
        command: "node",
        args: [path.join(__dirname, "..", "mcp", "gmail-server.js")],
      },
    },
  };
  fs.writeFileSync(MCP_CONFIG_FILE, JSON.stringify(mcpConfig, null, 2), "utf-8");
}

export function loadGmailConfig(): GmailConfig | null {
  if (!fs.existsSync(GMAIL_CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(GMAIL_CONFIG_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function removeGmailConfig(): void {
  if (fs.existsSync(GMAIL_CONFIG_FILE)) fs.unlinkSync(GMAIL_CONFIG_FILE);
  if (fs.existsSync(MCP_CONFIG_FILE)) fs.unlinkSync(MCP_CONFIG_FILE);
}

export function isGmailConnected(): boolean {
  return fs.existsSync(GMAIL_CONFIG_FILE) && fs.existsSync(MCP_CONFIG_FILE);
}

export function getMcpConfigPath(): string {
  return MCP_CONFIG_FILE;
}

export async function testGmailConnection(
  email: string,
  appPassword: string
): Promise<{ ok: boolean; error?: string }> {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: email, pass: appPassword },
  });

  try {
    await transporter.verify();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
