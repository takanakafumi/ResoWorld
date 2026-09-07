import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  previewLocalImport,
  resolveConfiguredImportRoot,
  localImportConfigFromEnvironment,
} from "../src/server/imports/local-files.ts";

type SuccessfulExtraction = {
  ok: true;
  extraction: {
    provider: "ollama";
    model: string;
    attempts: number;
    durationMs: number;
    usage: { inputTokens: number | null; outputTokens: number | null; totalTokens: number | null };
    document: { id: string; title: string; sha256: string };
    selectedPassageIds: string[];
    claims: unknown[];
  };
};

type FailedExtraction = {
  ok: false;
  error: { code: string; message: string; passageIds?: string[] };
};

async function loadLocalEnvironment() {
  const source = await readFile(join(process.cwd(), ".env.local"), "utf8");
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    if (process.env[key] !== undefined) continue;
    const rawValue = match[2].trim();
    process.env[key] = rawValue.replace(/^(['"])(.*)\1$/, "$2");
  }
}

async function main() {
  await loadLocalEnvironment();

  const arguments_ = process.argv.slice(2).filter((argument) => argument !== "--");
  const dryRun = arguments_.includes("--dry-run");
  const files = arguments_.filter((argument) => argument !== "--dry-run");
  if (files.length === 0) {
    throw new Error("Usage: pnpm extract:local -- [--dry-run] <file.txt> [file-2.txt ...]");
  }

  const provider = "ollama" as const;
  const model = process.env.RESOWORLD_OLLAMA_MODEL?.trim() || "qwen3.5:9b";
  const appUrl = process.env.RESOWORLD_LOCAL_APP_URL?.trim() || "http://localhost:3000";
  const importRoot = await resolveConfiguredImportRoot(localImportConfigFromEnvironment());
  const resultDirectory = join(importRoot, ".resoworld", "extraction-results");
  await mkdir(resultDirectory, { recursive: true });

  for (const file of files) {
    const preview = await previewLocalImport(file);
    if (dryRun) {
      process.stdout.write(`${file} passages=${preview.passages.length} characters=${preview.passages.reduce((total, passage) => total + passage.text.length, 0)}\n`);
      continue;
    }
    const response = await fetch(new URL("/api/extractions", appUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        file,
        documentSha256: preview.sha256,
        passageIds: preview.passages.map((passage) => passage.id),
        provider,
        model,
        consent: "process_selected_passages_locally",
      }),
    });
    const result = await response.json() as SuccessfulExtraction | FailedExtraction;
    if (!response.ok || !result.ok) {
      const failed = result as FailedExtraction;
      const passageCount = failed.error.passageIds?.length ?? 0;
      throw new Error(`${file}: ${failed.error.code}; failed passages=${passageCount}`);
    }

    const safeDocumentId = result.extraction.document.id.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const destination = join(resultDirectory, `${safeDocumentId}.${provider}.json`);
    const temporary = destination + ".tmp";
    await writeFile(temporary, JSON.stringify(result.extraction, null, 2) + "\n", "utf8");
    await rename(temporary, destination);
    process.stdout.write([
      file,
      `passages=${result.extraction.selectedPassageIds.length}`,
      `claims=${result.extraction.claims.length}`,
      `durationMs=${result.extraction.durationMs}`,
      `attempts=${result.extraction.attempts}`,
    ].join(" ") + "\n");
  }
}

void main();
