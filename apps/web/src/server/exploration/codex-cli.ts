import "server-only";

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  CodexResearchJsonSchema,
  CodexResearchOutputSchema,
} from "@/domain/exploration/codex-research";

const DEFAULT_TIMEOUT_MS = 180_000;

let activeRun = false;

export class CodexResearchError extends Error {
  constructor(
    public readonly code:
      | "disabled"
      | "busy"
      | "not_found"
      | "timeout"
      | "failed"
      | "invalid_output",
    message: string,
  ) {
    super(message);
    this.name = "CodexResearchError";
  }
}

export function buildCodexExecArgs(schemaPath: string, outputPath: string) {
  return [
    "--search",
    "exec",
    "--ephemeral",
    "--ignore-user-config",
    "--ignore-rules",
    "--skip-git-repo-check",
    "--sandbox",
    "read-only",
    "--output-schema",
    schemaPath,
    "--output-last-message",
    outputPath,
    "-",
  ];
}

export function parseCodexResearchOutput(value: string) {
  try {
    return CodexResearchOutputSchema.parse(JSON.parse(value));
  } catch {
    throw new CodexResearchError(
      "invalid_output",
      "Codex CLI returned output that did not satisfy the research schema.",
    );
  }
}

function configuredTimeout() {
  const value = Number(process.env.RESOWORLD_CODEX_CLI_TIMEOUT_MS);
  return Number.isFinite(value) && value >= 10_000
    ? Math.min(value, 600_000)
    : DEFAULT_TIMEOUT_MS;
}

function runProcess(input: {
  executable: string;
  args: string[];
  cwd: string;
  prompt: string;
  timeoutMs: number;
}) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(input.executable, input.args, {
      cwd: input.cwd,
      env: process.env,
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    let timedOut = false;
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, input.timeoutMs);

    child.stdout.on("data", () => undefined);
    child.stderr.resume();
    child.on("error", (error: NodeJS.ErrnoException) => {
      finish(() => {
        reject(
          new CodexResearchError(
            error.code === "ENOENT" ? "not_found" : "failed",
            error.code === "ENOENT"
              ? "Codex CLI executable was not found."
              : "Codex CLI could not be started.",
          ),
        );
      });
    });
    child.on("close", (code) => {
      finish(() => {
        if (timedOut) {
          reject(new CodexResearchError("timeout", "Codex CLI research timed out."));
        } else if (code !== 0) {
          reject(
            new CodexResearchError(
              "failed",
              "Codex CLI research failed. Check Codex login and local CLI configuration.",
            ),
          );
        } else {
          resolve();
        }
      });
    });
    child.stdin.end(input.prompt, "utf8");
  });
}

export async function requestCodexExplorationResearch(input: {
  prompt: string;
  enabled?: boolean;
  executable?: string;
}) {
  if (!input.enabled) {
    throw new CodexResearchError("disabled", "Codex CLI research is disabled.");
  }
  if (activeRun) {
    throw new CodexResearchError(
      "busy",
      "Another Codex CLI research job is already running.",
    );
  }

  activeRun = true;
  let workspace: string | undefined;
  try {
    workspace = await mkdtemp(join(tmpdir(), "resoworld-codex-"));
    const schemaPath = join(workspace, "research-schema.json");
    const outputPath = join(workspace, "research-output.json");
    await writeFile(
      schemaPath,
      JSON.stringify(CodexResearchJsonSchema, null, 2),
      "utf8",
    );
    await runProcess({
      executable: input.executable?.trim() || "codex",
      args: buildCodexExecArgs(schemaPath, outputPath),
      cwd: workspace,
      prompt: input.prompt,
      timeoutMs: configuredTimeout(),
    });
    return parseCodexResearchOutput(await readFile(outputPath, "utf8"));
  } finally {
    activeRun = false;
    if (workspace) await rm(workspace, { recursive: true, force: true });
  }
}
