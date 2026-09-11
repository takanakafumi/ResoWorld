import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";

import { buildJourneySuggestionContext } from "../src/domain/exploration/suggestion-drafts.ts";
import { KnowledgeDatasetSchema } from "../src/domain/knowledge/schema.ts";
import type { ReviewAtlas, ReviewDataset } from "../src/domain/review/types.ts";
import { requestOllamaSuggestionDraft } from "../src/server/exploration/ollama-suggestions.ts";

async function loadLocalEnvironment() {
  const source = await readFile(join(process.cwd(), ".env.local"), "utf8");
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match || process.env[match[1].trim()] !== undefined) continue;
    process.env[match[1].trim()] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

async function main() {
  await loadLocalEnvironment();
  const args = process.argv.slice(2).filter((value) => value !== "--");
  const dryRun = args.includes("--dry-run");
  const journeyIds = args.filter((value) => value !== "--dry-run");
  if (journeyIds.length === 0) throw new Error("Usage: pnpm suggest:local -- [--dry-run] <journey-id> [journey-id-2 ...]");
  const root = process.env.RESOWORLD_REVIEW_DIR?.trim();
  const datasetFile = process.env.RESOWORLD_REVIEW_FILE?.trim();
  const atlasFile = process.env.RESOWORLD_REVIEW_ATLAS_FILE?.trim();
  if (!root || !datasetFile || !atlasFile || !isAbsolute(root)) {
    throw new Error("RESOWORLD_REVIEW_DIR, RESOWORLD_REVIEW_FILE and RESOWORLD_REVIEW_ATLAS_FILE are required.");
  }
  const resolvedRoot = resolve(root);
  const resolveInsideRoot = (path: string) => {
    if (isAbsolute(path)) throw new Error("Review filenames must be relative.");
    const result = resolve(resolvedRoot, path);
    const fromRoot = relative(resolvedRoot, result);
    if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new Error("Review file escapes RESOWORLD_REVIEW_DIR.");
    return result;
  };
  const source = KnowledgeDatasetSchema.parse(JSON.parse(await readFile(resolveInsideRoot(datasetFile), "utf8")));
  const atlas = JSON.parse(await readFile(resolveInsideRoot(atlasFile), "utf8")) as ReviewAtlas;
  const configuredStatus = process.env.RESOWORLD_REVIEW_INITIAL_STATUS?.trim();
  const claims = ["suggested", "needs_review", "confirmed", "rejected"].includes(configuredStatus ?? "")
    ? source.claims.map((claim) => ({ ...claim, reviewStatus: configuredStatus as typeof claim.reviewStatus }))
    : source.claims;
  const dataset = { ...source, claims, atlas } as ReviewDataset;
  const outputDirectory = join(resolvedRoot, ".resoworld", "suggestion-drafts");
  await mkdir(outputDirectory, { recursive: true });

  for (const journeyId of journeyIds) {
    const context = buildJourneySuggestionContext(dataset, journeyId);
    if (context.connections.length === 0) {
      process.stdout.write(JSON.stringify({ journeyId, status: "blocked", reason: "no_knowledge_connections", spots: context.spots.length, claims: context.claims.length, connections: 0 }) + "\n");
      continue;
    }
    if (dryRun) {
      process.stdout.write(JSON.stringify({
        journeyId, spots: context.spots.length, claims: context.claims.length, connections: context.connections.length,
      }) + "\n");
      continue;
    }
    const result = await requestOllamaSuggestionDraft({
      context,
      baseUrl: process.env.RESOWORLD_OLLAMA_BASE_URL,
      model: process.env.RESOWORLD_OLLAMA_MODEL,
    });
    const destination = join(outputDirectory, journeyId.replace(/[^a-zA-Z0-9._-]+/g, "-") + ".ollama.json");
    const temporary = destination + ".tmp";
    await writeFile(temporary, JSON.stringify({
      schemaVersion: "0.1.0",
      createdAt: new Date().toISOString(),
      journeyId,
      provider: result.provider,
      model: result.model,
      attempts: result.attempts,
      usage: result.usage,
      suggestions: result.output.suggestions,
    }, null, 2) + "\n", "utf8");
    await rename(temporary, destination);
    process.stdout.write(journeyId + " suggestions=" + result.output.suggestions.length + " file=" + destination + "\n");
  }
}

void main();
