import fs from "fs";
import { Schedule } from "../types";
import { plistPath, logPath } from "./paths";
import { findBinary, getCurrentPath } from "./platform";

interface CalendarInterval {
  Minute?: number;
  Hour?: number;
  Day?: number;
  Month?: number;
  Weekday?: number;
}

export function cronToCalendarIntervals(cron: string): CalendarInterval[] {
  const [minute, hour, day, month, weekday] = cron.split(/\s+/);

  // Reject unsupported patterns
  for (const field of [minute, hour, day, month, weekday]) {
    if (field.includes("/")) {
      throw new Error(
        `Unsupported cron pattern "${cron}": step values (/) are not supported by launchd.\n` +
          `Consider using a simpler schedule.`
      );
    }
  }

  // 모든 필드를 확장하여 조합 생성
  const minutes = expandField(minute, 0, 59);
  const hours = expandField(hour, 0, 23);
  const days = expandField(day, 1, 31);
  const months = expandField(month, 1, 12);
  const weekdays = expandField(weekday, 0, 6);

  // 각 필드의 모든 조합으로 interval 생성
  const intervals: CalendarInterval[] = [];
  const minuteList = minutes || [null];
  const hourList = hours || [null];
  const dayList = days || [null];
  const monthList = months || [null];
  const weekdayList = weekdays || [null];

  for (const mo of monthList) {
    for (const d of dayList) {
      for (const wd of weekdayList) {
        for (const h of hourList) {
          for (const m of minuteList) {
            const interval: CalendarInterval = {};
            if (m !== null) interval.Minute = m;
            if (h !== null) interval.Hour = h;
            if (d !== null) interval.Day = d;
            if (mo !== null) interval.Month = mo;
            if (wd !== null) interval.Weekday = wd;
            intervals.push(interval);
          }
        }
      }
    }
  }

  return intervals;
}

function expandField(field: string, min: number, max: number): number[] | null {
  if (field === "*") return null;

  const values: number[] = [];
  for (const part of field.split(",")) {
    const rangeMatch = part.match(/^(\d+)-(\d+)$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      for (let i = start; i <= end; i++) {
        values.push(i);
      }
    } else {
      values.push(parseInt(part, 10));
    }
  }
  return values;
}

function calendarIntervalsToXml(intervals: CalendarInterval[]): string {
  if (intervals.length === 1) {
    return `    <key>StartCalendarInterval</key>\n    <dict>\n${dictEntries(intervals[0])}    </dict>`;
  }

  const items = intervals
    .map((iv) => `      <dict>\n${dictEntries(iv, "        ")}      </dict>`)
    .join("\n");
  return `    <key>StartCalendarInterval</key>\n    <array>\n${items}\n    </array>`;
}

function dictEntries(iv: CalendarInterval, indent = "      "): string {
  const lines: string[] = [];
  for (const [key, val] of Object.entries(iv)) {
    if (val !== undefined) {
      lines.push(`${indent}<key>${key}</key>`);
      lines.push(`${indent}<integer>${val}</integer>`);
    }
  }
  return lines.join("\n") + "\n";
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** plist 파일 경로 반환 (platform.ts에서 사용) */
export function getPlistPath(name: string): string {
  return plistPath(name);
}

/** macOS plist XML 생성 (platform.ts에서 사용) */
export function generatePlistXml(schedule: Schedule): string {
  const scheduleBin = findBinary("claude-schedule");
  const label = `com.claude-schedule.${schedule.name}`;
  const log = logPath(schedule.name);
  const envPath = getCurrentPath();
  const calendarXml = calendarIntervalsToXml(cronToCalendarIntervals(schedule.cron));

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${label}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${scheduleBin}</string>
        <string>_run-wrapped</string>
        <string>${escapeXml(schedule.name)}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${schedule.workDir}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>${envPath}</string>
    </dict>
${calendarXml}
    <key>StandardOutPath</key>
    <string>${log}</string>
    <key>StandardErrorPath</key>
    <string>${log}</string>
</dict>
</plist>
`;
}

/** 기존 호환 — plist 생성 + 파일 저장 */
export function generatePlist(schedule: Schedule): string {
  return generatePlistXml(schedule);
}

export function writePlist(schedule: Schedule): string {
  const p = plistPath(schedule.name);
  const content = generatePlistXml(schedule);
  fs.writeFileSync(p, content);
  return p;
}

export function deletePlist(name: string): void {
  const p = plistPath(name);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}
