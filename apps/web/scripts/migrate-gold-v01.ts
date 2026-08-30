import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { z } from "zod";

import {
  HistoricalTimeSchema,
  KnowledgeDatasetSchema,
  SCHEMA_VERSION,
  type Claim,
  type HistoricalTime,
} from "../src/domain/knowledge/schema.ts";

const LegacyDocumentSchema = z.object({
  id: z.string(),
  title: z.string(),
  path: z.string(),
  sha256: z.string(),
  authorType: z.string(),
  privacy: z.string(),
  observedAt: z.string().nullable(),
  documentedAt: z.string().nullable(),
  dateStatus: z.string(),
});

const LegacyClaimSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  statement: z.string(),
  subject: z.object({
    name: z.string(),
    type: z.string(),
  }),
  predicate: z.string(),
  object: z.object({
    name: z.string(),
    type: z.string(),
  }),
  sourceNature: z.string(),
  originType: z.string(),
  documentVoice: z.string(),
  reviewStatus: z.string(),
  epistemicStatus: z.string(),
  historicalTime: z
    .object({
      label: z.string(),
      precision: z.string(),
    })
    .nullable(),
  places: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
    }),
  ),
  evidence: z.object({
    startLine: z.number(),
    endLine: z.number(),
    quote: z.string(),
  }),
  sourceRef: z.string().url().optional(),
});

const LegacyDatasetSchema = z.object({
  datasetId: z.string(),
  privacy: z.string(),
  documents: z.array(LegacyDocumentSchema),
  claims: z.array(LegacyClaimSchema),
});

type LegacyClaim = z.infer<typeof LegacyClaimSchema>;

const epistemicMap: Record<
  string,
  Claim["epistemic"]
> = {
  "actionable-suggestion": {
    verification: "not-applicable",
    modality: "suggestion",
  },
  "explicitly-hypothetical": {
    verification: "unverified",
    modality: "hypothetical",
  },
  "interpretive-synthesis": {
    verification: "unverified",
    modality: "synthesis",
  },
  "interpretive-unverified": {
    verification: "unverified",
    modality: "interpretive",
  },
  "personal-experience": {
    verification: "personal-evidence",
    modality: "asserted",
  },
  "personal-interpretation": {
    verification: "personal-evidence",
    modality: "interpretive",
  },
  "personal-observation": {
    verification: "personal-evidence",
    modality: "asserted",
  },
  "personal-question": {
    verification: "not-applicable",
    modality: "question",
  },
  "personal-reflection": {
    verification: "personal-evidence",
    modality: "interpretive",
  },
  "qualified-unverified": {
    verification: "unverified",
    modality: "qualified",
  },
  "source-cited-not-checked": {
    verification: "source-not-checked",
    modality: "asserted",
  },
  "source-missing-in-passage": {
    verification: "unverified",
    modality: "asserted",
  },
  "source-reference-unverified": {
    verification: "source-not-checked",
    modality: "asserted",
  },
  "tradition-as-stated": {
    verification: "unverified",
    modality: "asserted",
  },
  "unverified-in-dataset": {
    verification: "unverified",
    modality: "asserted",
  },
};

function toHistoricalTime(
  value: LegacyClaim["historicalTime"],
): HistoricalTime | null {
  if (!value) {
    return null;
  }

  if (value.precision === "unknown") {
    return {
      kind: "unknown",
      label: value.label,
    };
  }

  const precision =
    value.precision === "century" ? "broad-period" : value.precision;

  return HistoricalTimeSchema.parse({
    kind: "named",
    label: value.label,
    precision,
  });
}

function toClaimKind(claim: LegacyClaim): Claim["claimKind"] {
  const modality = epistemicMap[claim.epistemicStatus]?.modality;

  if (modality === "question") return "question";
  if (modality === "suggestion") return "suggestion";
  if (modality === "hypothetical") return "hypothesis";
  if (modality === "synthesis") return "synthesis";
  if (claim.sourceNature === "Observation") return "observation";
  if (claim.sourceNature === "UserHypothesis") return "hypothesis";
  if (claim.sourceNature === "AISuggestion") return "synthesis";
  return "assertion";
}

function migrateClaim(
  claim: LegacyClaim,
  documentSha256: string,
): Claim {
  const epistemic = epistemicMap[claim.epistemicStatus];
  if (!epistemic) {
    throw new Error(`Unknown epistemicStatus on ${claim.id}: ${claim.epistemicStatus}`);
  }

  return {
    schemaVersion: SCHEMA_VERSION,
    id: claim.id,
    statement: claim.statement,
    subject: claim.subject as Claim["subject"],
    predicate: claim.predicate,
    object: {
      kind: "entity",
      entity: claim.object as Claim["subject"],
    },
    qualifiers: {},
    claimKind: toClaimKind(claim),
    originType: claim.originType as Claim["originType"],
    reviewStatus: claim.reviewStatus as Claim["reviewStatus"],
    epistemic,
    historicalTime: toHistoricalTime(claim.historicalTime),
    places: claim.places as Claim["places"],
    evidence: [
      {
        role: "supports",
        sourceNature: claim.sourceNature as Claim["evidence"][number]["sourceNature"],
        documentVoice: claim.documentVoice as Claim["evidence"][number]["documentVoice"],
        passage: {
          documentId: claim.documentId,
          documentSha256,
          startLine: claim.evidence.startLine,
          endLine: claim.evidence.endLine,
          quote: claim.evidence.quote,
        },
        source: claim.sourceRef ? { url: claim.sourceRef } : undefined,
      },
    ],
    createdAt: "2026-08-30T00:00:00.000Z",
  };
}

async function main() {
  const [, , inputArgument, outputArgument] = process.argv;
  if (!inputArgument || !outputArgument) {
    throw new Error(
      "Usage: node --experimental-strip-types scripts/migrate-gold-v01.ts <input.json> <output.json>",
    );
  }

  const inputPath = resolve(inputArgument);
  const outputPath = resolve(outputArgument);
  if (inputPath === outputPath) {
    throw new Error("Input and output paths must differ");
  }

  const legacy = LegacyDatasetSchema.parse(
    JSON.parse(await readFile(inputPath, "utf8")),
  );
  const documentById = new Map(
    legacy.documents.map((document) => [document.id, document]),
  );

  const migrated = KnowledgeDatasetSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    datasetId: `${legacy.datasetId}-schema-${SCHEMA_VERSION}`,
    privacy: "local-only",
    documents: legacy.documents,
    sources: [],
    claims: legacy.claims.map((claim) => {
      const document = documentById.get(claim.documentId);
      if (!document) {
        throw new Error(`Unknown document on ${claim.id}: ${claim.documentId}`);
      }
      return migrateClaim(claim, document.sha256);
    }),
  });

  await writeFile(outputPath, `${JSON.stringify(migrated, null, 2)}\n`, "utf8");
  console.log(
    `Migrated ${migrated.claims.length} Claims to schema ${SCHEMA_VERSION}: ${outputPath}`,
  );
}

await main();
