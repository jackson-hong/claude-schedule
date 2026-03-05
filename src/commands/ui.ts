import { exec } from "child_process";
import { createServer } from "../ui/server";

export function uiCommand(options: { port: string }): void {
  const port = parseInt(options.port, 10) || 3274;
  createServer(port);

  // Open browser
  const url = `http://localhost:${port}`;
  exec(`open "${url}"`, (err) => {
    if (err) {
      console.log(`Open ${url} in your browser.`);
    }
  });
}
