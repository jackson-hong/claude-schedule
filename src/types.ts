export interface Schedule {
  name: string;
  prompt: string;
  at: string;
  cron: string;
  workDir: string;
  createdAt: string;
  useGmail?: boolean;
  useSlack?: boolean;
}

export interface RunRecord {
  number: number;
  scheduleName: string;
  trigger: 'ui' | 'launchd' | 'cli';
  startedAt: string;
  finishedAt: string | null;
  durationMs: number | null;
  exitCode: number | null;
  status: 'running' | 'success' | 'failure';
  outputFile: string;
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
