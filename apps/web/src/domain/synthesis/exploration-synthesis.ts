import { z } from "zod";

import type { ReviewDataset } from "@/domain/review/types";

export const SynthesisLensTypeSchema = z.enum([
  "route",
  "mythology",
  "religion",
  "genealogy",
  "chronology",
  "interpretation",
  "politics",
  "landscape",
  "custom",
]);

const PerspectiveSchema = z.object({
  discipline: z.string().trim().min(1).max(120),
  interpretation: z.string().trim().min(1).max(900),
  status: z.enum(["evidence", "inference", "alternative"]),
});

export const ExplorationSynthesisOutputSchema = z.object({
  worldSummary: z.string().trim().min(1).max(1_600),
  lenses: z.array(z.object({
    type: SynthesisLensTypeSchema,
    title: z.string().trim().min(1).max(200),
    organizingQuestion: z.string().trim().min(1).max(500),
    explanation: z.string().trim().min(1).max(1_200),
    spotNames: z.array(z.string().trim().min(1)).max(20),
    eras: z.array(z.string().trim().min(1)).max(12),
    concepts: z.array(z.string().trim().min(1)).max(16),
    perspectives: z.array(PerspectiveSchema).min(1).max(6),
  })).min(3).max(8),
  optionalResonances: z.array(z.object({
    title: z.string().trim().min(1).max(200),
    whyItMayResonate: z.string().trim().min(1).max(800),
    relatedLensTypes: z.array(SynthesisLensTypeSchema).min(1).max(4),
  })).max(4),
});

export type ExplorationSynthesisOutput = z.infer<
  typeof ExplorationSynthesisOutputSchema
>;

function historicalTimeLabel(
  value: ReviewDataset["claims"][number]["historicalTime"],
) {
  if (!value) return null;
  if (value.kind === "calendar") {
    return value.endYear
      ? `${value.startYear}–${value.endYear}年`
      : `${value.startYear}年`;
  }
  return value.label || null;
}

export function buildExplorationSynthesisDigest(dataset: ReviewDataset) {
  const atlas = dataset.atlas;
  const spots = atlas?.spots ?? [];
  const spotNamesByClaim = new Map<string, string[]>();
  for (const spot of spots) {
    for (const claimId of spot.claimIds) {
      spotNamesByClaim.set(claimId, [
        ...(spotNamesByClaim.get(claimId) ?? []),
        spot.name,
      ]);
    }
  }

  return {
    spots: spots.map(({ name, region, kind }) => ({ name, region, kind })),
    claims: dataset.claims
      .filter((claim) => claim.reviewStatus === "confirmed")
      .map((claim) => ({
      statement: claim.statement,
      claimKind: claim.claimKind,
      historicalTime: historicalTimeLabel(claim.historicalTime),
      evidenceNatures: [...new Set(
        claim.evidence.map((evidence) => evidence.sourceNature),
      )],
      spotNames: spotNamesByClaim.get(claim.id) ?? [],
      reviewStatus: claim.reviewStatus,
      })),
    connections: (atlas?.connections ?? []).map((connection) => ({
      connectionKind: connection.connectionKind,
      title: connection.title,
      summary: connection.summary,
      spotNames: connection.spotIds
        .map((id) => spots.find((spot) => spot.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
      concepts: connection.concepts,
      facets: connection.facets.map(({ label, weight }) => ({ label, weight })),
      eras: connection.eras.map(({ label, range, mapLabel }) => ({
        label,
        range,
        mapLabel,
      })),
    })),
  };
}
