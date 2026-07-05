import { loadSchedules } from "../lib/config";
import {
  saveNotionConfig,
  loadNotionConfig,
  pushAllSchedulesToNotion,
  pushAllRunsToNotion,
} from "../lib/notion-sync";

export function notionSetupCommand(opts: {
  token: string;
  scheduleDb: string;
  runHistoryDb: string;
}): void {
  saveNotionConfig({
    token: opts.token,
    scheduleDbId: opts.scheduleDb,
    runHistoryDbId: opts.runHistoryDb,
  });
  console.log("Notion 연결 설정 완료.");
  console.log(`  Schedules DB: ${opts.scheduleDb}`);
  console.log(`  Run History DB: ${opts.runHistoryDb}`);
}

export async function notionInitCommand(opts: { historyOnly?: boolean }): Promise<void> {
  const config = loadNotionConfig();
  if (!config) {
    console.error("Notion이 연결되어 있지 않습니다. notion-setup을 먼저 실행하세요.");
    process.exit(1);
  }

  const schedules = loadSchedules();
  if (schedules.length === 0) {
    console.log("동기화할 스케줄이 없습니다.");
    return;
  }

  if (!opts.historyOnly) {
    console.log(`${schedules.length}개 스케줄을 Notion에 동기화합니다...`);
    const { success, failed } = await pushAllSchedulesToNotion(schedules);
    console.log(`스케줄: ${success}개 성공, ${failed}개 실패`);
  }

  // 실행 히스토리 push
  const names = schedules.map((s) => s.name);
  console.log(`\n실행 히스토리를 Notion에 동기화합니다...`);
  const runs = await pushAllRunsToNotion(names, console.log);
  console.log(`히스토리: ${runs.success}개 성공, ${runs.failed}개 실패`);
}

export function notionStatusCommand(): void {
  const config = loadNotionConfig();
  if (!config) {
    console.log("Notion 연결: 미설정");
    return;
  }
  console.log("Notion 연결: 설정됨");
  console.log(`  Schedules DB: ${config.scheduleDbId}`);
  console.log(`  Run History DB: ${config.runHistoryDbId}`);
}
