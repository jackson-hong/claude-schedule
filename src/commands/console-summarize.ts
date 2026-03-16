import fs from "fs";
import { execSync } from "child_process";
import { consoleSessionPath } from "../lib/paths";
import { ConsoleSession } from "../types";

function buildPromptText(session: ConsoleSession): string {
  // transcript 파일이 있으면 사용, 없으면 저장된 prompts + lastAssistantMessage로 대체
  if (session.transcriptPath && fs.existsSync(session.transcriptPath)) {
    const raw = fs.readFileSync(session.transcriptPath, "utf-8");
    // JSONL에서 user/assistant 메시지만 추출하여 축약
    const lines = raw.split("\n").filter((l) => l.trim());
    const messages: string[] = [];
    let totalLen = 0;
    const MAX_LEN = 8000;

    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === "human" || obj.type === "user") {
          const text = extractText(obj);
          if (text) {
            messages.push(`사용자: ${text}`);
            totalLen += text.length;
          }
        } else if (obj.type === "assistant") {
          const text = extractText(obj);
          if (text) {
            messages.push(`Claude: ${text}`);
            totalLen += text.length;
          }
        }
      } catch {
        // skip
      }
      if (totalLen > MAX_LEN) break;
    }

    if (messages.length > 0) return messages.join("\n\n");
  }

  // fallback: prompts + lastAssistantMessage
  const parts: string[] = [];
  for (const p of session.prompts) {
    parts.push(`사용자: ${p.prompt}`);
  }
  if (session.lastAssistantMessage) {
    const msg = session.lastAssistantMessage.length > 3000
      ? session.lastAssistantMessage.slice(0, 3000) + "..."
      : session.lastAssistantMessage;
    parts.push(`Claude: ${msg}`);
  }
  return parts.join("\n\n");
}

function extractText(obj: Record<string, unknown>): string {
  // message content 추출
  const content = (obj.message as Record<string, unknown>)?.content ?? obj.content;
  if (typeof content === "string") return content.slice(0, 1500);
  if (Array.isArray(content)) {
    const texts: string[] = [];
    for (const block of content) {
      if (typeof block === "string") texts.push(block);
      else if (block.type === "text" && block.text) texts.push(block.text as string);
    }
    return texts.join(" ").slice(0, 1500);
  }
  return "";
}

export function consoleSummarizeCommand(sessionId: string): void {
  const filePath = consoleSessionPath(sessionId);
  if (!fs.existsSync(filePath)) {
    process.exit(0);
  }

  let session: ConsoleSession;
  try {
    session = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    process.exit(0);
  }

  const conversation = buildPromptText(session);
  if (!conversation.trim()) {
    process.exit(0);
  }

  const prompt = `다음은 Claude Code 세션의 대화 내용이다. 이 세션에서 진행 중인 작업을 분석하여 JSON으로만 응답해라. 다른 텍스트 없이 JSON만 출력해라.

형식:
{"title": "이모지 + 10자 내외 한국어 작업 제목", "summary": "한국어 요약 (최대 1000자)"}

summary 작성 규칙:
- 이모지와 개행(\\n)을 적극 활용하여 가독성 높게 작성
- 아래 섹션 구조를 따를 것:
  📋 작업 개요: 한 줄 요약
  🔧 주요 변경사항: 수행한 작업을 항목별로 나열
  📌 현재 상태: 진행 상황 또는 완료 여부

title 예시: "🔧 JWT 버그 수정", "📝 README 업데이트", "🚀 배포 파이프라인 구축"

대화 내용:
${conversation}`;

  try {
    const result = execSync(
      `claude -p --model claude-haiku-4-5-20251001 --output-format json`,
      {
        input: prompt,
        encoding: "utf-8",
        timeout: 30000,
        stdio: ["pipe", "pipe", "pipe"],
        env: { ...process.env, CLAUDE_SCHEDULE_INTERNAL: "1" },
      }
    );

    // claude --output-format json 결과에서 text 추출
    let text = result.trim();
    try {
      const parsed = JSON.parse(text);
      // output-format json 일 때 result 필드에 텍스트가 있을 수 있음
      if (parsed.result) text = parsed.result;
      else if (typeof parsed === "string") text = parsed;
    } catch {
      // 그대로 사용
    }

    // JSON 파싱
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      if (data.title && data.summary) {
        // 세션 파일 다시 읽기 (중간에 다른 이벤트가 업데이트했을 수 있음)
        const fresh: ConsoleSession = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        fresh.title = String(data.title);
        fresh.summary = String(data.summary);
        fs.writeFileSync(filePath, JSON.stringify(fresh, null, 2), "utf-8");
      }
    }
  } catch {
    // 요약 실패 시 조용히 무시
  }

  process.exit(0);
}
