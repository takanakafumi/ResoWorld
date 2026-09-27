import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

import { CLAIM_EXTRACTION_PROMPT_VERSION } from "@/domain/extraction/prompt";
import { ClaimExtractionOutputSchema } from "@/domain/extraction/schema";
import {
  localImportConfigFromEnvironment,
  resolveConfiguredImportRoot,
} from "@/server/imports/local-files";

import type { CompletedExtractionBatch, ExtractionProvider } from "./provider";

const BatchResultSchema = z.object({
  provider: z.literal("lmstudio"),
  responseId: z.null(),
  model: z.string().min(1),
  attempts: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  output: ClaimExtractionOutputSchema,
  usage: z.object({
    inputTokens: z.number().int().nonnegative().nullable(),
    outputTokens: z.number().int().nonnegative().nullable(),
    totalTokens: z.number().int().nonnegative().nullable(),
  }),
});

const CheckpointSchema = z.object({
  schemaVersion: z.literal("1"),
  documentSha256: z.string().regex(/^[a-f0-9]{64}$/),
  provider: z.literal("lmstudio"),
  model: z.string().min(1),
  promptVersion: z.string().min(1),
  batches: z.record(z.string(), z.object({
    id: z.string(),
    passageIds: z.array(z.string().min(1)).min(1),
    result: BatchResultSchema,
  })),
});

type ExtractionCheckpoint = z.infer<typeof CheckpointSchema>;

function checkpointKey(input: {
  documentSha256: string;
  provider: ExtractionProvider;
  model: string;
}) {
  return createHash("sha256")
    .update([
      input.documentSha256.toLowerCase(),
      input.provider,
      input.model,
      CLAIM_EXTRACTION_PROMPT_VERSION,
    ].join("\n"))
    .digest("hex");
}

async function checkpointPath(input: {
  documentSha256: string;
  provider: ExtractionProvider;
  model: string;
}) {
  const root = await resolveConfiguredImportRoot(localImportConfigFromEnvironment());
  const directory = join(root, ".resoworld", "extractions");
  await mkdir(directory, { recursive: true });
  return join(directory, checkpointKey(input) + ".json");
}

export async function loadExtractionCheckpoint(input: {
  documentSha256: string;
  provider: ExtractionProvider;
  model: string;
}) {
  const path = await checkpointPath(input);
  try {
    const parsed = CheckpointSchema.parse(JSON.parse(await readFile(path, "utf8")));
    if (
      parsed.documentSha256 !== input.documentSha256.toLowerCase() ||
      parsed.provider !== input.provider ||
      parsed.model !== input.model ||
      parsed.promptVersion !== CLAIM_EXTRACTION_PROMPT_VERSION
    ) return new Map<string, CompletedExtractionBatch>();
    return new Map(Object.values(parsed.batches).map((batch) => [batch.id, batch]));
  } catch {
    return new Map<string, CompletedExtractionBatch>();
  }
}

export async function saveExtractionCheckpoint(input: {
  documentSha256: string;
  provider: Exclude<ExtractionProvider, "openai">;
  model: string;
  batches: Map<string, CompletedExtractionBatch>;
}) {
  const path = await checkpointPath(input);
  const checkpoint: ExtractionCheckpoint = {
    schemaVersion: "1",
    documentSha256: input.documentSha256.toLowerCase(),
    provider: input.provider,
    model: input.model,
    promptVersion: CLAIM_EXTRACTION_PROMPT_VERSION,
    batches: Object.fromEntries(input.batches),
  };
  const temporaryPath = path + ".tmp";
  await writeFile(temporaryPath, JSON.stringify(checkpoint, null, 2) + "\n", "utf8");
  await rename(temporaryPath, path);
}
