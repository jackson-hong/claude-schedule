import { spawn } from "child_process";
import { getSchedule } from "../lib/config";
import { createRun, completeRun, appendRunOutput } from "../lib/runs";
import { isGmailConnected, getMcpConfigPath } from "../lib/gmail";

function formatStreamLine(line: string): string {
  const ts = new Date().toISOString().slice(11, 19);
  try {
    const obj = JSON.parse(line);
    if (obj.type === "assistant" && obj.message?.content) {
      const parts: string[] = [];
      for (const block of obj.message.content) {
        if (block.type === "thinking" && block.thinking) {
          parts.push(`${ts} [thinking]      ${block.thinking}\n`);
        } else if (block.type === "text" && block.text) {
          parts.push(`${ts} [text]          ${block.text}\n`);
        } else if (block.type === "tool_use") {
          const input = JSON.stringify(block.input || {});
          const short = input.length > 200 ? input.slice(0, 200) + "..." : input;
          parts.push(`${ts} [tool_use]      (${block.name}) ${short}\n`);
        }
      }
      return parts.join("");
    } else if (obj.type === "result") {
      return `${ts} [system]        Completed (${obj.subtype}, ${obj.duration_ms}ms, $${(obj.total_cost_usd || 0).toFixed(4)})\n`;
    }
  } catch {
    // not JSON
  }
  return "";
}

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

  const args = ["--dangerously-skip-permissions", "--output-format", "stream-json", "--verbose"];
  if (schedule.useGmail && isGmailConnected()) {
    args.push("--mcp-config", getMcpConfigPath());
  }
  args.push("-p", schedule.prompt);

  const child = spawn("claude", args, {
    cwd: schedule.workDir,
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let buffer = "";
  child.stdout?.on("data", (chunk: Buffer) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const formatted = formatStreamLine(line);
      if (formatted) {
        process.stdout.write(formatted);
        appendRunOutput(name, record.number, formatted);
      }
    }
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    const ts = new Date().toISOString().slice(11, 19);
    const formatted = `${ts} [error]         ${text.trim()}\n`;
    process.stderr.write(formatted);
    appendRunOutput(name, record.number, formatted);
  });

  child.on("close", (code) => {
    if (buffer.trim()) {
      const formatted = formatStreamLine(buffer);
      if (formatted) {
        process.stdout.write(formatted);
        appendRunOutput(name, record.number, formatted);
      }
    }
    const exitCode = code ?? 1;
    completeRun(name, record.number, exitCode);
    process.exit(exitCode);
  });

  child.on("error", (err) => {
    const ts = new Date().toISOString().slice(11, 19);
    const formatted = `${ts} [error]         ${err.message}\n`;
    process.stderr.write(formatted);
    appendRunOutput(name, record.number, formatted);
    completeRun(name, record.number, 1);
    process.exit(1);
  });
}
