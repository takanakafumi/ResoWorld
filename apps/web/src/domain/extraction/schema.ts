import { z } from "zod";

import {
  ClaimKindSchema,
  DocumentVoiceSchema,
  EntityReferenceSchema,
  EpistemicStateSchema,
  PlaceReferenceSchema,
  SourceNatureSchema,
} from "@/domain/knowledge/schema";

const ExtractedHistoricalTimeSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("calendar"),
    label: z.string().trim().min(1).nullable(),
    startYear: z.number().int(),
    endYear: z.number().int().nullable(),
    approximate: z.boolean(),
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
    label: z.string().trim().min(1).nullable(),
  }),
]);

const ExtractedEvidenceSchema = z.object({
  passageId: z.string().trim().min(1),
  role: z.enum(["supports", "contradicts", "context"]),
  sourceNature: SourceNatureSchema,
  documentVoice: DocumentVoiceSchema,
  sourceTitle: z.string().trim().min(1).nullable(),
  sourceUrl: z.url().nullable(),
  note: z.string().trim().min(1).nullable(),
});

const ExtractedObjectSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("entity"),
    entity: EntityReferenceSchema.omit({ id: true }),
  }),
  z.object({
    kind: z.literal("literal"),
    value: z.union([z.string(), z.number(), z.boolean()]),
  }),
]);

export const ExtractedClaimCandidateSchema = z.object({
  statement: z.string().trim().min(1),
  subject: EntityReferenceSchema.omit({ id: true }),
  predicate: z.string().regex(/^[a-z][a-z0-9_]*$/),
  object: ExtractedObjectSchema,
  claimKind: ClaimKindSchema,
  originType: z.enum(["user", "ai"]),
  epistemic: EpistemicStateSchema,
  historicalTime: ExtractedHistoricalTimeSchema.nullable(),
  places: z.array(PlaceReferenceSchema.omit({ entityId: true })),
  evidence: z.array(ExtractedEvidenceSchema).min(1),
}).superRefine((claim, context) => {
  if (!claim.places.some(({ role }) => role === "intended_place")) return;
  const hasDirectUserEvidence = claim.evidence.some(({ role, documentVoice }) =>
    role === "supports" && (documentVoice === "user-quote" || documentVoice === "user-narrator"),
  );
  if (claim.originType !== "user" || !hasDirectUserEvidence) {
    context.addIssue({ code: "custom", path: ["places"], message: "intended_place requires direct user-authored supporting evidence." });
  }
});

export const ClaimExtractionOutputSchema = z.object({
  claims: z.array(ExtractedClaimCandidateSchema),
});

const ClaimExtractionRequestBase = {
  file: z.string().trim().min(1),
  documentSha256: z.string().regex(/^[A-Fa-f0-9]{64}$/),
  passageIds: z.array(z.string().trim().min(1)).min(1).max(500),
};

export const ClaimExtractionRequestSchema = z.object({
  ...ClaimExtractionRequestBase,
  provider: z.literal("lmstudio"),
  model: z.string().trim().min(1),
  consent: z.literal("process_selected_passages_locally"),
});

export type ClaimExtractionOutput = z.infer<
  typeof ClaimExtractionOutputSchema
>;
export type ExtractedClaimCandidate = z.infer<
  typeof ExtractedClaimCandidateSchema
>;
