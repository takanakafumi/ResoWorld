"use client";

import { useSearchParams } from "next/navigation";
import type { ReviewDataset } from "@/domain/review/types";
import { AtlasWorkspace } from "./atlas-workspace";
import { ReviewWorkspace } from "./review-workspace";

export function ReviewClientPage({ dataset }: { dataset: ReviewDataset }) {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") || undefined;
  const claim = searchParams.get("claim") || undefined;
  const journey = searchParams.get("journey") || undefined;
  const lens = searchParams.get("lens") || undefined;

  return view === "graph" ? (
    <ReviewWorkspace dataset={dataset} initialClaimId={claim} />
  ) : (
    <AtlasWorkspace
      dataset={dataset}
      initialJourneyId={journey}
      initialLensId={lens}
    />
  );
}
