import { NextResponse } from "next/server";
import { z } from "zod";

import { applyLocalManualVisitNote, createLocalManualVisitCandidate } from "@/server/review/manual-visit-note";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CommonSchema = z.object({
  journeyId: z.string().min(1),
  note: z.string().trim().min(3).max(4_000),
  observedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  consent: z.literal("save_manual_visit_evidence"),
});
const RequestSchema = z.discriminatedUnion("mode", [
  CommonSchema.extend({ mode: z.literal("existing"), spotId: z.string().min(1) }),
  CommonSchema.extend({ mode: z.literal("new"), placeName: z.string().trim().min(1).max(200) }),
]);

export async function POST(request: Request) {
  const input = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "追記する訪問内容を確認してください。" } }, { status: 400 });
  }
  try {
    const result = input.data.mode === "new"
      ? await createLocalManualVisitCandidate(input.data)
      : await applyLocalManualVisitNote(input.data);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown manual visit note error.";
    console.error("Manual visit note failed:", detail);
    return NextResponse.json({ ok: false, error: { code: "manual_visit_note_failed", message: "訪問の追記を保存できませんでした。DatasetとAtlasは更新していません。", detail } }, { status: 409 });
  }
}
