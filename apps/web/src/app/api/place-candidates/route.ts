import { NextResponse } from "next/server";
import { z } from "zod";

import { searchPlaceCandidates } from "@/server/geocoding/nominatim";

const requestSchema = z.object({
  query: z.string().trim().min(1).max(160),
  consent: z.literal("search_place_name_with_nominatim"),
});

export async function POST(request: Request) {
  const input = requestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ ok: false, error: { code: "invalid_request", message: "検索する地名を確認してください。" } }, { status: 400 });
  }
  try {
    const result = await searchPlaceCandidates(input.data.query);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Place search failed.";
    return NextResponse.json({ ok: false, error: { code: "place_search_failed", message } }, { status: 502 });
  }
}
