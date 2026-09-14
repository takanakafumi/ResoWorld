import { describe, expect, it } from "vitest";

import { asakuraConnectionsPack } from "./asakura-pack";

describe("asakuraConnectionsPack", () => {
  it("keeps the Asakura location proposal separate from established archaeology", () => {
    expect(asakuraConnectionsPack.assertions.find(({ id }) => id === "asakura-009")).toMatchObject({
      nature: "scholarly-hypothesis",
      confidence: "disputed",
      reviewStatus: "reviewed",
    });
    expect(asakuraConnectionsPack.assertions.find(({ id }) => id === "asakura-010")).toMatchObject({
      nature: "interpretive-model",
      confidence: "disputed",
      reviewStatus: "draft",
    });
    expect(asakuraConnectionsPack.assertions).not.toContainEqual(
      expect.objectContaining({ subjectId: "hiratsuka-kawazoe-site", predicate: "identified_as", objectId: "yamatai-asakura-hypothesis" }),
    );
  });
});