import type { Claim, KnowledgeDataset } from "./schema";
import { SCHEMA_VERSION } from "./schema";

export const DEMO_DOCUMENT_SHA256 =
  "1111111111111111111111111111111111111111111111111111111111111111";

export const validClaimFixture: Claim = {
  schemaVersion: SCHEMA_VERSION,
  id: "claim-demo-1",
  statement: "地点Aで観察した地形から、信仰テーマAとの関係を検討した。",
  subject: {
    id: "entity-place-a",
    name: "地点A",
    type: "Place",
  },
  predicate: "may_relate_to",
  object: {
    kind: "entity",
    entity: {
      id: "entity-belief-a",
      name: "信仰テーマA",
      type: "Belief",
    },
  },
  qualifiers: {
    anonymized: true,
  },
  claimKind: "hypothesis",
  originType: "imported",
  reviewStatus: "confirmed",
  epistemic: {
    verification: "personal-evidence",
    modality: "hypothetical",
  },
  historicalTime: {
    kind: "named",
    label: "古代",
    precision: "broad-period",
  },
  places: [
    {
      entityId: "entity-place-a",
      name: "地点A",
      role: "observed_place",
    },
  ],
  evidence: [
    {
      id: "evidence-demo-1",
      role: "supports",
      sourceNature: "Observation",
      documentVoice: "user-narrator",
      passage: {
        documentId: "document-demo-1",
        documentSha256: DEMO_DOCUMENT_SHA256,
        startLine: 10,
        endLine: 12,
        quote: "匿名化された現地観察の例。",
      },
    },
  ],
  createdAt: "2026-08-30T00:00:00.000Z",
};

export const validDatasetFixture: KnowledgeDataset = {
  schemaVersion: SCHEMA_VERSION,
  datasetId: "dataset-anonymized-demo",
  privacy: "anonymized-demo",
  documents: [
    {
      id: "document-demo-1",
      title: "匿名化された探索記録",
      path: "data/demo/anonymized-exploration.txt",
      sha256: DEMO_DOCUMENT_SHA256,
      authorType: "user-authored",
      privacy: "anonymized",
      observedAt: "2026-08-01",
      documentedAt: "2026-08-02",
      dateStatus: "known",
    },
  ],
  sources: [],
  claims: [validClaimFixture],
};
