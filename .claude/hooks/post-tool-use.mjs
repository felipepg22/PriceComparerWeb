import { open, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const MAX_INPUT_BYTES = 256 * 1024;
export const MAX_FILE_BYTES = 256 * 1024;

function isWithinRoot(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

export async function resolveProjectFile(filePath, projectDir) {
  if (
    typeof filePath !== "string" ||
    filePath === "" ||
    filePath.includes("\0") ||
    typeof projectDir !== "string" ||
    projectDir === ""
  ) {
    return null;
  }

  const lexicalRoot = path.resolve(projectDir);
  const lexicalPath = path.resolve(lexicalRoot, filePath);
  if (!isWithinRoot(lexicalRoot, lexicalPath)) {
    return null;
  }

  const projectRoot = await realpath(lexicalRoot).catch(() => null);
  if (projectRoot === null) {
    return null;
  }

  const resolvedFile = await realpath(lexicalPath).catch(() => null);
  return resolvedFile !== null && isWithinRoot(projectRoot, resolvedFile) ? resolvedFile : null;
}

export function inspectText(text, extension) {
  const issues = [];

  if (extension.toLowerCase() === ".json") {
    try {
      JSON.parse(text);
    } catch {
      issues.push("malformed JSON");
    }
  }

  if (/^(<<<<<<<(?: .*)?|=======$|>>>>>>>.*)$/m.test(text)) {
    issues.push("merge-conflict markers");
  }

  if (/[\t ]+(?:\r?\n|$)/.test(text)) {
    issues.push("trailing whitespace");
  }

  return issues;
}

export async function inspectProjectFile(filePath, projectDir) {
  const resolvedFile = await resolveProjectFile(filePath, projectDir);
  if (resolvedFile === null) {
    return { status: "rejected", issues: [] };
  }

  let handle;
  try {
    handle = await open(resolvedFile, "r");
    const stats = await handle.stat();
    if (!stats.isFile()) {
      return { status: "rejected", issues: [] };
    }
    if (stats.size > MAX_FILE_BYTES) {
      return { status: "too-large", issues: [] };
    }

    const buffer = Buffer.alloc(MAX_FILE_BYTES + 1);
    const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
    if (bytesRead > MAX_FILE_BYTES) {
      return { status: "too-large", issues: [] };
    }

    const bytes = buffer.subarray(0, bytesRead);
    if (bytes.includes(0)) {
      return { status: "binary", issues: [] };
    }

    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return { status: "binary", issues: [] };
    }

    return { status: "inspected", issues: inspectText(text, path.extname(resolvedFile)) };
  } catch {
    return { status: "unreadable", issues: [] };
  } finally {
    await handle?.close().catch(() => {});
  }
}

function feedback(additionalContext) {
  return {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext,
    },
  };
}

export async function postToolUseOutput(payload, projectDir) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  const result = await inspectProjectFile(payload.tool_input?.file_path, projectDir);
  if (result.status === "too-large") {
    return feedback(`Automated edit checks skipped a file larger than ${MAX_FILE_BYTES} bytes.`);
  }
  if (result.status === "unreadable") {
    return feedback("Automated edit checks could not read the edited file.");
  }
  if (result.issues.length === 0) {
    return null;
  }

  return feedback(`Automated edit checks detected: ${result.issues.join(", ")}.`);
}

async function readInput(stream) {
  const chunks = [];
  let size = 0;

  for await (const chunk of stream) {
    size += chunk.length;
    if (size > MAX_INPUT_BYTES) {
      return null;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

export async function main() {
  const input = await readInput(process.stdin);
  if (input === null) {
    return;
  }

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    return;
  }

  const output = await postToolUseOutput(payload, process.env.CLAUDE_PROJECT_DIR ?? "");
  if (output !== null) {
    process.stdout.write(`${JSON.stringify(output)}\n`);
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await main();
}
