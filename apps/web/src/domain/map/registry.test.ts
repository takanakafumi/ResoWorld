import { describe, expect, it } from "vitest";

import { registeredKnowledgeMapConnections } from "./registry";

describe("knowledge map registry", () => {
  it("publishes every registered Knowledge connection through one extension point", () => {
    expect(registeredKnowledgeMapConnections.map((connection) => connection.id)).toContain(
      "takasugi-life-geography",
    );
    expect(new Set(registeredKnowledgeMapConnections.map((connection) =>
      `${connection.packId}:${connection.presetId}:${connection.id}`,
    )).size).toBe(registeredKnowledgeMapConnections.length);
  });
});
