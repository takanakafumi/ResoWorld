import { NextResponse } from "next/server";

import { materializeExtractedClaims } from "@/domain/extraction/materialize";
import { ClaimExtractionRequestSchema } from "@/domain/extraction/schema";
import {
  ClaimExtractionError,
  requestClaimExtraction,
} from "@/server/extraction/openai";
import {
  LocalImportError,
  previewLocalImport,
} from "@/server/imports/local-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SELECTED_CHARACTERS = 120_000;

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { ok: false, error: { code, message } },
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

    const extraction = await requestClaimExtraction({
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.RESOWORLD_EXTRACTION_MODEL,
      documentTitle: preview.title,
      passages,
    });
    const claims = materializeExtractedClaims({
      output: extraction.output,
      passages,
      documentSha256: preview.sha256,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        ok: true,
        extraction: {
          responseId: extraction.responseId,
          model: extraction.model,
          attempts: extraction.attempts,
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
      const status = error.code === "not_configured" ? 503 : 502;
      return errorResponse(status, error.code, error.message);
    }
    return errorResponse(500, "internal_error", "Extraction failed locally.");
  }
}
