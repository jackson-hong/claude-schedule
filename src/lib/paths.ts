import path from "path";
import os from "os";

const HOME = os.homedir();

export const CONFIG_DIR = path.join(HOME, ".claude-schedule");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
export const LOGS_DIR = path.join(CONFIG_DIR, "logs");
export const RUNS_DIR = path.join(CONFIG_DIR, "runs");
export const GMAIL_CONFIG_FILE = path.join(CONFIG_DIR, "gmail.json");
export const MCP_CONFIG_FILE = path.join(CONFIG_DIR, "mcp.json");
export const LAUNCH_AGENTS_DIR = path.join(HOME, "Library", "LaunchAgents");

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
