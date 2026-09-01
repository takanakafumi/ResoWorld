import { NextResponse } from "next/server";
import { z } from "zod";

import { buildJourneyImportCandidate } from "@/domain/imports/journey-candidate";
import {
  DatasetImportConflict,
  mergeImportedDocument,
} from "@/domain/imports/merge-review-dataset";
import { ClaimSchema } from "@/domain/knowledge/schema";
import { previewLocalImport, LocalImportError } from "@/server/imports/local-files";
import { loadLocalKnowledgeDataset } from "@/server/review/knowledge-dataset";
import { LocalReviewDatasetError } from "@/server/review/local-dataset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({
  file: z.string().min(1),
  documentSha256: z.string().regex(/^[a-f0-9]{64}$/i),
  claims: z.array(ClaimSchema),
});

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { ok: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let input: z.infer<typeof RequestSchema>;
  try {
    input = RequestSchema.parse(await request.json());
  } catch {
    return errorResponse(400, "invalid_request", "Invalid draft import request.");
  }

  try {
    const [document, dataset] = await Promise.all([
      previewLocalImport(input.file, { expectedSha256: input.documentSha256 }),
      loadLocalKnowledgeDataset(),
    ]);
    if (document.changedFromExpectedHash) {
      return errorResponse(409, "document_changed", "The document changed after extraction.");
    }
    const result = mergeImportedDocument({ dataset, document, claims: input.claims });
    const journeyCandidate = buildJourneyImportCandidate(document, input.claims);
    return NextResponse.json(
      { ok: true, status: result.status, addedClaimCount: result.addedClaimCount, draft: result.dataset, journeyCandidate },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof DatasetImportConflict) return errorResponse(409, error.code, error.message);
    if (error instanceof LocalImportError || error instanceof LocalReviewDatasetError) {
      return errorResponse(400, error.code, error.message);
    }
    return errorResponse(500, "internal_error", "Draft dataset could not be generated.");
  }
}
