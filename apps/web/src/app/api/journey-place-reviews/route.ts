import { NextResponse } from "next/server";
import { z } from "zod";

import { assertJourneyPlaceReviewMatchesCandidate, JourneyPlaceReviewDraftSchema } from "@/domain/imports/journey-place-review";
import { loadLocalJourneyCandidate, saveLocalJourneyPlaceReview } from "@/server/imports/local-journey-candidates";

export const runtime = "nodejs";

const RequestSchema = z.object({
  candidateFile: z.string().min(1),
  draft: JourneyPlaceReviewDraftSchema,
});

export async function POST(request: Request) {
  const input = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "地点レビューの形式を確認してください。" } }, { status: 400 });
  }
  try {
    const candidate = await loadLocalJourneyCandidate(input.data.candidateFile);
    const draft = assertJourneyPlaceReviewMatchesCandidate(candidate, input.data.draft);
    const file = await saveLocalJourneyPlaceReview(input.data.candidateFile, draft);
    return NextResponse.json({ ok: true, file }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "review_mismatch", message: "元のJourney候補と一致しないため保存しませんでした。" } }, { status: 409 });
  }
}
