import { NextResponse } from "next/server";
import { z } from "zod";

import { applyJourneyAtlasUpdateDraft, buildJourneyAtlasUpdateDraft } from "@/domain/imports/journey-atlas-update";
import { applyLocalJourneyAtlas, loadLocalJourneyCandidate, loadLocalJourneyPlaceReview } from "@/server/imports/local-journey-candidates";
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
    const [candidate, review, dataset] = await Promise.all([
      loadLocalJourneyCandidate(input.data.candidateFile),
      loadLocalJourneyPlaceReview(input.data.candidateFile),
      loadLocalReviewDataset(),
    ]);
    if (!review || !dataset.atlas || candidate.id !== review.journey.id) throw new Error("Review is not ready.");
    const draft = buildJourneyAtlasUpdateDraft(review, dataset.atlas.spots);
    const updated = applyJourneyAtlasUpdateDraft(dataset.atlas, draft);
    const saved = await applyLocalJourneyAtlas(input.data.candidateFile, updated);
    return NextResponse.json({ ok: true, ...saved, summary: { spots: updated.spots.length, journeys: updated.journeys?.length ?? 0, addedConnections: 0 } }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "atlas_apply_failed", message: "ReviewとAtlasの整合性を確認できず、適用しませんでした。" } }, { status: 409 });
  }
}
