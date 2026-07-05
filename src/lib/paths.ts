import path from "path";
import os from "os";

const HOME = os.homedir();
const IS_MACOS = process.platform === "darwin";

export const CONFIG_DIR = path.join(HOME, ".claude-schedule");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export const LOGS_DIR = path.join(CONFIG_DIR, "logs");
export const RUNS_DIR = path.join(CONFIG_DIR, "runs");
export const GMAIL_CONFIG_FILE = path.join(CONFIG_DIR, "gmail.json");
export const SLACK_CONFIG_FILE = path.join(CONFIG_DIR, "slack.json");
export const MCP_CONFIG_FILE = path.join(CONFIG_DIR, "mcp.json");
export const PROMPTS_DIR = path.join(CONFIG_DIR, "prompts");
export const NOTION_CONFIG_FILE = path.join(CONFIG_DIR, "notion.json");
export const GROUPS_FILE = path.join(CONFIG_DIR, "groups.json");

// macOS launchd 전용 — 다른 OS에서는 사용되지 않음
export const LAUNCH_AGENTS_DIR = IS_MACOS
  ? path.join(HOME, "Library", "LaunchAgents")
  : path.join(CONFIG_DIR, "agents"); // fallback (사용되지 않음)

export function plistPath(name: string): string {
  return path.join(LAUNCH_AGENTS_DIR, `com.claude-schedule.${name}.plist`);
}

export function logPath(name: string): string {
  return path.join(LOGS_DIR, `${name}.log`);
}

export function runsDir(name: string): string {
  return path.join(RUNS_DIR, name);
}

export function runIndexPath(name: string): string {
  return path.join(RUNS_DIR, name, "index.json");
}

export function runOutputPath(name: string, number: number): string {
  return path.join(RUNS_DIR, name, `${number}.log`);
}

export function promptsDir(name: string): string {
  return path.join(PROMPTS_DIR, name);
}

export function promptIndexPath(name: string): string {
  return path.join(PROMPTS_DIR, name, "index.json");
}
