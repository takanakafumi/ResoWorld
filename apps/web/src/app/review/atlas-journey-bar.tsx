"use client";

import { memo } from "react";
import type { ReviewJourney } from "@/domain/review/types";
import styles from "./atlas.module.css";

export const AtlasJourneyBar = memo(function AtlasJourneyBar({
  journeys = [],
  selectedJourneyId,
  selectedJourney,
  mapVisitSpotCount,
  totalSpotCount,
  journeySpotCount,
  onSelectJourney,
}: {
  journeys?: ReviewJourney[];
  selectedJourneyId: string;
  selectedJourney?: ReviewJourney;
  mapVisitSpotCount: number;
  totalSpotCount: number;
  journeySpotCount: (spotIds: string[]) => number;
  onSelectJourney: (id: string) => void;
}) {
  if (journeys.length === 0) return null;

  return (
    <section className={styles.journeyBar}>
      <div className={styles.journeyBarTitle}>
        <span>STEP 1 · JOURNEY</span>
        <strong>地図に出す旅程を選ぶ</strong>
      </div>
      <nav aria-label="表示する探索範囲" className={styles.journeyBarNav}>
        <button
          type="button"
          data-active={selectedJourneyId === "all"}
          onClick={() => onSelectJourney("all")}
        >
          すべての旅<small>{mapVisitSpotCount}地点</small>
        </button>
        {journeys.map((journey) => (
          <button
            type="button"
            key={journey.id}
            data-active={selectedJourneyId === journey.id}
            onClick={() => onSelectJourney(journey.id)}
          >
            {journey.label}
            <small>{journeySpotCount(journey.spotIds)}地点</small>
          </button>
        ))}
      </nav>
      <div className={styles.journeyBarHint}>
        <span className={styles.journeyBarHintIcon}>ℹ️</span>
        <p>
          {selectedJourney
            ? `${selectedJourney.label}の${journeySpotCount(selectedJourney.spotIds)}地点を表示中（旅程選択時のみ訪問順も描画）`
            : totalSpotCount === mapVisitSpotCount
              ? `全${mapVisitSpotCount}地点を表示中（知識のつながりを観察）`
              : `全${mapVisitSpotCount}地点を表示中（行政区域は文脈として保持）`}
        </p>
      </div>
    </section>
  );
});
