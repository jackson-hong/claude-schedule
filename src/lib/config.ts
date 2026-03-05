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
