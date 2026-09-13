import { describe, expect, it } from "vitest";

import type { ReviewAtlas } from "@/domain/review/types";
import type { SuggestionDraftFile } from "./suggestion-drafts";
import { applySuggestionDraftSelection } from "./suggestion-drafts";

const atlas: ReviewAtlas = {
  title: "Atlas",
  journeys: [{ id: "journey-a", label: "Journey A", documentIds: ["document-a"], spotIds: ["spot-a", "spot-b"], connectionIds: ["connection-a"] }],
  spots: [
    { id: "spot-a", name: "A", region: "R", kind: "site", latitude: 34, longitude: 130, claimIds: ["claim-a"] },
    { id: "spot-b", name: "B", region: "R", kind: "site", latitude: 36, longitude: 132, claimIds: ["claim-a"] },
  ],
  connections: [{ id: "connection-a", connectionKind: "interpretive", initialStatus: "confirmed", eyebrow: "E", title: "C", summary: "S", spotIds: ["spot-a", "spot-b"], claimIds: ["claim-a"], concepts: ["C"], facets: [{ id: "route", label: "Route", weight: 3 }], eras: [] }],
  suggestions: [],
};
const draft: SuggestionDraftFile = {
  schemaVersion: "0.1.0", createdAt: "2026-09-11T00:00:00.000Z", journeyId: "journey-a", provider: "ollama", model: "qwen3.5:9b", attempts: 1, usage: { inputTokens: 10, outputTokens: 20 },
  suggestions: [{ title: "T", targetName: "Target", actionType: "revisit", question: "Q", missingInformation: "M", reason: "R", expectedObservation: "O", uncertainty: "U", claimIds: ["claim-a"], anchorSpotIds: ["spot-a", "spot-b"], connectionIds: ["connection-a"] }],
};

describe("applySuggestionDraftSelection", () => {
  it("materializes selected drafts at the anchor centroid with a stable ID", () => {
    const first = applySuggestionDraftSelection({ atlas, draft, selectedIndexes: [0] });
    expect(first.added).toHaveLength(1);
    expect(first.added[0]).toMatchObject({ latitude: 35, longitude: 131, initialStatus: "accepted" });
    const second = applySuggestionDraftSelection({ atlas: first.atlas, draft, selectedIndexes: [0] });
    expect(second.added).toHaveLength(0);
    expect(second.atlas.suggestions).toHaveLength(1);
  });

  it("requires a selection and rejects references outside the Journey", () => {
    expect(() => applySuggestionDraftSelection({ atlas, draft, selectedIndexes: [] })).toThrow("at least one");
    const invalid = structuredClone(draft);
    invalid.suggestions[0].anchorSpotIds = ["spot-elsewhere"];
    expect(() => applySuggestionDraftSelection({ atlas, draft: invalid, selectedIndexes: [0] })).toThrow("outside its Journey");
  });

  it("accepts a reviewed Knowledge Pack Connection without copying it into the Atlas", () => {
    const packDraft = structuredClone(draft);
    packDraft.suggestions[0].connectionIds = ["pack-connection"];
    const result = applySuggestionDraftSelection({ atlas, draft: packDraft, selectedIndexes: [0], allowedConnectionIds: ["connection-a", "pack-connection"] });
    expect(result.added[0].connectionIds).toEqual(["pack-connection"]);
    expect(result.atlas.connections).toEqual(atlas.connections);
  });

  it("places an unvisited Knowledge target at its own coordinates", () => {
    const frontierDraft = structuredClone(draft);
    frontierDraft.suggestions[0] = { ...frontierDraft.suggestions[0], actionType: "field_visit", targetPlaceId: "place-next", targetKind: "knowledge_unvisited", targetLatitude: 35.5, targetLongitude: 133.25 };
    const result = applySuggestionDraftSelection({ atlas, draft: frontierDraft, selectedIndexes: [0] });
    expect(result.added[0]).toMatchObject({ targetPlaceId: "place-next", targetKind: "knowledge_unvisited", latitude: 35.5, longitude: 133.25 });
  });
});
