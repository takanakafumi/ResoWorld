"use client";

import Link from "next/link";
import type { ReviewDataset } from "@/domain/review/types";
import styles from "./atlas.module.css";

export function AtlasTopbar({
  title,
  visitedSpotCount,
  connectionCount,
  suggestionCount,
  privacy,
}: {
  title: string;
  visitedSpotCount: number;
  connectionCount: number;
  suggestionCount: number;
  privacy: ReviewDataset["privacy"];
}) {
  return (
    <header className={styles.topbar}>
      <Link href="/" className={styles.brand} aria-label="ResoWorld home">
        <span aria-hidden="true">◉</span>
        <span>RESOWORLD</span>
      </Link>
      <div className={styles.titleBlock}>
        <span>TRAVEL CONNECTION ATLAS</span>
        <strong>{title}</strong>
      </div>
      <div className={styles.topMeta}>
        <Link href="/imports" className={styles.viewLink}>
          旅行記を追加
        </Link>
        <Link href="/review?view=graph" className={styles.viewLink}>
          関係図で検証
        </Link>
        <span>{visitedSpotCount} VISITED SPOTS</span>
        <span>{connectionCount} CONNECTIONS</span>
        <span>{suggestionCount} NEXT</span>
        <span className={styles.localBadge}>
          {privacy === "local-only"
            ? "LOCAL DATASET"
            : privacy === "anonymized-demo"
              ? "DEMO DATASET"
              : "SYNC CAPABLE"}
        </span>
      </div>
    </header>
  );
}
