import { describe, expect, it } from "vitest";

import { registeredLensTopics, type LensLayoutArchetype } from "@/domain/lens-packs/knowledge-registry";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { projectLensPreset } from "@/domain/lens-packs/projection";
import { calculateFactionPolarLayout } from "@/domain/lenses/layout/faction-polar-layout";

describe("Faction Network Archetype Topics Verification", () => {
  it("identifies all topics designated as faction archetype", () => {
    const factionTopics = registeredLensTopics.filter((t) => t.archetype === "faction");
    expect(factionTopics.length).toBeGreaterThanOrEqual(6);

    const ids = factionTopics.map((t) => t.id);
    expect(ids).toContain("yamatai-politics");
    expect(ids).toContain("ishin-figures-network");
    expect(ids).toContain("izumo-kunitsukami-preset");
    expect(ids).toContain("miyajima-patronage-and-space");
    expect(ids).toContain("hagi-domain-politics");
    expect(ids).toContain("dazaifu-defense-preset");
  });

  it("verifies ancient defense topic has faction archetype and core defense network entities", () => {
    const defenseTopic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset");
    expect(defenseTopic).toBeDefined();
    expect(defenseTopic?.archetype).toBe("faction");
    expect(defenseTopic?.archetypeLabel).toBe("勢力・相関型");

    const projection = projectLensPreset(defenseTopic!.pack, defenseTopic!.presetId);
    expect(projection.nodes.length).toBeGreaterThanOrEqual(5);
    const nodeIds = projection.nodes.map((n) => n.id);
    expect(nodeIds).toContain("place-mizuki");
    expect(nodeIds).toContain("place-ono-jo");
  });

  it("verifies Izumo Kuniyuzuri topic has faction archetype and core confrontation entities", () => {
    const izumoTopic = registeredLensTopics.find((t) => t.id === "izumo-kunitsukami-preset");
    expect(izumoTopic).toBeDefined();
    expect(izumoTopic?.archetype).toBe("faction");
    expect(izumoTopic?.archetypeLabel).toBe("勢力・相関型");
    expect(izumoTopic?.label).toBe("出雲国譲り神話（天津神と国津神の対峙）");

    const projection = projectLensPreset(izumoTopic!.pack, izumoTopic!.presetId);
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "izumo-taisha",
        "inasa-no-hama",
        "miho-shrine",
        "kamosu-shrine",
        "ookuninushi",
        "kotoshironushi",
      ]),
    );

    // Verify enshrinement and association edges
    expect(projection.edges.some((e) => e.predicate === "enshrined_at")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "associated_with")).toBe(true);
  });

  it("verifies Yamatai politics contains multiple polities and confrontation edges", () => {
    const yamataiTopic = registeredLensTopics.find((t) => t.id === "yamatai-politics");
    expect(yamataiTopic).toBeDefined();
    expect(yamataiTopic?.archetype).toBe("faction");

    const projection = projectLensPreset(yamataiTopic!.pack, yamataiTopic!.presetId);
    const politiesAndGroups = projection.nodes.filter((n) => n.kind === "polity" || n.kind === "group");
    expect(politiesAndGroups.map((n) => n.id)).toEqual(
      expect.arrayContaining(["yamatai-state", "kunu-state", "wei", "ittaisotsu", "wa-polities"]),
    );

    // Verify opposition and diplomacy predicates
    expect(projection.edges.some((e) => e.predicate === "opposed")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "dispatched")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "conferred_title_on")).toBe(true);
  });

  it("verifies Ishin figures network contains allied factions and mediators", () => {
    const ishinTopic = registeredLensTopics.find((t) => t.id === "ishin-figures-network");
    expect(ishinTopic).toBeDefined();
    expect(ishinTopic?.archetype).toBe("faction");

    const projection = projectLensPreset(ishinTopic!.pack, ishinTopic!.presetId);
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(["choshu-domain", "satsuma-domain", "satcho-alliance", "sakamoto-ryoma"]),
    );
  });

  it("resolves faction topics properly with archetype metadata in resolveLensTopics", () => {
    const resolvedPolitics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [],
      spots: [],
      includeUnvisited: true,
    });

    const yamataiResolved = resolvedPolitics.find((t) => t.id === "yamatai-politics");
    expect(yamataiResolved).toBeDefined();
    expect(yamataiResolved?.archetype).toBe<LensLayoutArchetype>("faction");
    expect(yamataiResolved?.archetypeLabel).toBe("勢力・相関型");

    const resolvedMythology = resolveLensTopics({
      perspectiveId: "mythology",
      claims: [],
      spots: [],
      includeUnvisited: true,
    });

    const izumoResolved = resolvedMythology.find((t) => t.id === "izumo-kunitsukami-preset");
    expect(izumoResolved).toBeDefined();
    expect(izumoResolved?.archetype).toBe<LensLayoutArchetype>("faction");
    expect(izumoResolved?.archetypeLabel).toBe("勢力・相関型");
  });

  it("verifies ancient-chieftains-network has faction archetype and chieftain confrontation/alliance edges", () => {
    const topic = registeredLensTopics.find((t) => t.id === "ancient-chieftains-network");
    expect(topic).toBeDefined();
    expect(topic?.archetype).toBe("faction");
    expect(topic?.perspectiveId).toBe("people");
    expect(topic?.label).toBe("古代海人首長・大和王権同盟網");

    const projection = projectLensPreset(topic!.pack, topic!.presetId);
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "azumi-isora",
        "munakata-tokuzen",
        "tsukushi-no-iwai",
        "mononobe-no-arakahi",
        "takechi-no-miko",
        "azumi-clan",
        "munakata-clan",
        "tsukushi-clan",
        "yamato-court",
      ]),
    );

    expect(projection.edges.some((e) => e.predicate === "opposed")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "allied_with")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "enshrined_at")).toBe(true);
  });

  it("verifies genpei-dannoura-network has faction archetype and Genpei war confrontation edges", () => {
    const topic = registeredLensTopics.find((t) => t.id === "genpei-dannoura-network");
    expect(topic).toBeDefined();
    expect(topic?.archetype).toBe("faction");
    expect(topic?.perspectiveId).toBe("people");
    expect(topic?.label).toBe("源平合戦・瀬戸内海壇と壇ノ浦決戦");

    const projection = projectLensPreset(topic!.pack, topic!.presetId);
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "taira-no-kiyomori",
        "emperor-antoku",
        "kenreimon-in",
        "taira-no-tomomori",
        "taira-no-noritsune",
        "minamoto-no-yoshitsune",
        "ogata-koreyoshi",
        "heike-clan",
        "genji-clan",
      ]),
    );

    expect(projection.edges.some((e) => e.predicate === "opposed")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "allied_with")).toBe(true);
    expect(projection.edges.some((e) => e.predicate === "enshrined_at")).toBe(true);
  });

  it("verifies ancient defense structural layout with designated factions and balanced polar layout", () => {
    const defenseTopic = registeredLensTopics.find((t) => t.id === "dazaifu-defense-preset");
    expect(defenseTopic).toBeDefined();
    expect(defenseTopic?.designatedFactions).toBeDefined();
    expect(defenseTopic?.designatedFactions?.length).toBe(2);
    expect(defenseTopic?.boundaryAxis?.label).toBe("663白村江・国家総力防衛ライン");
    expect(defenseTopic?.scopeClusters?.length).toBe(2);

    const projection = projectLensPreset(defenseTopic!.pack, defenseTopic!.presetId);
    const layout = calculateFactionPolarLayout(projection.nodes, projection.edges, {
      designatedFactions: defenseTopic?.designatedFactions,
      boundaryAxis: defenseTopic?.boundaryAxis,
    });

    expect(layout.factionZones.length).toBe(2);
    // Zone 0: 西海道・大宰府防衛中枢 (anchor: polity-dazaifu + 5 members)
    const frontZone = layout.factionZones.find((z) => z.id === "dazaifu-front");
    expect(frontZone).toBeDefined();
    expect(frontZone?.anchorNodeId).toBe("polity-dazaifu");
    expect(frontZone?.memberNodeIds.length).toBe(5);

    // Zone 1: 国家統治中枢 ＆ 本土・畿内防衛網 (anchor: polity-yamato-court + 3 members)
    const courtZone = layout.factionZones.find((z) => z.id === "yamato-court");
    expect(courtZone).toBeDefined();
    expect(courtZone?.anchorNodeId).toBe("polity-yamato-court");
    expect(courtZone?.memberNodeIds.length).toBe(3);

    // Boundary axis matches declarative configuration
    expect(layout.boundaryAxis.label).toBe("663白村江・国家総力防衛ライン");
    expect(layout.boundaryAxis.icon).toBe("🛡️");
  });

  it("verifies horizontal deployment of designated factions and scope clusters across all key faction topics", () => {
    const testTopicIds = [
      "dazaifu-defense-preset",
      "ancient-chieftains-network",
      "genpei-dannoura-network",
      "yamatai-politics",
      "ishin-figures-network",
    ];

    for (const topicId of testTopicIds) {
      const topic = registeredLensTopics.find((t) => t.id === topicId);
      expect(topic, `Topic ${topicId} must exist`).toBeDefined();
      expect(topic?.designatedFactions, `Topic ${topicId} must have designated factions`).toBeDefined();
      expect(topic?.designatedFactions?.length, `Topic ${topicId} must have at least 2 factions`).toBeGreaterThanOrEqual(2);
      expect(topic?.boundaryAxis, `Topic ${topicId} must have a boundary axis`).toBeDefined();
      expect(topic?.scopeClusters, `Topic ${topicId} must have scope clusters`).toBeDefined();
      expect(topic?.scopeClusters?.length, `Topic ${topicId} must have at least 2 scope clusters`).toBeGreaterThanOrEqual(2);

      // Verify layout calculation executes seamlessly with declarative config
      const projection = projectLensPreset(topic!.pack, topic!.presetId);
      const layout = calculateFactionPolarLayout(projection.nodes, projection.edges, {
        designatedFactions: topic?.designatedFactions,
        boundaryAxis: topic?.boundaryAxis,
      });

      expect(layout.factionZones.length).toBe(topic!.designatedFactions!.length);
      expect(layout.boundaryAxis.label).toBe(topic!.boundaryAxis!.label);
      expect(layout.nodePositions.size).toBeGreaterThanOrEqual(projection.nodes.length);
    }
  });
});
