import { describe, expect, it } from "vitest";

import { extractEntityCandidateNames, lensEntityNamesMatch } from "./entity-identity";

describe("extractEntityCandidateNames", () => {
  it("extracts base name and parenthetical sub-names", () => {
    expect(extractEntityCandidateNames("水城（水城跡・東門官道・水城館）")).toEqual([
      "水城（水城跡・東門官道・水城館）",
      "水城",
      "水城跡",
      "東門官道",
      "水城館",
    ]);
    expect(extractEntityCandidateNames("宗像大社 沖津宮（沖ノ島）")).toEqual([
      "宗像大社 沖津宮（沖ノ島）",
      "宗像大社 沖津宮",
      "沖ノ島",
    ]);
    expect(extractEntityCandidateNames("伊都国歴史博物館")).toEqual(["伊都国歴史博物館"]);
  });
});

describe("lensEntityNamesMatch", () => {
  it("matches normalized aliases and qualified proper names", () => {
    expect(lensEntityNamesMatch("髙祖神社", "髙祖神社")).toBe(true);
    expect(lensEntityNamesMatch("宗像大社 辺津宮", "宗像大社")).toBe(true);
    expect(lensEntityNamesMatch("水城跡", "水城（水城跡・東門官道・水城館）")).toBe(true);
    expect(lensEntityNamesMatch("水城", "水城（水城跡・東門官道・水城館）")).toBe(true);
    expect(lensEntityNamesMatch("大野城", "大野城（四王寺山）")).toBe(true);
    expect(lensEntityNamesMatch("四王寺山", "大野城（四王寺山）")).toBe(true);
  });

  it("does not expand short regional names by substring", () => {
    expect(lensEntityNamesMatch("福岡", "福岡・博多平野周辺")).toBe(false);
    expect(lensEntityNamesMatch("山口", "山口県の政治史")).toBe(false);
    expect(lensEntityNamesMatch("萩", "萩反射炉")).toBe(false);
    expect(lensEntityNamesMatch("伊都国", "伊都国歴史博物館")).toBe(false);
  });
});
