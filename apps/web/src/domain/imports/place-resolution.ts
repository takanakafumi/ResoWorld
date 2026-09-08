import { z } from "zod";

export const PlaceResolutionCandidateSchema = z.object({
  id: z.string().min(1),
  provider: z.enum(["nominatim", "official-source"]),
  displayName: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  category: z.string(),
  type: z.string(),
  address: z.record(z.string(), z.string()),
  attribution: z.string().min(1),
});

export type PlaceResolutionCandidate = z.infer<typeof PlaceResolutionCandidateSchema>;

export const PlaceResolutionSelectionSchema = z.object({
  query: z.string().min(1),
  status: z.literal("candidate"),
  selected: PlaceResolutionCandidateSchema,
});

export type PlaceResolutionSelection = z.infer<typeof PlaceResolutionSelectionSchema>;
