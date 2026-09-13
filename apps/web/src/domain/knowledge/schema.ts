import { z } from "zod";

import { DataTransportPolicySchema } from "../transport/policy.ts";

export const SCHEMA_VERSION = "0.2.0" as const;

const IdSchema = z.string().trim().min(1);
const Sha256Schema = z.string().regex(/^[A-Fa-f0-9]{64}$/);
const DateOnlySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const EntityTypeSchema = z.enum([
  "Place",
  "Person",
  "Group",
  "Deity",
  "Event",
  "Period",
  "Belief",
  "Artifact",
  "Concept",
]);

export const EntityReferenceSchema = z.object({
  id: IdSchema.optional(),
  name: z.string().trim().min(1),
  type: EntityTypeSchema,
});

export const ClaimObjectSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("entity"),
    entity: EntityReferenceSchema,
  }),
  z.object({
    kind: z.literal("literal"),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
]);

export const HistoricalTimeSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("calendar"),
      label: z.string().trim().min(1).optional(),
      startYear: z.number().int(),
      endYear: z.number().int().optional(),
      approximate: z.boolean().default(false),
    })
    .superRefine((value, context) => {
      if (value.endYear !== undefined && value.endYear < value.startYear) {
        context.addIssue({
          code: "custom",
          path: ["endYear"],
          message: "endYear must not precede startYear",
        });
      }
    }),
  z.object({
    kind: z.literal("named"),
    label: z.string().trim().min(1),
    precision: z.enum([
      "period",
      "broad-period",
      "approximate-range",
      "broad-range",
      "non-calendar",
      "mixed",
    ]),
  }),
  z.object({
    kind: z.literal("unknown"),
    label: z.string().trim().min(1).optional(),
  }),
]);

export const PlaceRoleSchema = z.enum([
  "observed_place",
  "subject_place",
  "evidence_place",
  "suggested_place",
  "intended_place",
]);

export const PlaceReferenceSchema = z.object({
  entityId: IdSchema.optional(),
  name: z.string().trim().min(1),
  role: PlaceRoleSchema,
});

export const SourceNatureSchema = z.enum([
  "Observation",
  "HistoricalSource",
  "Archaeology",
  "Tradition",
  "UserHypothesis",
  "Alternative",
  "AISuggestion",
]);

export const DocumentVoiceSchema = z.enum([
  "user-quote",
  "user-narrator",
  "ai-narrator",
  "ai-attributed-to-user",
  "ai-paraphrase-of-source",
  "external-source",
  "unknown",
]);

export const PassageAnchorSchema = z
  .object({
    documentId: IdSchema,
    documentSha256: Sha256Schema,
    startLine: z.number().int().positive(),
    endLine: z.number().int().positive(),
    quote: z.string().min(1),
    passageSha256: Sha256Schema.optional(),
  })
  .superRefine((value, context) => {
    if (value.endLine < value.startLine) {
      context.addIssue({
        code: "custom",
        path: ["endLine"],
        message: "endLine must not precede startLine",
      });
    }
  });

export const SourceReferenceSchema = z
  .object({
    sourceId: IdSchema.optional(),
    title: z.string().trim().min(1).optional(),
    url: z.url().optional(),
  })
  .refine((value) => value.sourceId || value.title || value.url, {
    message: "A source reference needs an id, title, or URL",
  });

export const EvidenceSchema = z.object({
  id: IdSchema.optional(),
  role: z.enum(["supports", "contradicts", "context"]),
  sourceNature: SourceNatureSchema,
  documentVoice: DocumentVoiceSchema,
  passage: PassageAnchorSchema,
  source: SourceReferenceSchema.optional(),
  note: z.string().trim().min(1).optional(),
});

export const ClaimKindSchema = z.enum([
  "assertion",
  "observation",
  "question",
  "hypothesis",
  "suggestion",
  "synthesis",
]);

export const EpistemicStateSchema = z.object({
  verification: z.enum([
    "personal-evidence",
    "unverified",
    "source-not-checked",
    "source-checked",
    "not-applicable",
  ]),
  modality: z.enum([
    "asserted",
    "qualified",
    "hypothetical",
    "interpretive",
    "synthesis",
    "question",
    "suggestion",
  ]),
});

