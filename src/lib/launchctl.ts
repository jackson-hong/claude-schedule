import { execSync } from "child_process";

export function load(plistPath: string): void {
  try {
    execSync(`launchctl load "${plistPath}"`, { stdio: "pipe" });
  } catch (err) {
    throw new Error(`Failed to load plist: ${(err as Error).message}`);
  }
}

export function unload(plistPath: string): void {
  try {
    execSync(`launchctl unload "${plistPath}"`, { stdio: "pipe" });
  } catch {
    // Ignore errors when unloading (might not be loaded)
  }
}
