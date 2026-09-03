import "server-only";

import { spawn } from "node:child_process";
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildExtractionInput,
  CLAIM_EXTRACTION_INSTRUCTIONS,
  ClaimExtractionJsonSchema,
} from "@/domain/extraction/prompt";
import { ClaimExtractionOutputSchema } from "@/domain/extraction/schema";
import type { ImportedPassage } from "@/domain/imports/types";

import { ClaimExtractionError } from "./errors";

let activeRun = false;

function stripUnsupportedFormats(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripUnsupportedFormats);
  if (!value || typeof value !== "object") return value;
  const record = { ...(value as Record<string, unknown>) };
  delete record.format;
  for (const [key, child] of Object.entries(record)) {
    record[key] = stripUnsupportedFormats(child);
  }
  return record;
}

export function buildCodexCompatibleSchema() {
  const schema = JSON.parse(
    JSON.stringify(ClaimExtractionJsonSchema).replaceAll('"oneOf":', '"anyOf":'),
  ) as unknown;
  return stripUnsupportedFormats(schema);
}

function summarizeCodexError(stderr: string, code: number | null) {
  const messages = [...stderr.matchAll(/"message"\s*:\s*"([^"]+)"/g)];
  return messages.at(-1)?.[1] ?? `exit ${code ?? "unknown"}`;
}

export function buildCodexExtractionArgs(schemaPath: string, outputPath: string, model: string) {
  return [
    "exec", "--ephemeral", "--ignore-user-config", "--ignore-rules",
    "--skip-git-repo-check", "--sandbox", "read-only", "--model", model,
    "-c", 'model_reasoning_effort="low"', "--output-schema", schemaPath,
    "--output-last-message", outputPath, "-",
  ];
}

export async function resolveCodexExecutable(configured?: string) {
  const candidate = configured?.trim();
  if (!candidate) return "codex";
  try {
    await access(candidate);
    return candidate;
  } catch {
    return "codex";
  }
}

function runCodex(input: { executable: string; args: string[]; cwd: string; prompt: string; timeoutMs: number }) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(input.executable, input.args, {
      cwd: input.cwd,
      env: process.env,
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "ignore", "pipe"],
    });
    let stderr = "";
    let timedOut = false;
    let settled = false;
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => { stderr = (stderr + chunk).slice(-4_000); });
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === "win32" && child.pid) {
        const killer = spawn(
          "taskkill.exe",
          ["/PID", String(child.pid), "/T", "/F"],
          { windowsHide: true, stdio: "ignore", shell: false },
        );
        killer.on("error", () => child.kill());
      } else {
        child.kill();
      }
    }, input.timeoutMs);
    child.on("error", () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(new ClaimExtractionError("unavailable", "Codex CLI could not be started."));
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (timedOut) reject(new ClaimExtractionError("incomplete", "Codex CLI extraction timed out."));
      else if (code !== 0) reject(new ClaimExtractionError("api_error", `Codex CLI extraction failed: ${summarizeCodexError(stderr, code)}`));
      else resolve();
    });
    child.stdin.end(input.prompt, "utf8");
  });
}

export async function requestCodexClaimExtraction(input: {
  executable?: string;
  model: string;
  documentTitle: string;
  passages: ImportedPassage[];
}) {
  if (activeRun) throw new ClaimExtractionError("unavailable", "Another Codex extraction is running.");
  activeRun = true;
  const startedAt = Date.now();
  let workspace: string | undefined;
  try {
    workspace = await mkdtemp(join(tmpdir(), "resoworld-codex-extraction-"));
    const schemaPath = join(workspace, "schema.json");
    const outputPath = join(workspace, "output.json");
    await writeFile(schemaPath, JSON.stringify(buildCodexCompatibleSchema(), null, 2), "utf8");
    await runCodex({
      executable: await resolveCodexExecutable(input.executable),
      args: buildCodexExtractionArgs(schemaPath, outputPath, input.model),
      cwd: workspace,
      prompt: CLAIM_EXTRACTION_INSTRUCTIONS + "\n\n入力:\n" + buildExtractionInput(input.documentTitle, input.passages),
      timeoutMs: Math.min(
        Math.max(Number(process.env.RESOWORLD_CODEX_CLI_TIMEOUT_MS) || 90_000, 10_000),
        90_000,
      ),
    });
    let output;
    try {
      output = ClaimExtractionOutputSchema.parse(JSON.parse(await readFile(outputPath, "utf8")));
    } catch {
      throw new ClaimExtractionError("invalid_output", "Codex CLI output did not satisfy the Claim schema.");
    }
    return {
      provider: "codex" as const,
      responseId: null,
      model: input.model,
      attempts: 1,
      durationMs: Date.now() - startedAt,
      output,
      usage: { inputTokens: null, outputTokens: null, totalTokens: null },
    };
  } finally {
    activeRun = false;
    if (workspace) await rm(workspace, { recursive: true, force: true });
  }
}
