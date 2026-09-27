import { describe, expect, it } from "vitest";
import { getKnowledgePack, shikinaishaChikuzenBuzenPack } from "./pack-loader";
import { projectLensMapPreset } from "./projection";
import { LensKnowledgePackSchema } from "./schema";
import { knowledgeVisitFrontierSuggestionsForVisitedSpots } from "../map/registry";
import type { ReviewAtlasSpot } from "../review/types";

describe("pack-loader & shikinaisha pack", () => {
  it("validates shikinaisha pack against LensKnowledgePackSchema", () => {
    expect(() => LensKnowledgePackSchema.parse(shikinaishaChikuzenBuzenPack)).not.toThrow();
    expect(shikinaishaChikuzenBuzenPack.id).toBe("shikinaisha-chikuzen-buzen");
    expect(shikinaishaChikuzenBuzenPack.entities.length).toBeGreaterThanOrEqual(10);
  });

  it("retrieves the pack via getKnowledgePack", () => {
    const pack = getKnowledgePack("shikinaisha-chikuzen-buzen");
    expect(pack).toBeDefined();
    expect(pack?.presets).toHaveLength(1);
    expect(pack?.presets[0]?.id).toBe("shikinaisha-network-preset");
  });

  it("preserves explorationQuestions in mapConnection projection", () => {
    const projected = projectLensMapPreset(shikinaishaChikuzenBuzenPack, "shikinaisha-network-preset");
    expect(projected.length).toBeGreaterThanOrEqual(2);

    const maritimeConn = projected.find((c) => c.id === "chikuzen-buzen-maritime-network");
    expect(maritimeConn).toBeDefined();
    expect(maritimeConn?.explorationQuestions).toBeDefined();

    // Check that places have question & reason
    const shigaQ = maritimeConn?.explorationQuestions?.["place-shikaga-jinja"];
    expect(shigaQ).toBeDefined();
    expect(shigaQ?.question).toContain("志賀海神社");
    expect(shigaQ?.reason).toBeDefined();
  });

  it("generates frontier suggestions with enriched questions when visited spots match", () => {
    const visitedMunakataSpot: ReviewAtlasSpot = {
      id: "spot-munakata",
      name: "宗像大社辺津宮",
      region: "福岡",
      kind: "shrine",
      latitude: 33.8306,
      longitude: 130.5138,
      claimIds: ["claim-1"],
      mapRole: "visited-place",
      positionStatus: "confirmed",
    };

    const suggestions = knowledgeVisitFrontierSuggestionsForVisitedSpots([visitedMunakataSpot]);
    const shigaSuggestion = suggestions.find((s) => s.targetName === "志賀海神社");

    expect(shigaSuggestion).toBeDefined();
    expect(shigaSuggestion?.targetKind).toBe("knowledge_unvisited");
    expect(shigaSuggestion?.actionType).toBe("field_visit");
    expect(shigaSuggestion?.question).toContain("志賀海神社");
    expect(shigaSuggestion?.reason).toContain("玄界灘・周防灘海上守護回廊");
  });

  it("validates and projects ancient defense network pack", () => {
    const pack = getKnowledgePack("ancient-defense-network");
    expect(pack).toBeDefined();
    expect(() => LensKnowledgePackSchema.parse(pack)).not.toThrow();

    const projected = projectLensMapPreset(pack!, "dazaifu-defense-preset");
    expect(projected.length).toBe(3);

    const dazaifuCore = projected.find((c) => c.id === "dazaifu-core-defense-network");
    expect(dazaifuCore).toBeDefined();
    expect(dazaifuCore?.places.map((p) => p.label)).toContain("水城跡");
    expect(dazaifuCore?.places.map((p) => p.label)).toContain("大野城跡");
    expect(dazaifuCore?.places.map((p) => p.label)).toContain("基肄城跡");

    // Check explorationQuestions on fortresses
    const mizukiQ = dazaifuCore?.explorationQuestions?.["place-mizuki"];
    expect(mizukiQ).toBeDefined();
    expect(mizukiQ?.question).toBeDefined();
    expect(mizukiQ?.reason).toBeDefined();
  });

  it("validates and projects western ichinomiya pack", () => {
    const pack = getKnowledgePack("ichinomiya-western-network");
    expect(pack).toBeDefined();
    expect(() => LensKnowledgePackSchema.parse(pack)).not.toThrow();

    const projected = projectLensMapPreset(pack!, "ichinomiya-western-preset");
    expect(projected.length).toBe(3);

    const kyushuCircuit = projected.find((c) => c.id === "kyushu-ichinomiya-circuit");
    expect(kyushuCircuit).toBeDefined();
    expect(kyushuCircuit?.places.map((p) => p.label)).toContain("筥崎宮");
    expect(kyushuCircuit?.places.map((p) => p.label)).toContain("宇佐神宮");
    expect(kyushuCircuit?.places.map((p) => p.label)).toContain("阿蘇神社");

    // Check explorationQuestions
    const hakozakiQ = kyushuCircuit?.explorationQuestions?.["place-hakozaki-gu"];
    expect(hakozakiQ).toBeDefined();
    expect(hakozakiQ?.question).toBeDefined();
    expect(hakozakiQ?.reason).toBeDefined();
  });

  it("validates and projects shoka sonjuku network pack", () => {
    const pack = getKnowledgePack("shoka-sonjuku-network");
    expect(pack).toBeDefined();
    expect(() => LensKnowledgePackSchema.parse(pack)).not.toThrow();

    const projected = projectLensMapPreset(pack!, "shoka-sonjuku-action-preset");
    expect(projected.length).toBe(3);

    const kaiten = projected.find((c) => c.id === "hagi-shimonoseki-kaiten-corridor");
    expect(kaiten).toBeDefined();
    expect(kaiten?.places.map((p) => p.label)).toContain("松下村塾");
    expect(kaiten?.places.map((p) => p.label)).toContain("功山寺");
    expect(kaiten?.places.map((p) => p.label)).toContain("東行庵");

    // Check explorationQuestions
    const kouzanjiQ = kaiten?.explorationQuestions?.["place-kouzanji"];
    expect(kouzanjiQ).toBeDefined();
    expect(kouzanjiQ?.question).toBeDefined();
    expect(kouzanjiQ?.reason).toBeDefined();
  });

  it("validates and projects ancient highways network pack", () => {
    const pack = getKnowledgePack("ancient-highways-network");
    expect(pack).toBeDefined();
    expect(() => LensKnowledgePackSchema.parse(pack)).not.toThrow();

    const projected = projectLensMapPreset(pack!, "ancient-highways-preset");
    expect(projected.length).toBe(2);

    const saikaido = projected.find((c) => c.id === "saikaido-dazaifu-official-road");
    expect(saikaido).toBeDefined();
    expect(saikaido?.places.map((p) => p.label)).toContain("関門海峡渡航地点（赤間関）");
    expect(saikaido?.places.map((p) => p.label)).toContain("鴻臚館跡");
    expect(saikaido?.places.map((p) => p.label)).toContain("大宰府政庁跡");

    // Check explorationQuestions
    const korokanQ = saikaido?.explorationQuestions?.["place-korokan"];
    expect(korokanQ).toBeDefined();
    expect(korokanQ?.question).toBeDefined();
    expect(korokanQ?.reason).toBeDefined();
  });
});
