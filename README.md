# claude-schedule

OS 스케줄러(macOS `launchd` / Windows Task Scheduler) 기반으로 Claude Code를 자동 실행하는 스케줄러. 자연어로 시간을 입력하면 크론 표현식으로 변환해 등록한다.

웹 대시보드(UI)와 CLI 모두 지원하며, Gmail/Slack 연동으로 실행 결과를 받고, Notion으로 스케줄·실행 히스토리를 동기화할 수 있다.

## 주요 기능

- **자연어 스케줄링** — "매일 오후 6시 반", "평일 오전 9시" 같은 표현을 크론으로 자동 변환
- **크로스 플랫폼** — macOS는 `launchd`, Windows는 `schtasks`(Task Scheduler)로 자동 등록
- **웹 대시보드** — 스케줄 CRUD, 즉시 실행/취소, 빌드 히스토리 조회, 드래그 정렬
- **그룹 관리** — 스케줄을 색상 그룹으로 묶어 정리 (그룹 CRUD, 순서 변경)
- **빌드 히스토리** — Jenkins 스타일 실행 이력 (실시간 상태, 출력 로그, SSE 스트리밍, 비용·토큰 집계)
- **프롬프트 히스토리** — 프롬프트 버전 관리 및 이전 버전 복원
- **Gmail 연동** — App Password 기반 SMTP MCP 서버로 Claude가 이메일 전송 가능
- **Slack 연동** — Webhook 기반 MCP 서버로 Claude가 Slack 메시지 전송 가능
- **Notion 연동** — 스케줄과 실행 히스토리를 Notion 데이터베이스로 동기화 (실행 완료 시 자동 push)
- **On/Off 토글** — 스케줄을 삭제하지 않고 활성/비활성 전환

## 설치

### 사전 요구사항

- macOS 또는 Windows
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

#### 스케줄 On/Off 토글

```bash
claude-schedule toggle daily-report   # 활성 ↔ 비활성 전환
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

- 스케줄 추가 / 수정 / 삭제 / 토글
- 즉시 실행 (Run 버튼) 및 실행 중 취소
- 드래그로 스케줄 순서 변경, 그룹 지정
- 그룹 생성 / 이름 변경 / 삭제 / 순서 변경 (색상 자동 배정)
- 빌드 히스토리 조회 (실행 상태, 소요 시간, 비용·토큰, 출력 로그)
- 프롬프트 인라인 수정 및 버전 복원
- Gmail / Slack 연결 / 해제

### Gmail 연동

스케줄 실행 중 Claude가 이메일을 보낼 수 있도록 Gmail SMTP를 연동한다.

**설정 방법:**

1. Google 계정 → [앱 비밀번호](https://myaccount.google.com/apppasswords) 생성
2. 대시보드 헤더의 **Connect Gmail** 클릭
3. 이메일 주소 + 앱 비밀번호 입력 → SMTP 연결 테스트 후 저장
4. 스케줄 생성/수정 시 **Enable Gmail** 체크

Gmail이 활성화된 스케줄은 실행 시 `--mcp-config` 플래그로 `send_email` MCP 도구가 Claude에 제공된다.

### Slack 연동

스케줄 실행 중 Claude가 Slack 메시지를 보낼 수 있도록 Incoming Webhook을 연동한다.

**설정 방법:**

1. Slack → Incoming Webhook URL 발급
2. 대시보드 헤더의 **Connect Slack** 클릭 → Webhook URL 입력 (연결 테스트 후 저장)
3. 스케줄 생성/수정 시 **Enable Slack** 체크

Slack이 활성화된 스케줄은 실행 시 `send_slack_message` MCP 도구가 Claude에 제공된다.

### Notion 연동

스케줄과 실행 히스토리를 Notion 데이터베이스로 동기화한다. 연결되어 있으면 실행이 끝날 때마다 실행 결과가 자동으로 Notion에 push된다.

**필요한 것:**

- Notion Integration Token
- Schedules 데이터베이스 ID (속성: Name, Prompt, Schedule, Cron, Work Dir, Enabled, Gmail, Slack, Status, Sync ID, Last Synced)
- Run History 데이터베이스 ID (속성: Title, Trigger, Status, Started At, Duration (s), Cost (USD), Input Tokens, Output Tokens, Schedule)

**설정 및 동기화:**

```bash
# 연결 설정
claude-schedule notion setup \
  --token secret_xxx \
  --schedule-db <schedules-db-id> \
  --run-history-db <run-history-db-id>

# 연결 상태 확인
claude-schedule notion status

