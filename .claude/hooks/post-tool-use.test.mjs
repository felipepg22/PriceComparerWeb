import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { MAX_FILE_BYTES, inspectProjectFile, postToolUseOutput, resolveProjectFile } from "./post-tool-use.mjs";

async function withFixture(run) {
  const parent = await mkdtemp(path.join(os.tmpdir(), "price-comparer-hook-"));
  const projectDir = path.join(parent, "project");
  await mkdir(projectDir);
  try {
    await run({ parent, projectDir });
  } finally {
    await rm(parent, { force: true, recursive: true });
  }
}

test("a clean edited JSON file emits no feedback", async () => {
  await withFixture(async ({ projectDir }) => {
    const filePath = path.join(projectDir, "clean.json");
    await writeFile(filePath, '{\n  "ok": true\n}\n');

    const output = await postToolUseOutput({ tool_input: { file_path: filePath } }, projectDir);

    assert.equal(output, null);
  });
});

test("malformed JSON produces bounded feedback without file contents", async () => {
  await withFixture(async ({ projectDir }) => {
    const filePath = path.join(projectDir, "invalid.json");
    const sensitiveFixture = '{ "private": definitely-not-json }';
    await writeFile(filePath, sensitiveFixture);

    const output = await postToolUseOutput({ tool_input: { file_path: filePath } }, projectDir);
    const context = output?.hookSpecificOutput.additionalContext ?? "";

    assert.equal(output?.hookSpecificOutput.hookEventName, "PostToolUse");
    assert.match(context, /malformed JSON/);
    assert.doesNotMatch(context, /private|definitely-not-json/);
    assert.ok(context.length < 200);
  });
});

test("merge-conflict markers and trailing whitespace are reported deterministically", async () => {
  await withFixture(async ({ projectDir }) => {
    const filePath = path.join(projectDir, "conflict.txt");
    await writeFile(filePath, "<<<<<<< ours\nleft  \n=======\nright\n>>>>>>> theirs\n");

    const result = await inspectProjectFile(filePath, projectDir);

    assert.deepEqual(result, {
      status: "inspected",
      issues: ["merge-conflict markers", "trailing whitespace"],
    });
  });
});

test("paths outside the project and escaping symlinks are rejected", async () => {
  await withFixture(async ({ parent, projectDir }) => {
    const outside = path.join(parent, "outside.txt");
    const link = path.join(projectDir, "outside-link.txt");
    await writeFile(outside, "outside");
    await symlink(outside, link);

    assert.equal(await resolveProjectFile(outside, projectDir), null);
    assert.equal(await resolveProjectFile(link, projectDir), null);
    assert.equal(await postToolUseOutput({ tool_input: { file_path: outside } }, projectDir), null);
  });
});

test("oversized files are not read into feedback", async () => {
  await withFixture(async ({ projectDir }) => {
    const filePath = path.join(projectDir, "oversized.txt");
    await writeFile(filePath, Buffer.alloc(MAX_FILE_BYTES + 1, "x"));

    const output = await postToolUseOutput({ tool_input: { file_path: filePath } }, projectDir);

    assert.equal(
      output?.hookSpecificOutput.additionalContext,
      `Automated edit checks skipped a file larger than ${MAX_FILE_BYTES} bytes.`,
    );
  });
});
