import { NextResponse } from "next/server";

import { buildCodexExplorationBrief } from "@/domain/exploration/codex-brief";
import { CodexResearchRequestSchema } from "@/domain/exploration/codex-research";
import {
  CodexResearchError,
  requestCodexExplorationResearch,
} from "@/server/exploration/codex-cli";
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
    parsedRequest = CodexResearchRequestSchema.parse(await request.json());
  } catch {
    return errorResponse(400, "invalid_request", "Invalid Codex research request.");
  }

  try {
    const dataset = await loadLocalReviewDataset();
    if (dataset.datasetId !== parsedRequest.datasetId) {
      return errorResponse(
        409,
        "dataset_changed",
        "The local review dataset changed. Reload the page.",
      );
    }
    const suggestion = dataset.atlas?.suggestions.find(
      (candidate) => candidate.id === parsedRequest.suggestionId,
    );
    if (!suggestion) {
      return errorResponse(
        404,
        "suggestion_not_found",
        "The exploration suggestion was not found.",
      );
    }

    const prompt = buildCodexExplorationBrief(suggestion);
    const research = await requestCodexExplorationResearch({
      prompt,
      enabled: process.env.RESOWORLD_CODEX_CLI_ENABLED === "true",
      executable: process.env.RESOWORLD_CODEX_CLI_PATH,
    });

    return NextResponse.json(
      { ok: true, brief: prompt, research },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof LocalReviewDatasetError) {
      return errorResponse(503, error.code, error.message);
    }
    if (error instanceof CodexResearchError) {
      const status =
        error.code === "timeout"
          ? 504
          : error.code === "failed" || error.code === "invalid_output"
            ? 502
            : 503;
      return errorResponse(status, error.code, error.message);
    }
    return errorResponse(500, "internal_error", "Codex research failed locally.");
  }
}
