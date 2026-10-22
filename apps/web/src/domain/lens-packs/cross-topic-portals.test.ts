import { describe, expect, it } from "vitest";

import { resolveCrossTopicPortals } from "./cross-topic-portals";

describe("cross-topic-portals (ADR-0022)", () => {
  it("resolves multi-topic portals for 出雲大社 across presets", () => {
    const allPortals = resolveCrossTopicPortals("izumo-taisha");
    expect(allPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = allPortals.map((p) => p.topicId);
    expect(topicIds).toContain("izumo-kunitsukami-preset");
    expect(topicIds).toContain("izumo-kunitsukami-corridor");

    // When viewing from izumo-kunitsukami-corridor, the active topic is excluded
    const fromCorridor = resolveCrossTopicPortals("izumo-taisha", {
      currentTopicId: "izumo-kunitsukami-corridor",
    });
    expect(fromCorridor.map((p) => p.topicId)).not.toContain("izumo-kunitsukami-corridor");
    expect(fromCorridor.map((p) => p.topicId)).toContain("izumo-kunitsukami-preset");
  });

  it("resolves portals by Japanese label and aliases", () => {
    const byName = resolveCrossTopicPortals({ name: "出雲大社" }, {
      currentTopicId: "izumo-kunitsukami-preset",
    });
    expect(byName.map((p) => p.topicId)).toContain("izumo-kunitsukami-corridor");

    // Classical alias 天日隅宮 (Ground Anchor alias coverage)
    const byAlias = resolveCrossTopicPortals({ name: "天日隅宮" });
    expect(byAlias.map((p) => p.topicId)).toContain("izumo-kunitsukami-preset");
    expect(byAlias.map((p) => p.topicId)).toContain("izumo-kunitsukami-corridor");
  });

  it("resolves multi-topic portals for 厳島神社 across packs", () => {
    const miyajimaPortals = resolveCrossTopicPortals("itsukushima-shrine");
    expect(miyajimaPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = miyajimaPortals.map((p) => p.topicId);
    expect(topicIds).toContain("miyajima-sacred-relations");

    // Kyujitai and alias matching
    const byKyujitai = resolveCrossTopicPortals({ name: "嚴島神社" });
    expect(byKyujitai.map((p) => p.topicId)).toContain("miyajima-sacred-relations");
  });

  it("resolves multi-topic portals for 宇佐神宮 across packs", () => {
    const usaPortals = resolveCrossTopicPortals("usa-jingu");
    expect(usaPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = usaPortals.map((p) => p.topicId);
    expect(topicIds).toContain("religion-syncretism");
    expect(topicIds).toContain("ichinomiya-western-preset");
  });

  it("returns empty array for unknown or empty targets safely", () => {
    expect(resolveCrossTopicPortals(undefined)).toEqual([]);
    expect(resolveCrossTopicPortals("")).toEqual([]);
    expect(resolveCrossTopicPortals("non-existent-entity-99999")).toEqual([]);
  });
});
