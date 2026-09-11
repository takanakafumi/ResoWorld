import { describe, expect, it } from "vitest";

import { projectLensMapPreset, projectLensPreset } from "./projection";
import { hagiBakumatsuPack } from "./bakumatsu-pack";

describe("hagiBakumatsuPack", () => {
  it("keeps reviewed external sources and projects both structural flows", () => {
    const projection = projectLensPreset(hagiBakumatsuPack, "bakumatsu-structure");
    expect(hagiBakumatsuPack.sources.every((source) => source.reviewStatus === "reviewed")).toBe(true);
    expect(projection.nodes.map((node) => node.id)).toEqual(
      expect.arrayContaining(["meirinkan", "takasugi-shinsaku", "hagi-reverberatory-furnace", "ebisugahana-shipyard"]),
    );
    expect(projection.edges.every((edge) => edge.reviewStatus === "reviewed")).toBe(true);
  });

  it("projects the education and modernization structures onto visited places", () => {
    const connections = projectLensMapPreset(hagiBakumatsuPack, "bakumatsu-structure");
    expect(connections.map((connection) => connection.id)).toEqual([
      "hagi-education-geography",
      "hagi-modernization-geography",
    ]);
    expect(connections.every((connection) => connection.places.length === 2)).toBe(true);
    expect(connections.every((connection) => connection.reviewStatus === "reviewed")).toBe(true);
  });
});
