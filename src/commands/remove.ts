import { getSchedule, removeSchedule } from "../lib/config";
import { unload } from "../lib/launchctl";
import { deletePlist } from "../lib/plist";
import { plistPath } from "../lib/paths";

export function removeCommand(name: string): void {
  const schedule = getSchedule(name);
  if (!schedule) {
    console.error(`Schedule "${name}" not found.`);
    process.exit(1);
  }

  try {
    unload(plistPath(name));
    deletePlist(name);
    removeSchedule(name);
    console.log(`Schedule "${name}" removed.`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
