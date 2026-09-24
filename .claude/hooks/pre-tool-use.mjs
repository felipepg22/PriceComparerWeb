import process from "node:process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const MAX_INPUT_BYTES = 256 * 1024;

function splitCommandSegments(command) {
  const segments = [];
  let current = "";
  let quote = null;
  let escaped = false;

  for (let index = 0; index < command.length; index += 1) {
    const character = command[index];

    if (escaped) {
      current += character;
      escaped = false;
      continue;
    }

    if (character === "\\" && quote !== "'") {
      current += character;
      escaped = true;
      continue;
    }

    if (quote !== null) {
      current += character;
      if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      current += character;
      continue;
    }

    if (character === ";" || character === "\n" || character === "|" || character === "&") {
      if (current.trim() !== "") {
        segments.push(current.trim());
      }
      current = "";
      if ((character === "|" || character === "&") && command[index + 1] === character) {
        index += 1;
      }
      continue;
    }

    current += character;
  }

  if (current.trim() !== "") {
    segments.push(current.trim());
  }

  return segments;
}

function tokenizeSegment(segment) {
  const words = [];
  let current = "";
  let quote = null;
  let escaped = false;
  let hasToken = false;

  const pushCurrent = () => {
    if (hasToken) {
      words.push(current);
      current = "";
      hasToken = false;
    }
  };

  for (let index = 0; index < segment.length; index += 1) {
    const character = segment[index];

    if (escaped) {
      current += character;
      hasToken = true;
      escaped = false;
      continue;
    }

    if (character === "\\" && quote !== "'") {
      escaped = true;
      hasToken = true;
      continue;
    }

    if (quote !== null) {
      if (character === quote) {
        quote = null;
      } else {
        current += character;
      }
      hasToken = true;
      continue;
    }

    if (character === "'" || character === '"') {
      quote = character;
      hasToken = true;
      continue;
    }

    if (/\s/.test(character)) {
      pushCurrent();
      continue;
    }

    if (character === "#" && !hasToken) {
      break;
    }

    current += character;
    hasToken = true;
  }

  if (escaped) {
    current += "\\";
  }
  pushCurrent();
  return words;
}

function commandArguments(words) {
  let index = 0;
  while (index < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index])) {
    index += 1;
  }

  while (["command", "exec", "nohup"].includes(path.basename(words[index] ?? ""))) {
    index += 1;
  }

  if (path.basename(words[index] ?? "") === "env") {
    index += 1;
    while (index < words.length && (words[index].startsWith("-") || /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[index]))) {
      index += 1;
    }
  }

  if (path.basename(words[index] ?? "") === "sudo") {
    index += 1;
    const optionsWithValues = new Set(["-C", "-D", "-g", "-h", "-p", "-R", "-T", "-t", "-u"]);
    while (index < words.length && words[index].startsWith("-")) {
      const option = words[index];
      index += 1;
      if (optionsWithValues.has(option)) {
        index += 1;
      }
    }
  }

  const executable = path.basename(words[index] ?? "");
  return { executable, args: words.slice(index + 1) };
}

function gitSubcommand(args) {
  const optionsWithValues = new Set(["-C", "-c", "--exec-path", "--git-dir", "--namespace", "--super-prefix", "--work-tree"]);

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (optionsWithValues.has(argument)) {
      index += 1;
      continue;
    }
    if (argument.startsWith("--") && argument.includes("=")) {
      continue;
    }
    if (argument.startsWith("-")) {
      continue;
    }
    return { name: argument, args: args.slice(index + 1) };
  }

  return { name: null, args: [] };
}

function isRecursiveRmFlag(argument) {
  return argument === "--recursive" || /^-[^-]*[rR]/.test(argument);
}

