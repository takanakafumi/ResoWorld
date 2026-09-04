import { describe, expect, it } from "vitest";

import type { ReviewAtlasSpot } from "@/domain/review/types";

import { resolveLensPresetForSpot } from "./preset-selection";
import { religionRelationsPack } from "./seed-packs";

function spot(name: string): ReviewAtlasSpot {
  return { id: `spot-${name}`, name, region: "地域", kind: "訪問地点", latitude: 0, longitude: 0, claimIds: [] };
}

describe("resolveLensPresetForSpot", () => {
  it("opens the local shrine preset for a Yamatai shrine visit", () => {
    expect(resolveLensPresetForSpot(religionRelationsPack, spot("筑紫神社"))).toEqual({
      presetId: "local-shrine-connections",
      entityId: "chikushi-shrine",
    });
  });

  it("keeps an established regional shrine in the syncretism view", () => {
    expect(resolveLensPresetForSpot(religionRelationsPack, spot("宗像大社 辺津宮"))).toEqual({
      presetId: "religion-syncretism",
      entityId: "munakata-taisha",
    });
  });

  it("does not choose a preset for an unrelated broad place", () => {
    expect(resolveLensPresetForSpot(religionRelationsPack, spot("福岡"))).toBeUndefined();
  });
});

