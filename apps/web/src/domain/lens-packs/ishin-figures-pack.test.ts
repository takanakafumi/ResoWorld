import { describe, expect, it } from "vitest";
import { ishinFiguresPack } from "./ishin-figures-pack";
import { projectLensPreset } from "./projection";

describe("ishinFiguresPack", () => {
  it("projects the documented Kido-Ryoma-Saigo connection", () => {
    const projection = projectLensPreset(ishinFiguresPack, "ishin-network");
    expect(projection.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(["kido-takayoshi", "sakamoto-ryoma", "saigo-takamori", "satcho-alliance"]));
    expect(projection.edges.every((edge) => edge.reviewStatus === "reviewed")).toBe(true);
    expect(ishinFiguresPack.sources.every((source) => source.reviewStatus === "reviewed")).toBe(true);
    expect(projection.nodes.map((node) => node.id)).toEqual(expect.arrayContaining(["takasugi-birthplace", "takasugi-grave"]));
    expect(projection.edges.filter((edge) => edge.subjectId === "takasugi-shinsaku").map((edge) => edge.predicate)).toEqual(expect.arrayContaining(["born_at", "buried_at"]));
  });
});
