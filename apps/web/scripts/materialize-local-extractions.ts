import { readFile, realpath, rename, stat, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, parse, relative, resolve } from "node:path";

import { z } from "zod";

import { mergeExtractedDocument } from "../src/domain/imports/merge-review-dataset.ts";
import { buildJourneyImportCandidate, combineJourneyImportCandidates } from "../src/domain/imports/journey-candidate.ts";
import { ClaimSchema, KnowledgeDatasetSchema } from "../src/domain/knowledge/schema.ts";
import { localImportConfigFromEnvironment, previewLocalImport, resolveConfiguredImportRoot } from "../src/server/imports/local-files.ts";

const ExtractionResultSchema = z.object({
  provider: z.literal("ollama"),
  document: z.object({ id: z.string().min(1), sha256: z.string().length(64) }),
  claims: z.array(ClaimSchema),
});

async function loadLocalEnvironment() {
  const source = await readFile(join(process.cwd(), ".env.local"), "utf8");
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    if (process.env[key] !== undefined) continue;
    process.env[key] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
}

function parseArguments() {
  const arguments_ = process.argv.slice(2).filter((argument) => argument !== "--");
  const outputIndex = arguments_.indexOf("--output");
  if (outputIndex < 0 || !arguments_[outputIndex + 1]) {
    throw new Error("Usage: pnpm materialize:local-extractions -- --output <draft.json> <file.txt> [file-2.txt ...]");
  }
  const output = arguments_[outputIndex + 1];
  const labelIndex = arguments_.indexOf("--journey-label");
  const journeyLabel = labelIndex >= 0 ? arguments_[labelIndex + 1] : undefined;
  if (labelIndex >= 0 && !journeyLabel) throw new Error("--journey-label requires a value.");
  const excluded = new Set([outputIndex, outputIndex + 1, ...(labelIndex >= 0 ? [labelIndex, labelIndex + 1] : [])]);
  const files = arguments_.filter((_, index) => !excluded.has(index));
  if (files.length === 0) throw new Error("At least one source document is required.");
  if (isAbsolute(output) || basename(output) !== output || !output.toLocaleLowerCase("en-US").endsWith(".json")) {
    throw new Error("Output must be a JSON filename inside RESOWORLD_REVIEW_DIR.");
  }
  return { output, files, journeyLabel };
}

async function main() {
  await loadLocalEnvironment();
  const { output, files, journeyLabel } = parseArguments();
  const reviewRootSetting = process.env.RESOWORLD_REVIEW_DIR?.trim();
  const reviewFileSetting = process.env.RESOWORLD_REVIEW_FILE?.trim();
  if (!reviewRootSetting || !isAbsolute(reviewRootSetting) || !reviewFileSetting || isAbsolute(reviewFileSetting)) {
    throw new Error("RESOWORLD_REVIEW_DIR and RESOWORLD_REVIEW_FILE must configure a local baseline.");
  }

  const reviewRoot = await realpath(reviewRootSetting);
  if (!(await stat(reviewRoot)).isDirectory()) throw new Error("Review root is not a directory.");
  const baselinePath = await realpath(resolve(reviewRoot, reviewFileSetting));
  const relativeBaseline = relative(reviewRoot, baselinePath);
  if (relativeBaseline.startsWith("..") || isAbsolute(relativeBaseline)) throw new Error("Baseline is outside the review root.");
  let dataset = KnowledgeDatasetSchema.parse(JSON.parse(await readFile(baselinePath, "utf8")));

  const importRoot = await resolveConfiguredImportRoot(localImportConfigFromEnvironment());
  const resultDirectory = join(importRoot, ".resoworld", "extraction-results");
  let addedDocuments = 0;
  let addedClaims = 0;
  const journeyCandidates = [];

  for (const file of files) {
    const document = await previewLocalImport(file);
    const safeDocumentId = document.id.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const extraction = ExtractionResultSchema.parse(JSON.parse(await readFile(join(resultDirectory, `${safeDocumentId}.ollama.json`), "utf8")));
    if (extraction.document.id !== document.id || extraction.document.sha256 !== document.sha256) {
      throw new Error(`${file}: extraction does not match the current source document.`);
    }
    const canonicalDocument = dataset.documents.find(({ sha256 }) => sha256 === document.sha256);
    const candidateDocument = canonicalDocument ? { ...document, id: canonicalDocument.id } : document;
    const candidateClaims = extraction.claims.map((claim) => ({
      ...claim,
      evidence: claim.evidence.map((evidence) => ({
        ...evidence,
        passage: { ...evidence.passage, documentId: candidateDocument.id },
      })),
    }));
    journeyCandidates.push(buildJourneyImportCandidate(candidateDocument, candidateClaims));
    const merged = mergeExtractedDocument({ dataset, document, claims: extraction.claims });
    dataset = merged.dataset;
    if (merged.status === "added") addedDocuments += 1;
    addedClaims += merged.addedClaimCount;
  }

  const destination = resolve(reviewRoot, output);
  const relativeDestination = relative(reviewRoot, destination);
  if (relativeDestination.startsWith("..") || isAbsolute(relativeDestination)) throw new Error("Output is outside the review root.");
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, JSON.stringify(dataset, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  const journeyOutput = `${parse(output).name}.journey-candidate.json`;
  const journey = combineJourneyImportCandidates(journeyCandidates, {
    id: `journey-${parse(output).name.replace(/[^a-zA-Z0-9._-]+/g, "-")}`,
    label: journeyLabel ?? journeyCandidates.map(({ label }) => label).join(" / "),
  });
  const journeyDestination = resolve(reviewRoot, journeyOutput);
  const journeyTemporary = `${journeyDestination}.tmp`;
  await writeFile(journeyTemporary, JSON.stringify(journey, null, 2) + "\n", "utf8");
  await rename(journeyTemporary, journeyDestination);
  process.stdout.write([
    `output=${output}`,
    `documents=${dataset.documents.length}`,
    `claims=${dataset.claims.length}`,
    `addedDocuments=${addedDocuments}`,
    `addedClaims=${addedClaims}`,
    `journeyCandidate=${journeyOutput}`,
    `placeCandidates=${journey.placeCandidates.length}`,
    "status=review_required",
  ].join(" ") + "\n");
}

void main();
