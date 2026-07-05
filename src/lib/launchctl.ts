import { execSync } from "child_process";
import { IS_WINDOWS } from "./platform";

export function load(plistPath: string): void {
  if (IS_WINDOWS) {
    // Windows에서는 platform.ts의 schedulerLoad를 사용
    return;
  }
  try {
    execSync(`launchctl load "${plistPath}"`, { stdio: "pipe" });
  } catch (err) {
    throw new Error(`Failed to load plist: ${(err as Error).message}`);
  }
}

export function unload(plistPath: string): void {
  if (IS_WINDOWS) {
    // Windows에서는 platform.ts의 schedulerUnload를 사용
    return;
  }
  try {
    execSync(`launchctl unload "${plistPath}"`, { stdio: "pipe" });
  } catch {
    // Ignore errors when unloading (might not be loaded)
  }
}
