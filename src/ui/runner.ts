import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { getSchedule } from "../lib/config";
import { createRun, completeRun, appendRunOutput, updateRunUsage } from "../lib/runs";
import { shouldUseMcpConfig, getMcpConfigPath } from "../lib/mcp-config";

interface LogEntry {
  type: "thinking" | "tool_use" | "tool_result" | "text" | "system" | "error";
  content: string;
  timestamp: string;
  tool?: string;
}

interface RunInfo {
  runId: string;
  name: string;
  runNumber: number;
  process: ChildProcess;
  emitter: EventEmitter;
  output: string[];
  logs: LogEntry[];
  done: boolean;
}

const runs = new Map<string, RunInfo>();
let nextId = 1;

function formatLogLine(entry: LogEntry): string {
  const tag = `[${entry.type}]`.padEnd(15);
  const tool = entry.tool ? ` (${entry.tool})` : "";
  return `${entry.timestamp} ${tag}${tool} ${entry.content}\n`;
}

function parseStreamJson(line: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const ts = new Date().toISOString().slice(11, 19);

  try {
    const obj = JSON.parse(line);

    if (obj.type === "assistant" && obj.message?.content) {
      for (const block of obj.message.content) {
        if (block.type === "thinking" && block.thinking) {
          entries.push({ type: "thinking", content: block.thinking, timestamp: ts });
        } else if (block.type === "text" && block.text) {
          entries.push({ type: "text", content: block.text, timestamp: ts });
        } else if (block.type === "tool_use") {
          const inputStr = JSON.stringify(block.input || {});
          const short = inputStr.length > 200 ? inputStr.slice(0, 200) + "..." : inputStr;
          entries.push({ type: "tool_use", content: short, timestamp: ts, tool: block.name });
        }
      }
    } else if (obj.type === "user") {
      // tool_result comes as user message
      const content = Array.isArray(obj.message?.content) ? obj.message.content : [];
      for (const block of content) {
        if (block.type === "tool_result") {
          const text = typeof block.content === "string"
            ? block.content
            : Array.isArray(block.content)
              ? block.content.map((c: { text?: string }) => c.text || "").join("")
              : JSON.stringify(block.content);
          const short = text.length > 500 ? text.slice(0, 500) + "..." : text;
          entries.push({ type: "tool_result", content: short, timestamp: ts });
        }
      }
    } else if (obj.type === "result") {
      entries.push({ type: "system", content: `Completed (${obj.subtype}, ${obj.duration_ms}ms, $${(obj.total_cost_usd || 0).toFixed(4)})`, timestamp: ts });
    }
  } catch {
    // not valid JSON, ignore
  }

  return entries;
}

export function startRun(name: string): { runId: string; runNumber: number } {
  const schedule = getSchedule(name);
  if (!schedule) {
    throw new Error(`Schedule "${name}" not found.`);
  }

  const runRecord = createRun(name, "ui");
  const runId = `run-${nextId++}-${Date.now()}`;
  const emitter = new EventEmitter();

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
    detached: true,
  });

  const info: RunInfo = {
    runId,
    name,
    runNumber: runRecord.number,
    process: child,
    emitter,
    output: [],
    logs: [],
    done: false,
  };

  runs.set(runId, info);

  let stdoutBuffer = "";
  child.stdout?.on("data", (chunk: Buffer) => {
    stdoutBuffer += chunk.toString();
    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const entries = parseStreamJson(line);
      for (const entry of entries) {
        const formatted = formatLogLine(entry);
        info.output.push(formatted);
        info.logs.push(entry);
        appendRunOutput(name, runRecord.number, formatted);
        emitter.emit("data", formatted);
      }
      // 토큰 사용량 수집
      try {
        const obj = JSON.parse(line);
        if (obj.type === "result") {
          const cost = obj.total_cost_usd || 0;
          const input = obj.usage?.input_tokens || 0;
          const output = obj.usage?.output_tokens || 0;
          if (cost > 0 || input > 0 || output > 0) {
            updateRunUsage(name, runRecord.number, cost, input, output);
          }
        }
      } catch { /* not JSON */ }
    }
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    const entry: LogEntry = { type: "error", content: text.trim(), timestamp: new Date().toISOString().slice(11, 19) };
    const formatted = formatLogLine(entry);
    info.output.push(formatted);
    info.logs.push(entry);
    appendRunOutput(name, runRecord.number, formatted);
    emitter.emit("data", formatted);
  });

  child.on("close", (code) => {
    // Flush remaining buffer
    if (stdoutBuffer.trim()) {
      const entries = parseStreamJson(stdoutBuffer);
      for (const entry of entries) {
        const formatted = formatLogLine(entry);
        info.output.push(formatted);
        info.logs.push(entry);
        appendRunOutput(name, runRecord.number, formatted);
        emitter.emit("data", formatted);
      }
    }
    info.done = true;
    const exitCode = code ?? 1;
    completeRun(name, runRecord.number, exitCode);
    emitter.emit("done", exitCode);
  });

  child.on("error", (err) => {
    info.done = true;
    const entry: LogEntry = { type: "error", content: err.message, timestamp: new Date().toISOString().slice(11, 19) };
    const formatted = formatLogLine(entry);
    appendRunOutput(name, runRecord.number, formatted);
    completeRun(name, runRecord.number, 1);
    emitter.emit("data", formatted);
    emitter.emit("done", 1);
  });

  return { runId, runNumber: runRecord.number };
}

export function getRun(runId: string): RunInfo | undefined {
  return runs.get(runId);
}

export function findActiveRunId(name: string, runNumber: number): string | undefined {
  for (const [runId, info] of runs) {
    if (info.name === name && info.runNumber === runNumber && !info.done) {
      return runId;
    }
  }
  return undefined;
}

export function cancelRun(runId: string): boolean {
  const info = runs.get(runId);
  if (!info || info.done) return false;
  const pid = info.process.pid;
  if (!pid) return false;
  // Kill the entire process group so child processes are also terminated
  if (process.platform === "win32") {
    // Windows: taskkill /T for tree kill
    try {
      require("child_process").execSync(`taskkill /pid ${pid} /T /F`, { stdio: "pipe" });
    } catch { /* already dead */ }
  } else {
    try { process.kill(-pid, "SIGTERM"); } catch { /* already dead */ }
    // Force kill after 3 seconds if still alive
    setTimeout(() => {
      if (!info.done) {
        try { process.kill(-pid, "SIGKILL"); } catch { /* already dead */ }
      }
    }, 3000);
  }
  return true;
}
