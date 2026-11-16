import { describe, expect, it } from "vitest";

import { resolveCrossTopicPortals } from "./cross-topic-portals";

describe("cross-topic-portals (ADR-0022)", () => {
  it("resolves multi-topic portals for 出雲大社 across presets", () => {
    const allPortals = resolveCrossTopicPortals("izumo-taisha");
    expect(allPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = allPortals.map((p) => p.topicId);
    expect(topicIds).toContain("izumo-kunitsukami-preset");
    expect(topicIds).toContain("izumo-kunitsukami-corridor");

    // When viewing from izumo-kunitsukami-corridor, the active topic is excluded
    const fromCorridor = resolveCrossTopicPortals("izumo-taisha", {
      currentTopicId: "izumo-kunitsukami-corridor",
    });
    expect(fromCorridor.map((p) => p.topicId)).not.toContain("izumo-kunitsukami-corridor");
    expect(fromCorridor.map((p) => p.topicId)).toContain("izumo-kunitsukami-preset");
  });

  it("resolves portals by Japanese label and aliases", () => {
    const byName = resolveCrossTopicPortals({ name: "出雲大社" }, {
      currentTopicId: "izumo-kunitsukami-preset",
    });
    expect(byName.map((p) => p.topicId)).toContain("izumo-kunitsukami-corridor");

    // Classical alias 天日隅宮 (Ground Anchor alias coverage)
    const byAlias = resolveCrossTopicPortals({ name: "天日隅宮" });
    expect(byAlias.map((p) => p.topicId)).toContain("izumo-kunitsukami-preset");
    expect(byAlias.map((p) => p.topicId)).toContain("izumo-kunitsukami-corridor");
  });

  it("resolves multi-topic portals for 厳島神社 across packs", () => {
    const miyajimaPortals = resolveCrossTopicPortals("itsukushima-shrine");
    expect(miyajimaPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = miyajimaPortals.map((p) => p.topicId);
    expect(topicIds).toContain("miyajima-sacred-relations");

    // Kyujitai and alias matching
    const byKyujitai = resolveCrossTopicPortals({ name: "嚴島神社" });
    expect(byKyujitai.map((p) => p.topicId)).toContain("miyajima-sacred-relations");
  });

  it("resolves multi-topic portals for 宇佐神宮 across packs", () => {
    const usaPortals = resolveCrossTopicPortals("usa-jingu");
    expect(usaPortals.length).toBeGreaterThanOrEqual(2);

    const topicIds = usaPortals.map((p) => p.topicId);
    expect(topicIds).toContain("religion-syncretism");
    expect(topicIds).toContain("ichinomiya-western-preset");
  });

  it("resolves multi-topic portals for Moji & Chofu Kanmon crossover shrines (古代×源平)", () => {
    // 和布刈神社: 海洋神話 (marine-deities-preset) & 神功皇后 (jingu-kogo-legend-preset) & 壇ノ浦 (genpei-dannoura-network)
    const mekariPortals = resolveCrossTopicPortals({ id: "spot-mekari-jinja", name: "和布刈神社" });
    const mekariTopicIds = mekariPortals.map((p) => p.topicId);
    expect(mekariTopicIds).toContain("marine-deities-preset");
    expect(mekariTopicIds).toContain("jingu-kogo-legend-preset");
    expect(mekariTopicIds).toContain("genpei-dannoura-network");

    // primarySpotId のみによる O(1) 決定論的解決（名称が変わっても引けること）
    const mekariBySpotIdPortals = resolveCrossTopicPortals({ id: "spot-mekari-jinja", name: "関門最狭部神社" });
    expect(mekariBySpotIdPortals.map((p) => p.topicId)).toContain("genpei-dannoura-network");

    // 甲宗八幡宮: 神功皇后 (jingu-kogo-legend-preset) & 壇ノ浦 (genpei-dannoura-network)
    const kosoPortals = resolveCrossTopicPortals({ id: "spot-koso-hachimangu", name: "甲宗八幡宮" });
    const kosoTopicIds = kosoPortals.map((p) => p.topicId);
    expect(kosoTopicIds).toContain("jingu-kogo-legend-preset");
    expect(kosoTopicIds).toContain("genpei-dannoura-network");

    // 戸上神社: 神功皇后 (jingu-kogo-legend-preset) & 壇ノ浦 (genpei-dannoura-network)
    const togamiPortals = resolveCrossTopicPortals({ id: "spot-tonogami-jinja", name: "戸上神社（本宮・上宮遥拝）" });
    const togamiTopicIds = togamiPortals.map((p) => p.topicId);
    expect(togamiTopicIds).toContain("jingu-kogo-legend-preset");
    expect(togamiTopicIds).toContain("genpei-dannoura-network");
  });

  it("resolves multi-topic portals for Dazaifu spots (太宰府天満宮, 九州国立博物館)", () => {
    // 太宰府天満宮: サプライチェーン (prehistoric-supply-chain-preset)
    const dazaifuPortals = resolveCrossTopicPortals({ id: "spot-dazaifu-tenmangu", name: "太宰府天満宮" });
    const dazaifuTopicIds = dazaifuPortals.map((p) => p.topicId);
    expect(dazaifuTopicIds).toContain("prehistoric-supply-chain-preset");

    // 九州国立博物館: 三角縁神獣鏡同盟 (sankakubuchi-alliance-preset) & サプライチェーン (prehistoric-supply-chain-preset)
    const kyuhakuPortals = resolveCrossTopicPortals({ id: "spot-kyushu-national-museum", name: "九州国立博物館" });
    const kyuhakuTopicIds = kyuhakuPortals.map((p) => p.topicId);
    expect(kyuhakuTopicIds).toContain("sankakubuchi-alliance-preset");
    expect(kyuhakuTopicIds).toContain("prehistoric-supply-chain-preset");
  });

  it("resolves working non-stratum LENS portals for Kunisaki, Chikushi archaic shrines, Ito-jo, and Early Modern Nagasaki spots (Issue #42)", async () => {
    const { registeredLensTopics } = await import("./knowledge-registry");
    const stratumTopicIds = new Set(registeredLensTopics.filter((t) => t.isStratum).map((t) => t.id));

    const expectedPortals: Array<{ spotId: string; name: string; expectedTopicId: string }> = [
      { spotId: "futagoji", name: "両子寺", expectedTopicId: "usa-rokugo-syncretism-preset" },
      { spotId: "kumano-magaibutsu", name: "熊野磨崖仏", expectedTopicId: "usa-rokugo-syncretism-preset" },
      { spotId: "spot-kashii-furumiya-shrine", name: "古宮大明神社・訶志比宮址（沙庭斎場・棺掛椎）", expectedTopicId: "jingu-kogo-legend-preset" },
      { spotId: "spot-ojo-jinja-tonokoga", name: "王城神社", expectedTopicId: "archaic-local-shrines" },
      { spotId: "spot-taiso-jinja-gegu", name: "太祖神社 下宮（太祖宮）", expectedTopicId: "archaic-local-shrines" },
      { spotId: "spot-import-ff7ade7e", name: "高祖山", expectedTopicId: "dazaifu-defense-preset" },
      { spotId: "spot-suwa-shrine-nagasaki", name: "諏訪神社", expectedTopicId: "early-modern-port-network-preset" },
      { spotId: "spot-matsumori-tenmangu", name: "松森天満宮", expectedTopicId: "early-modern-port-network-preset" },
      { spotId: "spot-dejima-nagasaki", name: "出島（出島和蘭商館跡）", expectedTopicId: "early-modern-port-network-preset" },
      { spotId: "spot-nagasaki-museum", name: "長崎歴史文化博物館", expectedTopicId: "early-modern-port-network-preset" },
    ];

    for (const { spotId, name, expectedTopicId } of expectedPortals) {
      const portals = resolveCrossTopicPortals({ id: spotId, name });
      const topicIds = portals.map((p) => p.topicId);
      expect(topicIds, `${name} (${spotId}) should resolve portal ${expectedTopicId}`).toContain(expectedTopicId);

      // Must include at least one navigable non-stratum LENS topic so STRATUM -> LENS jump never drops to fallback
      const nonStratumPortals = portals.filter((p) => !stratumTopicIds.has(p.topicId));
      expect(
        nonStratumPortals.length,
        `${name} (${spotId}) must have at least 1 clickable non-stratum LENS portal`,
      ).toBeGreaterThanOrEqual(1);
    }

    // Kunisaki also remains connected in religion-syncretism stratum
    expect(resolveCrossTopicPortals({ id: "futagoji", name: "両子寺" }).map((p) => p.topicId)).toContain(
      "religion-syncretism",
    );
  });

  it("returns empty array for unknown or empty targets safely", () => {
    expect(resolveCrossTopicPortals(undefined)).toEqual([]);
    expect(resolveCrossTopicPortals("")).toEqual([]);
    expect(resolveCrossTopicPortals("non-existent-entity-99999")).toEqual([]);
  });
});
