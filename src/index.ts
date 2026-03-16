#!/usr/bin/env node

import { Command } from "commander";
import { addCommand } from "./commands/add";
import { listCommand } from "./commands/list";
import { removeCommand } from "./commands/remove";
import { logsCommand } from "./commands/logs";
import { runCommand } from "./commands/run";
import { uiCommand } from "./commands/ui";
import { runWrappedCommand } from "./commands/run-wrapped";
import { consoleHookCommand } from "./hooks/console-hook";
import { setupHooksCommand } from "./commands/setup-hooks";
import { consoleSummarizeCommand } from "./commands/console-summarize";

const program = new Command();

program
  .name("claude-schedule")
  .description("Manage scheduled Claude Code tasks via macOS launchd")
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

program
  .command("_console-hook")
  .description("(internal) Receive Claude Code hook events via stdin")
  .action(consoleHookCommand);

program
  .command("_console-summarize <sessionId>")
  .description("(internal) Generate title and summary for a console session")
  .action(consoleSummarizeCommand);

program
  .command("setup-hooks")
  .description("Configure Claude Code hooks for console monitoring")
  .action(setupHooksCommand);

program.parse();
