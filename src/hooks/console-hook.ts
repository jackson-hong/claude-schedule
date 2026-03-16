#!/usr/bin/env node

import fs from "fs";
import { spawn, execSync } from "child_process";
import { CONSOLE_DIR, consoleSessionPath } from "../lib/paths";
import { ConsoleSession, ConsoleEvent } from "../types";

function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
    // timeout 5초 — stdin이 안 오면 종료
    setTimeout(() => resolve(data), 5000);
  });
}

function loadSession(sessionId: string): ConsoleSession | null {
  const filePath = consoleSessionPath(sessionId);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function saveSession(session: ConsoleSession): void {
  if (!fs.existsSync(CONSOLE_DIR)) {
    fs.mkdirSync(CONSOLE_DIR, { recursive: true });
  }
  fs.writeFileSync(consoleSessionPath(session.sessionId), JSON.stringify(session, null, 2), "utf-8");
}

function newSession(event: ConsoleEvent, now: string): ConsoleSession {
  return {
    sessionId: event.session_id,
    cwd: event.cwd,
    model: event.model || null,
    permissionMode: event.permission_mode || null,
    status: "active",
    startedAt: now,
    lastActivityAt: now,
    prompts: [],
    lastAssistantMessage: null,
    endReason: null,
    transcriptPath: event.transcript_path || null,
    title: null,
    summary: null,
  };
}

function findBin(): string {
  try {
    return execSync("which claude-schedule", { encoding: "utf-8" }).trim();
  } catch {
    return "claude-schedule";
  }
}

function spawnSummarize(sessionId: string): void {
  try {
    const bin = findBin();
    const child = spawn(bin, ["_console-summarize", sessionId], {
      stdio: "ignore",
      detached: true,
    });
    child.unref();
  } catch {
    // 실패 시 무시
  }
}

function processEvent(event: ConsoleEvent): void {
  const now = new Date().toISOString();
  let session = loadSession(event.session_id);

  switch (event.hook_event_name) {
    case "SessionStart": {
      if (!session) {
        session = newSession(event, now);
      } else {
        // resume
        session.status = "active";
        session.lastActivityAt = now;
        if (event.model) session.model = event.model;
        if (event.cwd) session.cwd = event.cwd;
        if (event.transcript_path) session.transcriptPath = event.transcript_path;
      }
      break;
    }

    case "UserPromptSubmit": {
      if (!session) {
        session = newSession(event, now);
      }
      session.status = "active";
      session.lastActivityAt = now;
      if (event.transcript_path) session.transcriptPath = event.transcript_path;
      if (event.prompt) {
        session.prompts.push({ prompt: event.prompt, submittedAt: now });
      }
      break;
    }

    case "Stop": {
      if (!session) return;
      session.status = "idle";
      session.lastActivityAt = now;
      if (event.transcript_path) session.transcriptPath = event.transcript_path;
      if (event.last_assistant_message) {
        session.lastAssistantMessage = event.last_assistant_message;
      }
      saveSession(session);

      // 매 Stop마다 백그라운드 요약 실행 (제목/요약 갱신)
      spawnSummarize(session.sessionId);
      return; // saveSession 이미 호출됨
    }

    case "SessionEnd": {
      if (!session) return;
      session.status = "ended";
      session.lastActivityAt = now;
      session.endReason = event.reason || null;
      break;
    }

    default:
      return;
  }

  saveSession(session);
}

export async function consoleHookCommand(): Promise<void> {
  // 내부 호출(요약 등)에서 발생한 hook은 무시 — 무한 루프 방지
  if (process.env.CLAUDE_SCHEDULE_INTERNAL === "1") {
    process.exit(0);
  }

  try {
    const raw = await readStdin();
    if (!raw.trim()) {
      process.exit(0);
    }
    const event: ConsoleEvent = JSON.parse(raw);
    if (!event.session_id || !event.hook_event_name) {
      process.exit(0);
    }
    processEvent(event);
  } catch {
    // hook은 조용히 실패해야 함
  }
  process.exit(0);
}