export const ClaimSchema = z.object({
  schemaVersion: z.literal(SCHEMA_VERSION),
  id: IdSchema,
  statement: z.string().trim().min(1),
  subject: EntityReferenceSchema,
  predicate: z.string().regex(/^[a-z][a-z0-9_]*$/),
  object: ClaimObjectSchema,
  qualifiers: z.record(z.string(), z.unknown()).default({}),
  claimKind: ClaimKindSchema,
  originType: z.enum(["user", "ai", "imported", "system"]),
  reviewStatus: z.enum([
    "suggested",
    "confirmed",
    "rejected",
    "needs_review",
  ]),
  epistemic: EpistemicStateSchema,
  historicalTime: HistoricalTimeSchema.nullable(),
  places: z.array(PlaceReferenceSchema).default([]),
  evidence: z.array(EvidenceSchema).min(1),
  createdAt: z.iso.datetime(),
});

export const DocumentSchema = z.object({
  id: IdSchema,
  title: z.string().trim().min(1),
  path: z.string().trim().min(1),
  sha256: Sha256Schema,
  authorType: z.enum([
    "user-authored",
    "ai-assisted-summary",
    "external-source",
    "unknown",
  ]),
  privacy: z.enum(["private", "anonymized", "public"]),
  observedAt: DateOnlySchema.nullable(),
  documentedAt: DateOnlySchema.nullable(),
  dateStatus: z.enum(["known", "partial", "not-present-in-source"]),
});

export const SourceSchema = z.object({
  id: IdSchema,
  title: z.string().trim().min(1),
  url: z.url().optional(),
  accessedAt: DateOnlySchema.optional(),
  note: z.string().trim().min(1).optional(),
});

export const KnowledgeDatasetSchema = z
  .object({
    schemaVersion: z.literal(SCHEMA_VERSION),
    datasetId: IdSchema,
    privacy: z.enum(["local-only", "remote-enabled", "hybrid", "anonymized-demo"]),
    transportPolicy: DataTransportPolicySchema.optional(),
    documents: z.array(DocumentSchema).min(1),
    sources: z.array(SourceSchema).default([]),
    claims: z.array(ClaimSchema).min(1),
  })
  .superRefine((dataset, context) => {
    const documentById = new Map(
      dataset.documents.map((document) => [document.id, document]),
    );
    const seenDocumentIds = new Set<string>();
    const seenClaimIds = new Set<string>();
    const seenSourceIds = new Set<string>();

    dataset.documents.forEach((document, index) => {
      if (seenDocumentIds.has(document.id)) {
        context.addIssue({
          code: "custom",
          path: ["documents", index, "id"],
          message: `Duplicate document id: ${document.id}`,
        });
      }
      seenDocumentIds.add(document.id);
    });

    dataset.sources.forEach((source, index) => {
      if (seenSourceIds.has(source.id)) {
        context.addIssue({
          code: "custom",
          path: ["sources", index, "id"],
          message: `Duplicate source id: ${source.id}`,
        });
      }
      seenSourceIds.add(source.id);
    });

    dataset.claims.forEach((claim, claimIndex) => {
      if (seenClaimIds.has(claim.id)) {
        context.addIssue({
          code: "custom",
          path: ["claims", claimIndex, "id"],
          message: `Duplicate claim id: ${claim.id}`,
        });
      }
      seenClaimIds.add(claim.id);

      claim.evidence.forEach((evidence, evidenceIndex) => {
        const document = documentById.get(evidence.passage.documentId);
        if (!document) {
          context.addIssue({
            code: "custom",
            path: ["claims", claimIndex, "evidence", evidenceIndex, "passage"],
            message: `Unknown document: ${evidence.passage.documentId}`,
          });
          return;
        }

        if (
          document.sha256.toLowerCase() !==
          evidence.passage.documentSha256.toLowerCase()
        ) {
          context.addIssue({
            code: "custom",
            path: [
              "claims",
              claimIndex,
              "evidence",
              evidenceIndex,
              "passage",
              "documentSha256",
            ],
            message: "Evidence document hash does not match the document record",
          });
        }
      });
    });
  });

export type EntityType = z.infer<typeof EntityTypeSchema>;
export type EntityReference = z.infer<typeof EntityReferenceSchema>;
export type HistoricalTime = z.infer<typeof HistoricalTimeSchema>;
export type PassageAnchor = z.infer<typeof PassageAnchorSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Claim = z.infer<typeof ClaimSchema>;
export type Document = z.infer<typeof DocumentSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type KnowledgeDataset = z.infer<typeof KnowledgeDatasetSchema>;
