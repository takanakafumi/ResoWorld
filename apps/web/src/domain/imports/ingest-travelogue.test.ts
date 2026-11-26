import { describe, expect, it } from "vitest";
import type { ReviewAtlas, ReviewDataset } from "@/domain/review/types";
import {
  ingestTravelogue,
  TravelogueIngestManifestSchema,
  type TravelogueIngestManifest,
} from "./ingest-travelogue";

function makeBaseDataset(): ReviewDataset & {
  documents: Array<Record<string, unknown>>;
  atlas: ReviewAtlas;
} {
  return {
    datasetId: "test-dataset",
    privacy: "local-only",
    documents: [],
    claims: [],
    atlas: {
      title: "Test Atlas",
      spots: [],
      connections: [],
      journeys: [],
      suggestions: [
        {
          id: "next-old-yoshinogari",
          title: "吉野ヶ里を比較訪問",
          targetName: "吉野ヶ里遺跡",
          targetPlaceId: "place-yoshinogari",
          targetKind: "knowledge_unvisited",
          actionType: "field_visit",
          latitude: 33.327,
          longitude: 130.384,
          question: "問い",
          missingInformation: "不足",
          reason: "理由",
          expectedObservation: "観察",
          uncertainty: "不確実性",
          claimIds: [],
          anchorSpotIds: [],
          connectionIds: [],
          lensId: "politics",
          topicId: "yayoi-archaeology-preset",
          initialStatus: "suggested",
        },
      ],
    },
  };
}

const SAMPLE_TRAVELOGUE = [
  "# 2026年12月01日 テスト探索記",
  "吉野ヶ里遺跡の北墳丘墓と外壕を見学した。",
  "与止日女神社で嘉瀬川沿いの大楠と肥前鳥居を確認した。",
].join("\n");

const BASE_MANIFEST: TravelogueIngestManifest = {
  schemaVersion: "0.1.0",
  document: {
    title: "2026年12月01日 テスト探索記",
    logicalPath: "旅行記/テスト探索記_2026-12-01.md",
    observedAt: "2026-12-01",
  },
  journey: {
    id: "journey-test-2026-12-01",
    label: "テスト探索（吉野ヶ里・與止日女）",
  },
  spots: [
    {
      id: "spot-yoshinogari-site",
      name: "吉野ヶ里遺跡",
      region: "佐賀県 · 吉野ヶ里町",
      kind: "弥生環濠集落遺跡",
      latitude: 33.3270916,
      longitude: 130.3842637,
    },
    {
      id: "spot-yodohime-jinja",
      name: "與止日女神社",
      region: "佐賀県 · 佐賀市大和町",
      kind: "神社",
      latitude: 33.32627,
      longitude: 130.268321,
    },
  ],
  claims: [
    {
      id: "claim-test-001",
      spotId: "spot-yoshinogari-site",
      statement: "吉野ヶ里遺跡で北墳丘墓と外壕を現地確認した。",
      predicate: "observed_archaeological_feature",
      objectName: "北墳丘墓・外壕",
      objectType: "Place",
      claimKind: "observation",
      sourceNature: "Archaeology",
      modality: "asserted",
      certaintyTier: "A",
      historicalTime: { kind: "named", label: "弥生時代中期〜後期", precision: "broad-range" },
      startLine: 2,
      endLine: 2,
    },
    {
      id: "claim-test-002",
      spotId: "spot-yodohime-jinja",
      statement: "與止日女神社で1608年銘の肥前鳥居と大楠を確認した。",
      predicate: "observed_shrine_architecture",
      objectName: "肥前鳥居・大楠",
      objectType: "Artifact",
      claimKind: "observation",
      sourceNature: "HistoricalSource",
      modality: "asserted",
      certaintyTier: "A",
      historicalTime: { kind: "calendar", startYear: 1608, endYear: 1608, approximate: false, label: "江戸時代初期" },
      startLine: 3,
      endLine: 3,
    },
  ],
  itineraryConnection: {
    id: "itinerary-test-2026-12-01",
    eyebrow: "2026-12-01 テスト行程",
    title: "吉野ヶ里遺跡から與止日女神社へ",
    summary: "佐賀平野と川上峡を巡ったテスト行程。",
    concepts: ["吉野ヶ里遺跡", "與止日女神社"],
    facets: [{ id: "itinerary", label: "現地訪問行程", weight: 4 }],
  },
  retireSuggestionIds: ["next-old-yoshinogari"],
  addSuggestions: [
    {
      id: "next-test-kyoseki",
      title: "巨石パークを訪問する",
      targetName: "肥前大和巨石パーク",
      latitude: 33.337914,
      longitude: 130.262871,
      question: "川上信仰と巨石群の地形的関係は？",
      missingInformation: "未訪問",
      reason: "雨天見送り",
      expectedObservation: "巨石配置",
      uncertainty: "自然形成との区別",
      claimIds: ["claim-test-002"],
      anchorSpotIds: ["spot-yodohime-jinja"],
      connectionIds: [],
      lensId: "religion",
      topicId: "religion-concepts",
    },
  ],
};

