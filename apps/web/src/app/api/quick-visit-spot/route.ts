import { NextResponse } from "next/server";
import { z } from "zod";

import { applyQuickVisitSpot } from "@/server/review/quick-visit-spot";

export const runtime = "nodejs";

const RequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  region: z.string().trim().max(100).optional(),
  kind: z.string().trim().max(100).optional(),
  journeyId: z.string().optional(),
  note: z.string().trim().max(4000).optional(),
  consent: z.literal("quick_register_visited_spot"),
});

export async function POST(request: Request) {
  const input = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid_request", message: "登録する地点情報を確認してください。" } },
      { status: 400 },
    );
  }

  try {
    const result = await applyQuickVisitSpot(input.data);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown quick visit spot error.";
    console.error("Quick visit spot failed:", detail);
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "quick_visit_failed",
          message: "訪問地点の即時登録に失敗しました。",
          detail,
        },
      },
      { status: 409 },
    );
  }
}
