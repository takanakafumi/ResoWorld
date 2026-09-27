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
});
