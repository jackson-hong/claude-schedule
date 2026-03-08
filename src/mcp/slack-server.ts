import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import { SLACK_CONFIG_FILE } from "../lib/paths";

interface SlackConfig {
  webhookUrl: string;
  channelName: string;
}

function loadConfig(): SlackConfig {
  if (!fs.existsSync(SLACK_CONFIG_FILE)) {
    throw new Error("Slack not configured. Set up Slack in the claude-schedule UI first.");
  }
  return JSON.parse(fs.readFileSync(SLACK_CONFIG_FILE, "utf-8"));
}

const config = loadConfig();

const server = new McpServer(
  { name: "slack", version: "1.0.0" },
  {
    instructions: `This server sends Slack messages via Incoming Webhook to channel: ${config.channelName}. Use send_slack_message to deliver messages.`,
  },
);

server.tool(
  "send_slack_message",
  `Send a message to Slack channel "${config.channelName}" via Incoming Webhook.`,
  {
    message: z.string().describe("Message text to send (supports Slack mrkdwn formatting)"),
  },
  async ({ message }) => {
    try {
      const res = await fetch(config.webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message }),
      });

      if (!res.ok) {
        const body = await res.text();
        return {
          content: [
            {
              type: "text" as const,
              text: `Failed to send Slack message: ${body || `HTTP ${res.status}`}`,
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: `Slack message sent successfully to ${config.channelName}.`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to send Slack message: ${(err as Error).message}`,
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
  console.error("Slack MCP server error:", err);
  process.exit(1);
});