describe("ingestTravelogue canonical pipeline", () => {
  it("materializes spots, mandatory observed_place claims, itinerary, Frontier updates, promotion report, and is idempotent", () => {
    const first = ingestTravelogue({
      dataset: makeBaseDataset(),
      rawText: SAMPLE_TRAVELOGUE,
      manifest: BASE_MANIFEST,
      runGovernanceAudit: true,
    });

    expect(first.governance.totalViolations).toBe(0);
    expect(first.summary.ingestedClaimCount).toBe(2);
    expect(first.summary.totalSpots).toBe(2);
    expect(first.summary.totalJourneys).toBe(1);

    // Every claim carries deterministic observed_place + exact quote & SHA-256
    for (const claim of first.dataset.claims) {
      expect(claim.places.some((p) => p.role === "observed_place")).toBe(true);
      expect(claim.evidence[0]?.passage.quote).toBeTruthy();
      expect(claim.evidence[0]?.passage.passageSha256).toMatch(/^[a-f0-9]{64}$/);
    }

    // Spots are confirmed visited-place with clean physical kinds
    for (const spot of first.dataset.atlas.spots) {
      expect(spot.mapRole).toBe("visited-place");
      expect(spot.positionStatus).toBe("confirmed");
    }

    // Itinerary connection complies with ADR-0028
    const itin = first.dataset.atlas.connections.find((c) => c.id === "itinerary-test-2026-12-01");
    expect(itin).toMatchObject({
      connectionKind: "itinerary",
      lensId: "itinerary",
      topicId: null,
      displayMode: "line",
    });

    // Frontier retirement & addition
    expect(first.dataset.atlas.suggestions?.some((s) => s.id === "next-old-yoshinogari")).toBe(false);
    expect(first.dataset.atlas.suggestions?.some((s) => s.id === "next-test-kyoseki")).toBe(true);

    // Promotion report discovers matching LENS pack entities
    expect(first.promotionReport.matchedPackNodes.some((n) => n.entityId === "place-yoshinogari")).toBe(true);
    expect(first.promotionReport.matchedPackNodes.some((n) => n.entityId === "place-yodohime-jinja")).toBe(true);

    // Idempotent re-run produces identical counts
    const second = ingestTravelogue({
      dataset: first.dataset,
      rawText: SAMPLE_TRAVELOGUE,
      manifest: BASE_MANIFEST,
      runGovernanceAudit: true,
    });
    expect(second.summary.totalSpots).toBe(first.summary.totalSpots);
    expect(second.summary.totalClaims).toBe(first.summary.totalClaims);
    expect(second.summary.totalJourneys).toBe(first.summary.totalJourneys);
    expect(second.summary.totalSuggestions).toBe(first.summary.totalSuggestions);
  });

  it("enforces structural guards against absolute local paths, status-polluted kind, and invalid suggestion topic scoping", () => {
    expect(() =>
      TravelogueIngestManifestSchema.parse({
        ...BASE_MANIFEST,
        document: { ...BASE_MANIFEST.document, logicalPath: "/home/antigravity/secret.txt" },
      }),
    ).toThrow(/logicalPath/);

    expect(() =>
      TravelogueIngestManifestSchema.parse({
        ...BASE_MANIFEST,
        spots: [{ ...BASE_MANIFEST.spots[0], kind: "訪問地点候補" }],
      }),
    ).toThrow(/spot\.kind/);

    expect(() =>
      ingestTravelogue({
        dataset: makeBaseDataset(),
        rawText: SAMPLE_TRAVELOGUE,
        manifest: {
          ...BASE_MANIFEST,
          addSuggestions: [
            {
              ...BASE_MANIFEST.addSuggestions[0],
              lensId: "route", // mismatches religion-concepts perspectiveId ("religion")
            },
          ],
        },
        runGovernanceAudit: false,
      }),
    ).toThrow(/does not match/);
  });
});
