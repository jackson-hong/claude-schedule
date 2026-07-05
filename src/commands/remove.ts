import { getSchedule, removeSchedule } from "../lib/config";
import { unregisterSchedule } from "../lib/platform";

export function removeCommand(name: string): void {
  const schedule = getSchedule(name);
  if (!schedule) {
    console.error(`Schedule "${name}" not found.`);
    process.exit(1);
  }

  try {
    unregisterSchedule(schedule);
    removeSchedule(name);
    console.log(`Schedule "${name}" removed.`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
