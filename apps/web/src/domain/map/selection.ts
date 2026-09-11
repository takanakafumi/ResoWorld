export type AtlasSelection = {
  spotId: string;
  focus:
    | { kind: "none" }
    | { kind: "spot" }
    | { kind: "exploration-connection"; id: string; eraId: string; focusSpot?: boolean }
    | { kind: "knowledge-connection"; id: string }
    | { kind: "suggestion"; id: string }
    | { kind: "route-node"; id: string };
};

export type AtlasSelectionEvent =
  | { type: "reset"; spotId: string; focus?: AtlasSelection["focus"] }
  | { type: "select-spot"; spotId: string; connectionId?: string; eraId?: string }
  | { type: "select-exploration-connection"; id: string; eraId: string; spotId?: string }
  | { type: "select-knowledge-connection"; id: string }
  | { type: "select-suggestion"; id: string }
  | { type: "select-route-node"; id: string }
  | { type: "select-era"; id: string }
  | { type: "clear-focus" };

export function reduceAtlasSelection(
  selection: AtlasSelection,
  event: AtlasSelectionEvent,
): AtlasSelection {
  switch (event.type) {
    case "reset":
      return { spotId: event.spotId, focus: event.focus ?? { kind: "none" } };
    case "select-spot":
      if (selection.spotId === event.spotId) {
        return { spotId: "", focus: { kind: "none" } };
      }
      return {
        spotId: event.spotId,
        focus: event.connectionId
          ? { kind: "exploration-connection", id: event.connectionId, eraId: event.eraId ?? "", focusSpot: true }
          : { kind: "spot" },
      };
    case "select-exploration-connection":
      return {
        spotId: event.spotId ?? selection.spotId,
        focus: { kind: "exploration-connection", id: event.id, eraId: event.eraId },
      };
    case "select-knowledge-connection":
      return { ...selection, focus: { kind: "knowledge-connection", id: event.id } };
    case "select-suggestion":
      return { ...selection, focus: { kind: "suggestion", id: event.id } };
    case "select-route-node":
      return { ...selection, focus: { kind: "route-node", id: event.id } };
    case "select-era":
      return selection.focus.kind === "exploration-connection"
        ? { ...selection, focus: { ...selection.focus, eraId: event.id } }
        : selection;
    case "clear-focus":
      return { ...selection, focus: { kind: "none" } };
  }
}
