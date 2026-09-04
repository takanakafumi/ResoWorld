import { describe, expect, it } from "vitest";

import type { ReviewAtlasSpot } from "@/domain/review/types";

import { resolveSpotKnowledgeContexts } from "./spot-knowledge";

function spot(name: string): ReviewAtlasSpot {
  return { id: `spot-${name}`, name, region: "福岡県", kind: "訪問地点", latitude: 33.5, longitude: 130.4, claimIds: [] };
}

describe("resolveSpotKnowledgeContexts", () => {
  it.each([
    "伊都国歴史博物館",
    "高祖神社",
    "熊野神社",
    "光正寺",
    "三雲南小路遺跡",
    "平原遺跡",
    "細石神社",
    "須玖岡本遺跡群",
    "筑紫神社",
    "奴国の丘歴史公園",
    "三雲・井原遺跡",
  ])("finds reviewed context for the Yamatai visit %s", (name) => {
    const contexts = resolveSpotKnowledgeContexts(spot(name));

    expect(contexts.length).toBeGreaterThan(0);
    expect(contexts.flatMap((context) => context.relations).length).toBeGreaterThan(0);
    expect(contexts.flatMap((context) => context.sources).length).toBeGreaterThan(0);
  });

  it("does not attach unrelated short place names by partial matching", () => {
    expect(resolveSpotKnowledgeContexts(spot("萩"))).toEqual([]);
    expect(resolveSpotKnowledgeContexts(spot("福岡"))).toEqual([]);
  });

  it("still recognizes a qualified visited place name", () => {
    expect(resolveSpotKnowledgeContexts(spot("宗像大社 辺津宮")).some(
      (context) => context.entityId === "munakata-taisha",
    )).toBe(true);
  });
});
