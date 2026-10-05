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
  });

  it("projects jingu-kogo-legend-preset correctly", () => {
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
  });

  it("verifies map connection lines and exploration questions", () => {
    const preset = jinguKogoLegendPack.presets[0];
    expect(preset.mapConnections.length).toBe(2);

    const birthCorridor = preset.mapConnections.find((c) => c.id === "jingu-chikushi-birth-corridor");
    expect(birthCorridor).toBeDefined();
    expect(birthCorridor?.placeEntityIds).toContain("kashii-gu");
    expect(birthCorridor?.placeEntityIds).toContain("umi-hachimangu");
    expect(birthCorridor?.placeEntityIds).toContain("hakozaki-gu");
    expect(birthCorridor?.placeEntityIds).toContain("onamuchi-shrine");

    expect(birthCorridor?.explorationQuestions["kashii-gu"]).toBeDefined();
    expect(birthCorridor?.explorationQuestions["umi-hachimangu"]).toBeDefined();
    expect(birthCorridor?.explorationQuestions["hakozaki-gu"]).toBeDefined();

    const kanmonRoute = preset.mapConnections.find((c) => c.id === "jingu-kanmon-usa-route");
    expect(kanmonRoute).toBeDefined();
    expect(kanmonRoute?.placeEntityIds).toContain("iminomiya-shrine");
    expect(kanmonRoute?.placeEntityIds).toContain("sumiyoshi-shrine-nagato");
    expect(kanmonRoute?.placeEntityIds).toContain("usa-jingu");
  });
});
