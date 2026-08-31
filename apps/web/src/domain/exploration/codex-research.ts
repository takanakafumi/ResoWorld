import { z } from "zod";

export const CodexResearchRequestSchema = z
  .object({
    datasetId: z.string().trim().min(1).max(160),
    suggestionId: z.string().trim().min(1).max(160),
    consent: z.literal("run_codex_cli_research"),
  })
  .strict();

export const CodexResearchSourceSchema = z
  .object({
    title: z.string().trim().min(1).max(300),
    url: z.url(),
  })
  .strict();

export const CodexResearchCandidateSchema = z
  .object({
    targetName: z.string().trim().min(1).max(200),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    reason: z.string().trim().min(1).max(1_200),
    expectedObservation: z.string().trim().min(1).max(1_200),
    uncertainty: z.string().trim().min(1).max(800),
    sources: z.array(CodexResearchSourceSchema).min(1).max(4),
  })
  .strict();

export const CodexResearchOutputSchema = z
  .object({
    summary: z.string().trim().min(1).max(1_200),
    candidates: z.array(CodexResearchCandidateSchema).min(1).max(4),
    humanReview: z.array(z.string().trim().min(1).max(800)).min(1).max(6),
  })
  .strict();

export type CodexResearchOutput = z.infer<typeof CodexResearchOutputSchema>;

export const CodexResearchJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    candidates: {
      type: "array",
      minItems: 1,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          targetName: { type: "string" },
          actionType: {
            type: "string",
            enum: ["field_visit", "literature_research", "revisit"],
          },
          reason: { type: "string" },
          expectedObservation: { type: "string" },
          uncertainty: { type: "string" },
          sources: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                title: { type: "string" },
                url: { type: "string" },
              },
              required: ["title", "url"],
            },
          },
        },
        required: [
          "targetName",
          "actionType",
          "reason",
          "expectedObservation",
          "uncertainty",
          "sources",
        ],
      },
    },
    humanReview: {
      type: "array",
      minItems: 1,
      maxItems: 6,
      items: { type: "string" },
    },
  },
  required: ["summary", "candidates", "humanReview"],
} as const;
