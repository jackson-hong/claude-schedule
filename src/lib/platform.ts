import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { Schedule } from "../types";
import { logPath } from "./paths";

export const IS_WINDOWS = process.platform === "win32";
export const IS_MACOS = process.platform === "darwin";

/**
 * `which` (Unix) / `where` (Windows) 로 바이너리 경로를 찾는다.
 */
export function findBinary(name: string): string {
  const cmd = IS_WINDOWS ? `where ${name}` : `which ${name}`;
  try {
    return execSync(cmd, { encoding: "utf-8" }).trim().split(/\r?\n/)[0];
  } catch {
    throw new Error(`Could not find '${name}' binary. Make sure it is installed.`);
  }
}

/**
 * `which` / `where` 로 바이너리 경로를 찾되, 실패 시 fallback 반환.
 */
export function findBinarySafe(name: string, fallback?: string): string {
  try {
    return findBinary(name);
  } catch {
    return fallback || name;
  }
}

/**
 * 현재 PATH 환경변수 반환
 */
export function getCurrentPath(): string {
  if (IS_WINDOWS) {
    return process.env.PATH || "";
  }
  try {
    return execSync("echo $PATH", { encoding: "utf-8" }).trim();
  } catch {
    return "/usr/local/bin:/usr/bin:/bin";
  }
}

/**
 * 브라우저로 URL 열기
 */
export function openBrowser(url: string): void {
  const { exec } = require("child_process");
  let cmd: string;
  if (IS_MACOS) {
    cmd = `open "${url}"`;
  } else if (IS_WINDOWS) {
    cmd = `start "" "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd, () => {
    // 실패 시 무시 — 호출부에서 fallback 처리
  });
}

/**
 * 터미널에서 명령어 실행 (Console resume 용)
 */
export function openTerminalWithCommand(cwd: string, command: string): void {
  if (IS_MACOS) {
    const tmpFile = path.join(os.tmpdir(), `claude-resume-${Date.now()}.command`);
    const script = `#!/bin/bash\ncd ${JSON.stringify(cwd)} && ${command}\nrm -f ${JSON.stringify(tmpFile)}\n`;
    fs.writeFileSync(tmpFile, script, { mode: 0o755 });
    execSync(`open ${JSON.stringify(tmpFile)}`, { stdio: "ignore" });
  } else if (IS_WINDOWS) {
    const tmpFile = path.join(os.tmpdir(), `claude-resume-${Date.now()}.bat`);
    const script = `@echo off\r\ncd /d ${JSON.stringify(cwd)}\r\n${command}\r\ndel "%~f0"\r\n`;
    fs.writeFileSync(tmpFile, script);
    execSync(`start "" ${JSON.stringify(tmpFile)}`, { stdio: "ignore" });
  } else {
    // Linux: xterm 또는 x-terminal-emulator 시도
    const tmpFile = path.join(os.tmpdir(), `claude-resume-${Date.now()}.sh`);
    const script = `#!/bin/bash\ncd ${JSON.stringify(cwd)} && ${command}\nrm -f ${JSON.stringify(tmpFile)}\n`;
    fs.writeFileSync(tmpFile, script, { mode: 0o755 });
    try {
      execSync(`x-terminal-emulator -e ${JSON.stringify(tmpFile)}`, { stdio: "ignore" });
    } catch {
      execSync(`xterm -e ${JSON.stringify(tmpFile)}`, { stdio: "ignore" });
    }
  }
}

// ─── 스케줄러 추상화 ────────────────────────────────────────────

/**
 * OS 스케줄러에 스케줄 등록
 */
export function schedulerLoad(schedule: Schedule, configPath: string): void {
  if (IS_WINDOWS) {
    windowsTaskCreate(schedule);
  } else {
    // macOS / Linux: launchd plist
    execSync(`launchctl load "${configPath}"`, { stdio: "pipe" });
  }
}

/**
 * OS 스케줄러에서 스케줄 제거
 */
export function schedulerUnload(schedule: Schedule, configPath: string): void {
  if (IS_WINDOWS) {
    windowsTaskDelete(schedule.name);
  } else {
    try {
      execSync(`launchctl unload "${configPath}"`, { stdio: "pipe" });
    } catch {
      // 이미 언로드된 경우 무시
    }
  }
}

/**
 * OS 스케줄러용 설정 파일 작성 (plist 또는 무시)
 * Windows는 schtasks를 직접 사용하므로 파일 불필요.
 * 반환: 생성된 설정 파일 경로 (Windows에서는 빈 문자열)
 */
export function schedulerWriteConfig(schedule: Schedule): string {
  if (IS_WINDOWS) {
    return ""; // Windows는 schtasks로 직접 등록
  }
  // macOS: plist 생성
  const { generatePlistXml, getPlistPath } = require("./plist");
  const plistFilePath = getPlistPath(schedule.name);
  const content = generatePlistXml(schedule);
  fs.writeFileSync(plistFilePath, content);
  return plistFilePath;
}

