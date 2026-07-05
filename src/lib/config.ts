import fs from "fs";
import { CONFIG_DIR, CONFIG_FILE, LOGS_DIR } from "./paths";
import { Schedule } from "../types";

function ensureDirs(): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export function loadSchedules(): Schedule[] {
  ensureDirs();
  if (!fs.existsSync(CONFIG_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
}

export function saveSchedules(schedules: Schedule[]): void {
  ensureDirs();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(schedules, null, 2));
}

export function getSchedule(name: string): Schedule | undefined {
  return loadSchedules().find((s) => s.name === name);
}

export function addSchedule(schedule: Schedule): void {
  const schedules = loadSchedules();
  if (schedules.some((s) => s.name === schedule.name)) {
    throw new Error(`Schedule "${schedule.name}" already exists.`);
  }
  schedules.push(schedule);
  saveSchedules(schedules);
}

export function updateSchedule(name: string, updates: Partial<Schedule>): Schedule {
  const schedules = loadSchedules();
  const idx = schedules.findIndex((s) => s.name === name);
  if (idx === -1) {
    throw new Error(`Schedule "${name}" not found.`);
  }
  schedules[idx] = { ...schedules[idx], ...updates, name };
  saveSchedules(schedules);
  return schedules[idx];
}

export function removeSchedule(name: string): void {
  const schedules = loadSchedules();
  const filtered = schedules.filter((s) => s.name !== name);
  if (filtered.length === schedules.length) {
    throw new Error(`Schedule "${name}" not found.`);
  }
  saveSchedules(filtered);
}

/**
 * 한 그룹 내 스케줄 순서를 names 배열대로 0..N-1로 재할당.
 * 같은 그룹에 속하지만 names에 누락된 스케줄은 뒤에 createdAt 순으로 붙는다.
 * 다른 그룹의 스케줄은 건드리지 않는다.
 */
export function reorderSchedulesInGroup(
  groupId: string | null,
  names: string[]
): void {
  const schedules = loadSchedules();
  const inGroup = schedules.filter(
    (s) => (s.groupId ?? null) === groupId
  );
  const map = new Map(inGroup.map((s) => [s.name, s]));
  const orderedNames: string[] = [];
  for (const n of names) {
    if (map.has(n)) {
      orderedNames.push(n);
      map.delete(n);
    }
  }
  // 누락된 항목은 createdAt 순으로 뒤에 append
  const leftovers = [...map.values()].sort((a, b) =>
    (a.createdAt || "").localeCompare(b.createdAt || "")
  );
  for (const s of leftovers) orderedNames.push(s.name);

  const orderMap = new Map<string, number>();
  orderedNames.forEach((n, i) => orderMap.set(n, i));

  const updated = schedules.map((s) =>
    (s.groupId ?? null) === groupId && orderMap.has(s.name)
      ? { ...s, order: orderMap.get(s.name)! }
      : s
  );
  saveSchedules(updated);
}

/**
 * 그룹 삭제 시 호출 — 해당 그룹의 스케줄들을 groupId=null로 이동.
 */
export function clearGroupAssignments(groupId: string): void {
  const schedules = loadSchedules();
  const updated = schedules.map((s) =>
    s.groupId === groupId ? { ...s, groupId: null } : s
  );
  saveSchedules(updated);
}
