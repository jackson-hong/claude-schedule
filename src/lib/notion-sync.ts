import fs from "fs";
import { Client } from "@notionhq/client";
import { NOTION_CONFIG_FILE } from "./paths";
import { Schedule, RunRecord } from "../types";
import { listRuns, getRunOutput } from "./runs";

export interface NotionConfig {
  token: string;
  scheduleDbId: string;
  runHistoryDbId: string;
}

// --- Config ---

export function loadNotionConfig(): NotionConfig | null {
  if (!fs.existsSync(NOTION_CONFIG_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(NOTION_CONFIG_FILE, "utf-8"));
  } catch {
    return null;
  }
}

export function saveNotionConfig(config: NotionConfig): void {
  fs.mkdirSync(require("path").dirname(NOTION_CONFIG_FILE), { recursive: true });
  fs.writeFileSync(NOTION_CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function isNotionConnected(): boolean {
  return loadNotionConfig() !== null;
}

function getClient(): { client: Client; config: NotionConfig } | null {
  const config = loadNotionConfig();
  if (!config) return null;
  return { client: new Client({ auth: config.token }), config };
}

// --- Schedule → Notion 매핑 ---

function scheduleToNotionProps(schedule: Schedule): Record<string, unknown> {
  return {
    Name: { title: [{ text: { content: schedule.name } }] },
    Prompt: { rich_text: [{ text: { content: schedule.prompt.slice(0, 2000) } }] },
    Schedule: { rich_text: [{ text: { content: schedule.at } }] },
    Cron: { rich_text: [{ text: { content: schedule.cron } }] },
    "Work Dir": { rich_text: [{ text: { content: schedule.workDir } }] },
    Enabled: { checkbox: schedule.enabled !== false },
    Gmail: { checkbox: !!schedule.useGmail },
    Slack: { checkbox: !!schedule.useSlack },
    Status: { select: { name: "synced" } },
    "Sync ID": { rich_text: [{ text: { content: schedule.name } }] },
    "Last Synced": { date: { start: new Date().toISOString() } },
  };
}

// --- Push Schedules ---

export async function pushScheduleToNotion(schedule: Schedule): Promise<string> {
  const conn = getClient();
  if (!conn) throw new Error("Notion이 연결되어 있지 않습니다. notion-setup을 먼저 실행하세요.");

  const response = await conn.client.pages.create({
    parent: { database_id: conn.config.scheduleDbId },
    properties: scheduleToNotionProps(schedule) as any,
  });

  return response.id;
}

export async function pushAllSchedulesToNotion(schedules: Schedule[]): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const schedule of schedules) {
    try {
      await pushScheduleToNotion(schedule);
      success++;
    } catch (err) {
      console.error(`  ✗ "${schedule.name}": ${(err as Error).message}`);
      failed++;
    }
  }

  return { success, failed };
}

// --- Push Run Result ---

export async function pushRunToNotion(
  scheduleName: string,
  record: RunRecord,
  output: string | null
): Promise<void> {
  const conn = getClient();
  if (!conn) return; // Notion 미연결 시 무시

  // Schedules DB에서 해당 스케줄 페이지 찾기 (search API 사용)
  let schedulePageId: string | undefined;
  try {
    const searchResult = await conn.client.search({
      query: scheduleName,
      filter: { value: "page", property: "object" },
      page_size: 10,
    });
    for (const page of searchResult.results) {
      if (page.object === "page" && "parent" in page) {
        const parent = (page as any).parent;
        if (parent?.database_id === conn.config.scheduleDbId) {
          schedulePageId = page.id;
          break;
        }
      }
    }
  } catch {
    // 검색 실패 시 relation 없이 진행
  }

  const statusMap: Record<string, string> = {
    running: "running",
    success: "success",
    failure: "failure",
    timeout: "timeout",
  };

  const properties: Record<string, unknown> = {
    Title: { title: [{ text: { content: `${scheduleName} #${record.number}` } }] },
    Trigger: { select: { name: record.trigger } },
    Status: { select: { name: statusMap[record.status] || "failure" } },
    "Started At": { date: { start: record.startedAt } },
  };

  if (record.durationMs != null) {
    properties["Duration (s)"] = { number: Math.round(record.durationMs / 1000) };
  }
  if (record.costUsd != null) {
    properties["Cost (USD)"] = { number: record.costUsd };
  }
  if (record.inputTokens != null) {
    properties["Input Tokens"] = { number: record.inputTokens };
  }
  if (record.outputTokens != null) {
    properties["Output Tokens"] = { number: record.outputTokens };
  }
  if (schedulePageId) {
    properties["Schedule"] = { relation: [{ id: schedulePageId }] };
  }

  // 페이지 본문에 실행 로그 추가
  const children: unknown[] = [];
  if (output) {
    // Notion 블록 텍스트 제한: 2000자씩 분할
    const maxLen = 2000;
    const trimmed = output.length > 10000 ? output.slice(-10000) : output;
    for (let i = 0; i < trimmed.length; i += maxLen) {
      children.push({
        object: "block",
        type: "code",
        code: {
          rich_text: [{ text: { content: trimmed.slice(i, i + maxLen) } }],
          language: "plain text",
        },
      });
    }
  }

  await conn.client.pages.create({
    parent: { database_id: conn.config.runHistoryDbId },
    properties: properties as any,
    children: children as any,
  });
}

// --- Push All Run History ---

export async function pushAllRunsToNotion(
  scheduleNames: string[],
  onProgress?: (msg: string) => void
): Promise<{ success: number; failed: number }> {
  const conn = getClient();
  if (!conn) throw new Error("Notion이 연결되어 있지 않습니다.");

  let success = 0;
  let failed = 0;

  for (const name of scheduleNames) {
    const { runs, total } = listRuns(name, 1000, 0);
    if (total === 0) continue;

    onProgress?.(`  ${name}: ${total}개 히스토리 전송 중...`);

    // 오래된 순서로 push (runs는 newest-first이므로 reverse)
    const sorted = [...runs].reverse();
    for (const record of sorted) {
      try {
        const output = getRunOutput(name, record.number);
        await pushRunToNotion(name, record, output);
        success++;
      } catch (err) {
        onProgress?.(`    ✗ ${name} #${record.number}: ${(err as Error).message}`);
        failed++;
      }
      // Rate limit 방지 (3 req/s)
      await new Promise((r) => setTimeout(r, 350));
    }
  }

  return { success, failed };
}
