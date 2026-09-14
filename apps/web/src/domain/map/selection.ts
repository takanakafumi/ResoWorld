export type PinnedMapConnection =
  | { kind: "exploration"; id: string; eraId: string }
  | { kind: "knowledge"; id: string };

export type AtlasSelection = {
  spotId: string;
  pinnedConnection?: PinnedMapConnection;
  focus:
    | { kind: "none"; preserveCamera?: boolean }
    | { kind: "spot" }
    | { kind: "exploration-connection"; id: string; eraId: string; focusSpot?: boolean }
    | { kind: "knowledge-connection"; id: string }
    | { kind: "suggestion"; id: string }
    | { kind: "route-node"; id: string };
};

export type AtlasSelectionEvent =
  | { type: "reset"; spotId: string; focus?: AtlasSelection["focus"] }
  | { type: "select-spot"; spotId: string }
  | { type: "select-exploration-connection"; id: string; eraId: string; spotId?: string }
  | { type: "select-knowledge-connection"; id: string }
  | { type: "select-suggestion"; id: string }
  | { type: "select-route-node"; id: string }
  | { type: "select-era"; id: string }
  | { type: "clear-focus" }
  | { type: "clear-pinned-connection" };

export function reduceAtlasSelection(
  selection: AtlasSelection,
  event: AtlasSelectionEvent,
): AtlasSelection {
  switch (event.type) {
    case "reset":
      return { spotId: event.spotId, focus: event.focus ?? { kind: "none" } };
    case "select-spot":
      if (selection.spotId === event.spotId) {
        return { ...selection, spotId: "", focus: { kind: "none", preserveCamera: true } };
      }
      return { ...selection, spotId: event.spotId, focus: { kind: "spot" } };
    case "select-exploration-connection": {
      const same = selection.pinnedConnection?.kind === "exploration" && selection.pinnedConnection.id === event.id;
      if (same) {
        return { ...selection, spotId: event.spotId ?? selection.spotId, pinnedConnection: undefined, focus: { kind: "none", preserveCamera: true } };
      }
      return {
        ...selection,
        spotId: event.spotId ?? selection.spotId,
        pinnedConnection: { kind: "exploration", id: event.id, eraId: event.eraId },
        focus: { kind: "exploration-connection", id: event.id, eraId: event.eraId },
      };
    }
    case "select-knowledge-connection": {
      const same = selection.pinnedConnection?.kind === "knowledge" && selection.pinnedConnection.id === event.id;
      if (same) {
        return { ...selection, pinnedConnection: undefined, focus: { kind: "none", preserveCamera: true } };
      }
      return { ...selection, pinnedConnection: { kind: "knowledge", id: event.id }, focus: { kind: "knowledge-connection", id: event.id } };
    }
    case "select-suggestion":
      return { ...selection, focus: { kind: "suggestion", id: event.id } };
    case "select-route-node":
      return { ...selection, focus: { kind: "route-node", id: event.id } };
    case "select-era":
      if (selection.pinnedConnection?.kind !== "exploration") return selection;
      return {
        ...selection,
        pinnedConnection: { ...selection.pinnedConnection, eraId: event.id },
        focus: selection.focus.kind === "exploration-connection"
          ? { ...selection.focus, eraId: event.id }
          : selection.focus,
      };
    case "clear-focus":
      return { ...selection, focus: { kind: "none" } };
    case "clear-pinned-connection":
      return { ...selection, pinnedConnection: undefined, focus: { kind: "none", preserveCamera: true } };
  }
}