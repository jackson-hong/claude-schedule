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

// Console types

export interface ConsolePrompt {
  prompt: string;
  submittedAt: string;
}

export interface ConsoleSession {
  sessionId: string;
  cwd: string;
  model: string | null;
  permissionMode: string | null;
  status: 'active' | 'idle' | 'ended';
  startedAt: string;
  lastActivityAt: string;
  prompts: ConsolePrompt[];
  lastAssistantMessage: string | null;
  endReason: string | null;
  transcriptPath: string | null;
  title: string | null;
  summary: string | null;
}

export interface ConsoleEvent {
  session_id: string;
  hook_event_name: 'SessionStart' | 'UserPromptSubmit' | 'Stop' | 'SessionEnd';
  cwd: string;
  permission_mode?: string;
  transcript_path?: string;
  // SessionStart
  source?: string;
  model?: string;
  // UserPromptSubmit
  prompt?: string;
  // Stop
  last_assistant_message?: string;
  // SessionEnd
  reason?: string;
}