/**
 * OS 스케줄러 설정 파일 삭제
 */
export function schedulerDeleteConfig(name: string): void {
  if (IS_WINDOWS) {
    // Windows는 schtasks /delete로 처리하므로 파일 삭제 불필요
    return;
  }
  const { getPlistPath } = require("./plist");
  const p = getPlistPath(name);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}

/**
 * 스케줄 등록 (설정 파일 생성 + OS 스케줄러 로드)
 */
export function registerSchedule(schedule: Schedule): string {
  const configPath = schedulerWriteConfig(schedule);
  schedulerLoad(schedule, configPath);
  return configPath;
}

/**
 * 스케줄 해제 (OS 스케줄러 언로드 + 설정 파일 삭제)
 */
export function unregisterSchedule(schedule: Schedule): void {
  if (IS_WINDOWS) {
    windowsTaskDelete(schedule.name);
  } else {
    const { getPlistPath } = require("./plist");
    const configPath = getPlistPath(schedule.name);
    schedulerUnload(schedule, configPath);
    schedulerDeleteConfig(schedule.name);
  }
}

// ─── Windows Task Scheduler 헬퍼 ──────────────────────────────

function cronToSchtasksArgs(schedule: Schedule): string[] {
  const [minute, hour, day, month, weekday] = schedule.cron.split(/\s+/);

  // 매일 실행 (단일 시간)
  if (day === "*" && month === "*" && weekday === "*" && !minute.includes(",") && !hour.includes(",")) {
    const h = hour === "*" ? "0" : hour;
    const m = minute === "*" ? "0" : minute;
    return ["/sc", "daily", "/st", `${h.padStart(2, "0")}:${m.padStart(2, "0")}`];
  }

  // 특정 요일
  if (day === "*" && month === "*" && weekday !== "*") {
    const dayMap: Record<string, string> = {
      "0": "SUN", "1": "MON", "2": "TUE", "3": "WED", "4": "THU", "5": "FRI", "6": "SAT",
    };
    const days = weekday.split(",").map(d => dayMap[d] || d).join(",");
    const h = hour === "*" ? "0" : hour;
    const m = minute === "*" ? "0" : minute;
    return ["/sc", "weekly", "/d", days, "/st", `${h.padStart(2, "0")}:${m.padStart(2, "0")}`];
  }

  // 특정 월/일
  if (day !== "*" && month !== "*") {
    const h = hour === "*" ? "0" : hour;
    const m = minute === "*" ? "0" : minute;
    return ["/sc", "monthly", "/d", day, "/m", getMonthNames(month), "/st", `${h.padStart(2, "0")}:${m.padStart(2, "0")}`];
  }

  // 매일 특정 시간 (fallback)
  const h = hour === "*" ? "0" : hour.split(",")[0];
  const m = minute === "*" ? "0" : minute.split(",")[0];
  return ["/sc", "daily", "/st", `${h.padStart(2, "0")}:${m.padStart(2, "0")}`];
}

function getMonthNames(month: string): string {
  const names: Record<string, string> = {
    "1": "JAN", "2": "FEB", "3": "MAR", "4": "APR", "5": "MAY", "6": "JUN",
    "7": "JUL", "8": "AUG", "9": "SEP", "10": "OCT", "11": "NOV", "12": "DEC",
  };
  return month.split(",").map(m => names[m] || m).join(",");
}

function getWindowsTaskName(name: string): string {
  return `claude-schedule-${name}`;
}

function windowsTaskCreate(schedule: Schedule): void {
  const bin = findBinarySafe("claude-schedule");
  const taskName = getWindowsTaskName(schedule.name);
  const log = logPath(schedule.name);
  const schedArgs = cronToSchtasksArgs(schedule);

  // 기존 작업 삭제 (업데이트 시)
  try {
    execSync(`schtasks /delete /tn "${taskName}" /f`, { stdio: "pipe" });
  } catch { /* 없으면 무시 */ }

  const cmd = [
    "schtasks", "/create",
    "/tn", `"${taskName}"`,
    "/tr", `"${bin} _run-wrapped ${schedule.name}"`,
    ...schedArgs,
    "/f",
  ].join(" ");

  try {
    execSync(cmd, { stdio: "pipe" });
  } catch (err) {
    throw new Error(`Failed to create Windows scheduled task: ${(err as Error).message}`);
  }
}

function windowsTaskDelete(name: string): void {
  const taskName = getWindowsTaskName(name);
  try {
    execSync(`schtasks /delete /tn "${taskName}" /f`, { stdio: "pipe" });
  } catch {
    // 없으면 무시
  }
}
