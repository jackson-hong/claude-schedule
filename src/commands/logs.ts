import fs from "fs";
import { execSync, spawn } from "child_process";
import { getSchedule } from "../lib/config";
import { logPath } from "../lib/paths";

export function logsCommand(name: string, options: { tail?: boolean }): void {
  const schedule = getSchedule(name);
  if (!schedule) {
    console.error(`Schedule "${name}" not found.`);
    process.exit(1);
  }

  const log = logPath(name);
  if (!fs.existsSync(log)) {
    console.log("No logs yet.");
    return;
  }

  if (options.tail) {
    const child = spawn("tail", ["-f", log], { stdio: "inherit" });
    child.on("error", (err) => {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    });
  } else {
    const content = fs.readFileSync(log, "utf-8");
    console.log(content);
  }
}
