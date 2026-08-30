import { NextResponse } from "next/server";

import {
  ExplorationResearchBriefSchema,
  ExplorationResearchRequestSchema,
} from "@/domain/exploration/research";
import {
  ExplorationResearchError,
  requestOpenAIExplorationResearch,
} from "@/server/exploration/openai-web-research";
import {
  loadLocalReviewDataset,
  LocalReviewDatasetError,
} from "@/server/review/local-dataset";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(status: number, code: string, message: string) {
  return NextResponse.json(
    { ok: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return errorResponse(403, "invalid_origin", "Cross-origin research is not allowed.");
  }

  let parsedRequest;
  try {
    parsedRequest = ExplorationResearchRequestSchema.parse(await request.json());
  } catch {
    return errorResponse(400, "invalid_request", "Invalid exploration research request.");
  }

  try {
    const dataset = await loadLocalReviewDataset();
    if (dataset.datasetId !== parsedRequest.datasetId) {
      return errorResponse(409, "dataset_changed", "The local review dataset changed. Reload the page.");
    }
    const suggestion = dataset.atlas?.suggestions.find(
      (candidate) => candidate.id === parsedRequest.suggestionId,
    );
    if (!suggestion) {
      return errorResponse(404, "suggestion_not_found", "The exploration suggestion was not found.");
    }

    const brief = ExplorationResearchBriefSchema.parse({
      targetName: suggestion.targetName,
      actionType: suggestion.actionType,
      question: suggestion.question,
      missingInformation: suggestion.missingInformation,
      expectedObservation: suggestion.expectedObservation,
    });
    const research = await requestOpenAIExplorationResearch({
      brief,
      apiKey: process.env.OPENAI_API_KEY,
      enabled: process.env.RESOWORLD_OPENAI_WEB_SEARCH_ENABLED === "true",
      model: process.env.RESOWORLD_OPENAI_WEB_SEARCH_MODEL,
    });

    return NextResponse.json(
      { ok: true, brief, research },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof LocalReviewDatasetError) {
      return errorResponse(503, error.code, error.message);
    }
    if (error instanceof ExplorationResearchError) {
      const status =
        error.code === "disabled" || error.code === "not_configured" ? 503 : 502;
      return errorResponse(status, error.code, error.message);
    }
    return errorResponse(500, "internal_error", "Exploration research failed locally.");
  }
}
