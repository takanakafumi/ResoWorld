import { describe, expect, it } from "vitest";
import { KnowledgeDatasetSchema } from "@/domain/knowledge/schema";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import { JourneyPlaceReviewDraftSchema } from "./journey-place-review";
import { applyJourneyEntityResolutionDraft, buildJourneyEntityResolutionDraft } from "./journey-entity-resolution";

const review = JourneyPlaceReviewDraftSchema.parse({ schemaVersion: "0.1.0", status: "reviewed_place_classification", journey: { id: "journey", label: "Journey" }, documentIds: ["document"], places: [{ key: "candidate-toma", name: "投馬国", entityId: "candidate-toma", classification: "historical_candidate", roles: ["subject_place"], claimIds: ["claim"] }] });
const pack = wajindenRoutesPack;
const dataset = KnowledgeDatasetSchema.parse({ schemaVersion: "0.2.0", datasetId: "dataset", privacy: "local-only", documents: [{ id: "document", title: "Document", path: "document.txt", sha256: "a".repeat(64), authorType: "user-authored", privacy: "private", observedAt: null, documentedAt: null, dateStatus: "not-present-in-source" }], claims: [{ schemaVersion: "0.2.0", id: "claim", statement: "投馬国について記録した。", subject: { id: "candidate-toma", name: "投馬国", type: "Place" }, predicate: "mentions", object: { kind: "literal", value: true }, qualifiers: {}, claimKind: "observation", originType: "imported", reviewStatus: "confirmed", epistemic: { verification: "personal-evidence", modality: "asserted" }, historicalTime: null, places: [{ entityId: "candidate-toma", name: "投馬国", role: "subject_place" }, { entityId: "museum", name: "投馬国歴史館", role: "observed_place" }], evidence: [{ role: "supports", sourceNature: "Observation", documentVoice: "user-narrator", passage: { documentId: "document", documentSha256: "a".repeat(64), startLine: 1, endLine: 1, quote: "投馬国" } }], createdAt: "2026-09-08T00:00:00.000Z" }] });

describe("journey entity resolution", () => {
  it("resolves a reviewed historical candidate to one Pack entity", () => { const draft = buildJourneyEntityResolutionDraft(review, pack); expect(draft.links[0]).toMatchObject({ candidateEntityId: "candidate-toma", entityId: "toma-state" }); expect(draft.unresolved).toEqual([]); });
  it("replaces only the provisional reference ID and preserves other places and evidence", () => { const updated = applyJourneyEntityResolutionDraft(dataset, buildJourneyEntityResolutionDraft(review, pack)); expect(updated.claims[0].subject.id).toBe("toma-state"); expect(updated.claims[0].places[0].entityId).toBe("toma-state"); expect(updated.claims[0].places[1].entityId).toBe("museum"); expect(updated.claims[0].evidence).toEqual(dataset.claims[0].evidence); });
  it("does not guess when a label is ambiguous", () => { const ambiguous = { ...pack, entities: [...pack.entities, { id: "other-toma", kind: "polity" as const, label: "投馬国", aliases: [] }] }; expect(buildJourneyEntityResolutionDraft(review, ambiguous).unresolved[0]).toMatchObject({ reason: "ambiguous" }); });
});
