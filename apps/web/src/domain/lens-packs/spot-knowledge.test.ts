import { describe, expect, it } from "vitest";

import type { ReviewAtlasSpot } from "@/domain/review/types";
import { validClaimFixture } from "@/domain/knowledge/fixtures";

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

  it("shows Umi as a reviewed but disputed Fumi identification", () => {
    const contexts = resolveSpotKnowledgeContexts(spot("宇美町"));
    const context = contexts.find((candidate) => candidate.entityId === "umi");

    expect(context?.relations.some((relation) => relation.relatedEntityLabel === "不弥国")).toBe(true);
    expect(context?.sources.some((source) => source.publisher === "宇美町")).toBe(true);
  });

  it("follows a Spot Claim's stable Entity ID into external knowledge", () => {
    const target = { ...spot("高祖山"), claimIds: ["claim-ito"] };
    const claim = { ...validClaimFixture, id: "claim-ito", subject: { ...validClaimFixture.subject, id: "ito-state", name: "伊都国" } };
    const contexts = resolveSpotKnowledgeContexts(target, [claim]);

    expect(contexts.some((context) => context.entityId === "ito-state" && context.basis === "claim_entity" && context.claimIds.includes("claim-ito"))).toBe(true);
  });

  it("does not replace a stable facility ID through a partial name match", () => {
    const target = { ...spot("資料館"), claimIds: ["claim-museum"] };
    const claim = { ...validClaimFixture, id: "claim-museum", subject: { ...validClaimFixture.subject, id: "museum", name: "奴国の丘歴史公園" } };
    expect(resolveSpotKnowledgeContexts(target, [claim]).some((context) => context.entityId === "na-state")).toBe(false);
  });

  it("routes Hagi knowledge to reusable perspectives rather than removed target tabs", () => {
    const contexts = resolveSpotKnowledgeContexts(spot("高杉晋作誕生地"));

    expect(contexts.some((context) => context.lensId === "politics")).toBe(true);
    expect(contexts.some((context) => context.lensId === "people")).toBe(true);
    expect(contexts.some((context) => context.lensId === "bakumatsu" || context.lensId === "restoration-figures")).toBe(false);
  });

  it("maps Shirakami Shrine and Numakuma Shrine to marine deities and maritime rites topic", () => {
    const shirakamiContexts = resolveSpotKnowledgeContexts(spot("白神社"));
    const shirakami = shirakamiContexts.find((c) => c.entityId === "shirakami-shrine");
    expect(shirakami).toBeDefined();
    expect(shirakami?.lensId).toBe("mythology");
    expect(shirakami?.topicId).toBe("marine-deities-preset");
    expect(shirakami?.topicLabel).toBe("海洋神話と古代海人族三系統");

    const numakumaContexts = resolveSpotKnowledgeContexts(spot("沼名前神社"));
    const numakuma = numakumaContexts.find((c) => c.entityId === "numakuma-shrine");
    expect(numakuma).toBeDefined();
    expect(numakuma?.lensId).toBe("mythology");
    expect(numakuma?.topicId).toBe("marine-deities-preset");
    expect(numakuma?.topicLabel).toBe("海洋神話と古代海人族三系統");
  });

  it("resolves Hiratsuka Kawazoe and Amagi Museum via yayoi archaeology network", () => {
    const hiratsukaContexts = resolveSpotKnowledgeContexts(spot("平塚川添遺跡"));
    expect(hiratsukaContexts.some((c) => c.packId === "yayoi-archaeology-network")).toBe(true);

    const amagiContexts = resolveSpotKnowledgeContexts(spot("甘木歴史資料館"));
    expect(amagiContexts.some((c) => c.packId === "yayoi-archaeology-network")).toBe(true);
  });

  it("resolves Joshinin via religion syncretism pack", () => {
    const joshininContexts = resolveSpotKnowledgeContexts(spot("浄心院"));
    const joshinin = joshininContexts.find((c) => c.entityId === "joshinin");
    expect(joshinin).toBeDefined();
    expect(joshinin?.lensId).toBe("religion");
  });
});
