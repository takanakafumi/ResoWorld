import { describe, expect, it } from "vitest";
import { izumoKunitsukamiPack } from "./izumo-kunitsukami-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("izumoKunitsukamiPack", () => {
  it("conforms to knowledge pack schema and contains required sources and entities", () => {
    expect(izumoKunitsukamiPack.id).toBe("izumo-kunitsukami-network");
    expect(izumoKunitsukamiPack.sources.length).toBeGreaterThanOrEqual(7);
    expect(izumoKunitsukamiPack.entities.some((e) => e.id === "ookuninushi")).toBe(true);
    expect(izumoKunitsukamiPack.entities.some((e) => e.id === "kotoshironushi")).toBe(true);
    expect(izumoKunitsukamiPack.entities.some((e) => e.id === "oomononushi")).toBe(true);
    expect(izumoKunitsukamiPack.presets).toHaveLength(2);
  });

  it("projects izumo-kunitsukami-preset relationship graph with core Kuniyuzuri nodes", () => {
    const projection = projectLensPreset(izumoKunitsukamiPack, "izumo-kunitsukami-preset");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "izumo-taisha",
        "inasa-no-hama",
        "miho-shrine",
        "kamosu-shrine",
        "ookuninushi",
        "kotoshironushi",
      ])
    );
  });

  it("projects izumo-kunitsukami-corridor relationship graph with western corridor nodes", () => {
    const projection = projectLensPreset(izumoKunitsukamiPack, "izumo-kunitsukami-corridor");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining([
        "onamuchi-shrine",
        "minagi-hayashida",
        "izumo-taisha",
        "oomiwa-shrine",
        "ookuninushi",
        "oomononushi",
      ])
    );
  });

  it("projects map connections for both presets", () => {
    // Preset 1: Izumo core kuniyuzuri line
    const corePreset = projectLensMapPreset(izumoKunitsukamiPack, "izumo-kunitsukami-preset");
    expect(corePreset).toHaveLength(1);

    const izumoAxis = corePreset[0];
    expect(izumoAxis.id).toBe("izumo-core-kuniyuzuri-line");
    expect(izumoAxis.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["izumo-taisha", "inasa-no-hama", "miho-shrine", "kamosu-shrine"])
    );
    expect(izumoAxis.explorationQuestions?.["izumo-taisha"]).toMatchObject({
      question: expect.stringContaining("幽"),
      reason: expect.stringContaining("天日隅宮"),
    });

    // Preset 2: Western corridor
    const westernPreset = projectLensMapPreset(izumoKunitsukamiPack, "izumo-kunitsukami-corridor");
    expect(westernPreset).toHaveLength(1);

    const westernCorridor = westernPreset[0];
    expect(westernCorridor.id).toBe("kunitsukami-western-network");
    expect(westernCorridor.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["onamuchi-shrine", "minagi-hayashida", "itsukushima-shrine", "oomiwa-shrine", "izumo-taisha"])
    );
    expect(westernCorridor.explorationQuestions?.["oomiwa-shrine"]).toMatchObject({
      question: expect.stringContaining("三輪山"),
      reason: expect.stringContaining("和魂"),
    });
  });
});
