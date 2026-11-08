import { describe, expect, it } from "vitest";
import { ancientMaterialCulturePack } from "./ancient-material-culture-pack";
import { projectLensPreset } from "./projection";
import { registeredLensTopics } from "./knowledge-registry";

describe("Ancient Material Culture Pack (古代物質文化・威信財同盟網)", () => {
  it("verifies pack metadata and sources integrity", () => {
    expect(ancientMaterialCulturePack.id).toBe("ancient-material-culture");
    expect(ancientMaterialCulturePack.status).toBe("active");
    expect(ancientMaterialCulturePack.sources.length).toBeGreaterThanOrEqual(6);
    expect(ancientMaterialCulturePack.viewpoints.length).toBe(2);
    expect(ancientMaterialCulturePack.presets.length).toBe(2);
  });

  describe("Topic 1: Sankakubuchi Alliance (三角縁神獣鏡 同笵鏡同盟網)", () => {
    it("projects valid nodes and edges for faction archetype", () => {
      const projection = projectLensPreset(
        ancientMaterialCulturePack,
        "sankakubuchi-alliance-preset",
      );

      expect(projection.nodes.length).toBeGreaterThanOrEqual(8);
      expect(projection.edges.length).toBeGreaterThanOrEqual(8);

      // Core Alliance Sites
      const kurozuka = projection.nodes.find((n) => n.id === "place-kurozuka");
      const tsubai = projection.nodes.find((n) => n.id === "place-tsubai-otsukayama");
      const bizen = projection.nodes.find((n) => n.id === "place-bizen-kurumazuka");
      const ishizukayama = projection.nodes.find((n) => n.id === "place-ishizukayama");
      const gionyama = projection.nodes.find((n) => n.id === "place-gionyama-kofun");
      const hirabaru = projection.nodes.find((n) => n.id === "place-hirabaru");

      expect(kurozuka).toBeDefined();
      expect(tsubai).toBeDefined();
      expect(bizen).toBeDefined();
      expect(ishizukayama).toBeDefined();
      expect(gionyama).toBeDefined();
      expect(hirabaru).toBeDefined();

      // Dazaifu Kyushu National Museum node
      const kyuhaku = projection.nodes.find((n) => n.id === "place-kyushu-national-museum");
      expect(kyuhaku).toBeDefined();
      expect(kyuhaku?.label).toContain("九州国立博物館");

      // Registered topic integrity
      const topic = registeredLensTopics.find(
        (t) => t.id === "sankakubuchi-alliance-preset",
      );
      expect(topic).toBeDefined();
      expect(topic?.archetype).toBe("faction");
      expect(topic?.perspectiveId).toBe("politics");
      expect(topic?.focus).toBe("chieftain-alliance");
      expect(topic?.designatedFactions?.length).toBe(6);
    });
  });

  describe("Topic 2: Prehistoric Supply Chain (古代列島鉱物交易サプライチェーン)", () => {
    it("projects valid nodes and edges for hub-spoke archetype", () => {
      const projection = projectLensPreset(
        ancientMaterialCulturePack,
        "prehistoric-supply-chain-preset",
      );

      expect(projection.nodes.length).toBeGreaterThanOrEqual(10);
      expect(projection.edges.length).toBeGreaterThanOrEqual(10);

      // Core Hub and 4 Major Resources
      const hub = projection.nodes.find((n) => n.id === "hub-yamato-workshop");
      const itoigawa = projection.nodes.find((n) => n.id === "place-itoigawa-jade");
      const wakasugiyama = projection.nodes.find((n) => n.id === "place-wakasugiyama");
      const kasenyama = projection.nodes.find((n) => n.id === "place-kasenyama-jasper");
      const gaya = projection.nodes.find((n) => n.id === "place-gaya-iron");

      expect(hub).toBeDefined();
      expect(itoigawa).toBeDefined();
      expect(wakasugiyama).toBeDefined();
      expect(kasenyama).toBeDefined();
      expect(gaya).toBeDefined();

      // Sanctuaries / Shrines
      const nibu = projection.nodes.find((n) => n.id === "shrine-nibu-tsuhime");
      const nunakawa = projection.nodes.find((n) => n.id === "shrine-nunakawa-hime");
      const tamatsukuri = projection.nodes.find((n) => n.id === "shrine-tamatsukuri");
      const munakata = projection.nodes.find((n) => n.id === "shrine-munakata-taisha");

      expect(nibu).toBeDefined();
      expect(nunakawa).toBeDefined();
      expect(tamatsukuri).toBeDefined();
      expect(munakata).toBeDefined();

      // Dazaifu Tenmangu (Maritime Watatsumi sanctuary node)
      const dazaifu = projection.nodes.find((n) => n.id === "place-dazaifu-tenmangu");
      expect(dazaifu).toBeDefined();
      expect(dazaifu?.label).toContain("太宰府天満宮");

      // Registered topic integrity
      const topic = registeredLensTopics.find(
        (t) => t.id === "prehistoric-supply-chain-preset",
      );
      expect(topic).toBeDefined();
      expect(topic?.archetype).toBe("hub-spoke");
      expect(topic?.perspectiveId).toBe("route");
      expect(topic?.focus).toBe("highways");
    });
  });
});
