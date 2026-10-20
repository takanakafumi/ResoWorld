import { describe, expect, it } from "vitest";
import { hyugaMythologyPack } from "./hyuga-mythology-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("hyugaMythologyPack", () => {
  it("conforms to knowledge pack schema and contains required sources and entities", () => {
    expect(hyugaMythologyPack.id).toBe("hyuga-mythology-network");
    expect(hyugaMythologyPack.sources.length).toBeGreaterThanOrEqual(7);
    expect(hyugaMythologyPack.entities.some((e) => e.id === "ninigi-no-mikoto")).toBe(true);
    expect(hyugaMythologyPack.entities.some((e) => e.id === "hoori-no-mikoto")).toBe(true);
    expect(hyugaMythologyPack.entities.some((e) => e.id === "ugayafukiaezu-no-mikoto")).toBe(true);
    expect(hyugaMythologyPack.presets).toHaveLength(2);
  });

  it("projects hyuga-mythology-preset relationship graph with descent and lineage nodes", () => {
    const projection = projectLensPreset(hyugaMythologyPack, "hyuga-mythology-preset");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "sazareishi-shrine",
        "takasu-shrine",
        "takachiho-shrine",
        "ninigi-no-mikoto",
        "hoori-no-mikoto",
        "ugayafukiaezu-no-mikoto",
      ])
    );
    expect(projection.edges.filter((e) => e.relationFamily === "genealogy").length).toBeGreaterThanOrEqual(3);
  });

  it("projects hyuga-umiyamasachi-route relationship graph with coast nodes", () => {
    const projection = projectLensPreset(hyugaMythologyPack, "hyuga-umiyamasachi-route");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "aoshima-shrine",
        "udo-jingu",
        "miyazaki-jingu",
        "hoori-no-mikoto",
        "toyotama-hime",
      ])
    );
  });

  it("projects map connections for both presets", () => {
    // Preset 1: Tenson Korin mountain axis
    const mountainPreset = projectLensMapPreset(hyugaMythologyPack, "hyuga-mythology-preset");
    expect(mountainPreset).toHaveLength(1);

    const mountainAxis = mountainPreset[0];
    expect(mountainAxis.id).toBe("tenson-korin-mountain-axis");
    expect(mountainAxis.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["takachiho-shrine", "amanoyasu-kawara", "kirishima-jingu", "sazareishi-shrine"])
    );
    expect(mountainAxis.explorationQuestions?.["takachiho-shrine"]).toMatchObject({
      question: expect.stringContaining("高千穂"),
      reason: expect.stringContaining("降臨"),
    });

    // Preset 2: Coast umisachi yamasachi corridor
    const coastPreset = projectLensMapPreset(hyugaMythologyPack, "hyuga-umiyamasachi-route");
    expect(coastPreset).toHaveLength(1);

    const coastCorridor = coastPreset[0];
    expect(coastCorridor.id).toBe("hyuga-coast-umisachi-yamasachi");
    expect(coastCorridor.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["aoshima-shrine", "udo-jingu", "miyazaki-jingu", "takasu-shrine"])
    );
    expect(coastCorridor.explorationQuestions?.["udo-jingu"]).toMatchObject({
      question: expect.stringContaining("海食洞"),
      reason: expect.stringContaining("ウガヤフキアエズ"),
    });
  });
});
