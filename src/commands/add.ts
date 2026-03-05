import os from "os";
import path from "path";
import readline from "readline";
import { addSchedule } from "../lib/config";
import { parseNaturalLanguageToCron } from "../lib/parser";
import { writePlist } from "../lib/plist";
import { load } from "../lib/launchctl";
import { plistPath } from "../lib/paths";
import { Schedule } from "../types";

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== "n");
    });
  });
}

export async function addCommand(
  name: string,
  options: { at: string; prompt: string; dir?: string }
): Promise<void> {
  const workDir = options.dir
    ? path.resolve(options.dir.replace(/^~/, os.homedir()))
    : os.homedir();

  console.log(`Converting "${options.at}" to cron expression...`);

  let cron: string;
  try {
    cron = parseNaturalLanguageToCron(options.at);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`\n  "${options.at}" → ${cron}`);
  const ok = await confirm(`\nRegister this schedule? (Y/n) `);
  if (!ok) {
    console.log("Cancelled.");
    return;
  }

  const schedule: Schedule = {
    name,
    prompt: options.prompt,
    at: options.at,
    cron,
    workDir,
    createdAt: new Date().toISOString(),
  };

  try {
    addSchedule(schedule);
    const plist = writePlist(schedule);
    load(plist);
    console.log(`\nSchedule "${name}" registered successfully.`);
    console.log(`  Plist: ${plistPath(name)}`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
}
