import { describe, expect, it } from "vitest";

import { isMapVisitSpot, mapSpotPresentation } from "./spot-presentation";

describe("map spot presentation", () => {
  it.each([
    ["宇美町立歴史民俗資料館", "博物館・歴史資料館", "museum"],
    ["須玖岡本遺跡", "遺跡・古墳", "archaeology"],
    ["宗像大社 辺津宮", "神社・祭祀", "shrine"],
    ["両子寺", "寺院", "temple"],
    ["高杉晋作誕生地", "史跡", "historic"],
    ["千畳敷", "自然・景観", "nature"],
  ])("classifies %s", (name, kind, expected) => {
    expect(mapSpotPresentation({ name, kind }).id).toBe(expected);
  });

  it("keeps administrative areas as context without treating them as visit markers", () => {
    expect(isMapVisitSpot({ mapRole: "area-context" })).toBe(false);
    expect(isMapVisitSpot({ mapRole: "visited-place" })).toBe(true);
    expect(isMapVisitSpot({})).toBe(true);
  });
});
