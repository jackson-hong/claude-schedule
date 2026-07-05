import { getSchedule, updateSchedule } from "../lib/config";
import { registerSchedule, schedulerUnload, IS_WINDOWS } from "../lib/platform";
import { plistPath } from "../lib/paths";

export function toggleCommand(name: string): void {
  const schedule = getSchedule(name);
  if (!schedule) {
    console.error(`스케줄 "${name}"을(를) 찾을 수 없습니다.`);
    process.exit(1);
  }

  const currentlyEnabled = schedule.enabled !== false;
  const newEnabled = !currentlyEnabled;

  if (newEnabled) {
    // 활성화: 설정 파일 생성 후 OS 스케줄러에 로드
    const updated = updateSchedule(name, { enabled: true });
    registerSchedule(updated);
    console.log(`스케줄 "${name}" 활성화됨`);
  } else {
    // 비활성화: OS 스케줄러에서 언로드
    const configPath = IS_WINDOWS ? "" : plistPath(name);
    schedulerUnload(schedule, configPath);
    updateSchedule(name, { enabled: false });
    console.log(`스케줄 "${name}" 비활성화됨`);
  }
}
