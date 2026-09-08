import { NextResponse } from "next/server";
import { z } from "zod";
import { applyJourneyEntityResolutionDraft, buildJourneyEntityResolutionDraft } from "@/domain/imports/journey-entity-resolution";
import { wajindenRoutesPack } from "@/domain/lens-packs/seed-packs";
import { loadLocalJourneyPlaceReview, saveLocalJourneyEntityResolution } from "@/server/imports/local-journey-candidates";
import { applyLocalKnowledgeDataset, loadLocalKnowledgeDataset } from "@/server/review/knowledge-dataset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const RequestSchema = z.object({ candidateFile: z.string().min(1), consent: z.literal("apply_reviewed_historical_entity_resolution") });

export async function POST(request: Request) {
  const input = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "Entity解決の適用内容を確認してください。" } }, { status: 400 });
  try {
    const [review, dataset] = await Promise.all([loadLocalJourneyPlaceReview(input.data.candidateFile), loadLocalKnowledgeDataset()]);
    if (!review) throw new Error("Place review is not ready.");
    const draft = buildJourneyEntityResolutionDraft(review, wajindenRoutesPack);
    if (draft.links.length === 0 || draft.unresolved.length > 0) throw new Error("Entity resolution needs review.");
    const updated = applyJourneyEntityResolutionDraft(dataset, draft);
    const [resolutionFile, saved] = await Promise.all([saveLocalJourneyEntityResolution(input.data.candidateFile, draft), applyLocalKnowledgeDataset(input.data.candidateFile, updated)]);
    return NextResponse.json({ ok: true, ...saved, resolutionFile, summary: { matchedCandidates: draft.links.length, unresolvedCandidates: 0, referencedClaims: new Set(draft.links.flatMap((link) => link.claimIds)).size } }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown entity resolution error.";
    console.error("Journey entity resolution failed:", detail);
    return NextResponse.json({ ok: false, error: { code: "entity_resolution_failed", message: "古代候補を一意に解決できず、正本Datasetには適用しませんでした。", detail } }, { status: 409 });
  }
}
