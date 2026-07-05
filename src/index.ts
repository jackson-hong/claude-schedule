#!/usr/bin/env node

import { Command } from "commander";
import { addCommand } from "./commands/add";
import { listCommand } from "./commands/list";
import { removeCommand } from "./commands/remove";
import { logsCommand } from "./commands/logs";
import { runCommand } from "./commands/run";
import { uiCommand } from "./commands/ui";
import { toggleCommand } from "./commands/toggle";
import { runWrappedCommand } from "./commands/run-wrapped";
import { notionSetupCommand, notionInitCommand, notionStatusCommand } from "./commands/notion";

const program = new Command();

program
  .name("claude-schedule")
  .description("Manage scheduled Claude Code tasks (macOS launchd / Windows Task Scheduler)")
  .version("1.0.0");

program
  .command("add <name>")
  .description("Add a new scheduled task")
  .requiredOption("--at <time>", "Schedule time in natural language (e.g. \"매일 오후 6시 반\")")
  .requiredOption("--prompt <prompt>", "Prompt to send to Claude")
  .option("--dir <directory>", "Working directory (default: ~/)")
  .action(addCommand);

program
  .command("list")
  .description("List all registered schedules")
  .action(listCommand);

program
  .command("remove <name>")
  .description("Remove a scheduled task")
  .action(removeCommand);

program
  .command("logs <name>")
  .description("View logs for a scheduled task")
  .option("--tail", "Follow log output in real-time")
  .action(logsCommand);

program
  .command("toggle <name>")
  .description("Toggle a schedule on/off")
  .action(toggleCommand);

program
  .command("run <name>")
  .description("Run a scheduled task immediately")
  .action(runCommand);

program
  .command("ui")
  .description("Open the web dashboard")
  .option("--port <port>", "Port to listen on", "3274")
  .action(uiCommand);

program
  .command("_run-wrapped <name>")
  .description("(internal) Run a schedule with history tracking — used by launchd")
  .action(runWrappedCommand);

const notion = program
  .command("notion")
  .description("Notion 연동 관리");

notion
  .command("setup")
  .description("Notion 연결 설정")
  .requiredOption("--token <token>", "Notion Integration Token")
  .requiredOption("--schedule-db <id>", "Schedules Database ID")
  .requiredOption("--run-history-db <id>", "Run History Database ID")
  .action(notionSetupCommand);

notion
  .command("init")
  .description("기존 스케줄 및 히스토리를 Notion에 동기화")
  .option("--history-only", "히스토리만 동기화")
  .action(notionInitCommand);

notion
  .command("status")
  .description("Notion 연결 상태 확인")
  .action(notionStatusCommand);

program.parse();
