import type { Claim } from "@/domain/knowledge/schema";

export type ReviewDocument = {
  id: string;
  title: string;
};

export type ReviewDataset = {
  datasetId: string;
  privacy: "local-only" | "anonymized-demo";
  documents: ReviewDocument[];
  claims: Claim[];
};

export type ReviewStatus = Claim["reviewStatus"];

export type EntityProposal = {
  id: string;
  kind: "merge" | "split";
  entityNames: string[];
  createdAt: string;
};
