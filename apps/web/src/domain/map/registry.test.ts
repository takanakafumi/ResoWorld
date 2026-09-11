import { describe, expect, it } from "vitest";

import { knowledgeMapConnectionsForGroup, knowledgeMapConnectionsForLens, knowledgeMapConnectionsForVisitedSpots, registeredKnowledgeMapConnections } from "./registry";

describe("knowledge map registry", () => {
  it("publishes every registered Knowledge connection through one extension point", () => {
    expect(registeredKnowledgeMapConnections.map((connection) => connection.id)).toContain(
      "takasugi-life-geography",
    );
    expect(registeredKnowledgeMapConnections.map((connection) => connection.id)).toEqual(
      expect.arrayContaining(["hagi-education-geography", "hagi-modernization-geography"]),
    );
    expect(registeredKnowledgeMapConnections.map((connection) => connection.id)).toEqual(
      expect.arrayContaining(["ito-archaeology-visits", "nakoku-archaeology-visits", "fumi-koshoji-hypothesis", "takasu-sazare-tradition", "kumano-sugu-overlap"]),
    );
    expect(new Set(registeredKnowledgeMapConnections.map((connection) =>
      `${connection.packId}:${connection.presetId}:${connection.id}`,
    )).size).toBe(registeredKnowledgeMapConnections.length);
  });

  it("scopes base Knowledge connections to the selected Lens", () => {
    expect(knowledgeMapConnectionsForLens("route").map((connection) => connection.id)).toEqual([
      "ito-archaeology-visits",
      "nakoku-archaeology-visits",
      "fumi-koshoji-hypothesis",
    ]);
    expect(knowledgeMapConnectionsForLens("route").some((connection) => connection.id === "takasugi-life-geography")).toBe(false);
    expect(knowledgeMapConnectionsForLens("people").map((connection) => connection.id)).toContain("takasugi-life-geography");
    expect(knowledgeMapConnectionsForLens("people").map((connection) => connection.id)).toContain("hagi-education-geography");
    expect(knowledgeMapConnectionsForLens("people").map((connection) => connection.id)).not.toContain("hagi-modernization-geography");
    expect(knowledgeMapConnectionsForLens("politics").map((connection) => connection.id)).toContain("hagi-modernization-geography");
  });

  it("shows Knowledge connections by visited endpoints independently of the active Lens", () => {
    const visited = [
      { id: "birth", name: "高杉晋作誕生地", region: "萩", kind: "史跡", latitude: 34.411689, longitude: 131.393019, claimIds: [], positionStatus: "confirmed" as const },
      { id: "grave", name: "東行庵・高杉晋作墓所", region: "下関", kind: "史跡", latitude: 34.085844, longitude: 131.071011, claimIds: [], positionStatus: "confirmed" as const },
    ];

    expect(knowledgeMapConnectionsForVisitedSpots(visited).map((connection) => connection.id)).toContain("takasugi-life-geography");
    expect(knowledgeMapConnectionsForVisitedSpots(visited.slice(0, 1)).map((connection) => connection.id)).not.toContain("takasugi-life-geography");
  });

  it("projects the Wajinden route through the same grouped extension point", () => {
    const routes = knowledgeMapConnectionsForGroup("wajinden-routes");

    expect(routes.map((connection) => connection.id)).toEqual([
      "toma-location-candidates",
      "wajinden-source-route",
      "wajinden-kyushu-hypothesis",
      "wajinden-kinai-hypothesis",
    ]);
    expect(routes[1]).toMatchObject({
      pointFocusEntityIds: { gimhae: "guya-korea", umi: "fumi-state" },
      appearance: { color: "#68c7bd", legendLabel: "史料順" },
    });
  });
});
