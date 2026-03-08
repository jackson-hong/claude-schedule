import fs from "fs";
import { CONFIG_DIR, SLACK_CONFIG_FILE } from "./paths";
import { regenerateMcpConfig } from "./mcp-config";

export interface SlackConfig {
  webhookUrl: string;
  channelName: string;
}

export function saveSlackConfig(webhookUrl: string, channelName: string): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const config: SlackConfig = { webhookUrl, channelName };
  fs.writeFileSync(SLACK_CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");

  regenerateMcpConfig();
}

export function loadSlackConfig(): SlackConfig | null {
  if (!fs.existsSync(SLACK_CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(SLACK_CONFIG_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function removeSlackConfig(): void {
  if (fs.existsSync(SLACK_CONFIG_FILE)) fs.unlinkSync(SLACK_CONFIG_FILE);
  regenerateMcpConfig();
}

export function isSlackConnected(): boolean {
  return fs.existsSync(SLACK_CONFIG_FILE);
}

export async function testWebhook(
  webhookUrl: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "claude-schedule connected!" }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: body || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
