import { describe, expect, it } from "vitest";
import { ancientChieftainsPack } from "./ancient-chieftains-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("ancientChieftainsPack", () => {
  it("conforms to schema and includes local chieftains entities and assertions", () => {
    expect(ancientChieftainsPack.id).toBe("ancient-chieftains-network");
    expect(ancientChieftainsPack.entities.some((e) => e.id === "tayatsuhime")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "natsuha")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "hashiro-kumawashi")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "itode")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "kuma-wani")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "oka-minato-shrine")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "orihata-shrine")).toBe(true);
    expect(ancientChieftainsPack.entities.some((e) => e.id === "tsukushi-no-iwai")).toBe(true);
  });

  it("projects ancient-chieftains-preset relationship graph with chieftains", () => {
    const projection = projectLensPreset(ancientChieftainsPack, "ancient-chieftains-preset");
    expect(projection.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(["tsukushi-no-iwai", "tayatsuhime", "hashiro-kumawashi", "itode", "kuma-wani"])
    );
  });

  it("projects four archetypes map connection with focus-only display mode", () => {
    const mapConnections = projectLensMapPreset(ancientChieftainsPack, "ancient-chieftains-preset");
    const fourArchetypes = mapConnections.find((c) => c.id === "conn-chieftains-four-archetypes");
    expect(fourArchetypes).toBeDefined();
    expect(fourArchetypes?.displayMode).toBe("focus-only");
    expect(fourArchetypes?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining([
        "yamato-oimatsu-shrine",
        "yasufuri-shrine",
        "chikushi-jinja",
        "iwatoyama-kofun",
      ])
    );
    expect(fourArchetypes?.explorationQuestions?.["yamato-oimatsu-shrine"]).toMatchObject({
      question: expect.stringContaining("山門地域"),
      reason: expect.stringContaining("土蜘蛛"),
    });
    expect(fourArchetypes?.explorationQuestions?.["yasufuri-shrine"]).toMatchObject({
      question: expect.stringContaining("朝倉郡"),
      reason: expect.stringContaining("神話的物語造形"),
    });

    const coastalCorridor = mapConnections.find((c) => c.id === "conn-genkai-coastal-corridor");
    expect(coastalCorridor).toBeDefined();
    expect(coastalCorridor?.displayMode).toBe("line");
    expect(coastalCorridor?.places.map((p) => p.id)).toEqual(
      expect.arrayContaining(["shikaumi-jinja", "munakata-taisha", "orihata-shrine", "oka-minato-shrine"])
    );
    expect(coastalCorridor?.explorationQuestions?.["oka-minato-shrine"]).toMatchObject({
      question: expect.stringContaining("岡水門"),
      reason: expect.stringContaining("海人首長"),
    });
  });
});
