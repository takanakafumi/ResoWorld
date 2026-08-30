import type { Claim } from "@/domain/knowledge/schema";

export type ReviewDocument = {
  id: string;
  title: string;
};

export type ReviewAtlasSpot = {
  id: string;
  name: string;
  region: string;
  kind: string;
  latitude: number;
  longitude: number;
  claimIds: string[];
};

export type ReviewAtlasConnection = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  spotIds: string[];
  claimIds: string[];
  concepts: string[];
};

export type ReviewAtlas = {
  title: string;
  spots: ReviewAtlasSpot[];
  connections: ReviewAtlasConnection[];
};

export type ReviewDataset = {
  datasetId: string;
  privacy: "local-only" | "anonymized-demo";
  documents: ReviewDocument[];
  claims: Claim[];
  atlas: ReviewAtlas | null;
};

export type ReviewStatus = Claim["reviewStatus"];

export type EntityProposal = {
  id: string;
  kind: "merge" | "split";
  entityNames: string[];
  createdAt: string;
};
