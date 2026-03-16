# claude-schedule

macOS `launchd` 기반으로 Claude Code를 자동 실행하는 스케줄러. 자연어로 시간을 입력하면 크론 표현식으로 변환해 등록한다.

웹 대시보드(UI)와 CLI 모두 지원하며, Gmail/Slack 연동으로 실행 결과를 받을 수 있다.

## 주요 기능

- **자연어 스케줄링** — "매일 오후 6시 반", "평일 오전 9시" 같은 표현을 크론으로 자동 변환
- **웹 대시보드** — 스케줄 CRUD, 즉시 실행, 빌드 히스토리 조회
- **Claude Console** — Claude Code Hook 기반 실시간 세션 모니터링, AI 자동 요약/제목 생성, 터미널 Resume
- **빌드 히스토리** — Jenkins 스타일 실행 이력 (실시간 상태, 출력 로그, SSE 스트리밍)
- **Gmail 연동** — App Password 기반 SMTP MCP 서버로 Claude가 이메일 전송 가능
- **Slack 연동** — Webhook 기반 MCP 서버로 Claude가 Slack 메시지 전송 가능
- **macOS launchd** — 맥을 닫아도 스케줄이 실행됨 (cron 대신 launchd 사용)

## 설치

### 사전 요구사항

- macOS
- Node.js 18+
- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) 설치 및 인증 완료

```bash
git clone https://github.com/jackson-hong/claude-schedule.git
cd claude-schedule
npm install
npm run build
npm link
```

## 사용법

### CLI

#### 스케줄 추가

`--at`에 자연어로 시간을 입력하면 Claude가 크론 표현식으로 변환한다.

```bash
claude-schedule add daily-report \
  --at "매일 오후 6시 반" \
  --prompt "/daily-report \$(date +%Y-%m-%d)"

claude-schedule add pr-review \
  --at "평일 오전 9시" \
  --prompt "어제 올라온 PR 리뷰해줘" \
  --dir ~/my-project
```

| 옵션 | 설명 | 필수 |
|------|------|------|
| `--at <시간>` | 자연어 스케줄 (예: "매일 오후 6시 반") | O |
| `--prompt <프롬프트>` | Claude에 전달할 프롬프트 | O |
| `--dir <경로>` | 작업 디렉토리 (기본: `~/`) | X |

#### 스케줄 목록

```bash
claude-schedule list
```

#### 스케줄 삭제

```bash
claude-schedule remove daily-report
```

#### 로그 확인

```bash
claude-schedule logs daily-report
claude-schedule logs daily-report --tail   # 실시간
```

#### 즉시 실행

```bash
claude-schedule run daily-report
```

### 웹 대시보드

```bash
claude-schedule ui                # http://localhost:3274
claude-schedule ui --port 8080    # 포트 지정
```

대시보드에서 할 수 있는 것:

- 스케줄 추가 / 수정 / 삭제
- 즉시 실행 (Run 버튼)
- 빌드 히스토리 조회 (실행 상태, 소요 시간, 출력 로그)
- 프롬프트 인라인 수정
- Gmail / Slack 연결 / 해제
- **Claude Console** — 실시간 세션 모니터링

### Claude Console

Claude Code의 Hook 시스템을 활용하여 현재 실행 중인 모든 Claude Code 세션을 실시간으로 모니터링한다.

#### 설정

```bash
claude-schedule setup-hooks   # ~/.claude/settings.json에 hook 자동 등록
# Claude Code 재시작 필요 (hook은 세션 시작 시 스냅샷)
```

#### 기능

- **실시간 세션 목록** — 활성/대기/종료 상태별 그룹 테이블 (SSE 실시간 업데이트)
- **AI 자동 요약** — 매 응답 완료 시 Claude Haiku로 제목/요약 자동 생성
- **세션 상세** — 프롬프트 히스토리, 마지막 응답, 요약 확인
- **Resume in Terminal** — 기본 터미널 앱에서 세션 이어가기
- **세션 숨기기** — x 버튼으로 불필요한 세션 비노출
- **종료 그룹 접기** — 종료 세션은 기본 접힌 상태

#### 동작 원리

1. `setup-hooks`가 `~/.claude/settings.json`에 4개 hook 등록 (SessionStart, UserPromptSubmit, Stop, SessionEnd)
2. Hook은 `type: "command"`로 `claude-schedule _console-hook` 실행
3. Hook이 stdin으로 이벤트 JSON 수신 → `~/.claude-schedule/console/{session_id}.json` 파일 생성/업데이트
4. 매 Stop 이벤트 시 백그라운드에서 `claude-schedule _console-summarize` 실행 → 제목/요약 생성
5. 대시보드가 `fs.watch`로 파일 변경 감지 → SSE로 클라이언트에 실시간 전달
6. 내부 Claude 호출은 `CLAUDE_SCHEDULE_INTERNAL=1` 환경변수로 hook 무한 루프 방지

### Gmail 연동

스케줄 실행 중 Claude가 이메일을 보낼 수 있도록 Gmail SMTP를 연동한다.

**설정 방법:**

