import { describe, expect, it } from "vitest";

import { registeredLensTopics, type LensLayoutArchetype } from "@/domain/lens-packs/knowledge-registry";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { projectLensPreset } from "@/domain/lens-packs/projection";

describe("Faction Network Archetype Topics Verification", () => {
  it("identifies all topics designated as faction archetype", () => {
    const factionTopics = registeredLensTopics.filter((t) => t.archetype === "faction");
    expect(factionTopics.length).toBeGreaterThanOrEqual(5);

    const ids = factionTopics.map((t) => t.id);
    expect(ids).toContain("yamatai-politics");
    expect(ids).toContain("ishin-figures-network");
    expect(ids).toContain("izumo-kunitsukami-preset");
    expect(ids).toContain("miyajima-patronage-and-space");
    expect(ids).toContain("hagi-domain-politics");
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
});
