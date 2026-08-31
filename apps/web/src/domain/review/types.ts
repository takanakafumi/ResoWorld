import type { Claim } from "@/domain/knowledge/schema";
import type { DataTransportPolicy } from "@/domain/transport/policy";

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

export type ReviewConnectionFacet = {
  id: string;
  label: string;
  weight: number;
};

export type ReviewAtlasEra = {
  id: string;
  label: string;
  range: string;
  mapLabel: string;
  mapLayer: "mythic" | "maritime" | "religious" | "domain" | "modern" | "present";
  spotIds: string[];
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
  facets: ReviewConnectionFacet[];
  eras: ReviewAtlasEra[];
};

export type ExplorationSuggestionStatus = "suggested" | "accepted" | "rejected";

export type ReviewExplorationSuggestion = {
  id: string;
  title: string;
  targetName: string;
  actionType: "field_visit" | "literature_research" | "revisit";
  latitude: number;
  longitude: number;
  question: string;
  missingInformation: string;
  reason: string;
  expectedObservation: string;
  uncertainty: string;
  claimIds: string[];
  anchorSpotIds: string[];
  connectionIds: string[];
  initialStatus: ExplorationSuggestionStatus;
};

export type ReviewAtlas = {
  title: string;
  spots: ReviewAtlasSpot[];
  connections: ReviewAtlasConnection[];
  suggestions: ReviewExplorationSuggestion[];
};

export type ReviewDataset = {
  datasetId: string;
  privacy: "local-only" | "remote-enabled" | "hybrid" | "anonymized-demo";
  transportPolicy?: DataTransportPolicy;
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