1. Google 계정 → [앱 비밀번호](https://myaccount.google.com/apppasswords) 생성
2. 대시보드 헤더의 **Connect Gmail** 클릭
3. 이메일 주소 + 앱 비밀번호 입력 → SMTP 연결 테스트 후 저장
4. 스케줄 생성/수정 시 **Enable Gmail** 체크

Gmail이 활성화된 스케줄은 실행 시 `--mcp-config` 플래그로 `send_email` MCP 도구가 Claude에 제공된다.

## 동작 원리

1. `--at`으로 입력된 자연어를 `claude -p --model haiku`로 크론 표현식 변환
2. 크론 표현식을 launchd `StartCalendarInterval` 형식으로 변환
3. `~/Library/LaunchAgents/com.claude-schedule.{name}.plist` 생성
4. `launchctl load`로 등록
5. 스케줄 시간이 되면 `claude-schedule _run-wrapped <name>` 실행
6. 실행 결과를 빌드 히스토리에 기록 (상태, 소요 시간, 출력 로그)

## 데이터 구조

```
~/.claude-schedule/
├── config.json          # 등록된 스케줄 목록
├── gmail.json           # Gmail SMTP 자격증명
├── slack.json           # Slack Webhook 자격증명
├── mcp.json             # MCP 서버 설정
├── logs/                # launchd 실행 로그
│   └── {name}.log
├── runs/                # 빌드 히스토리
│   └── {name}/
│       ├── index.json   # 실행 이력 메타데이터
│       ├── 1.log        # #1 실행 출력
│       └── 2.log        # #2 실행 출력
├── prompts/             # 프롬프트 히스토리
│   └── {name}/
│       └── index.json
└── console/             # Claude Console 세션 데이터
    └── {session_id}.json

~/Library/LaunchAgents/
└── com.claude-schedule.{name}.plist
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/schedules` | 스케줄 목록 |
| POST | `/api/schedules` | 스케줄 추가 |
| PUT | `/api/schedules/:name` | 스케줄 수정 |
| DELETE | `/api/schedules/:name` | 스케줄 삭제 |
| POST | `/api/schedules/:name/run` | 즉시 실행 |
| GET | `/api/schedules/:name/logs` | launchd 로그 |
| GET | `/api/schedules/:name/runs` | 빌드 히스토리 |
| GET | `/api/schedules/:name/runs/:number` | 실행 상세 |
| GET | `/api/schedules/:name/runs/:number/output` | 실행 출력 |
| GET | `/api/runs/:runId/stream` | SSE 실시간 스트리밍 |
| POST | `/api/parse-cron` | 크론 변환 미리보기 |
| GET | `/api/gmail/status` | Gmail 연결 상태 |
| POST | `/api/gmail/connect` | Gmail 연결 |
| DELETE | `/api/gmail/disconnect` | Gmail 해제 |
| GET | `/api/slack/status` | Slack 연결 상태 |
| POST | `/api/slack/connect` | Slack 연결 |
| DELETE | `/api/slack/disconnect` | Slack 해제 |
| GET | `/api/console/sessions` | 콘솔 세션 목록 |
| GET | `/api/console/sessions/:id` | 세션 상세 |
| DELETE | `/api/console/sessions` | 세션 데이터 초기화 |
| POST | `/api/console/sessions/:id/summarize` | 세션 요약 생성 |
| POST | `/api/console/sessions/:id/resume` | 터미널에서 세션 Resume |
| GET | `/api/console/stream` | 콘솔 SSE 실시간 스트리밍 |

## 프로젝트 구조

```
src/
├── index.ts                  # CLI 진입점 (commander)
├── types.ts                  # 공통 타입
├── commands/
│   ├── add.ts                # 스케줄 추가
│   ├── list.ts               # 스케줄 목록
│   ├── remove.ts             # 스케줄 삭제
│   ├── logs.ts               # 로그 확인
│   ├── run.ts                # 즉시 실행
│   ├── run-wrapped.ts        # launchd 실행 래퍼
│   ├── ui.ts                 # 웹 대시보드 시작
│   ├── setup-hooks.ts        # Claude Code hook 설정
│   └── console-summarize.ts  # 세션 요약 생성
├── hooks/
│   └── console-hook.ts       # Claude Code hook 이벤트 수신
├── lib/
│   ├── paths.ts              # 경로 상수
│   ├── config.ts             # 스케줄 설정 CRUD
│   ├── parser.ts             # 자연어 → 크론 변환
│   ├── plist.ts              # plist XML 생성
│   ├── launchctl.ts          # launchctl load/unload
│   ├── runs.ts               # 빌드 히스토리 관리
│   ├── console-store.ts      # 콘솔 세션 스토어 (fs.watch + EventEmitter)
│   ├── gmail.ts              # Gmail 설정 CRUD + SMTP 테스트
│   ├── slack.ts              # Slack 설정 CRUD + Webhook 테스트
│   ├── mcp-config.ts         # MCP 설정 생성
│   └── prompt-history.ts     # 프롬프트 버전 관리
├── mcp/
│   ├── gmail-server.ts       # Gmail MCP 서버 (send_email)
│   └── slack-server.ts       # Slack MCP 서버 (send_slack_message)
└── ui/
    ├── server.ts             # HTTP 서버
    ├── routes.ts             # API 라우팅
    ├── runner.ts             # Claude 프로세스 실행 + SSE
    └── html.ts               # 대시보드 HTML/CSS/JS
```

## 제한사항

- macOS 전용 (launchd 기반)
- 크론의 step 값(`*/2`, `*/5` 등)은 launchd에서 지원하지 않음
- Claude CLI 인증이 완료되어 있어야 함
- Gmail 연동은 Google 앱 비밀번호 필요 (2단계 인증 활성화 필수)

## 라이선스

MIT
