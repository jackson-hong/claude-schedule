import { createServer } from "../ui/server";
import { openBrowser } from "../lib/platform";

export function uiCommand(options: { port: string }): void {
  const port = parseInt(options.port, 10) || 3274;
  createServer(port);

  const url = `http://localhost:${port}`;
  try {
    openBrowser(url);
  } catch {
    console.log(`Open ${url} in your browser.`);
  }
}
