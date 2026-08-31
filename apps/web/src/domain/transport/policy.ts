import { z } from "zod";

export const DataTransportPolicySchema = z.object({
  storage: z.enum(["local", "server", "hybrid"]),
  analysis: z.enum(["local", "server", "hybrid"]),
  contextScope: z.enum([
    "minimum-brief",
    "selected-records",
    "full-dataset",
  ]),
  providerIds: z.array(z.string().trim().min(1)).default([]),
});

export const DEFAULT_DATA_TRANSPORT_POLICY = {
  storage: "local",
  analysis: "local",
  contextScope: "minimum-brief",
  providerIds: [],
} as const;

export type DataTransportPolicy = z.infer<typeof DataTransportPolicySchema>;

