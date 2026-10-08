import { describe, expect, it } from "vitest";

import {
  japaneseMythologyPack,
  religionRelationsPack,
  seedLensKnowledgePacks,
  wajindenRoutesPack,
} from "./seed-packs";
import { LensAssertionSchema, LensKnowledgePackSchema, LensSourceSchema } from "./schema";

describe("LensAssertionSchema", () => {
  const assertion = {
    id: "history-001",
    subjectId: "subject",
    predicate: "occurred_at",
    objectId: "place",
    relationFamily: "historical-context" as const,
    nature: "reviewed-reference" as const,
    viewpointIds: ["history"],
    sourceIds: ["official-history"],
    confidence: "high" as const,
    reviewStatus: "reviewed" as const,
  };

  it("defaults optional chronology and evidence basis for existing packs", () => {
    expect(LensAssertionSchema.parse(assertion)).toMatchObject({
      historicalTime: null,
      sourceTime: null,
      evidenceBasis: "unspecified",
    });
  });

  it("keeps event time distinct from source time and evidence basis", () => {
    expect(LensAssertionSchema.parse({
      ...assertion,
      historicalTime: { kind: "calendar", startYear: 1180, approximate: false },
      sourceTime: { kind: "named", label: "後世の記録", precision: "broad-period" },
      evidenceBasis: "reported-historical-record",
    })).toMatchObject({
      historicalTime: { kind: "calendar", startYear: 1180 },
      sourceTime: { kind: "named", label: "後世の記録" },
      evidenceBasis: "reported-historical-record",
    });
  });

  it("rejects a reversed historical range", () => {
    expect(LensAssertionSchema.safeParse({
      ...assertion,
      historicalTime: { kind: "calendar", startYear: 1200, endYear: 1180, approximate: false },
    }).success).toBe(false);
  });

  it("rejects dated assertions without an explicit evidence basis", () => {
    expect(LensAssertionSchema.safeParse({
      ...assertion,
      historicalTime: { kind: "calendar", startYear: 1180, approximate: false },
    }).success).toBe(false);

    expect(LensAssertionSchema.safeParse({
      ...assertion,
      sourceTime: { kind: "named", label: "後世の記録", precision: "broad-period" },
    }).success).toBe(false);
  });
});

describe("LensSourceSchema", () => {
  it("keeps traceability metadata without requiring it from existing drafts", () => {
    expect(
      LensSourceSchema.parse({
        id: "museum-reference",
        kind: "modern-reference",
        title: "展示解説",
        authors: ["担当学芸員"],
        publisher: "地域博物館",
        publishedAt: "2026-08",
        url: "https://example.com/reference",
        retrievedAt: "2026-09-01",
        locator: "第2章 祭祀の展開",
        contentHash: `sha256:${"a".repeat(64)}`,
        reviewStatus: "reviewed",
      }),
    ).toMatchObject({ reviewStatus: "reviewed", publisher: "地域博物館" });
  });

  it("marks a minimally described source as a candidate", () => {
    expect(
      LensSourceSchema.parse({
        id: "draft-source",
        kind: "user-input",
        title: "会話上の整理",
      }).reviewStatus,
    ).toBe("candidate");
  });

  it("rejects an invalid content hash", () => {
    expect(
      LensSourceSchema.safeParse({
        id: "broken-source",
        kind: "modern-reference",
        title: "壊れた参照",
        contentHash: "sha256:not-a-hash",
      }).success,
    ).toBe(false);
  });
});

