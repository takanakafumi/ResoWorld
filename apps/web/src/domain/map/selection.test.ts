import { describe, expect, it } from "vitest";

import { reduceAtlasSelection } from "./selection";
import type { AtlasSelection } from "./selection";

const initial: AtlasSelection = { spotId: "spot-a", focus: { kind: "none" } };

describe("atlas selection", () => {
  it("keeps spot and connection selection in one transition", () => {
    const selected = reduceAtlasSelection(initial, {
      type: "select-exploration-connection",
      id: "connection-a",
      eraId: "era-a",
      spotId: "spot-b",
    });

    expect(selected).toEqual({
      spotId: "spot-b",
      focus: { kind: "exploration-connection", id: "connection-a", eraId: "era-a" },
    });
    expect(reduceAtlasSelection(selected, { type: "select-era", id: "era-b" }).focus).toEqual({
      kind: "exploration-connection",
      id: "connection-a",
      eraId: "era-b",
    });
  });

  it("replaces incompatible focus instead of leaving stale selections", () => {
    const suggestion = reduceAtlasSelection(initial, { type: "select-suggestion", id: "next-a" });
    const knowledge = reduceAtlasSelection(suggestion, { type: "select-knowledge-connection", id: "knowledge-a" });

    expect(knowledge).toEqual({
      spotId: "spot-a",
      focus: { kind: "knowledge-connection", id: "knowledge-a" },
    });
    expect(reduceAtlasSelection(knowledge, { type: "clear-focus" })).toEqual(initial);
  });

  it("marks a directly selected spot as the map focus while retaining its connection", () => {
    expect(reduceAtlasSelection(initial, {
      type: "select-spot",
      spotId: "spot-b",
      connectionId: "connection-a",
      eraId: "era-a",
    })).toEqual({
      spotId: "spot-b",
      focus: { kind: "exploration-connection", id: "connection-a", eraId: "era-a", focusSpot: true },
    });

    expect(reduceAtlasSelection(initial, { type: "select-spot", spotId: "spot-b" })).toEqual({
      spotId: "spot-b",
      focus: { kind: "spot" },
    });
  });

  it("clears the spot and its focus when the selected spot is clicked again", () => {
    const selected: AtlasSelection = { spotId: "spot-b", focus: { kind: "spot" } };

    expect(reduceAtlasSelection(selected, { type: "select-spot", spotId: "spot-b" })).toEqual({
      spotId: "",
      focus: { kind: "none", preserveCamera: true },
    });
  });
});
