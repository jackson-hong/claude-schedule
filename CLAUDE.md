# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

macOS `launchd` 기반 Claude Code 스케줄러 CLI 도구. 자연어 한국어(예: "매일 오후 6시 반")를 크론 표현식으로 변환하여 launchd에 등록한다. 웹 대시보드에서 스케줄을 관리한다.

## 빌드 & 실행

```bash
npm run build          # tsc → dist/
npm run dev            # tsc --watch
npm link               # claude-schedule 글로벌 커맨드 등록
```

테스트 프레임워크 및 린터 미설정.

## 아키텍처

**CLI 진입점**: `src/index.ts` — Commander 기반. 서브커맨드: `add`, `list`, `remove`, `logs`, `run`, `toggle`, `ui`, `notion`, 내부 커맨드: `_run-wrapped`.

**스케줄 실행 흐름**:
1. `add` 커맨드: 자연어 → `claude -p --model haiku`로 크론 변환(`lib/parser.ts`) → plist XML 생성(`lib/plist.ts`) → `launchctl load`(`lib/launchctl.ts`)
2. launchd가 스케줄 시간에 `claude-schedule _run-wrapped <name>` 호출
3. `_run-wrapped`(`commands/run-wrapped.ts`): `claude --dangerously-skip-permissions --output-format stream-json` 프로세스 스폰, 스트리밍 JSON 파싱, 포맷된 로그를 빌드 히스토리에 기록
4. 내부 Claude 호출 시 `CLAUDE_SCHEDULE_INTERNAL=1` 환경변수 설정 (재귀 방지용 마커)

**웹 대시보드** (`ui/` 디렉토리):
- `ui/server.ts` — Node.js `http.createServer` 직접 사용 (Express 없음)
- `ui/routes.ts` — REST API 라우팅 + SSE 실시간 스트리밍
- `ui/html.ts` — 단일 파일 HTML/CSS/JS 대시보드 (번들러, 프레임워크 없음)
- `ui/runner.ts` — UI에서 트리거된 실행의 Claude 프로세스 스폰 및 SSE 포워딩

**MCP 연동**: Gmail/Slack MCP 서버(`mcp/gmail-server.ts`, `mcp/slack-server.ts`)가 실행 시 `send_email`, `send_slack_message` 도구 제공. 스케줄별 `useGmail`/`useSlack` 플래그로 활성화. `lib/mcp-config.ts`가 `~/.claude-schedule/mcp.json`을 동적 생성.

**데이터 저장**: 모든 상태는 `~/.claude-schedule/`에 플랫 JSON 파일로 저장. DB 없음. config, Gmail/Slack 자격증명, 빌드 히스토리, 프롬프트 히스토리 각각 별도 JSON.

## 주요 컨벤션

- TypeScript `strict: true`, ES2022 타겟, CommonJS 모듈
- 외부 HTTP 프레임워크 없이 raw `http` 모듈로 라우팅
- 사용자 대면 문자열은 한국어 사용 (CLI 출력, UI 라벨, README)
- launchd plist 접두사: `com.claude-schedule.{name}`
- 실행 트리거 종류: `'ui' | 'launchd' | 'cli'`
- 실행 로그 포맷: `HH:MM:SS [type] message` (type: thinking, text, tool_use, system, error)
- 내부 커맨드는 `_` 접두사 (`_run-wrapped`)
