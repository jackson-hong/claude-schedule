import fs from "fs";
import { Group } from "../types";
import { CONFIG_DIR, GROUPS_FILE } from "./paths";

const PALETTE = [
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#d946ef", // fuchsia
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
];

function ensureDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

export function loadGroups(): Group[] {
  ensureDir();
  if (!fs.existsSync(GROUPS_FILE)) return [];
  return JSON.parse(fs.readFileSync(GROUPS_FILE, "utf-8"));
}

export function saveGroups(groups: Group[]): void {
  ensureDir();
  fs.writeFileSync(GROUPS_FILE, JSON.stringify(groups, null, 2));
}

export function getGroup(id: string): Group | undefined {
  return loadGroups().find((g) => g.id === id);
}

function hashName(name: string): number {
  let h = 0;
  for (const c of name) h = ((h * 31 + c.charCodeAt(0)) >>> 0);
  return h;
}

function assignColor(name: string, used: string[]): string {
  const start = hashName(name) % PALETTE.length;
  for (let i = 0; i < PALETTE.length; i++) {
    const candidate = PALETTE[(start + i) % PALETTE.length];
    if (!used.includes(candidate)) return candidate;
  }
  return PALETTE[start];
}

function generateId(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "") || "group";
  const groups = loadGroups();
  let id = `grp_${base}`;
  let n = 2;
  while (groups.some((g) => g.id === id)) {
    id = `grp_${base}_${n++}`;
  }
  return id;
}

export function addGroup(name: string): Group {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("그룹 이름이 비어있습니다.");
  const groups = loadGroups();
  if (groups.some((g) => g.name === trimmed)) {
    throw new Error(`그룹 "${trimmed}"이(가) 이미 존재합니다.`);
  }
  const color = assignColor(trimmed, groups.map((g) => g.color));
  const order = groups.length > 0 ? Math.max(...groups.map((g) => g.order)) + 1 : 0;
  const group: Group = { id: generateId(trimmed), name: trimmed, color, order };
  groups.push(group);
  saveGroups(groups);
  return group;
}

export function renameGroup(id: string, name: string): Group {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("그룹 이름이 비어있습니다.");
  const groups = loadGroups();
  const idx = groups.findIndex((g) => g.id === id);
  if (idx === -1) throw new Error(`그룹 "${id}"를 찾을 수 없습니다.`);
  if (groups.some((g) => g.id !== id && g.name === trimmed)) {
    throw new Error(`그룹 "${trimmed}"이(가) 이미 존재합니다.`);
  }
  groups[idx] = { ...groups[idx], name: trimmed };
  saveGroups(groups);
  return groups[idx];
}

export function deleteGroup(id: string): void {
  const groups = loadGroups().filter((g) => g.id !== id);
  saveGroups(groups);
}

export function reorderGroups(ids: string[]): Group[] {
  const groups = loadGroups();
  const map = new Map(groups.map((g) => [g.id, g]));
  const reordered: Group[] = [];
  ids.forEach((id, i) => {
    const g = map.get(id);
    if (g) {
      reordered.push({ ...g, order: i });
      map.delete(id);
    }
  });
  // 누락된 그룹은 뒤에 붙여서 데이터 손실 방지
  let i = reordered.length;
  for (const g of map.values()) {
    reordered.push({ ...g, order: i++ });
  }
  saveGroups(reordered);
  return reordered;
}
