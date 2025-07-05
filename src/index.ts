#!/usr/bin/env -S tsx
import { query } from "@anthropic-ai/claude-code";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

interface CLIArgs {
  prompt?: string;
  inputFile?: string;
  maxTurns?: number;
  sessionId?: string;
  allowedTools?: string;
  disallowedTools?: string;
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = {};
  let consumed = new Set<number>();
  let continueFlag = false;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '-i' || arg === '--input') {
      result.prompt = args[++i];
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === '-f' || arg === '--file') {
      result.inputFile = args[++i];
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === '--max-turns') {
      result.maxTurns = parseInt(args[++i], 10);
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === '-c' || arg === '--continue') {
      continueFlag = true;
      consumed.add(i);
    } else if (arg === '--resume') {
      result.sessionId = args[++i];
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === '--allowedTools') {
      result.allowedTools = args[++i];
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === '--disallowedTools') {
      result.disallowedTools = args[++i];
      consumed.add(i - 1);
      consumed.add(i);
    } else if (arg === '-h' || arg === '--help') {
      console.log('Usage: claude-run [options]');
      console.log('Options:');
      console.log('  -i, --input <prompt>     Prompt to send to Claude');
      console.log('  -f, --file <file>        Input file to send to Claude');
      console.log('  --max-turns <number>     Maximum number of turns to run');
      console.log('  -c, --continue           Continue from a previous session');
      console.log('  --resume <session-id>    Resume from a previous session');
      console.log('  --allowedTools <tools>   Allowed tools separated by comma');
      console.log('  --disallowedTools <tools> Disallowed tools separated by comma');
      process.exit(0);
    }
  }

  // -i も -f も指定されていない場合、最初の未消費引数をpromptとして扱う
  if (!result.prompt && !result.inputFile) {
    for (let i = 0; i < args.length; i++) {
      if (!consumed.has(i)) {
        result.prompt = args[i];
        break;
      }
    }
  }

  // continueフラグをresultに追加
  (result as any).continue = continueFlag;
  return result;
}

function getPrompt(args: CLIArgs): string {
  if (args.inputFile) {
    try {
      const filePath = resolve(args.inputFile);
      return readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error reading file ${args.inputFile}:`, (error as Error).message);
      process.exit(1);
    }
  } else if (args.prompt) {
    return args.prompt;
  } else {
    console.error('Please provide either -i <prompt> or -f <file>');
    process.exit(1);
  }
}

function loadSettings() {
  const baseDir = process.cwd();
  const settingPaths = [
    ".claude/settings.local.json",
    ".claude/settings.json"
  ];
  for (const relPath of settingPaths) {
    const absPath = resolve(baseDir, relPath);
    if (existsSync(absPath)) {

      try {
        const json = JSON.parse(readFileSync(absPath, "utf8"));
        console.log(`${relPath} was loaded`);
        return json;
      } catch (e) {
        console.error(`${relPath} failed to load or parse: ${(e as Error).message}`);
        process.exit(1);
      }
    }
  }
  return null;
}

async function main() {
  const args = parseArgs();
  const prompt = getPrompt(args);
  let sessionId: string | undefined;
  const usedTools: string[] = [];

  console.log(`ccrun start \n`);

  // 設定ファイルの読み込み
  const settings = loadSettings();
  let allowedTools: string[] = args.allowedTools ? args.allowedTools.replace(/ /g, "").split(",") : [];
  let disallowedTools: string[] = args.disallowedTools ? args.disallowedTools.replace(/ /g, "").split(",") : [];
  if (settings && settings.permissions) {
    if (Array.isArray(settings.permissions.allow)) {
      allowedTools = allowedTools.concat(settings.permissions.allow);
    }
    if (Array.isArray(settings.permissions.deny)) {
      disallowedTools = disallowedTools.concat(settings.permissions.deny);
    }
  }
  console.log(`allowedTools: ${allowedTools}`);
  console.log(`disallowedTools: ${disallowedTools}`);

  try {
    for await (const message of query({
      prompt: prompt,
      abortController: new AbortController(),
      options: {
        allowedTools: allowedTools.length > 0 ? allowedTools : undefined,
        disallowedTools: disallowedTools.length > 0 ? disallowedTools : undefined,
        maxTurns: args.maxTurns ? args.maxTurns : undefined,
        continue: (args as any).continue ? true : undefined,
        resume: args.sessionId ? args.sessionId : undefined,
      },
    })) {
      console.log(`\n## ${message.type}`);
      // session_idを保存
      if (message.type === "system") {
        sessionId = message.session_id;
        console.log(`Session ID: ${sessionId}`);
      } else if (message.type === "assistant" || message.type === "user") {

        const contents = message.message.content;
        for (const content of contents) {
          if (content.type === "text") {
            console.log(content.text.replace(/\n/g, '\n'));
          } else if (content.type === "image_url") {
            console.log(content);
          } else if (content.type === "tool_use") {
            console.log("### tool_use");
            console.log(content.name);

            if (!usedTools.includes(content.name)) {
              usedTools.push(content.name);
            }

            if(content.name === "TodoWrite"){
              const todos = content.input.todos;
              for (const todo of todos) {
                console.log(`${todo.id}: ${todo.content} (${todo.status})`);
              }
            } else {
              console.log(content.input);
            }
          } else if (content.type === "tool_result") {
            console.log("### tool_result");
            console.log(content);
            if (typeof content.content === "string") {
              const displayContent = content.content.replace(/\n/g, '\n').split("\n").slice(0, 5).join("\n") + "...";
              console.log(displayContent);
            } else {
              // console.log(content.content);
            }
          } else {
            console.log(`## ${content.type}`);
            console.log(content);
          }
        }
      } else if (message.type === "result") {
        if (message.subtype === "success") {
          console.log(message.result);
        } else if (message.subtype === "error_max_turns") {
          console.log("Error: Max turns reached");
        } else if (message.subtype === "error_during_execution") {
          console.log("Error: During execution");
        }

        console.log('\n');
        console.log(`Used tools: ${usedTools.join(", ")} \n`);
        console.log(`Usage: ${JSON.stringify(message.usage)} \n`);
      } else {
        console.log(message);
      }
    }

    // 最後にsession_idを表示
    if (sessionId) {
      console.log(`Session ID: ${sessionId}`);
      console.log(`Continue with: --continue or --resume ${sessionId}`);
    }

  } catch (error) {
    console.error('Error executing query:', (error as Error).message);
    process.exit(1);
  }
}

main();