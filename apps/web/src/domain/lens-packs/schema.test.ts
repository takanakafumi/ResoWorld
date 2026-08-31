import { describe, expect, it } from "vitest";

import {
  japaneseMythologyPack,
  religionRelationsPack,
  seedLensKnowledgePacks,
  wajindenRoutesPack,
} from "./seed-packs";
import { LensKnowledgePackSchema, LensSourceSchema } from "./schema";

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
});

describe("seed lens knowledge packs", () => {
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
    ]);

    const islamRelation = religionRelationsPack.assertions.find(
      (assertion) => assertion.subjectId === "islam" && assertion.predicate === "member_of",
    );
    expect(islamRelation?.objectId).toBe("abrahamic-traditions");
  });
});
