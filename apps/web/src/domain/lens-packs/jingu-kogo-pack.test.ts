import { describe, it, expect } from "vitest";

import { jinguKogoLegendPack } from "./jingu-kogo-pack";
import { projectLensPreset } from "./projection";

describe("Empress Jingu Legend Pack (神功皇后伝承と古代筑紫・八幡信仰回廊)", () => {
  it("validates pack metadata and schema", () => {
    expect(jinguKogoLegendPack.id).toBe("jingu-kogo-legend-network");
    expect(jinguKogoLegendPack.version).toBe("0.1.0");
    expect(jinguKogoLegendPack.status).toBe("active");
    expect(jinguKogoLegendPack.entities.length).toBeGreaterThanOrEqual(14);
    expect(jinguKogoLegendPack.assertions.length).toBeGreaterThanOrEqual(15);
    expect(jinguKogoLegendPack.presets.length).toBe(1);
  });

  it("projects unified jingu-kogo-legend-preset saga correctly", () => {
    const projection = projectLensPreset(jinguKogoLegendPack, "jingu-kogo-legend-preset");
    expect(projection.nodes.length).toBeGreaterThan(0);
    expect(projection.edges.length).toBeGreaterThan(0);

    const jinguNode = projection.nodes.find((n) => n.id === "jingu-kogo");
    expect(jinguNode).toBeDefined();
    expect(jinguNode?.label).toBe("神功皇后");

    const kashiiNode = projection.nodes.find((n) => n.id === "kashii-gu");
    expect(kashiiNode).toBeDefined();
    expect(kashiiNode?.label).toBe("香椎宮");

    const umiNode = projection.nodes.find((n) => n.id === "umi-hachimangu");
    expect(umiNode).toBeDefined();
    expect(umiNode?.label).toBe("宇美八幡宮");

    const hakozakiNode = projection.nodes.find((n) => n.id === "hakozaki-gu");
    expect(hakozakiNode).toBeDefined();
    expect(hakozakiNode?.label).toBe("筥崎宮");

    const usaNode = projection.nodes.find((n) => n.id === "usa-jingu");
    expect(usaNode).toBeDefined();
    expect(usaNode?.label).toBe("宇佐神宮");

    const iminomiyaNode = projection.nodes.find((n) => n.id === "iminomiya-shrine");
    expect(iminomiyaNode).toBeDefined();
    expect(iminomiyaNode?.label).toBe("忌宮神社");

    const mekariNode = projection.nodes.find((n) => n.id === "mekari-shrine");
    expect(mekariNode).toBeDefined();
    expect(mekariNode?.label).toBe("和布刈神社");

    const kosoNode = projection.nodes.find((n) => n.id === "koso-hachimangu");
    expect(kosoNode).toBeDefined();
    expect(kosoNode?.label).toBe("甲宗八幡宮");
  });

  it("verifies dual map connection lines and exploration questions for unified saga", () => {
    const sagaPreset = jinguKogoLegendPack.presets[0];
    expect(sagaPreset.id).toBe("jingu-kogo-legend-preset");
    expect(sagaPreset.mapConnections.length).toBe(2);

    // Line 1: Birth corridor
    const birthCorridor = sagaPreset.mapConnections[0];
    expect(birthCorridor.id).toBe("jingu-chikushi-birth-corridor");
    expect(birthCorridor.placeEntityIds).toContain("kashii-gu");
    expect(birthCorridor.placeEntityIds).toContain("umi-hachimangu");
    expect(birthCorridor.placeEntityIds).toContain("hakozaki-gu");
    expect(birthCorridor.placeEntityIds).toContain("onamuchi-shrine");

    expect(birthCorridor.explorationQuestions["kashii-gu"]).toBeDefined();
    expect(birthCorridor.explorationQuestions["umi-hachimangu"]).toBeDefined();
    expect(birthCorridor.explorationQuestions["hakozaki-gu"]).toBeDefined();

    // Line 2: Kanmon & Usa route
    const kanmonRoute = sagaPreset.mapConnections[1];
    expect(kanmonRoute.id).toBe("jingu-kanmon-usa-route");
    expect(kanmonRoute.placeEntityIds).toContain("iminomiya-shrine");
    expect(kanmonRoute.placeEntityIds).toContain("sumiyoshi-shrine-nagato");
    expect(kanmonRoute.placeEntityIds).toContain("mekari-shrine");
    expect(kanmonRoute.placeEntityIds).toContain("koso-hachimangu");
    expect(kanmonRoute.placeEntityIds).toContain("kashii-gu");
    expect(kanmonRoute.placeEntityIds).toContain("usa-jingu");

    expect(kanmonRoute.explorationQuestions["iminomiya-shrine"]).toBeDefined();
    expect(kanmonRoute.explorationQuestions["sumiyoshi-shrine-nagato"]).toBeDefined();
    expect(kanmonRoute.explorationQuestions["mekari-shrine"]).toBeDefined();
    expect(kanmonRoute.explorationQuestions["koso-hachimangu"]).toBeDefined();
    expect(kanmonRoute.explorationQuestions["usa-jingu"]).toBeDefined();
  });
});