# 기존 스케줄 + 실행 히스토리 최초 동기화
claude-schedule notion init
claude-schedule notion init --history-only   # 히스토리만
```

## 동작 원리

1. `--at`으로 입력된 자연어를 `claude -p --model haiku`로 크론 표현식 변환
2. 크론 표현식을 OS 스케줄러 형식으로 변환
   - macOS: launchd `StartCalendarInterval` (`~/Library/LaunchAgents/com.claude-schedule.{name}.plist`)
   - Windows: `schtasks /create` (Task Scheduler)
3. OS 스케줄러에 등록 (`launchctl load` / `schtasks`)
4. 스케줄 시간이 되면 `claude-schedule _run-wrapped <name>` 실행
5. `claude --dangerously-skip-permissions --output-format stream-json` 프로세스를 스폰해 스트리밍 JSON을 파싱
6. 실행 결과(상태, 소요 시간, 비용, 토큰, 출력 로그)를 빌드 히스토리에 기록하고, Notion이 연결돼 있으면 자동 push
7. 내부 Claude 호출은 `CLAUDE_SCHEDULE_INTERNAL=1` 환경변수로 재귀 실행 방지

## 데이터 구조

```
~/.claude-schedule/
├── config.json          # 등록된 스케줄 목록
├── groups.json          # 스케줄 그룹
├── gmail.json           # Gmail SMTP 자격증명
├── slack.json           # Slack Webhook 자격증명
├── notion.json          # Notion 연동 설정
├── mcp.json             # MCP 서버 설정
├── logs/                # OS 스케줄러 실행 로그
│   └── {name}.log
├── runs/                # 빌드 히스토리
│   └── {name}/
│       ├── index.json   # 실행 이력 메타데이터
│       ├── 1.log        # #1 실행 출력
│       └── 2.log        # #2 실행 출력
└── prompts/             # 프롬프트 히스토리
    └── {name}/
        └── index.json

# macOS 전용
~/Library/LaunchAgents/
└── com.claude-schedule.{name}.plist
```

## API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/schedules` | 스케줄 목록 |
| POST | `/api/schedules` | 스케줄 추가 |
| PUT | `/api/schedules/reorder` | 스케줄 순서/그룹 변경 |
| PUT | `/api/schedules/:name` | 스케줄 수정 |
| POST | `/api/schedules/:name/toggle` | 스케줄 On/Off 토글 |
| DELETE | `/api/schedules/:name` | 스케줄 삭제 |
| POST | `/api/schedules/:name/run` | 즉시 실행 |
| POST | `/api/runs/:runId/cancel` | 실행 취소 (runId) |
| POST | `/api/schedules/:name/runs/:number/cancel` | 실행 취소 (name+번호) |
| GET | `/api/schedules/:name/logs` | OS 스케줄러 로그 |
| GET | `/api/schedules/:name/runs` | 빌드 히스토리 |
| GET | `/api/schedules/:name/runs/:number` | 실행 상세 |
| GET | `/api/schedules/:name/runs/:number/output` | 실행 출력 |
| GET | `/api/runs/:runId/stream` | SSE 실시간 스트리밍 |
| GET | `/api/schedules/:name/prompts` | 프롬프트 버전 목록 |
| POST | `/api/schedules/:name/prompts/:number/restore` | 프롬프트 버전 복원 |
| POST | `/api/parse-cron` | 크론 변환 미리보기 |
| GET | `/api/dirs` | 디렉토리 탐색 (작업 디렉토리 선택) |
| GET | `/api/groups` | 그룹 목록 |
| POST | `/api/groups` | 그룹 추가 |
| PUT | `/api/groups/reorder` | 그룹 순서 변경 |
| PUT | `/api/groups/:id` | 그룹 이름 변경 |
| DELETE | `/api/groups/:id` | 그룹 삭제 |
| GET | `/api/gmail/status` | Gmail 연결 상태 |
| POST | `/api/gmail/connect` | Gmail 연결 |
| DELETE | `/api/gmail/disconnect` | Gmail 해제 |
| GET | `/api/slack/status` | Slack 연결 상태 |
| POST | `/api/slack/connect` | Slack 연결 |
| DELETE | `/api/slack/disconnect` | Slack 해제 |

## 프로젝트 구조

```
src/
├── index.ts                  # CLI 진입점 (commander)
├── types.ts                  # 공통 타입 (Schedule, Group, RunRecord ...)
├── commands/
│   ├── add.ts                # 스케줄 추가
│   ├── list.ts               # 스케줄 목록
│   ├── remove.ts             # 스케줄 삭제
│   ├── toggle.ts             # 스케줄 On/Off 토글
│   ├── logs.ts               # 로그 확인
│   ├── run.ts                # 즉시 실행
│   ├── run-wrapped.ts        # OS 스케줄러 실행 래퍼 (히스토리 기록 + Notion push)
│   ├── ui.ts                 # 웹 대시보드 시작
│   └── notion.ts             # Notion setup / init / status
├── lib/
│   ├── paths.ts              # 경로 상수
│   ├── platform.ts           # OS 추상화 (launchd / schtasks, 터미널·브라우저)
│   ├── config.ts             # 스케줄 설정 CRUD + 순서/그룹
│   ├── groups.ts             # 그룹 CRUD (색상 자동 배정)
│   ├── parser.ts             # 자연어 → 크론 변환
│   ├── plist.ts              # launchd plist XML 생성
│   ├── launchctl.ts          # launchctl load/unload
│   ├── runs.ts               # 빌드 히스토리 관리
│   ├── notion-sync.ts        # Notion 동기화
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

- macOS(launchd) 및 Windows(Task Scheduler) 지원. Linux는 스케줄러 등록 미검증
- 크론의 step 값(`*/2`, `*/5` 등)은 launchd에서 지원하지 않음
- Claude CLI 인증이 완료되어 있어야 함
- Gmail 연동은 Google 앱 비밀번호 필요 (2단계 인증 활성화 필수)

## 라이선스

MIT
