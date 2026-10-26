import { describe, expect, it } from "vitest";

import {
  isMapCandidateSpot,
  isMapDisplayableSpot,
  isMapVisitSpot,
  mapSpotPresentation,
  resolveSpotEpistemicNature,
  SPOT_EPISTEMIC_NATURE_DEFINITIONS,
  spotMatchesNatureFilter,
  type SpotEpistemicNature,
} from "./spot-presentation";
import type { ReviewAtlasSpot } from "@/domain/review/types";

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
    expect(isMapVisitSpot({ mapRole: "candidate-place" })).toBe(false);
    expect(isMapVisitSpot({ mapRole: "visited-place" })).toBe(true);
    expect(isMapVisitSpot({})).toBe(true);
  });

  it("identifies candidate spots correctly", () => {
    expect(isMapCandidateSpot({ mapRole: "candidate-place" })).toBe(true);
    expect(isMapCandidateSpot({ mapRole: "visited-place", positionStatus: "candidate" })).toBe(true);
    expect(isMapCandidateSpot({ mapRole: "visited-place", positionStatus: "confirmed" })).toBe(false);
    expect(isMapCandidateSpot({ mapRole: "area-context", positionStatus: "candidate" })).toBe(false);
  });

  it("identifies displayable spots on the map", () => {
    expect(isMapDisplayableSpot({ mapRole: "visited-place" })).toBe(true);
    expect(isMapDisplayableSpot({ mapRole: "candidate-place" })).toBe(true);
    expect(isMapDisplayableSpot({})).toBe(true);
    expect(isMapDisplayableSpot({ mapRole: "area-context" })).toBe(false);
  });
});