function isBroadRemovalTarget(target, projectDir, cwd) {
  if (/^\.\.?\/*$/.test(target)) {
    return true;
  }

  const symbolicBroadTargets = new Set([
    "~",
    "$HOME",
    "${HOME}",
    "$CLAUDE_PROJECT_DIR",
    "${CLAUDE_PROJECT_DIR}",
  ]);
  if (symbolicBroadTargets.has(target)) {
    return true;
  }

  if (target.includes("$") || target.startsWith("~")) {
    return false;
  }

  const resolvedTarget = path.resolve(cwd, target);
  const resolvedProject = path.resolve(projectDir);
  return resolvedTarget === path.parse(resolvedTarget).root || resolvedTarget === resolvedProject;
}

function destructiveReasonForSegment(segment, projectDir, cwd) {
  const words = tokenizeSegment(segment);
  const { executable, args } = commandArguments(words);

  if (executable === "git") {
    const subcommand = gitSubcommand(args);
    if (subcommand.name === "reset" && subcommand.args.includes("--hard")) {
      return "git reset --hard can discard uncommitted work";
    }
    if (
      subcommand.name === "clean" &&
      !subcommand.args.some((argument) => argument === "--dry-run" || /^-[^-]*n/.test(argument)) &&
      subcommand.args.some((argument) => argument === "--force" || /^-[^-]*f/.test(argument))
    ) {
      return "forceful git clean can permanently delete untracked files";
    }
    if (subcommand.name === "checkout" && subcommand.args.includes("--")) {
      return "git checkout -- can discard uncommitted file changes";
    }
  }

  if (executable === "rm" && args.some(isRecursiveRmFlag)) {
    const targets = args.filter((argument) => argument === "-" || !argument.startsWith("-"));
    if (targets.some((target) => isBroadRemovalTarget(target, projectDir, cwd))) {
      return "recursive deletion targets a broad or project-level path";
    }
  }

  return null;
}

export function destructiveCommandReason(command, projectDir, cwd = projectDir) {
  if (typeof command !== "string" || typeof projectDir !== "string" || projectDir === "") {
    return null;
  }

  for (const segment of splitCommandSegments(command)) {
    const reason = destructiveReasonForSegment(segment, projectDir, cwd);
    if (reason !== null) {
      return reason;
    }
  }

  return null;
}

export function preToolUseOutput(payload, projectDir) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return permissionRequest("The Bash command could not be inspected because the hook input was malformed.");
  }

  const command = payload.tool_input?.command;
  if (typeof command !== "string") {
    return permissionRequest("The Bash command could not be inspected because tool_input.command was missing.");
  }

  if (
    typeof projectDir !== "string" ||
    projectDir.trim() === "" ||
    projectDir.includes("\0") ||
    !path.isAbsolute(projectDir)
  ) {
    return permissionRequest("The Bash command could not be inspected because the project root was missing or invalid.");
  }

  const cwd = typeof payload.cwd === "string" && payload.cwd !== "" ? payload.cwd : projectDir;
  const reason = destructiveCommandReason(command, projectDir, cwd);
  return reason === null ? null : permissionRequest(reason);
}

function permissionRequest(reason) {
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: reason,
    },
  };
}

async function readInput(stream) {
  const chunks = [];
  let size = 0;

  for await (const chunk of stream) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) {
      return { overflow: true, text: "" };
    }
    chunks.push(chunk);
  }

  return { overflow: false, text: Buffer.concat(chunks).toString("utf8") };
}

export async function main() {
  const input = await readInput(process.stdin);
  let output;

  if (input.overflow) {
    output = permissionRequest("The Bash command could not be inspected because the hook input exceeded its size limit.");
  } else {
    try {
      output = preToolUseOutput(JSON.parse(input.text), process.env.CLAUDE_PROJECT_DIR ?? "");
    } catch {
      output = permissionRequest("The Bash command could not be inspected because the hook input was not valid JSON.");
    }
  }

  if (output !== null) {
    process.stdout.write(`${JSON.stringify(output)}\n`);
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
