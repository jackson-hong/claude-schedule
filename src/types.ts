export interface Schedule {
  name: string;
  prompt: string;
  at: string;
  cron: string;
  workDir: string;
  createdAt: string;
  enabled?: boolean;
  useGmail?: boolean;
  useSlack?: boolean;
  groupId?: string | null;
  order?: number;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface RunRecord {
  number: number;
  scheduleName: string;
  trigger: 'ui' | 'launchd' | 'cli';
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  exitCode: number | null;
  status: 'running' | 'success' | 'failure' | 'timeout';
  outputFile: string;
  costUsd: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
}

export interface RunHistory {
  scheduleName: string;
  nextRunNumber: number;
  runs: RunRecord[];
}

export interface PromptVersion {
  number: number;
  prompt: string;
  savedAt: string;
}

export interface PromptHistory {
  scheduleName: string;
  nextVersionNumber: number;
  versions: PromptVersion[];
}
