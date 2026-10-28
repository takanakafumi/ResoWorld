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
    ["国立広島原爆死没者追悼平和祈念館", "追悼祈念館・学術展示", "museum"],
    ["国立広島原爆死没者追悼平和祈念館", "memorial", "museum"],
    ["勝馬 沖津宮（沖津島）", "神社・海中島嶼聖域", "shrine"],
    ["沖津宮", "海中島嶼聖域", "shrine"],
    ["萩", "地域・行政区域", "area"],
    ["福岡", "地域・行政区域", "area"],
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

  it("identifies candidate spots correctly by mapRole only (Orthogonal Concerns)", () => {
    expect(isMapCandidateSpot({ mapRole: "candidate-place" })).toBe(true);
    expect(isMapCandidateSpot({ mapRole: "visited-place" })).toBe(false);
    expect(isMapCandidateSpot({ mapRole: "area-context" })).toBe(false);
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
      "area_context",
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
      kind: "古代官衙遺跡",
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
      kind: "古代窯跡群・遺跡",
      latitude: 33.5916,
      longitude: 130.5111,
      claimIds: ["claim-kasuya-sue-wakasugi-004"],
      mapRole: "candidate-place",
      positionStatus: "candidate",
    };
    expect(resolveSpotEpistemicNature(suekiKilns)).toBe("candidate_frontier");

    // Munakata candidate sites (Issue #40)
    const okinoshima: ReviewAtlasSpot = {
      id: "spot-candidate-munakata-okitsumiya",
      name: "宗像大社 沖津宮（沖ノ島）",
      region: "福岡県 · 宗像市",
      kind: "神社・古代島嶼祭祀遺跡",
      latitude: 34.2447,
      longitude: 130.1039,
      claimIds: ["MZ-002"],
      mapRole: "candidate-place",
      positionStatus: "confirmed",
    };
    expect(resolveSpotEpistemicNature(okinoshima)).toBe("candidate_frontier");
    expect(isMapCandidateSpot(okinoshima)).toBe(true);
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

  it("Invariant 6: Modern infrastructure resolution for bridge, market, station (Issue #38)", () => {
    const kanmonBridge: ReviewAtlasSpot = {
      id: "spot-geocode-be4996360d42",
      name: "関門橋",
      region: "山口県 · 下関市",
      kind: "橋・交通インフラ",
      latitude: 33.9616722,
      longitude: 130.9588007,
      claimIds: ["claim-ef79640e36a9f1edc321"],
      mapRole: "visited-place",
    };
    expect(resolveSpotEpistemicNature(kanmonBridge)).toBe("modern_infrastructure");

    const karatoMarket: ReviewAtlasSpot = {
      id: "spot-geocode-54fce6a9b371",
      name: "唐戸市場",
      region: "山口県 · 下関市",
      kind: "地域市場・観光拠点",
      latitude: 33.9566245,
      longitude: 130.945817,
      claimIds: ["claim-6e4c3b329ed9419be982"],
      mapRole: "visited-place",
    };
    expect(resolveSpotEpistemicNature(karatoMarket)).toBe("modern_infrastructure");
  });

  it("Invariant 7: Visited places NEVER become candidate frontiers regardless of positionStatus (Issue #38)", () => {
    const visitedPlaceWithCandidatePosition: ReviewAtlasSpot = {
      id: "spot-test-visited",
      name: "テスト訪問地点",
      region: "テスト地域",
      kind: "神社",
      latitude: 33.0,
      longitude: 130.0,
      claimIds: ["claim-1"],
      mapRole: "visited-place",
      positionStatus: "candidate",
    };
    expect(resolveSpotEpistemicNature(visitedPlaceWithCandidatePosition)).not.toBe("candidate_frontier");
    expect(isMapCandidateSpot(visitedPlaceWithCandidatePosition)).toBe(false);
  });

  it("Invariant 8: Memorial halls (祈念館) are recognized as museum_archive (Issue #39)", () => {
    const peaceMemorial: ReviewAtlasSpot = {
      id: "spot-import-6bc2290b",
      name: "国立広島原爆死没者追悼平和祈念館",
      region: "広島県",
      kind: "追悼祈念館・学術展示",
      latitude: 34.39265,
      longitude: 132.45332,
      claimIds: ["claim-1"],
      mapRole: "visited-place",
    };
    expect(resolveSpotEpistemicNature(peaceMemorial)).toBe("museum_archive");
    expect(mapSpotPresentation(peaceMemorial).id).toBe("museum");
    expect(mapSpotPresentation(peaceMemorial).icon).toBe("館");
  });

  it("Invariant 9: Okitsumiya sacred island is recognized as shrine and probable ancient (Issue #39)", () => {
    const okitsumiya: ReviewAtlasSpot = {
      id: "spot-okitsumiya",
      name: "勝馬 沖津宮（沖津島）",
      region: "福岡県 · 福岡市東区",
      kind: "神社・海中島嶼聖域",
      latitude: 33.6845,
      longitude: 130.2872,
      claimIds: ["claim-shika-016"],
      mapRole: "visited-place",
    };
    expect(resolveSpotEpistemicNature(okitsumiya)).toBe("probable_ancient");
    expect(mapSpotPresentation(okitsumiya).id).toBe("shrine");
    expect(mapSpotPresentation(okitsumiya).icon).toBe("社");
  });

  it("Invariant 10: Area representative points are distinguished as area_context with custom styling (Issue #39)", () => {
    const hagiArea: ReviewAtlasSpot = {
      id: "spot-geocode-888466064767",
      name: "萩",
      region: "山口県 · 萩市",
      kind: "地域・行政区域",
      latitude: 34.4081,
      longitude: 131.3991,
      claimIds: [],
      mapRole: "visited-place",
    };
    expect(resolveSpotEpistemicNature(hagiArea)).toBe("area_context");
    expect(mapSpotPresentation(hagiArea).id).toBe("area");
    expect(mapSpotPresentation(hagiArea).icon).toBe("域");
    expect(mapSpotPresentation(hagiArea).color).toBe("#9575cd");
  });
});
