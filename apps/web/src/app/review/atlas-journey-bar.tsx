"use client";

import type { ReviewJourney } from "@/domain/review/types";
import styles from "./atlas.module.css";

export function AtlasJourneyBar({
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
      <div>
        <span>STEP 1 · JOURNEY</span>
        <strong>地図に出す旅程を選ぶ</strong>
      </div>
      <nav aria-label="表示する探索範囲">
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
      <p>
        {selectedJourney
          ? `${selectedJourney.label}の${journeySpotCount(selectedJourney.spotIds)}地点を表示します。旅程を選んだときだけ訪問順も表示します。`
          : totalSpotCount === mapVisitSpotCount
            ? `全${mapVisitSpotCount}地点を表示します。訪問順は表示せず、知識のつながりを見ます。`
            : `全${mapVisitSpotCount}地点を表示します。行政区域は文脈として保持し、訪問地点には数えません。`}
      </p>
    </section>
  );
}
