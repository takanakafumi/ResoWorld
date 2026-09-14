import { NextResponse } from "next/server";
import { z } from "zod";

import { applyJourneyAtlasUpdateDraft, buildJourneyAtlasUpdateDraft } from "@/domain/imports/journey-atlas-update";
import { applyLocalJourneyAtlas, loadLocalJourneyCandidate, loadLocalJourneyKnowledgeCandidate, loadLocalJourneyPlaceReview } from "@/server/imports/local-journey-candidates";
import { applyLocalKnowledgeDataset, loadLocalKnowledgeDataset } from "@/server/review/knowledge-dataset";
import { loadLocalReviewDataset } from "@/server/review/local-dataset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  candidateFile: z.string().min(1),
  consent: z.literal("apply_reviewed_journey_atlas_update"),
});

export async function POST(request: Request) {
  const input = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "Atlas適用内容を確認してください。" } }, { status: 400 });
  try {
    const [candidate, review, currentKnowledge, knowledgeCandidate] = await Promise.all([
      loadLocalJourneyCandidate(input.data.candidateFile),
      loadLocalJourneyPlaceReview(input.data.candidateFile),
      loadLocalKnowledgeDataset(),
      loadLocalJourneyKnowledgeCandidate(input.data.candidateFile),
    ]);
    if (!review || candidate.id !== review.journey.id) throw new Error("Review is not ready.");
    const documentIds = new Set(knowledgeCandidate.documents.map(({ id }) => id));
    const claimIds = new Set(knowledgeCandidate.claims.map(({ id }) => id));
    if (!candidate.documentIds.every((id) => documentIds.has(id)) || !candidate.claimIds.every((id) => claimIds.has(id))) throw new Error("Knowledge candidate does not contain the Journey evidence.");
    if (!currentKnowledge.documents.every(({ id }) => documentIds.has(id)) || !currentKnowledge.claims.every(({ id }) => claimIds.has(id))) throw new Error("Knowledge candidate is older than the configured Dataset.");
    const knowledgeSaved = await applyLocalKnowledgeDataset(input.data.candidateFile, knowledgeCandidate);
    const dataset = await loadLocalReviewDataset();
    if (!dataset.atlas) throw new Error("Atlas is not configured.");
    const draft = buildJourneyAtlasUpdateDraft(review, dataset.atlas.spots);
    const updated = applyJourneyAtlasUpdateDraft(dataset.atlas, draft);
    const saved = await applyLocalJourneyAtlas(input.data.candidateFile, updated);
    return NextResponse.json({ ok: true, ...saved, knowledgeDatasetFile: knowledgeSaved.datasetFile, knowledgeBackupFile: knowledgeSaved.backupFile, summary: { documents: knowledgeCandidate.documents.length, claims: knowledgeCandidate.claims.length, spots: updated.spots.length, journeys: updated.journeys?.length ?? 0, addedConnections: 0 } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown Atlas apply error.";
    console.error("Journey Atlas apply failed:", detail);
    return NextResponse.json({ ok: false, error: { code: "atlas_apply_failed", message: "ReviewとAtlasの整合性を確認できず、適用しませんでした。", detail } }, { status: 409 });
  }
}
