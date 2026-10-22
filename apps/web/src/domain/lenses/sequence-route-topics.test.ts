import { describe, expect, it } from "vitest";

import { registeredLensTopics, type LensLayoutArchetype } from "@/domain/lens-packs/knowledge-registry";
import { resolveLensTopics } from "@/domain/lenses/topic-resolver";
import { projectLensPreset } from "@/domain/lens-packs/projection";

describe("Sequence Route Archetype Topics Verification", () => {
  it("identifies all topics designated as sequence archetype", () => {
    const sequenceTopics = registeredLensTopics.filter((t) => t.archetype === "sequence");
    expect(sequenceTopics.length).toBeGreaterThanOrEqual(7);

    const ids = sequenceTopics.map((t) => t.id);
    expect(ids).toContain("jingu-kogo-legend-preset");
    expect(ids).toContain("jingu-kanmon-usa-preset");
    expect(ids).toContain("jinmu-setouchi-route-preset");
    expect(ids).toContain("jinmu-yamato-conquest-preset");
    expect(ids).toContain("hyuga-umiyamasachi-route");
    expect(ids).toContain("ancient-highways-preset");
    expect(ids).toContain("miyajima-current-paths");
  });

  it("verifies sequential placeEntityIds on primary map connections for sequence topics", () => {
    const sequenceTopics = registeredLensTopics.filter((t) => t.archetype === "sequence");

    for (const topic of sequenceTopics) {
      const preset = topic.pack.presets.find((p) => p.id === topic.presetId);
      expect(preset, `Preset not found for ${topic.id}`).toBeDefined();

      if (preset?.mapConnections && preset.mapConnections.length > 0) {
        const primaryConn = preset.mapConnections[0];
        expect(primaryConn.placeEntityIds.length, `No placeEntityIds in ${topic.id}`).toBeGreaterThanOrEqual(2);

        // If exploration questions exist, they must have valid question and reason
        const questions = primaryConn.explorationQuestions ?? {};
        const questionKeys = Object.keys(questions);
        for (const placeId of questionKeys) {
          expect(questions[placeId].question).toBeTruthy();
          expect(questions[placeId].reason).toBeTruthy();
        }
      }
    }
  });

  it("verifies Jingu Kogo birth corridor sequence order and exploration questions", () => {
    const jinguTopic = registeredLensTopics.find((t) => t.id === "jingu-kogo-legend-preset");
    expect(jinguTopic).toBeDefined();
    expect(jinguTopic?.archetype).toBe("sequence");

    const preset = jinguTopic!.pack.presets.find((p) => p.id === jinguTopic!.presetId);
    const conn = preset!.mapConnections[0];

    // Verify 4-act progression
    expect(conn.placeEntityIds).toEqual(
      expect.arrayContaining(["kashii-gu", "yamada-saigu", "umi-hachimangu", "hakozaki-gu"]),
    );

    // Verify Kashii (act 1), Umi (act 3), Hakozaki (act 4) questions
    expect(conn.explorationQuestions["kashii-gu"]?.question).toContain("沙庭");
    expect(conn.explorationQuestions["umi-hachimangu"]?.question).toContain("応神天皇");
    expect(conn.explorationQuestions["hakozaki-gu"]?.question).toContain("胞衣");
  });

  it("verifies Hyuga Umiyamasachi coast sequence route", () => {
    const umiyamasachiTopic = registeredLensTopics.find((t) => t.id === "hyuga-umiyamasachi-route");
    expect(umiyamasachiTopic).toBeDefined();
    expect(umiyamasachiTopic?.archetype).toBe("sequence");

    const preset = umiyamasachiTopic!.pack.presets.find((p) => p.id === umiyamasachiTopic!.presetId);
    const conn = preset!.mapConnections[0];

    expect(conn.placeEntityIds).toEqual(
      expect.arrayContaining(["aoshima-shrine", "udo-jingu", "miyazaki-jingu"]),
    );
    expect(conn.explorationQuestions["aoshima-shrine"]?.question).toContain("海幸山幸");
    expect(conn.explorationQuestions["udo-jingu"]?.question).toContain("海食洞");
  });

  it("resolves sequence topics properly with archetype metadata in resolveLensTopics", () => {
    const resolvedMythology = resolveLensTopics({
      perspectiveId: "mythology",
      claims: [],
      spots: [],
      includeUnvisited: true,
    });

    const jinguResolved = resolvedMythology.find((t) => t.id === "jingu-kogo-legend-preset");
    expect(jinguResolved).toBeDefined();
    expect(jinguResolved?.archetype).toBe<LensLayoutArchetype>("sequence");
    expect(jinguResolved?.archetypeLabel).toBe("シーケンス・回廊型");

    const hyugaCoast = resolvedMythology.find((t) => t.id === "hyuga-umiyamasachi-route");
    expect(hyugaCoast).toBeDefined();
    expect(hyugaCoast?.archetype).toBe<LensLayoutArchetype>("sequence");
    expect(hyugaCoast?.archetypeLabel).toBe("シーケンス・回廊型");
  });

  it("verifies Wajinden route comparison has 7-station primary spine (including Ito and Na) and simultaneous hypothesis fork", () => {
    const wajindenTopic = registeredLensTopics.find((t) => t.id === "wajinden-route-comparison");
    expect(wajindenTopic).toBeDefined();
    expect(wajindenTopic?.archetype).toBe("sequence");

    const preset = wajindenTopic!.pack.presets.find((p) => p.id === wajindenTopic!.presetId);
    expect(preset).toBeDefined();

    // Primary connection must be wajinden-source-route
    const primaryConn = preset!.mapConnections[0];
    expect(primaryConn.id).toBe("wajinden-source-route");
    expect(primaryConn.label).toContain("記述順");

    // Must include all 7 historical stations including Itoshima (Ito) and Kasuga (Na)
    expect(primaryConn.placeEntityIds).toEqual([
      "gimhae",
      "tsushima",
      "iki",
      "karatsu",
      "itoshima",
      "kasuga-sugu-core",
      "umi",
    ]);

    // Focus entity IDs must map to Ito-state and Na-state
    expect(primaryConn.pointFocusEntityIds["itoshima"]).toBe("ito-state");
    expect(primaryConn.pointFocusEntityIds["kasuga-sugu-core"]).toBe("na-state");
    expect(primaryConn.pointFocusEntityIds["umi"]).toBe("fumi-state");

    // Must have simultaneous hypothesis connections for Kyushu and Kinai
    const kyushuHyp = preset!.mapConnections.find((c) => c.id === "wajinden-kyushu-hypothesis");
    const kinaiHyp = preset!.mapConnections.find((c) => c.id === "wajinden-kinai-hypothesis");
    expect(kyushuHyp, "Kyushu hypothesis must exist").toBeDefined();
    expect(kinaiHyp, "Kinai hypothesis must exist").toBeDefined();

    // Invariant: The primary route spine must strictly contain the 7 text itinerary stations, never modern museums
    expect(primaryConn.placeEntityIds).not.toContain("ito-history-museum");
    expect(primaryConn.placeEntityIds).not.toContain("nakoku-hill-park");
    expect(primaryConn.placeEntityIds.length).toBe(7);
  });

  it("verifies Jingu Kanmon Usa saga has exactly 4 progression stations without phantom shrines", () => {
    const sagaTopic = registeredLensTopics.find((t) => t.id === "jingu-kanmon-usa-preset");
    expect(sagaTopic).toBeDefined();

    const preset = sagaTopic!.pack.presets.find((p) => p.id === sagaTopic!.presetId);
    const conn = preset!.mapConnections[0];

    expect(conn.placeEntityIds).toEqual([
      "iminomiya-shrine",
      "sumiyoshi-shrine-nagato",
      "kashii-gu",
      "usa-jingu",
    ]);
  });

  it("verifies Jinmu Yamato conquest has both stages leading to Kashihara enthronement", () => {
    const conquestTopic = registeredLensTopics.find((t) => t.id === "jinmu-yamato-conquest-preset");
    expect(conquestTopic).toBeDefined();

    const preset = conquestTopic!.pack.presets.find((p) => p.id === conquestTopic!.presetId);
    expect(preset!.mapConnections.length).toBeGreaterThanOrEqual(2);

    const defeatConn = preset!.mapConnections.find((c) => c.id === "jinmu-kusaka-defeat-and-bypass");
    const enthronementConn = preset!.mapConnections.find((c) => c.id === "jinmu-kumano-yamato-enthronement");

    expect(defeatConn).toBeDefined();
    expect(enthronementConn).toBeDefined();
    expect(enthronementConn!.placeEntityIds).toContain("place-kashihara-jingu");
  });
});
