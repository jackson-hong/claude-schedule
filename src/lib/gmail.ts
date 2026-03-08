import fs from "fs";
import nodemailer from "nodemailer";
import { CONFIG_DIR, GMAIL_CONFIG_FILE } from "./paths";
import { regenerateMcpConfig } from "./mcp-config";

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

  regenerateMcpConfig();
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
  regenerateMcpConfig();
}

export function isGmailConnected(): boolean {
  return fs.existsSync(GMAIL_CONFIG_FILE);
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
