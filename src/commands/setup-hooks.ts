import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";

const CLAUDE_SETTINGS_PATH = path.join(os.homedir(), ".claude", "settings.json");

function findClauseScheduleBin(): string {
  try {
    return execSync("which claude-schedule", { encoding: "utf-8" }).trim();
  } catch {
    // fallback: npm global bin 경로 추정
    return "claude-schedule";
  }
}

interface HookEntry {
  matcher: string;
  hooks: { type: string; command: string }[];
}

function makeHookEntry(bin: string): HookEntry {
  return {
    matcher: "",
    hooks: [
      {
        type: "command",
        command: `${bin} _console-hook`,
      },
    ],
  };
}

function isOurHook(entry: HookEntry, bin: string): boolean {
  return entry.hooks?.some(
    (h) => h.type === "command" && h.command.includes("_console-hook")
  ) ?? false;
}

export function setupHooksCommand(options: { port?: string }): void {
  const bin = findClauseScheduleBin();
  const hookEntry = makeHookEntry(bin);
  const events = ["SessionStart", "UserPromptSubmit", "Stop", "SessionEnd"];

  // settings.json 읽기
  let settings: Record<string, unknown> = {};
  if (fs.existsSync(CLAUDE_SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_PATH, "utf-8"));
    } catch {
      console.error("Error: ~/.claude/settings.json 파싱 실패. 수동으로 확인해주세요.");
      process.exit(1);
    }
  }

  // hooks 객체 초기화
  if (!settings.hooks || typeof settings.hooks !== "object") {
    settings.hooks = {};
  }
  const hooks = settings.hooks as Record<string, HookEntry[]>;

  let added = 0;
  let skipped = 0;

  for (const event of events) {
    if (!Array.isArray(hooks[event])) {
      hooks[event] = [];
    }

    // 이미 우리 hook이 있으면 스킵
    const existing = hooks[event].find((e) => isOurHook(e, bin));
    if (existing) {
      skipped++;
      continue;
    }

    hooks[event].push(hookEntry);
    added++;
  }

  // 디렉토리 확인
  const dir = path.dirname(CLAUDE_SETTINGS_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(CLAUDE_SETTINGS_PATH, JSON.stringify(settings, null, 2), "utf-8");

  if (added > 0) {
    console.log(`Hook ${added}개 등록 완료. (${skipped}개 이미 존재)`);
  } else {
    console.log("모든 hook이 이미 등록되어 있습니다.");
  }

  console.log(`\n설정 파일: ${CLAUDE_SETTINGS_PATH}`);
  console.log("\n⚠ Claude Code를 재시작해야 hook이 적용됩니다.");
}
