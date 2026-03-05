import http from "http";
import { handleRequest } from "./routes";

export function createServer(port: number): http.Server {
  const server = http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      console.error("Unhandled error:", err);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
  });

  server.listen(port, () => {
    console.log(`claude-schedule UI running at http://localhost:${port}`);
  });

  return server;
}
