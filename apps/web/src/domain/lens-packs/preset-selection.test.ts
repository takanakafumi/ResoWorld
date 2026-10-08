import { describe, expect, it } from "vitest";

import type { ReviewAtlasSpot } from "@/domain/review/types";
import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { resolveApplicableLensPresets, resolveLensEntityForSpot, resolveLensPresetForSpot, selectAvailableLensPreset } from "./preset-selection";
import { religionRelationsPack, wajindenRoutesPack } from "./seed-packs";

function spot(name: string): ReviewAtlasSpot {
  return { id: `spot-${name}`, name, region: "地域", kind: "訪問地点", latitude: 0, longitude: 0, claimIds: [] };
}

describe("resolveLensPresetForSpot", () => {
  it("opens the local shrine preset for a Yamatai shrine visit", () => {
    expect(resolveLensPresetForSpot(religionRelationsPack, spot("筑紫神社"))).toEqual({
      presetId: "archaic-local-shrines",
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

  it("finds a visited archaeological entity inside the route preset", () => {
    expect(resolveLensEntityForSpot(
      wajindenRoutesPack,
      "wajinden-comparison",
      spot("伊都国歴史博物館"),
    )?.id).toBe("ito-history-museum");
  });
});

describe("selectAvailableLensPreset", () => {
  it("keeps a valid manual preset when map selection changes the automatic preset", () => {
    const applicable = new Set(["religion-history", "religion-syncretism"]);
    expect(selectAvailableLensPreset(applicable, "religion-history", "religion-syncretism", "religion-syncretism")).toBe("religion-history");
  });

  it("falls back when the manual preset leaves the exploration scope", () => {
    const applicable = new Set(["religion-syncretism"]);
    expect(selectAvailableLensPreset(applicable, "religion-history", "religion-syncretism", "religion-syncretism")).toBe("religion-syncretism");
  });
});
describe("resolveApplicableLensPresets", () => {
  it("does not activate a preset from a peripheral entity alone", () => {
    const peripheralClaim = {
      ...validClaimFixture,
      id: "claim-wei",
      subject: { ...validClaimFixture.subject, id: "wei", name: "魏" },
    };

    expect(resolveApplicableLensPresets(wajindenRoutesPack, [peripheralClaim], [])).toEqual([]);
  });

  it("returns only presets connected to the current exploration", () => {
    const claim = {
      ...validClaimFixture,
      id: "claim-chikushi-shrine",
      subject: { name: "筑紫神社", type: "Place" as const },
      places: [{ name: "筑紫神社", role: "observed_place" as const }],
    };
    const visitedSpot = { ...spot("筑紫神社"), claimIds: [claim.id] };
    const applicable = resolveApplicableLensPresets(religionRelationsPack, [claim], [visitedSpot]);
    expect(applicable.map((preset) => preset.presetId)).toContain("archaic-local-shrines");
    expect(applicable.every((preset) => preset.spotIds.length > 0 || preset.claimIds.length > 0)).toBe(true);
  });
});