describe("Spot Epistemic Nature Resolution & Layer Filtering (Issue #36)", () => {
  it("Invariant 1: Epistemic Nature completeness in dictionary", () => {
    const natures: SpotEpistemicNature[] = [
      "ancient_continuity",
      "probable_ancient",
      "later_reconstitution",
      "modern_religious",
      "museum_archive",
      "modern_infrastructure",
      "candidate_frontier",
      "unclassified",
    ];

    for (const nature of natures) {
      const def = SPOT_EPISTEMIC_NATURE_DEFINITIONS[nature];
      expect(def).toBeDefined();
      expect(def.label.length).toBeGreaterThan(0);
      expect(def.badge.length).toBeGreaterThan(0);
      expect(def.icon.length).toBeGreaterThan(0);
      expect(def.color.startsWith("#")).toBe(true);
      expect(def.description.length).toBeGreaterThan(10);
    }
  });

  it("Invariant 2: Candidate frontier resolution for unvisited places", () => {
    const aeKanga: ReviewAtlasSpot = {
      id: "spot-candidate-ae-kanga",
      name: "阿恵官衙遺跡（国史跡）",
      region: "粕屋・須恵",
      kind: "訪問地点候補",
      latitude: 33.6152,
      longitude: 130.4708,
      claimIds: ["claim-kasuya-sue-wakasugi-003"],
      mapRole: "candidate-place",
      positionStatus: "candidate",
    };
    expect(resolveSpotEpistemicNature(aeKanga)).toBe("candidate_frontier");

    const suekiKilns: ReviewAtlasSpot = {
      id: "spot-candidate-sueki-kilns",
      name: "須恵器窯跡群（須恵町窯跡群）",
      region: "粕屋・須恵",
      kind: "訪問地点候補",
      latitude: 33.5916,
      longitude: 130.5111,
      claimIds: ["claim-kasuya-sue-wakasugi-004"],
      mapRole: "candidate-place",
      positionStatus: "candidate",
    };
    expect(resolveSpotEpistemicNature(suekiKilns)).toBe("candidate_frontier");
  });

  it("Invariant 3: Distinct classification between Modern Religious and Museum Archive", () => {
    // 宝満神宮寺: 現代宗教景観（構想先行型・性格C）
    const homanShinguji: ReviewAtlasSpot = {
      id: "spot-homan-shinguji",
      name: "宝満神宮寺・根本山 宝満堂",
      region: "糟屋郡須恵町",
      kind: "寺院・宗教施設・現代宗教景観（構想先行型）",
      latitude: 33.5968,
      longitude: 130.5285,
      claimIds: ["claim-kasuya-sue-wakasugi-002"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    };
    expect(resolveSpotEpistemicNature(homanShinguji)).toBe("modern_religious");

    // 須恵町立歴史民俗資料館: 学術展示
    const sueMuseum: ReviewAtlasSpot = {
      id: "spot-sue-history-museum",
      name: "須恵町立歴史民俗資料館",
      region: "糟屋郡須恵町",
      kind: "博物館・民俗資料館・窯業生活文化",
      latitude: 33.5936,
      longitude: 130.5097,
      claimIds: ["claim-kasuya-sue-wakasugi-004"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    };
    expect(resolveSpotEpistemicNature(sueMuseum)).toBe("museum_archive");
  });

  it("Invariant 4: Ancient Continuity (A) and Probable Ancient (B) resolution", () => {
    // 宗像大社: 古層継承（性格A）
    const munakata: ReviewAtlasSpot = {
      id: "munakata-taisha",
      name: "宗像大社 辺津宮",
      region: "宗像",
      kind: "神社・祭祀",
      latitude: 33.8315,
      longitude: 130.5144,
      claimIds: ["claim-munakata-001"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    };
    expect(resolveSpotEpistemicNature(munakata)).toBe("ancient_continuity");

    // 太祖神社 下宮: 古層候補（性格B）
    const taiso: ReviewAtlasSpot = {
      id: "spot-taiso-jinja-gegu",
      name: "太祖神社 下宮（太祖宮）",
      region: "糟屋郡篠栗町",
      kind: "神社・若杉山麓祭祀・太祖神楽・古層候補",
      latitude: 33.6263,
      longitude: 130.5222,
      claimIds: ["claim-kasuya-sue-wakasugi-001"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    };
    expect(resolveSpotEpistemicNature(taiso)).toBe("probable_ancient");
  });

  it("Invariant 5: Map Nature Filter logic operates strictly per layer", () => {
    // ancient_only filter
    expect(spotMatchesNatureFilter("ancient_continuity", "ancient_only")).toBe(true);
    expect(spotMatchesNatureFilter("probable_ancient", "ancient_only")).toBe(true);
    expect(spotMatchesNatureFilter("modern_religious", "ancient_only")).toBe(false);
    expect(spotMatchesNatureFilter("museum_archive", "ancient_only")).toBe(false);
    expect(spotMatchesNatureFilter("candidate_frontier", "ancient_only")).toBe(false);

    // sacred_only filter (includes ancient + later + modern religious)
    expect(spotMatchesNatureFilter("ancient_continuity", "sacred_only")).toBe(true);
    expect(spotMatchesNatureFilter("probable_ancient", "sacred_only")).toBe(true);
    expect(spotMatchesNatureFilter("later_reconstitution", "sacred_only")).toBe(true);
    expect(spotMatchesNatureFilter("modern_religious", "sacred_only")).toBe(true);
    expect(spotMatchesNatureFilter("museum_archive", "sacred_only")).toBe(false);
    expect(spotMatchesNatureFilter("modern_infrastructure", "sacred_only")).toBe(false);

    // museums_only filter
    expect(spotMatchesNatureFilter("museum_archive", "museums_only")).toBe(true);
    expect(spotMatchesNatureFilter("ancient_continuity", "museums_only")).toBe(false);
    expect(spotMatchesNatureFilter("modern_religious", "museums_only")).toBe(false);

    // candidates_only filter
    expect(spotMatchesNatureFilter("candidate_frontier", "candidates_only")).toBe(true);
    expect(spotMatchesNatureFilter("ancient_continuity", "candidates_only")).toBe(false);

    // all filter
    expect(spotMatchesNatureFilter("ancient_continuity", "all")).toBe(true);
    expect(spotMatchesNatureFilter("modern_religious", "all")).toBe(true);
    expect(spotMatchesNatureFilter("museum_archive", "all")).toBe(true);
    expect(spotMatchesNatureFilter("candidate_frontier", "all")).toBe(true);
  });
});
