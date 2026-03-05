import { spawn } from "child_process";
import { getSchedule } from "../lib/config";
import { createRun, completeRun, appendRunOutput } from "../lib/runs";
import { isGmailConnected, getMcpConfigPath } from "../lib/gmail";

export function runWrappedCommand(name: string): void {
  const schedule = getSchedule(name);
  if (!schedule) {
    console.error(`Schedule "${name}" not found.`);
    process.exit(1);
  }

  const record = createRun(name, "launchd");

  const env = { ...process.env };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;

  const args = ["--dangerously-skip-permissions"];
  if (schedule.useGmail && isGmailConnected()) {
    args.push("--mcp-config", getMcpConfigPath());
  }
  args.push("-p", schedule.prompt);

  const child = spawn("claude", args, {
    cwd: schedule.workDir,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    process.stdout.write(text);
    appendRunOutput(name, record.number, text);
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    process.stderr.write(text);
    appendRunOutput(name, record.number, text);
  });

  child.on("close", (code) => {
    const exitCode = code ?? 1;
    completeRun(name, record.number, exitCode);
    process.exit(exitCode);
  });

  child.on("error", (err) => {
    const errorText = `Error: ${err.message}\n`;
    process.stderr.write(errorText);
    appendRunOutput(name, record.number, errorText);
    completeRun(name, record.number, 1);
    process.exit(1);
  });
}
