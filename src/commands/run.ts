import { execSync } from "child_process";
import { getSchedule } from "../lib/config";

export function runCommand(name: string): void {
  const schedule = getSchedule(name);
  if (!schedule) {
    console.error(`Schedule "${name}" not found.`);
    process.exit(1);
  }

  console.log(`Running "${name}"...`);
  console.log(`  Prompt: ${schedule.prompt}`);
  console.log(`  Dir: ${schedule.workDir}\n`);

  try {
    execSync(`claude -p "${schedule.prompt.replace(/"/g, '\\"')}"`, {
      cwd: schedule.workDir,
      stdio: "inherit",
    });
  } catch (err) {
    console.error(`\nExecution failed: ${(err as Error).message}`);
    process.exit(1);
  }
}
