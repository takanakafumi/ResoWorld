import type { ReviewDataset } from "@/domain/review/types";
import publishedData from "@/data/published-review-dataset.json";

export async function loadPublishedReviewDataset(): Promise<ReviewDataset> {
  return publishedData as unknown as ReviewDataset;
}
