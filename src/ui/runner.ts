import { spawn, ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { getSchedule } from "../lib/config";
import { createRun, completeRun, appendRunOutput } from "../lib/runs";
import { isGmailConnected, getMcpConfigPath } from "../lib/gmail";

interface RunInfo {
  runId: string;
  name: string;
  runNumber: number;
  process: ChildProcess;
  emitter: EventEmitter;
  output: string[];
  done: boolean;
}

const runs = new Map<string, RunInfo>();
let nextId = 1;

export function startRun(name: string): { runId: string; runNumber: number } {
  const schedule = getSchedule(name);
  if (!schedule) {
    throw new Error(`Schedule "${name}" not found.`);
  }

  const runRecord = createRun(name, "ui");
  const runId = `run-${nextId++}-${Date.now()}`;
  const emitter = new EventEmitter();

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

  const info: RunInfo = {
    runId,
    name,
    runNumber: runRecord.number,
    process: child,
    emitter,
    output: [],
    done: false,
  };

  runs.set(runId, info);

  child.stdout?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    info.output.push(text);
    appendRunOutput(name, runRecord.number, text);
    emitter.emit("data", text);
  });

  child.stderr?.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    info.output.push(text);
    appendRunOutput(name, runRecord.number, text);
    emitter.emit("data", text);
  });

  child.on("close", (code) => {
    info.done = true;
    const exitCode = code ?? 1;
    completeRun(name, runRecord.number, exitCode);
    emitter.emit("done", exitCode);
  });

  child.on("error", (err) => {
    info.done = true;
    const errorText = `Error: ${err.message}\n`;
    appendRunOutput(name, runRecord.number, errorText);
    completeRun(name, runRecord.number, 1);
    emitter.emit("data", errorText);
    emitter.emit("done", 1);
  });

  return { runId, runNumber: runRecord.number };
}

export function getRun(runId: string): RunInfo | undefined {
  return runs.get(runId);
}
