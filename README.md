# claude-schedule

매일 특정 시간에 Claude Code를 자동 실행하는 스케줄을 관리하는 CLI 도구.

macOS `launchd`를 기반으로 동작하며, **자연어로 시간을 입력**하면 Claude가 크론 표현식으로 변환해준다.

## 설치

```bash
git clone <repo-url> ~/projects/claude-schedule
cd ~/projects/claude-schedule
npm install
npm run build
npm link
```

### 사전 요구사항

- macOS
- Node.js 18+
- [Claude CLI](https://docs.anthropic.com/en/docs/claude-code) 설치 및 인증 완료

## 사용법

### 스케줄 추가

`--at`에 자연어로 시간을 입력하면 Claude가 크론 표현식으로 변환하고, 확인 후 등록한다.

```bash
claude-schedule add daily-report \
  --at "매일 오후 6시 반" \
  --prompt "/daily-report \$(date +%Y-%m-%d)"

claude-schedule add pr-review \
  --at "평일 오전 9시" \
  --prompt "어제 올라온 PR 리뷰해줘" \
  --dir ~/my-project
```

```
Converting "매일 오후 6시 반" to cron expression...

  "매일 오후 6시 반" → 30 18 * * *

Register this schedule? (Y/n)
```

| 옵션 | 설명 | 필수 |
|------|------|------|
| `--at <시간>` | 자연어 스케줄 (예: "매일 오후 6시 반", "평일 오전 9시") | O |
| `--prompt <프롬프트>` | Claude에 전달할 프롬프트 | O |
| `--dir <경로>` | 작업 디렉토리 (기본: `~/`) | X |

### 스케줄 목록

```bash
claude-schedule list
```

```
NAME            SCHEDULE      AT                PROMPT                           DIR
daily-report    30 18 * * *   매일 오후 6시 반    /daily-report $(date +%Y-%m-%d)  ~/
pr-review       0 9 * * 1-5   평일 오전 9시       어제 올라온 PR 리뷰해줘            ~/my-project
```

### 스케줄 삭제

```bash
claude-schedule remove daily-report
```

launchd에서 해제하고, plist 파일과 설정을 함께 삭제한다.

### 로그 확인

```bash
# 전체 로그 출력
claude-schedule logs daily-report

# 실시간 모니터링
claude-schedule logs daily-report --tail
```

### 즉시 실행

등록된 스케줄의 프롬프트를 바로 실행해서 결과를 확인할 수 있다.

```bash
claude-schedule run daily-report
```

## 동작 원리

1. `--at`으로 입력된 자연어를 `claude -p --model haiku`로 크론 표현식으로 변환
2. 크론 표현식을 launchd의 `StartCalendarInterval` 형식으로 변환
3. `~/Library/LaunchAgents/com.claude-schedule.{name}.plist` 생성
4. `launchctl load`로 등록

### 파일 구조

```
~/.claude-schedule/
├── config.json          # 등록된 스케줄 목록
└── logs/                # 실행 로그
    └── {name}.log

~/Library/LaunchAgents/
└── com.claude-schedule.{name}.plist
```

## 제한사항

- macOS 전용 (launchd 기반)
- 크론의 step 값(`*/2`, `*/5` 등)은 launchd에서 지원하지 않아 사용 불가
- Claude CLI 인증이 되어 있어야 함

## 프로젝트 구조

```
src/
├── index.ts              # CLI 진입점 (commander)
├── types.ts              # 공통 타입
├── commands/
│   ├── add.ts            # 스케줄 추가
│   ├── list.ts           # 스케줄 목록
│   ├── remove.ts         # 스케줄 삭제
│   ├── logs.ts           # 로그 확인
│   └── run.ts            # 즉시 실행
└── lib/
    ├── paths.ts          # 경로 상수
    ├── config.ts         # 스케줄 설정 CRUD
    ├── parser.ts         # 자연어 → 크론 변환
    ├── plist.ts          # plist XML 생성
    └── launchctl.ts      # launchctl load/unload 래퍼
```

## 라이선스

MIT
