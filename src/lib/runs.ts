import fs from "fs";
import { RunHistory, RunRecord } from "../types";
import { runsDir, runIndexPath, runOutputPath } from "./paths";

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadHistory(scheduleName: string): RunHistory {
  const indexFile = runIndexPath(scheduleName);
  if (fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile, "utf-8"));
  }
  return { scheduleName, nextRunNumber: 1, runs: [] };
}

function saveHistory(history: RunHistory): void {
  const dir = runsDir(history.scheduleName);
  ensureDir(dir);
  fs.writeFileSync(runIndexPath(history.scheduleName), JSON.stringify(history, null, 2));
}

export function createRun(
  scheduleName: string,
  trigger: "ui" | "launchd" | "cli"
): RunRecord {
  const history = loadHistory(scheduleName);
  const number = history.nextRunNumber;
  const outputFile = runOutputPath(scheduleName, number);

  const record: RunRecord = {
    number,
    scheduleName,
    trigger,
    startedAt: new Date().toISOString(),
    finishedAt: null,
    durationMs: null,
    exitCode: null,
    status: "running",
    outputFile,
    costUsd: null,
    inputTokens: null,
    outputTokens: null,
  };

  history.runs.push(record);
  history.nextRunNumber = number + 1;
  saveHistory(history);

  // Create empty output file
  ensureDir(runsDir(scheduleName));
  fs.writeFileSync(outputFile, "");

  return record;
}

export function completeRun(
  scheduleName: string,
  number: number,
  exitCode: number
): void {
  const history = loadHistory(scheduleName);
  const record = history.runs.find((r) => r.number === number);
  if (!record) return;

  record.finishedAt = new Date().toISOString();
  record.exitCode = exitCode;
  record.status = exitCode === 0 ? "success" : "failure";
  record.durationMs =
    new Date(record.finishedAt).getTime() -
    new Date(record.startedAt).getTime();

  saveHistory(history);
}

export function updateRunUsage(
  scheduleName: string,
  number: number,
  costUsd: number,
  inputTokens: number,
  outputTokens: number
): void {
  const history = loadHistory(scheduleName);
  const record = history.runs.find((r) => r.number === number);
  if (!record) return;

  record.costUsd = (record.costUsd || 0) + costUsd;
  record.inputTokens = (record.inputTokens || 0) + inputTokens;
  record.outputTokens = (record.outputTokens || 0) + outputTokens;
  saveHistory(history);
}

export function appendRunOutput(
  scheduleName: string,
  number: number,
  text: string
): void {
  const outputFile = runOutputPath(scheduleName, number);
  fs.appendFileSync(outputFile, text);
}

export function listRuns(
  scheduleName: string,
  limit = 20,
  offset = 0
): { runs: RunRecord[]; total: number } {
  const history = loadHistory(scheduleName);
  // Return newest first
  const sorted = [...history.runs].reverse();
  const total = sorted.length;
  const runs = sorted.slice(offset, offset + limit);
  return { runs, total };
}

export function getRunRecord(
  scheduleName: string,
  number: number
): RunRecord | undefined {
  const history = loadHistory(scheduleName);
  return history.runs.find((r) => r.number === number);
}

export function getRunOutput(
  scheduleName: string,
  number: number
): string | null {
  const outputFile = runOutputPath(scheduleName, number);
  if (!fs.existsSync(outputFile)) return null;
  return fs.readFileSync(outputFile, "utf-8");
}

export function deleteRunHistory(scheduleName: string): void {
  const dir = runsDir(scheduleName);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
