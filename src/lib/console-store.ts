import fs from "fs";
import path from "path";
import { EventEmitter } from "events";
import { CONSOLE_DIR, consoleSessionPath } from "./paths";
import { ConsoleSession } from "../types";

const emitter = new EventEmitter();
let watcher: fs.FSWatcher | null = null;
const STALE_TIMEOUT_MS = 30 * 60 * 1000; // 30분

function ensureDir(): void {
  if (!fs.existsSync(CONSOLE_DIR)) {
    fs.mkdirSync(CONSOLE_DIR, { recursive: true });
  }
}

export function getAllSessions(): ConsoleSession[] {
  ensureDir();
  const files = fs.readdirSync(CONSOLE_DIR).filter((f) => f.endsWith(".json"));
  const sessions: ConsoleSession[] = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(path.join(CONSOLE_DIR, file), "utf-8");
      sessions.push(JSON.parse(raw));
    } catch {
      // 파손된 파일 무시
    }
  }

  // 30분 무활동 idle 세션 → ended 처리
  const now = Date.now();
  for (const s of sessions) {
    if (
      s.status !== "ended" &&
      now - new Date(s.lastActivityAt).getTime() > STALE_TIMEOUT_MS
    ) {
      s.status = "ended";
      s.endReason = "stale";
      try {
        fs.writeFileSync(consoleSessionPath(s.sessionId), JSON.stringify(s, null, 2), "utf-8");
      } catch { /* ignore */ }
    }
  }

  // 최근 활동 순 정렬
  sessions.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
  return sessions;
}

export function getSession(sessionId: string): ConsoleSession | null {
  const filePath = consoleSessionPath(sessionId);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export function clearSessions(): void {
  ensureDir();
  const files = fs.readdirSync(CONSOLE_DIR).filter((f) => f.endsWith(".json"));
  for (const file of files) {
    try {
      fs.unlinkSync(path.join(CONSOLE_DIR, file));
    } catch { /* ignore */ }
  }
}

export function onUpdate(callback: (session: ConsoleSession) => void): () => void {
  emitter.on("update", callback);
  return () => emitter.off("update", callback);
}

export function startWatching(): void {
  if (watcher) return;
  ensureDir();

  watcher = fs.watch(CONSOLE_DIR, (eventType, filename) => {
    if (!filename || !filename.endsWith(".json")) return;
    const sessionId = filename.replace(".json", "");
    const session = getSession(sessionId);
    if (session) {
      emitter.emit("update", session);
    }
  });

  watcher.on("error", () => {
    // watcher 에러 시 무시
  });
}

export function stopWatching(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}
