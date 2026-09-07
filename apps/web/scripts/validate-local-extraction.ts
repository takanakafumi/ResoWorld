import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { z } from "zod";

import { ClaimSchema } from "../src/domain/knowledge/schema.ts";
import { reviewPriorityTier } from "../src/domain/review/priority.ts";
import {
  localImportConfigFromEnvironment,
  previewLocalImport,
  resolveConfiguredImportRoot,
} from "../src/server/imports/local-files.ts";

const ExtractionResultSchema = z.object({
  provider: z.literal("ollama"),
  model: z.string().min(1),
  document: z.object({ id: z.string().min(1), sha256: z.string().length(64) }),
  selectedPassageIds: z.array(z.string().min(1)),
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

async function main() {
  await loadLocalEnvironment();
  const files = process.argv.slice(2).filter((argument) => argument !== "--");
  if (files.length === 0) throw new Error("Usage: pnpm validate:local-extraction -- <file.txt> [file-2.txt ...]");

  const importRoot = await resolveConfiguredImportRoot(localImportConfigFromEnvironment());
  const resultDirectory = join(importRoot, ".resoworld", "extraction-results");
  const allClaimIds = new Set<string>();

  for (const file of files) {
    const preview = await previewLocalImport(file);
    const safeDocumentId = preview.id.replace(/[^a-zA-Z0-9._-]+/g, "-");
    const rawResult = JSON.parse(await readFile(join(resultDirectory, `${safeDocumentId}.ollama.json`), "utf8"));
    const parsed = ExtractionResultSchema.safeParse(rawResult);
    if (!parsed.success) throw new Error(`${file}: invalid schema; issues=${parsed.error.issues.length}`);
    const result = parsed.data;
    if (result.document.id !== preview.id || result.document.sha256 !== preview.sha256) {
      throw new Error(`${file}: document identity mismatch`);
    }
    if (new Set(result.selectedPassageIds).size !== preview.passages.length || preview.passages.some((passage) => !result.selectedPassageIds.includes(passage.id))) {
      throw new Error(`${file}: selected Passage coverage mismatch`);
    }

    const passages = new Map(preview.passages.map((passage) => [
      `${passage.sha256}:${passage.startLine}:${passage.endLine}`,
      passage,
    ]));
    let evidenceCount = 0;
    for (const claim of result.claims) {
      if (allClaimIds.has(claim.id)) throw new Error(`${file}: duplicate Claim ID across results`);
      allClaimIds.add(claim.id);
      for (const evidence of claim.evidence) {
        evidenceCount += 1;
        const passage = evidence.passage;
        const source = passages.get(`${passage.passageSha256}:${passage.startLine}:${passage.endLine}`);
        if (!source || passage.documentId !== preview.id || passage.documentSha256 !== preview.sha256 || passage.quote !== source.text) {
          throw new Error(`${file}: Evidence does not match an immutable source Passage`);
        }
      }
    }

    const tiers = { focus: 0, supporting: 0, resolved: 0 };
    for (const claim of result.claims) tiers[reviewPriorityTier(claim)] += 1;
    process.stdout.write([
      file,
      `passages=${preview.passages.length}`,
      `claims=${result.claims.length}`,
      `evidence=${evidenceCount}`,
      `focus=${tiers.focus}`,
      `supporting=${tiers.supporting}`,
      `resolved=${tiers.resolved}`,
      "integrity=ok",
    ].join(" ") + "\n");
  }
}

void main();
