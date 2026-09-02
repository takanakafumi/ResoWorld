import { describe, expect, it } from "vitest";

import { knowledgeMapConnectionsForGroup, registeredKnowledgeMapConnections } from "./registry";

describe("knowledge map registry", () => {
  it("publishes every registered Knowledge connection through one extension point", () => {
    expect(registeredKnowledgeMapConnections.map((connection) => connection.id)).toContain(
      "takasugi-life-geography",
    );
    expect(new Set(registeredKnowledgeMapConnections.map((connection) =>
      `${connection.packId}:${connection.presetId}:${connection.id}`,
    )).size).toBe(registeredKnowledgeMapConnections.length);
  });

  it("projects the Wajinden route through the same grouped extension point", () => {
    const routes = knowledgeMapConnectionsForGroup("wajinden-routes");

    expect(routes.map((connection) => connection.id)).toEqual([
      "wajinden-source-route",
      "wajinden-kyushu-hypothesis",
      "wajinden-kinai-hypothesis",
    ]);
    expect(routes[0]).toMatchObject({
      pointFocusEntityIds: { gimhae: "guya-korea", umi: "fumi-state" },
      appearance: { color: "#68c7bd", legendLabel: "史料順" },
    });
  });
});
