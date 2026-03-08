import fs from "fs";
import { PromptHistory, PromptVersion } from "../types";
import { promptsDir, promptIndexPath } from "./paths";

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function loadHistory(scheduleName: string): PromptHistory {
  const indexFile = promptIndexPath(scheduleName);
  if (fs.existsSync(indexFile)) {
    return JSON.parse(fs.readFileSync(indexFile, "utf-8"));
  }
  return { scheduleName, nextVersionNumber: 1, versions: [] };
}

function saveHistory(history: PromptHistory): void {
  const dir = promptsDir(history.scheduleName);
  ensureDir(dir);
  fs.writeFileSync(promptIndexPath(history.scheduleName), JSON.stringify(history, null, 2));
}

export function savePromptVersion(scheduleName: string, prompt: string): PromptVersion {
  const history = loadHistory(scheduleName);
  const version: PromptVersion = {
    number: history.nextVersionNumber,
    prompt,
    savedAt: new Date().toISOString(),
  };
  history.versions.push(version);
  history.nextVersionNumber = version.number + 1;
  saveHistory(history);
  return version;
}

export function listPromptVersions(
  scheduleName: string,
  limit = 20,
  offset = 0
): { versions: PromptVersion[]; total: number } {
  const history = loadHistory(scheduleName);
  const sorted = [...history.versions].reverse();
  const total = sorted.length;
  const versions = sorted.slice(offset, offset + limit);
  return { versions, total };
}

export function getPromptVersion(
  scheduleName: string,
  number: number
): PromptVersion | undefined {
  const history = loadHistory(scheduleName);
  return history.versions.find((v) => v.number === number);
}

export function deletePromptHistory(scheduleName: string): void {
  const dir = promptsDir(scheduleName);
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
