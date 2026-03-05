import { loadSchedules } from "../lib/config";

export function listCommand(): void {
  const schedules = loadSchedules();

  if (schedules.length === 0) {
    console.log("No schedules registered.");
    return;
  }

  const nameW = Math.max(4, ...schedules.map((s) => s.name.length));
  const cronW = Math.max(8, ...schedules.map((s) => s.cron.length));
  const atW = Math.max(2, ...schedules.map((s) => s.at.length));
  const promptW = Math.max(6, ...schedules.map((s) => s.prompt.length));

  const header = [
    "NAME".padEnd(nameW),
    "SCHEDULE".padEnd(cronW),
    "AT".padEnd(atW),
    "PROMPT".padEnd(promptW),
    "DIR",
  ].join("  ");

  console.log(header);

  for (const s of schedules) {
    const row = [
      s.name.padEnd(nameW),
      s.cron.padEnd(cronW),
      s.at.padEnd(atW),
      s.prompt.padEnd(promptW),
      s.workDir.replace(process.env.HOME || "", "~"),
    ].join("  ");
    console.log(row);
  }
}
