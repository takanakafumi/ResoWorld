import Link from "next/link";
import { Suspense } from "react";

import {
  loadLocalReviewDataset,
  LocalReviewDatasetError,
} from "@/server/review/local-dataset";
import { loadPublishedReviewDataset } from "@/server/review/published-dataset";

import styles from "./review.module.css";
import { ReviewClientPage } from "./review-client-page";

async function loadReviewPageState() {
  try {
    return { dataset: await loadLocalReviewDataset(), error: null };
  } catch (error) {
    console.error("[ReviewPage] loadLocalReviewDataset failed:", error);
    try {
      return { dataset: await loadPublishedReviewDataset(), error: null };
    } catch {
      return {
        dataset: null,
        error:
          error instanceof LocalReviewDatasetError
            ? error
            : new LocalReviewDatasetError(
                "not_found",
                "Review dataset could not be loaded.",
              ),
      };
    }
  }
}

export default async function ReviewPage() {
  const state = await loadReviewPageState();
  if (state.dataset) {
    return (
      <Suspense fallback={null}>
        <ReviewClientPage dataset={state.dataset} />
      </Suspense>
    );
  }
  const reviewError = state.error;
  return (
    <main className={styles.setupPage}>
      <header className={styles.setupHeader}>
        <Link href="/" className={styles.brand}>
          <span aria-hidden="true">◉</span> RESOWORLD
        </Link>
        <span className={styles.localBadge}>LOCAL REVIEW</span>
      </header>
      <section className={styles.setupCard}>
        <p className={styles.eyebrow}>TRAVEL ATLAS WORKSPACE</p>
        <p className={styles.errorCode}>{reviewError.code}</p>
        <h1>ローカルDatasetを接続してください。</h1>
        <p>
          <code>apps/web/.env.local</code>で
          <code> RESOWORLD_REVIEW_ENABLED=true</code>、
          <code> RESOWORLD_REVIEW_DIR</code>、
          <code> RESOWORLD_REVIEW_FILE</code>、必要に応じて
          <code> RESOWORLD_REVIEW_ATLAS_FILE</code>を設定すると、旅行記を外へ出さずに
          地図からつながりを探索できます。
        </p>
        <Link href="/imports" className={styles.setupLink}>
          LOCAL IMPORTへ戻る
        </Link>
      </section>
    </main>
  );
}
