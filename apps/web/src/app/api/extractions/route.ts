import { NextResponse } from "next/server";

import { materializeExtractedClaims } from "@/domain/extraction/materialize";
import { ClaimExtractionRequestSchema } from "@/domain/extraction/schema";
import {
  ClaimExtractionError,
  PassageExtractionError,
} from "@/server/extraction/errors";
import { requestClaimExtraction } from "@/server/extraction/provider";
import {
  loadExtractionCheckpoint,
  saveExtractionCheckpoint,
} from "@/server/extraction/checkpoint";
import {
  LocalImportError,
  previewLocalImport,
} from "@/server/imports/local-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SELECTED_CHARACTERS = 120_000;

function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: { passageIds: string[] },
) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...details } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  let parsedRequest: ReturnType<typeof ClaimExtractionRequestSchema.parse>;
  try {
    parsedRequest = ClaimExtractionRequestSchema.parse(await request.json());
  } catch {
    return errorResponse(400, "invalid_request", "Invalid extraction request.");
  }

  if (new Set(parsedRequest.passageIds).size !== parsedRequest.passageIds.length) {
    return errorResponse(
      400,
      "duplicate_passage",
      "Passage IDs must be unique.",
    );
  }

  try {
    const preview = await previewLocalImport(parsedRequest.file, {
      expectedSha256: parsedRequest.documentSha256,
    });
    if (preview.changedFromExpectedHash) {
      return errorResponse(
        409,
        "document_changed",
        "The document changed after it was previewed. Review it again before sending.",
      );
    }

    const selectedIds = new Set(parsedRequest.passageIds);
    const passages = preview.passages.filter((passage) =>
      selectedIds.has(passage.id),
    );
    if (passages.length !== selectedIds.size) {
      return errorResponse(
        400,
        "unknown_passage",
        "The request contains an unknown Passage ID.",
      );
    }
    if (
      passages.reduce((total, passage) => total + passage.text.length, 0) >
      MAX_SELECTED_CHARACTERS
    ) {
      return errorResponse(
        413,
        "selection_too_large",
        "The selected Passage text exceeds the extraction limit.",
      );
    }

    const completedBatches = await loadExtractionCheckpoint({
      documentSha256: preview.sha256,
      provider: parsedRequest.provider,
      model: parsedRequest.model,
    });
    const extraction = await requestClaimExtraction({
      provider: parsedRequest.provider,
      model: parsedRequest.model,
      documentTitle: preview.title,
      passages,
      completedBatches,
      onBatchCompleted: parsedRequest.provider === "openai"
        ? undefined
        : async (batch) => {
            completedBatches.set(batch.id, batch);
            await saveExtractionCheckpoint({
              documentSha256: preview.sha256,
              provider: parsedRequest.provider,
              model: parsedRequest.model,
              batches: completedBatches,
            });
          },
    });
    const claims = materializeExtractedClaims({
      output: extraction.output,
      passages,
      documentSha256: preview.sha256,
      createdAt: new Date().toISOString(),
      extractedBy: extraction.provider,
    });

    return NextResponse.json(
      {
        ok: true,
        extraction: {
          provider: extraction.provider,
          responseId: extraction.responseId,
          model: extraction.model,
          attempts: extraction.attempts,
          durationMs: extraction.durationMs,
          usage: extraction.usage,
          document: {
            id: preview.id,
            title: preview.title,
            sha256: preview.sha256,
          },
          selectedPassageIds: passages.map((passage) => passage.id),
          claims,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof LocalImportError) {
      return errorResponse(400, error.code, error.message);
    }
    if (error instanceof ClaimExtractionError) {
      const status =
        error.code === "not_configured" || error.code === "unavailable"
          ? 503
          : 502;
      return errorResponse(
        status,
        error.code,
        error.message,
        error instanceof PassageExtractionError
          ? { passageIds: error.passageIds }
          : undefined,
      );
    }
    return errorResponse(500, "internal_error", "Extraction failed locally.");
  }
}
