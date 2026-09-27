import { describe, expect, it } from "vitest";

import { knowledgeMapConnectionsForGroup, knowledgeMapConnectionsForLens, knowledgeMapConnectionsForVisitedSpots, knowledgeSuggestionConnectionsForVisitedSpots, knowledgeVisitFrontiersForVisitedSpots, registeredKnowledgeMapConnections } from "./registry";

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

  it("projects visited Knowledge Pack links as Suggestion references without itinerary data", () => {
    const hagiSpots = [
      { id: "meirinkan-visit", name: "明倫館", region: "萩", kind: "史跡", latitude: 34.4095497, longitude: 131.3991098, claimIds: ["claim-school"], positionStatus: "confirmed" as const },
      { id: "shokasonjuku-visit", name: "松下村塾", region: "萩", kind: "史跡", latitude: 34.412172, longitude: 131.417347, claimIds: ["claim-school"], positionStatus: "confirmed" as const },
    ];
    const connections = knowledgeSuggestionConnectionsForVisitedSpots(hagiSpots);
    expect(connections.map(({ id }) => id)).toContain("hagi-education-geography");
    expect(connections.find(({ id }) => id === "hagi-education-geography")).toMatchObject({
      connectionKind: "documented",
      spotIds: ["meirinkan-visit", "shokasonjuku-visit"],
      claimIds: ["claim-school"],
    });
    expect(connections.find(({ id }) => id === "hagi-education-geography")?.facets.map(({ id }) => id)).toEqual(["people", "politics"]);
  });

  it("feeds Miyajima religious Knowledge into the same Suggestion references", () => {
    const miyajimaSpots = [
      { id: "itsukushima-visit", name: "厳島神社", region: "宮島", kind: "神社", latitude: 34.2965274, longitude: 132.3190065, claimIds: ["claim-landscape"], positionStatus: "confirmed" as const },
      { id: "miyama-visit", name: "御山神社", region: "宮島", kind: "神社", latitude: 34.27767, longitude: 132.31853, claimIds: ["claim-ritual"], positionStatus: "confirmed" as const },
      { id: "takimiya-visit", name: "滝宮神社", region: "宮島", kind: "神社", latitude: 34.2900151, longitude: 132.3194663, claimIds: ["claim-history"], positionStatus: "confirmed" as const },
      { id: "awashima-visit", name: "粟島神社", region: "宮島", kind: "神社", latitude: 34.2934427, longitude: 132.3191408, claimIds: ["claim-history"], positionStatus: "confirmed" as const },
      { id: "sano-visit", name: "三翁神社", region: "宮島", kind: "神社", latitude: 34.2964235, longitude: 132.3210688, claimIds: ["claim-history"], positionStatus: "confirmed" as const },
    ];

    expect(knowledgeSuggestionConnectionsForVisitedSpots(miyajimaSpots)).toContainEqual(
      expect.objectContaining({
        id: "miyajima-auxiliary-shrines",
        connectionKind: "documented",
        claimIds: ["claim-landscape", "claim-ritual", "claim-history"],
        facets: [{ id: "religion", label: "宗教", weight: 5 }],
      }),
    );
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
      { id: "kouzanji", name: "功山寺", region: "下関", kind: "寺院", latitude: 33.9960624, longitude: 130.9819937, claimIds: [], positionStatus: "confirmed" as const },
    ];

    expect(knowledgeMapConnectionsForVisitedSpots(visited).map((connection) => connection.id)).toContain("takasugi-life-geography");
    expect(knowledgeMapConnectionsForVisitedSpots(visited.slice(0, 2)).map((connection) => connection.id)).not.toContain("takasugi-life-geography");
  });

  it("projects unvisited places connected to visited spots as visit frontiers", () => {
    const visited = [{ id: "birth", name: "高杉晋作誕生地", region: "萩", kind: "史跡", latitude: 34.411689, longitude: 131.393019, claimIds: [], positionStatus: "confirmed" as const }];
    const frontiers = knowledgeVisitFrontiersForVisitedSpots(visited);

    expect(frontiers).toContainEqual(expect.objectContaining({
      placeId: "takasugi-grave",
      label: "東行庵・高杉晋作墓",
        connectionId: "takasugi-life-geography",
        connectionSummary: expect.any(String),
      anchorSpotIds: ["birth"],
      claimIds: [],
        reviewStatus: "reviewed",
        targetKind: "knowledge_unvisited",
    }));
    expect(frontiers.some(({ placeId }) => placeId === "takasugi-birthplace")).toBe(false);
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
      lensRefs: [{ lensId: "route", packId: "wajinden-routes", presetId: "wajinden-comparison" }],
      pointFocusEntityIds: { gimhae: "guya-korea", umi: "fumi-state" },
      appearance: { color: "#68c7bd", legendLabel: "史料順" },
    });
  });

  it("scopes Lens and grouped Knowledge connections to places touched by the current journey", () => {
    const hagiSpots = [
      { id: "meirinkan-visit", name: "明倫館", region: "萩", kind: "史跡", latitude: 34.4095497, longitude: 131.3991098, claimIds: [], positionStatus: "confirmed" as const },
    ];
    const yamataiSpots = [
      { id: "ito-visit", name: "伊都国歴史博物館", region: "糸島", kind: "博物館", latitude: 33.557, longitude: 130.162, claimIds: [], positionStatus: "confirmed" as const },
    ];

    expect(knowledgeMapConnectionsForLens("politics", hagiSpots).map((connection) => connection.id)).toEqual([
      "hagi-education-geography",
    ]);
    expect(knowledgeMapConnectionsForLens("politics", yamataiSpots)).toEqual([]);
    expect(knowledgeMapConnectionsForGroup("wajinden-routes", hagiSpots)).toEqual([]);

    const umiSpots = [
      { id: "umi-town", name: "宇美町", region: "福岡県", kind: "地域", latitude: 33.5677, longitude: 130.511, claimIds: [], positionStatus: "confirmed" as const },
    ];
    const umiRoutes = knowledgeMapConnectionsForGroup("wajinden-routes", umiSpots);
    expect(umiRoutes.map((c) => c.id)).toContain("wajinden-kyushu-hypothesis");
    expect(umiRoutes.map((c) => c.id)).toContain("wajinden-kinai-hypothesis");
    expect(umiRoutes.map((c) => c.id)).toContain("wajinden-source-route");
  });
});
