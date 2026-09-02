import { describe, expect, it } from "vitest";
import { ishinFiguresPack } from "./ishin-figures-pack";
import { projectLensMapPreset, projectLensPreset } from "./projection";

describe("ishinFiguresPack", () => {
  it("projects people, polities, and events without leaking places into the relationship lens", () => {
    const projection = projectLensPreset(ishinFiguresPack, "ishin-network");

    expect(projection.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(["kido-takayoshi", "sakamoto-ryoma", "saigo-takamori", "satcho-alliance"]));
    expect(projection.nodes.every((node) => node.kind !== "place")).toBe(true);
    expect(projection.edges.every((edge) => edge.reviewStatus === "reviewed")).toBe(true);
    expect(ishinFiguresPack.sources.every((source) => source.reviewStatus === "reviewed")).toBe(true);
  });

  it("projects Takasugi geography only as an evidence-backed map connection", () => {
    const [connection] = projectLensMapPreset(ishinFiguresPack, "ishin-network");

    expect(connection.id).toBe("takasugi-life-geography");
    expect(connection.anchor?.id).toBe("takasugi-shinsaku");
    expect(connection.places.map((place) => place.id)).toEqual(["takasugi-birthplace", "takasugi-grave"]);
    expect(connection.assertions.map((assertion) => assertion.id)).toEqual(["ishin-015", "ishin-016"]);
    expect(connection.sources.map((source) => source.id)).toEqual(["hagi-takasugi-birthplace", "shimonoseki-takasugi-grave"]);
    expect(connection).toMatchObject({ origin: "knowledge-pack", confidences: ["high"], reviewStatus: "reviewed" });
  });
});
