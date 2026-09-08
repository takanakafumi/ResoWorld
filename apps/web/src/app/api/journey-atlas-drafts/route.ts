import { NextResponse } from "next/server";

import { applyJourneyAtlasUpdateDraft, buildJourneyAtlasUpdateDraft } from "@/domain/imports/journey-atlas-update";
import { loadLocalJourneyCandidate, loadLocalJourneyPlaceReview, saveLocalJourneyAtlasPreview, saveLocalJourneyAtlasUpdate } from "@/server/imports/local-journey-candidates";
import { loadLocalReviewDataset } from "@/server/review/local-dataset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as { candidateFile?: unknown } | null;
  if (!input || typeof input.candidateFile !== "string") {
    return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "Journey候補を確認してください。" } }, { status: 400 });
  }
  try {
    const [candidate, review, dataset] = await Promise.all([
      loadLocalJourneyCandidate(input.candidateFile),
      loadLocalJourneyPlaceReview(input.candidateFile),
      loadLocalReviewDataset(),
    ]);
    if (!review) throw new Error("Place review is not saved.");
    if (candidate.id !== review.journey.id) throw new Error("Journey review does not match the candidate.");
    const draft = buildJourneyAtlasUpdateDraft(review, dataset.atlas?.spots ?? []);
    if (!dataset.atlas) throw new Error("Atlas is not configured.");
    const file = await saveLocalJourneyAtlasUpdate(input.candidateFile, draft);
    const preview = applyJourneyAtlasUpdateDraft(dataset.atlas, draft);
    const previewFile = await saveLocalJourneyAtlasPreview(input.candidateFile, preview);
    return NextResponse.json({
      ok: true,
      file,
      previewFile,
      summary: {
        reusedSpots: draft.journey.reusedSpotUpdates.length,
        candidateSpots: draft.candidateSpots.length,
        historicalCandidates: draft.historicalCandidates.length,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "atlas_draft_not_ready", message: "未解決の訪問地点があるため、Atlas更新Draftを生成できません。" } }, { status: 409 });
  }
}
