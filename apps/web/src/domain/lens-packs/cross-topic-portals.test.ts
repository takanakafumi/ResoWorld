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
  });

  it("resolves multi-topic portals for 厳島神社 across packs", () => {
    const miyajimaPortals = resolveCrossTopicPortals("itsukushima-shrine");
    expect(miyajimaPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = miyajimaPortals.map((p) => p.topicId);
    // Should link both sacred landscape and Genpei Dan-no-ura or others
    expect(topicIds).toContain("miyajima-sacred-relations");
  });

  it("returns empty array for unknown or empty targets safely", () => {
    expect(resolveCrossTopicPortals(undefined)).toEqual([]);
    expect(resolveCrossTopicPortals("")).toEqual([]);
    expect(resolveCrossTopicPortals("non-existent-entity-99999")).toEqual([]);
  });
});
