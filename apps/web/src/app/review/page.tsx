import Link from "next/link";

import {
  loadLocalReviewDataset,
  LocalReviewDatasetError,
} from "@/server/review/local-dataset";

import styles from "./review.module.css";
import { AtlasWorkspace } from "./atlas-workspace";
import { ReviewWorkspace } from "./review-workspace";

export const dynamic = "force-dynamic";

type ReviewPageProps = {
  searchParams: Promise<{ view?: string; claim?: string }>;
};

async function loadReviewPageState() {
  try {
    return { dataset: await loadLocalReviewDataset(), error: null };
  } catch (error) {
    return {
      dataset: null,
      error:
        error instanceof LocalReviewDatasetError
          ? error
          : new LocalReviewDatasetError(
              "not_found",
              "Local review dataset could not be loaded.",
            ),
    };
  }
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const [state, params] = await Promise.all([
    loadReviewPageState(),
    searchParams,
  ]);
  if (state.dataset) {
    return params.view === "graph"
      ? <ReviewWorkspace dataset={state.dataset} initialClaimId={params.claim} />
      : <AtlasWorkspace dataset={state.dataset} />;
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
