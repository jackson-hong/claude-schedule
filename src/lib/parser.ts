import { execSync } from "child_process";

const CRON_REGEX = /\b(\S+\s+\S+\s+\S+\s+\S+\s+\S+)\b/;

export function parseNaturalLanguageToCron(input: string): string {
  const prompt = `다음 자연어 스케줄을 크론 표현식으로 변환해. 크론 표현식만 출력해. 다른 설명 없이.\n입력: "${input}"`;

  let output: string;
  try {
    output = execSync(`claude -p --model haiku "${prompt.replace(/"/g, '\\"')}"`, {
      encoding: "utf-8",
      timeout: 30000,
    }).trim();
  } catch (err) {
    throw new Error(`Failed to convert schedule with Claude CLI: ${(err as Error).message}`);
  }

  const match = output.match(CRON_REGEX);
  if (!match) {
    throw new Error(
      `Could not extract cron expression from Claude response.\nResponse: ${output}`
    );
  }

  const cron = match[1];
  validateCronFields(cron);
  return cron;
}

function validateCronFields(cron: string): void {
  const fields = cron.split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Invalid cron expression (expected 5 fields): ${cron}`);
  }
}
