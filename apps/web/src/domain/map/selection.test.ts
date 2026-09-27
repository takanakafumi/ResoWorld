import { describe, expect, it } from "vitest";

import { reduceAtlasSelection } from "./selection";
import type { AtlasSelection } from "./selection";

const initial: AtlasSelection = { spotId: "spot-a", focus: { kind: "none" } };

describe("atlas selection", () => {
  it("pins an exploration connection and updates its era", () => {
    const selected = reduceAtlasSelection(initial, { type: "select-exploration-connection", id: "connection-a", eraId: "era-a", spotId: "spot-b" });
    expect(selected).toEqual({
      spotId: "spot-b",
      pinnedConnection: { kind: "exploration", id: "connection-a", eraId: "era-a" },
      focus: { kind: "exploration-connection", id: "connection-a", eraId: "era-a" },
    });
    expect(reduceAtlasSelection(selected, { type: "select-era", id: "era-b" })).toMatchObject({
      pinnedConnection: { kind: "exploration", id: "connection-a", eraId: "era-b" },
      focus: { kind: "exploration-connection", id: "connection-a", eraId: "era-b" },
    });
  });

  it("keeps a pinned connection when a spot is selected", () => {
    const pinned = reduceAtlasSelection(initial, { type: "select-exploration-connection", id: "connection-a", eraId: "era-a" });
    expect(reduceAtlasSelection(pinned, { type: "select-spot", spotId: "spot-b" })).toEqual({
      spotId: "spot-b",
      pinnedConnection: { kind: "exploration", id: "connection-a", eraId: "era-a" },
      focus: { kind: "spot" },
    });
  });

  it("keeps a pinned connection when the selected spot is toggled off", () => {
    const selected: AtlasSelection = { spotId: "spot-b", pinnedConnection: { kind: "knowledge", id: "knowledge-a" }, focus: { kind: "spot" } };
    expect(reduceAtlasSelection(selected, { type: "select-spot", spotId: "spot-b" })).toEqual({
      spotId: "",
      pinnedConnection: { kind: "knowledge", id: "knowledge-a" },
      focus: { kind: "none", preserveCamera: true },
    });
  });

  it("replaces one pinned connection with another", () => {
    const exploration = reduceAtlasSelection(initial, { type: "select-exploration-connection", id: "connection-a", eraId: "era-a" });
    expect(reduceAtlasSelection(exploration, { type: "select-knowledge-connection", id: "knowledge-a" })).toMatchObject({
      pinnedConnection: { kind: "knowledge", id: "knowledge-a" },
      focus: { kind: "knowledge-connection", id: "knowledge-a" },
    });
  });

  it("toggles the same connection off while preserving the camera", () => {
    const exploration = reduceAtlasSelection(initial, { type: "select-exploration-connection", id: "connection-a", eraId: "era-a" });
    expect(reduceAtlasSelection(exploration, { type: "select-exploration-connection", id: "connection-a", eraId: "era-a" })).toMatchObject({
      pinnedConnection: undefined,
      focus: { kind: "none", preserveCamera: true },
    });
    const knowledge = reduceAtlasSelection(initial, { type: "select-knowledge-connection", id: "knowledge-a" });
    expect(reduceAtlasSelection(knowledge, { type: "select-knowledge-connection", id: "knowledge-a" })).toMatchObject({
      pinnedConnection: undefined,
      focus: { kind: "none", preserveCamera: true },
    });
  });

  it("keeps the pinned line while Lens navigation changes camera focus", () => {
    const pinned = reduceAtlasSelection(initial, { type: "select-knowledge-connection", id: "knowledge-a" });
    expect(reduceAtlasSelection(pinned, { type: "select-route-node", id: "ito-state" })).toEqual({
      spotId: "spot-a",
      pinnedConnection: { kind: "knowledge", id: "knowledge-a" },
      focus: { kind: "route-node", id: "ito-state" },
    });
  });

  it("isolates suggestion selection from spots and toggles off on second click", () => {
    const pinned = reduceAtlasSelection(initial, { type: "select-exploration-connection", id: "connection-a", eraId: "era-a" });
    const suggestionSelected = reduceAtlasSelection(pinned, { type: "select-suggestion", id: "suggestion-1" });
    expect(suggestionSelected).toEqual({
      spotId: "",
      pinnedConnection: undefined,
      focus: { kind: "suggestion", id: "suggestion-1" },
    });
    const toggledOff = reduceAtlasSelection(suggestionSelected, { type: "select-suggestion", id: "suggestion-1" });
    expect(toggledOff).toMatchObject({
      focus: { kind: "none", preserveCamera: true },
    });
  });

  it("clears a pinned line only through an explicit close action", () => {
    const pinned = reduceAtlasSelection(initial, { type: "select-knowledge-connection", id: "knowledge-a" });
    expect(reduceAtlasSelection(pinned, { type: "clear-focus" }).pinnedConnection).toEqual({ kind: "knowledge", id: "knowledge-a" });
    expect(reduceAtlasSelection(pinned, { type: "clear-pinned-connection" })).toMatchObject({
      pinnedConnection: undefined,
      focus: { kind: "none", preserveCamera: true },
    });
  });
});