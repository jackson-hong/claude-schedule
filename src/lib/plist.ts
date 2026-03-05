import { execSync } from "child_process";
import fs from "fs";
import { Schedule } from "../types";
import { plistPath, logPath } from "./paths";

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

  const weekdays = expandField(weekday, 0, 6);

  if (weekdays === null) {
    // wildcard weekday — single interval
    const interval = buildInterval(minute, hour, day, month);
    return [interval];
  }

  // specific weekdays — one interval per weekday
  return weekdays.map((wd) => {
    const interval = buildInterval(minute, hour, day, month);
    interval.Weekday = wd;
    return interval;
  });
}

function buildInterval(
  minute: string,
  hour: string,
  day: string,
  month: string
): CalendarInterval {
  const interval: CalendarInterval = {};
  if (minute !== "*") interval.Minute = parseInt(minute, 10);
  if (hour !== "*") interval.Hour = parseInt(hour, 10);
  if (day !== "*") interval.Day = parseInt(day, 10);
  if (month !== "*") interval.Month = parseInt(month, 10);
  return interval;
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

function findClaudeBinary(): string {
  try {
    return execSync("which claude", { encoding: "utf-8" }).trim();
  } catch {
    throw new Error("Could not find 'claude' binary. Make sure Claude CLI is installed.");
  }
}

function findClaudeScheduleBinary(): string {
  try {
    return execSync("which claude-schedule", { encoding: "utf-8" }).trim();
  } catch {
    throw new Error("Could not find 'claude-schedule' binary. Make sure it is installed globally.");
  }
}

function getCurrentPath(): string {
  try {
    return execSync("echo $PATH", { encoding: "utf-8" }).trim();
  } catch {
    return "/usr/local/bin:/usr/bin:/bin";
  }
}

export function generatePlist(schedule: Schedule): string {
  const scheduleBin = findClaudeScheduleBinary();
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

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function writePlist(schedule: Schedule): string {
  const path = plistPath(schedule.name);
  const content = generatePlist(schedule);
  fs.writeFileSync(path, content);
  return path;
}

export function deletePlist(name: string): void {
  const path = plistPath(name);
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}