describe("LensKnowledgePackSchema", () => {
  it("accepts every seed knowledge pack", () => {
    expect(
      seedLensKnowledgePacks.map((pack) =>
        LensKnowledgePackSchema.parse(pack),
      ),
    ).toHaveLength(3);
  });

  it("rejects assertions that reference an unknown entity", () => {
    const invalid = {
      ...japaneseMythologyPack,
      assertions: [
        {
          ...japaneseMythologyPack.assertions[0],
          objectId: "missing-entity",
        },
      ],
    };

    const result = LensKnowledgePackSchema.safeParse(invalid);

    expect(result.success).toBe(false);
  });

  it("rejects a map connection without a declared place and assertion", () => {
    const invalid = {
      ...japaneseMythologyPack,
      presets: [{
        ...japaneseMythologyPack.presets[0],
        mapConnections: [{
          id: "broken-map-connection",
          label: "壊れた地理接続",
          description: "存在しない地点と関係を参照する。",
          placeEntityIds: ["missing-place", "munakata-taisha"],
          assertionIds: ["missing-assertion"],
        }],
      }],
    };

    expect(LensKnowledgePackSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects a reviewed assertion backed by a candidate source", () => {
    const invalid = {
      ...japaneseMythologyPack,
      assertions: [
        {
          ...japaneseMythologyPack.assertions[0],
          reviewStatus: "reviewed" as const,
        },
      ],
    };

    const result = LensKnowledgePackSchema.safeParse(invalid);

    expect(result.success).toBe(false);
  });
});

describe("seed lens knowledge packs", () => {
  it("reviews only the first directly supported assertions", () => {
    const reviewedIds = seedLensKnowledgePacks.flatMap((pack) =>
      pack.assertions
        .filter((assertion) => assertion.reviewStatus === "reviewed")
        .map((assertion) => assertion.id),
    );

    expect(new Set(reviewedIds)).toEqual(
      new Set([
        "myth-019",
        "route-012",
        "route-014",
        "route-015",
        "route-019",
        "route-020",
        "route-021",
        "route-022",
        "route-023",
        "route-024",
        "route-025",
        "archaeology-001",
        "archaeology-002",
        "archaeology-003",
        "archaeology-004",
        "archaeology-005",
        "archaeology-006",
        "archaeology-007",
        "archaeology-008",
        "religion-022",
        "religion-025",
        "religion-029",
        "religion-030",
        "religion-034",
        "religion-035",
        "religion-036",
        "religion-041",
      ]),
    );
  });

  it("keeps the Umi identification disputed while recording its reviewed municipal source", () => {
    const relation = wajindenRoutesPack.assertions.find((assertion) => assertion.id === "route-012");
    const source = wajindenRoutesPack.sources.find((candidate) => candidate.id === relation?.sourceIds[0]);

    expect(relation).toMatchObject({ objectId: "umi", confidence: "disputed", reviewStatus: "reviewed" });
    expect(source).toMatchObject({ publisher: "宇美町", reviewStatus: "reviewed" });
  });

  it("keeps the reviewed Usa to Rokugo Manzan relation inside the syncretism view", () => {
    const relation = religionRelationsPack.assertions.find(
      (assertion) => assertion.id === "religion-030",
    );
    const source = religionRelationsPack.sources.find(
      (candidate) => candidate.id === relation?.sourceIds[0],
    );

    expect(relation).toMatchObject({
      subjectId: "usa-jingu",
      objectId: "rokugo-manzan",
      relationFamily: "association",
      reviewStatus: "reviewed",
    });
    expect(source?.reviewStatus).toBe("reviewed");
  });

  it("keeps the Kyushu and Kinai Yamatai identifications as competing hypotheses", () => {
    const yamataiLocations = wajindenRoutesPack.assertions.filter(
      (assertion) => assertion.hypothesisGroupId === "yamatai-location",
    );

    expect(yamataiLocations).toHaveLength(2);
    expect(new Set(yamataiLocations.map((item) => item.viewpointIds[0]))).toEqual(
      new Set(["northern-kyushu-hypothesis", "kinai-hypothesis"]),
    );
    expect(yamataiLocations.every((item) => item.confidence === "disputed")).toBe(true);
  });

  it("separates the Na territorial range, Kasuga center candidate, and competing Toma candidates", () => {
    const naRelations = wajindenRoutesPack.assertions.filter((assertion) => assertion.subjectId === "na-state" && assertion.relationFamily === "identification");
    expect(naRelations).toEqual(expect.arrayContaining([
      expect.objectContaining({ objectId: "hakata-plain", hypothesisGroupId: "na-identification" }),
      expect.objectContaining({ objectId: "kasuga-sugu-core", hypothesisGroupId: "na-center-identification", reviewStatus: "reviewed" }),
    ]));

    const tomaLocations = wajindenRoutesPack.assertions.filter((assertion) => assertion.hypothesisGroupId === "toma-location");
    expect(tomaLocations).toHaveLength(4);
    expect(tomaLocations.every((assertion) => assertion.subjectId === "toma-state" && assertion.confidence === "disputed" && assertion.reviewStatus === "reviewed")).toBe(true);
  });

  it("keeps visited archaeological places separate from the Yamatai location hypotheses", () => {
    const archaeology = wajindenRoutesPack.assertions.filter((assertion) => assertion.id.startsWith("archaeology-"));
    expect(archaeology).toHaveLength(8);
    expect(archaeology.filter((assertion) => assertion.id !== "archaeology-008").every((assertion) => assertion.viewpointIds.includes("municipal-archaeology"))).toBe(true);
    expect(archaeology.find((assertion) => assertion.id === "archaeology-008")).toMatchObject({ nature: "scholarly-hypothesis", hypothesisGroupId: "fumi-identification", confidence: "disputed" });
    expect(wajindenRoutesPack.presets.find((preset) => preset.id === "wajinden-comparison")?.mapConnections.map((connection) => connection.id)).toEqual(expect.arrayContaining(["ito-archaeology-visits", "nakoku-archaeology-visits"]));
  });

  it("does not collapse textual variants and imperial succession into one relation", () => {
    const families = new Set(
      japaneseMythologyPack.assertions.map(
        (assertion) => assertion.relationFamily,
      ),
    );

    expect(families).toContain("genealogy");
    expect(families).toContain("textual-attestation");
    expect(families).toContain("succession");
    expect(families).toContain("enshrinement");
  });

  it("keeps historical, syncretic, and conceptual religion views separate", () => {
    expect(religionRelationsPack.presets.map((preset) => preset.id)).toEqual([
      "religion-history",
      "religion-syncretism",
      "religion-concepts",
      "archaic-local-shrines",
    ]);

    const localShrines = religionRelationsPack.presets.find(
      (preset) => preset.id === "archaic-local-shrines",
    );
    expect(localShrines).toMatchObject({
      viewpointIds: ["local-shrine-context"],
      relationFamilies: ["association", "ritual"],
    });
    expect(localShrines?.mapConnections.map((connection) => connection.id)).toEqual([
      "takasu-sazare-tradition",
      "kumano-sugu-overlap",
    ]);

    const islamRelation = religionRelationsPack.assertions.find(
      (assertion) => assertion.subjectId === "islam" && assertion.predicate === "member_of",
    );
    expect(islamRelation?.objectId).toBe("abrahamic-traditions");
  });
});
