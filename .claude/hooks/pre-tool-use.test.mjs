import assert from "node:assert/strict";
import test from "node:test";

import { destructiveCommandReason, preToolUseOutput } from "./pre-tool-use.mjs";

const projectDir = "/work/price-comparer";

test("safe commands do not request a decision", () => {
  const safeCommands = [
    "git status --short",
    "git reset --soft HEAD^",
    "git clean -nfd",
    "git checkout feature-branch",
    "rm -rf ./tmp",
    "printf '%s\\n' 'git reset --hard'",
  ];

  for (const command of safeCommands) {
    assert.equal(destructiveCommandReason(command, projectDir), null, command);
    assert.equal(preToolUseOutput({ tool_input: { command } }, projectDir), null, command);
  }
});

test("destructive git operations request permission", () => {
  const destructiveCommands = [
    "git reset --hard HEAD^",
    "git clean -fd",
    "git clean -xdf",
    "git checkout -- client/src/app.ts",
    "cd client && git reset --hard",
    "git -C client reset --hard",
  ];

  for (const command of destructiveCommands) {
    const output = preToolUseOutput({ tool_input: { command } }, projectDir);
    assert.equal(output?.hookSpecificOutput.hookEventName, "PreToolUse", command);
    assert.equal(output?.hookSpecificOutput.permissionDecision, "ask", command);
    assert.match(output?.hookSpecificOutput.permissionDecisionReason ?? "", /discard|delete/, command);
  }
});

test("recursive deletion of broad targets requests permission", () => {
  const destructiveCommands = [
    "rm -rf /",
    "rm --recursive --force ~",
    "rm -r $HOME",
    "rm -rf ${HOME}",
    "rm -rf $CLAUDE_PROJECT_DIR",
    `rm -rf "${projectDir}"`,
    "rm -rf .",
  ];

  for (const command of destructiveCommands) {
    const output = preToolUseOutput({ cwd: projectDir, tool_input: { command } }, projectDir);
    assert.equal(output?.hookSpecificOutput.permissionDecision, "ask", command);
  }
});

test("recursive dot targets require permission after directory changes", () => {
  const destructiveCommands = ["rm -rf ..", "cd client && rm -rf .", "cd client && rm -rf .."];

  for (const command of destructiveCommands) {
    const output = preToolUseOutput({ cwd: projectDir, tool_input: { command } }, projectDir);
    assert.equal(output?.hookSpecificOutput.permissionDecision, "ask", command);
  }
});

test("malformed hook input fails safely by requesting permission", () => {
  const output = preToolUseOutput({ tool_input: {} }, projectDir);
  assert.equal(output.hookSpecificOutput.permissionDecision, "ask");
});

test("a missing project root fails safely by requesting permission", () => {
  const output = preToolUseOutput({ tool_input: { command: "git reset --hard HEAD" } }, "");

  assert.equal(output?.hookSpecificOutput.permissionDecision, "ask");
  assert.match(output?.hookSpecificOutput.permissionDecisionReason ?? "", /project root/);
});
