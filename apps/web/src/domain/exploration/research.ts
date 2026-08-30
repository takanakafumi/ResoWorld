import { z } from "zod";

export const ExplorationResearchRequestSchema = z
  .object({
    datasetId: z.string().trim().min(1).max(160),
    suggestionId: z.string().trim().min(1).max(160),
    consent: z.literal("send_minimized_research_brief_to_openai"),
  })
  .strict();

export const ExplorationResearchBriefSchema = z
  .object({
    targetName: z.string().trim().min(1).max(200),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    question: z.string().trim().min(1).max(1_000),
    missingInformation: z.string().trim().min(1).max(1_000),
    expectedObservation: z.string().trim().min(1).max(1_000),
  })
  .strict();

export const ExplorationResearchCandidateSchema = z
  .object({
    targetName: z.string().trim().min(1).max(200),
    actionType: z.enum(["field_visit", "literature_research", "revisit"]),
    reason: z.string().trim().min(1).max(1_200),
    expectedObservation: z.string().trim().min(1).max(1_200),
    uncertainty: z.string().trim().min(1).max(800),
    sourceUrls: z.array(z.url()).min(1).max(4),
  })
  .strict();

export const ExplorationResearchOutputSchema = z
  .object({
    summary: z.string().trim().min(1).max(1_200),
    candidates: z.array(ExplorationResearchCandidateSchema).min(1).max(4),
  })
  .strict();

export type ExplorationResearchBrief = z.infer<
  typeof ExplorationResearchBriefSchema
>;
export type ExplorationResearchOutput = z.infer<
  typeof ExplorationResearchOutputSchema
>;

export const ExplorationResearchJsonSchema = {
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
          sourceUrls: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: { type: "string", format: "uri" },
          },
        },
        required: [
          "targetName",
          "actionType",
          "reason",
          "expectedObservation",
          "uncertainty",
          "sourceUrls",
        ],
      },
    },
  },
  required: ["summary", "candidates"],
} as const;
