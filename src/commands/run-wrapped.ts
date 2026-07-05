import { spawn } from "child_process";
import { getSchedule } from "../lib/config";
import { createRun, completeRun, appendRunOutput, updateRunUsage, getRunRecord, getRunOutput } from "../lib/runs";
import { shouldUseMcpConfig, getMcpConfigPath } from "../lib/mcp-config";
import { isNotionConnected, pushRunToNotion } from "../lib/notion-sync";

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

  if (schedule.enabled === false) {
    console.log(`Schedule "${name}" is disabled. Skipping.`);
    process.exit(0);
  }

  const record = createRun(name, "launchd");

  const env: Record<string, string | undefined> = { ...process.env, CLAUDE_SCHEDULE_INTERNAL: "1" };
  delete env.CLAUDECODE;
  delete env.CLAUDE_CODE_ENTRYPOINT;

  const args = ["--dangerously-skip-permissions", "--output-format", "stream-json", "--verbose"];
  if (shouldUseMcpConfig(schedule)) {
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
      // 토큰 사용량 수집
      try {
        const obj = JSON.parse(line);
        if (obj.type === "result") {
          const cost = obj.total_cost_usd || 0;
          const input = obj.usage?.input_tokens || 0;
          const output = obj.usage?.output_tokens || 0;
          if (cost > 0 || input > 0 || output > 0) {
            updateRunUsage(name, record.number, cost, input, output);
          }
        }
      } catch { /* not JSON */ }
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

    // Notion에 실행 결과 push
    if (isNotionConnected()) {
      const finalRecord = getRunRecord(name, record.number);
      const output = getRunOutput(name, record.number);
      if (finalRecord) {
        pushRunToNotion(name, finalRecord, output)
          .then(() => process.exit(exitCode))
          .catch(() => process.exit(exitCode));
        return;
      }
    }
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
