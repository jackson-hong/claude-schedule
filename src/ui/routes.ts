import { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import os from "os";
import path from "path";
import { loadSchedules, getSchedule, addSchedule, updateSchedule, removeSchedule, reorderSchedulesInGroup, clearGroupAssignments } from "../lib/config";
import { parseNaturalLanguageToCron } from "../lib/parser";
import { registerSchedule, unregisterSchedule, schedulerUnload, IS_WINDOWS } from "../lib/platform";
import { plistPath, logPath } from "../lib/paths";
import { Schedule } from "../types";
import { startRun, getRun, cancelRun, findActiveRunId } from "./runner";
import { getDashboardHtml } from "./html";
import { listRuns, getRunRecord, getRunOutput, deleteRunHistory } from "../lib/runs";
import { savePromptVersion, listPromptVersions, getPromptVersion, deletePromptHistory } from "../lib/prompt-history";
import { saveGmailConfig, loadGmailConfig, removeGmailConfig, isGmailConnected, testGmailConnection } from "../lib/gmail";
import { saveSlackConfig, loadSlackConfig, removeSlackConfig, isSlackConnected, testWebhook } from "../lib/slack";
import { loadGroups, getGroup, addGroup, renameGroup, deleteGroup, reorderGroups } from "../lib/groups";

function json(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function error(res: ServerResponse, message: string, status = 400): void {
  json(res, { error: message }, status);
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
  });
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const method = req.method || "GET";
  const pathname = url.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    // GET / — Dashboard HTML
    if (method === "GET" && pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(getDashboardHtml());
      return;
    }

    // GET /api/schedules — List all schedules
    if (method === "GET" && pathname === "/api/schedules") {
      json(res, loadSchedules());
      return;
    }

    // POST /api/schedules — Add new schedule
    if (method === "POST" && pathname === "/api/schedules") {
      const body = await parseBody(req);
      const { name, at, prompt, dir, useGmail, useSlack } = body as {
        name: string;
        at: string;
        prompt: string;
        dir?: string;
        useGmail?: boolean;
        useSlack?: boolean;
      };

      if (!name || !at || !prompt) {
        error(res, "Missing required fields: name, at, prompt");
        return;
      }

      const workDir = dir
        ? path.resolve(String(dir).replace(/^~/, os.homedir()))
        : os.homedir();

      const cron = parseNaturalLanguageToCron(String(at));

      const schedule: Schedule = {
        name: String(name),
        prompt: String(prompt),
        at: String(at),
        cron,
        workDir,
        createdAt: new Date().toISOString(),
        useGmail: !!useGmail,
        useSlack: !!useSlack,
      };

      addSchedule(schedule);
      registerSchedule(schedule);

      json(res, schedule, 201);
      return;
    }

    // PUT /api/schedules/reorder — Reorder schedules within a single group (must precede /:name)
    if (method === "PUT" && pathname === "/api/schedules/reorder") {
      const body = await parseBody(req);
      const { groupId, names } = body as { groupId?: string | null; names?: string[] };
      if (!Array.isArray(names)) {
        error(res, "Missing required field: names (string[])");
        return;
      }
      const gid = groupId === undefined || groupId === "" ? null : groupId;
      if (gid !== null && !getGroup(String(gid))) {
        error(res, `Group "${gid}" not found.`, 404);
        return;
      }
      reorderSchedulesInGroup(gid, names.map(String));
      json(res, { ok: true });
      return;
    }

    // PUT /api/schedules/:name — Update schedule
    const putMatch = pathname.match(/^\/api\/schedules\/([^/]+)$/);
    if (method === "PUT" && putMatch) {
      const name = decodeURIComponent(putMatch[1]);
      const existing = getSchedule(name);
      if (!existing) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }

      const body = await parseBody(req);
      const { at, prompt, dir, useGmail, useSlack, groupId } = body as {
        at?: string;
        prompt?: string;
        dir?: string;
        useGmail?: boolean;
        useSlack?: boolean;
        groupId?: string | null;
      };

      const updates: Record<string, unknown> = {};

      if (useGmail !== undefined) updates.useGmail = !!useGmail;
      if (useSlack !== undefined) updates.useSlack = !!useSlack;
      if (prompt !== undefined) {
        if (String(prompt) !== existing.prompt) {
          savePromptVersion(name, existing.prompt);
        }
        updates.prompt = String(prompt);
      }
      if (dir !== undefined) {
        updates.workDir = dir
          ? path.resolve(String(dir).replace(/^~/, os.homedir()))
          : os.homedir();
      }
      if (groupId !== undefined) {
        if (groupId === null || groupId === "") {
          updates.groupId = null;
        } else {
          if (!getGroup(String(groupId))) {
            error(res, `Group "${groupId}" not found.`, 404);
            return;
          }
          updates.groupId = String(groupId);
        }
      }

      const cronChanged = at !== undefined && String(at) !== existing.at;
      if (cronChanged) {
        const cron = parseNaturalLanguageToCron(String(at));
        updates.at = String(at);
        updates.cron = cron;
      }

      // 스케줄러 재등록은 cron이 바뀔 때만 필요. 그 외 메타 변경은 config만 갱신.
      const launchdAffecting =
        cronChanged ||
        updates.workDir !== undefined ||
        updates.useGmail !== undefined ||
        updates.useSlack !== undefined;

      let updated: Schedule;
      if (launchdAffecting) {
        const configPath = IS_WINDOWS ? "" : plistPath(name);
        schedulerUnload(existing, configPath);
        updated = updateSchedule(name, updates);
        registerSchedule(updated);
      } else {
        updated = updateSchedule(name, updates);
      }

      json(res, updated);
      return;
    }

    // POST /api/schedules/:name/toggle — Toggle schedule on/off
    const toggleMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/toggle$/);
    if (method === "POST" && toggleMatch) {
      const name = decodeURIComponent(toggleMatch[1]);
      const existing = getSchedule(name);
      if (!existing) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }

      const currentlyEnabled = existing.enabled !== false;
      const newEnabled = !currentlyEnabled;

      if (newEnabled) {
        const updated = updateSchedule(name, { enabled: true });
        registerSchedule(updated);
        json(res, updated);
      } else {
        const configPath = IS_WINDOWS ? "" : plistPath(name);
        schedulerUnload(existing, configPath);
        const updated = updateSchedule(name, { enabled: false });
        json(res, updated);
      }
      return;
    }

    // DELETE /api/schedules/:name — Remove schedule
    const deleteMatch = pathname.match(/^\/api\/schedules\/([^/]+)$/);
    if (method === "DELETE" && deleteMatch) {
      const name = decodeURIComponent(deleteMatch[1]);
      const schedule = getSchedule(name);
      if (!schedule) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }

      unregisterSchedule(schedule);
      removeSchedule(name);
      deleteRunHistory(name);
      deletePromptHistory(name);
      json(res, { ok: true });
      return;
    }

    // POST /api/schedules/:name/run — Run immediately
    const runMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/run$/);
    if (method === "POST" && runMatch) {
      const name = decodeURIComponent(runMatch[1]);
      const { runId, runNumber } = startRun(name);
      json(res, { runId, runNumber });
      return;
    }

    // POST /api/runs/:runId/cancel — Cancel a running job
    const cancelMatch = pathname.match(/^\/api\/runs\/([^/]+)\/cancel$/);
    if (method === "POST" && cancelMatch) {
      const runId = decodeURIComponent(cancelMatch[1]);
      const cancelled = cancelRun(runId);
      if (!cancelled) {
        error(res, "Run not found or already completed.", 404);
        return;
      }
      json(res, { ok: true });
      return;
    }

    // POST /api/schedules/:name/runs/:number/cancel — Cancel by name and run number
    const cancelByNameMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/runs\/(\d+)\/cancel$/);
    if (method === "POST" && cancelByNameMatch) {
      const name = decodeURIComponent(cancelByNameMatch[1]);
      const number = parseInt(cancelByNameMatch[2], 10);
      const runId = findActiveRunId(name, number);
      if (!runId) {
        error(res, "Run not found or already completed.", 404);
        return;
      }
      cancelRun(runId);
      json(res, { ok: true });
      return;
    }

    // GET /api/schedules/:name/logs — Get logs
    const logsMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/logs$/);
    if (method === "GET" && logsMatch) {
      const name = decodeURIComponent(logsMatch[1]);
      const schedule = getSchedule(name);
      if (!schedule) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }

      const log = logPath(name);
      if (!fs.existsSync(log)) {
        json(res, { logs: "" });
        return;
      }

      const content = fs.readFileSync(log, "utf-8");
      const lines = content.split("\n");
      const last500 = lines.slice(-500).join("\n");
      json(res, { logs: last500 });
      return;
    }

    // POST /api/parse-cron — Preview cron conversion
    if (method === "POST" && pathname === "/api/parse-cron") {
      const body = await parseBody(req);
      const { at } = body as { at: string };
      if (!at) {
        error(res, "Missing required field: at");
        return;
      }

      const cron = parseNaturalLanguageToCron(String(at));
      json(res, { cron });
      return;
    }

    // GET /api/runs/:runId/stream — SSE stream
    const streamMatch = pathname.match(/^\/api\/runs\/([^/]+)\/stream$/);
    if (method === "GET" && streamMatch) {
      const runId = decodeURIComponent(streamMatch[1]);
      const run = getRun(runId);
      if (!run) {
        error(res, `Run "${runId}" not found.`, 404);
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      });

      // Send buffered output
      for (const chunk of run.output) {
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      if (run.done) {
        res.write(`event: done\ndata: {}\n\n`);
        res.end();
        return;
      }

      const onData = (text: string) => {
        res.write(`data: ${JSON.stringify(text)}\n\n`);
      };

      const onDone = (code: number) => {
        res.write(`event: done\ndata: ${JSON.stringify({ code })}\n\n`);
        res.end();
        cleanup();
      };

      const cleanup = () => {
        run.emitter.removeListener("data", onData);
        run.emitter.removeListener("done", onDone);
      };

      run.emitter.on("data", onData);
      run.emitter.on("done", onDone);

      req.on("close", cleanup);
      return;
    }

    // GET /api/schedules/:name/runs — List run history
    const runsListMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/runs$/);
    if (method === "GET" && runsListMatch) {
      const name = decodeURIComponent(runsListMatch[1]);
      const schedule = getSchedule(name);
      if (!schedule) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);
      json(res, listRuns(name, limit, offset));
      return;
    }

    // GET /api/schedules/:name/runs/:number — Single run metadata
    const runDetailMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/runs\/(\d+)$/);
    if (method === "GET" && runDetailMatch) {
      const name = decodeURIComponent(runDetailMatch[1]);
      const number = parseInt(runDetailMatch[2], 10);
      const record = getRunRecord(name, number);
      if (!record) {
        error(res, `Run #${number} not found.`, 404);
        return;
      }
      json(res, record);
      return;
    }

    // GET /api/schedules/:name/runs/:number/output — Run output content
    const runOutputMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/runs\/(\d+)\/output$/);
    if (method === "GET" && runOutputMatch) {
      const name = decodeURIComponent(runOutputMatch[1]);
      const number = parseInt(runOutputMatch[2], 10);
      const output = getRunOutput(name, number);
      if (output === null) {
        error(res, `Output for run #${number} not found.`, 404);
        return;
      }
      json(res, { output });
      return;
    }

    // GET /api/gmail/status — Gmail connection status
    if (method === "GET" && pathname === "/api/gmail/status") {
      const config = loadGmailConfig();
      json(res, {
        connected: isGmailConnected(),
        email: config?.email || null,
      });
      return;
    }

    // POST /api/gmail/connect — Save Gmail credentials and test
    if (method === "POST" && pathname === "/api/gmail/connect") {
      const body = await parseBody(req);
      const { email, appPassword } = body as { email: string; appPassword: string };
      if (!email || !appPassword) {
        error(res, "Missing required fields: email, appPassword");
        return;
      }

      const test = await testGmailConnection(String(email), String(appPassword));
      if (!test.ok) {
        error(res, `SMTP connection failed: ${test.error}`);
        return;
      }

      saveGmailConfig(String(email), String(appPassword));
      json(res, { connected: true, email: String(email) });
      return;
    }

    // DELETE /api/gmail/disconnect — Remove Gmail config
    if (method === "DELETE" && pathname === "/api/gmail/disconnect") {
      removeGmailConfig();
      json(res, { connected: false });
      return;
    }

    // GET /api/slack/status — Slack connection status
    if (method === "GET" && pathname === "/api/slack/status") {
      const config = loadSlackConfig();
      json(res, {
        connected: isSlackConnected(),
        channelName: config?.channelName || null,
      });
      return;
    }

    // POST /api/slack/connect — Save Slack webhook and test
    if (method === "POST" && pathname === "/api/slack/connect") {
      const body = await parseBody(req);
      const { webhookUrl, channelName } = body as { webhookUrl: string; channelName: string };
      if (!webhookUrl) {
        error(res, "Missing required field: webhookUrl");
        return;
      }

      const test = await testWebhook(String(webhookUrl));
      if (!test.ok) {
        error(res, `Webhook test failed: ${test.error}`);
        return;
      }

      saveSlackConfig(String(webhookUrl), String(channelName || "Slack"));
      json(res, { connected: true, channelName: String(channelName || "Slack") });
      return;
    }

    // DELETE /api/slack/disconnect — Remove Slack config
    if (method === "DELETE" && pathname === "/api/slack/disconnect") {
      removeSlackConfig();
      json(res, { connected: false });
      return;
    }

    // GET /api/schedules/:name/prompts — List prompt versions
    const promptsListMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/prompts$/);
    if (method === "GET" && promptsListMatch) {
      const name = decodeURIComponent(promptsListMatch[1]);
      const schedule = getSchedule(name);
      if (!schedule) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }
      const limit = parseInt(url.searchParams.get("limit") || "20", 10);
      const offset = parseInt(url.searchParams.get("offset") || "0", 10);
      json(res, listPromptVersions(name, limit, offset));
      return;
    }

    // POST /api/schedules/:name/prompts/:number/restore — Restore prompt version
    const promptRestoreMatch = pathname.match(/^\/api\/schedules\/([^/]+)\/prompts\/(\d+)\/restore$/);
    if (method === "POST" && promptRestoreMatch) {
      const name = decodeURIComponent(promptRestoreMatch[1]);
      const number = parseInt(promptRestoreMatch[2], 10);
      const schedule = getSchedule(name);
      if (!schedule) {
        error(res, `Schedule "${name}" not found.`, 404);
        return;
      }
      const version = getPromptVersion(name, number);
      if (!version) {
        error(res, `Prompt version #${number} not found.`, 404);
        return;
      }
      // Save current prompt as a version before restoring
      savePromptVersion(name, schedule.prompt);
      // Update schedule with restored prompt
      const configPath = IS_WINDOWS ? "" : plistPath(name);
      schedulerUnload(schedule, configPath);
      const updated = updateSchedule(name, { prompt: version.prompt });
      registerSchedule(updated);
      json(res, updated);
      return;
    }

    // GET /api/dirs?prefix=... — List directories for autocomplete
    if (method === "GET" && pathname === "/api/dirs") {
      const prefix = url.searchParams.get("prefix") || "~/";
      const resolved = prefix.replace(/^~/, os.homedir());

      // Determine the parent directory and partial name to filter
      let dir: string;
      let partial: string;
      if (resolved.endsWith("/")) {
        dir = resolved;
        partial = "";
      } else {
        dir = path.dirname(resolved);
        partial = path.basename(resolved).toLowerCase();
      }

      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const dirs = entries
          .filter((e) => e.isDirectory() && !e.name.startsWith("."))
          .filter((e) => !partial || e.name.toLowerCase().startsWith(partial))
          .slice(0, 20)
          .map((e) => {
            const full = path.join(dir, e.name);
            return full.replace(os.homedir(), "~") + "/";
          });
        json(res, dirs);
      } catch {
        json(res, []);
      }
      return;
    }

    // GET /api/groups — List all groups (order ascending)
    if (method === "GET" && pathname === "/api/groups") {
      const groups = loadGroups().sort((a, b) => a.order - b.order);
      json(res, groups);
      return;
    }

    // POST /api/groups — Create a group
    if (method === "POST" && pathname === "/api/groups") {
      const body = await parseBody(req);
      const { name } = body as { name?: string };
      if (!name || !String(name).trim()) {
        error(res, "Missing required field: name");
        return;
      }
      const group = addGroup(String(name));
      json(res, group, 201);
      return;
    }

    // PUT /api/groups/reorder — Reorder groups (must precede /:id)
    if (method === "PUT" && pathname === "/api/groups/reorder") {
      const body = await parseBody(req);
      const { ids } = body as { ids?: string[] };
      if (!Array.isArray(ids)) {
        error(res, "Missing required field: ids (string[])");
        return;
      }
      const reordered = reorderGroups(ids.map(String));
      json(res, reordered);
      return;
    }

    // PUT /api/groups/:id — Rename group
    const groupRenameMatch = pathname.match(/^\/api\/groups\/([^/]+)$/);
    if (method === "PUT" && groupRenameMatch) {
      const id = decodeURIComponent(groupRenameMatch[1]);
      const body = await parseBody(req);
      const { name } = body as { name?: string };
      if (!name || !String(name).trim()) {
        error(res, "Missing required field: name");
        return;
      }
      const group = renameGroup(id, String(name));
      json(res, group);
      return;
    }

    // DELETE /api/groups/:id — Delete group + reassign schedules to unsorted
    const groupDeleteMatch = pathname.match(/^\/api\/groups\/([^/]+)$/);
    if (method === "DELETE" && groupDeleteMatch) {
      const id = decodeURIComponent(groupDeleteMatch[1]);
      if (!getGroup(id)) {
        error(res, `Group "${id}" not found.`, 404);
        return;
      }
      clearGroupAssignments(id);
      deleteGroup(id);
      json(res, { ok: true });
      return;
    }

    // 404
    error(res, "Not found", 404);
  } catch (err) {
    error(res, (err as Error).message, 500);
  }
}
