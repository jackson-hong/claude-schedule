import fs from "fs";
import path from "path";
import { CONFIG_DIR, MCP_CONFIG_FILE, GMAIL_CONFIG_FILE, SLACK_CONFIG_FILE } from "./paths";
import { Schedule } from "../types";

export function regenerateMcpConfig(): void {
  const mcpServers: Record<string, { command: string; args: string[] }> = {};

  if (fs.existsSync(GMAIL_CONFIG_FILE)) {
    mcpServers.gmail = {
      command: "node",
      args: [path.join(__dirname, "..", "mcp", "gmail-server.js")],
    };
  }

  if (fs.existsSync(SLACK_CONFIG_FILE)) {
    mcpServers.slack = {
      command: "node",
      args: [path.join(__dirname, "..", "mcp", "slack-server.js")],
    };
  }

  if (Object.keys(mcpServers).length === 0) {
    if (fs.existsSync(MCP_CONFIG_FILE)) fs.unlinkSync(MCP_CONFIG_FILE);
    return;
  }

  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  fs.writeFileSync(MCP_CONFIG_FILE, JSON.stringify({ mcpServers }, null, 2), "utf-8");
}

export function shouldUseMcpConfig(schedule: Schedule): boolean {
  return (
    (!!schedule.useGmail && fs.existsSync(GMAIL_CONFIG_FILE)) ||
    (!!schedule.useSlack && fs.existsSync(SLACK_CONFIG_FILE))
  );
}

export function getMcpConfigPath(): string {
  return MCP_CONFIG_FILE;
}
