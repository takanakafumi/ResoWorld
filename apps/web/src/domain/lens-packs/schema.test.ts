import { describe, expect, it } from "vitest";

import {
  japaneseMythologyPack,
  religionRelationsPack,
  seedLensKnowledgePacks,
  wajindenRoutesPack,
} from "./seed-packs";
import { LensKnowledgePackSchema } from "./schema";

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
