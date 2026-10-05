import { NextResponse } from "next/server";
import { z } from "zod";

import { applySuggestionDraftSelection, buildJourneySuggestionContext, validateSuggestionDraftReferences } from "@/domain/exploration/suggestion-drafts";
import { loadLocalSuggestionDraft } from "@/server/exploration/local-suggestion-drafts";
import { applyLocalJourneyAtlas } from "@/server/imports/local-journey-candidates";
import { loadLocalReviewDataset } from "@/server/review/local-dataset";

export const runtime = "nodejs";

const RequestSchema = z.object({
  draftFile: z.string().min(1),
  selectedIndexes: z.array(z.number().int().nonnegative()).min(1),
  consent: z.literal("apply_reviewed_suggestion_drafts"),
});

export async function POST(request: Request) {
  const input = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "採用する候補を確認してください。" } }, { status: 400 });
  try {
    const [draft, dataset] = await Promise.all([loadLocalSuggestionDraft(input.data.draftFile), loadLocalReviewDataset()]);
    if (!dataset.atlas) throw new Error("Atlas is unavailable.");
    const context = buildJourneySuggestionContext(dataset, draft.journeyId);
    validateSuggestionDraftReferences({ suggestions: draft.suggestions }, context);
    const result = applySuggestionDraftSelection({ atlas: dataset.atlas, draft, selectedIndexes: input.data.selectedIndexes, allowedConnectionIds: context.connections.map(({ id }) => id) });
    const saved = await applyLocalJourneyAtlas("suggestion-" + draft.journeyId + ".json", result.atlas);
    return NextResponse.json({ ok: true, ...saved, added: result.added.length, total: result.atlas.suggestions.length }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "suggestion_apply_failed", message: "下書きと現在のJourneyの整合性を確認できず、適用しませんでした。" } }, { status: 409 });
  }
}
