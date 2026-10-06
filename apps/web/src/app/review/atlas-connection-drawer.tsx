"use client";

import type { ReviewAtlasConnection, ReviewAtlasEra, ReviewAtlasSpot, ReviewDataset } from "@/domain/review/types";
import { dominantFacet, FacetCloud } from "./atlas-lenses";
import styles from "./atlas.module.css";

const natureLabels: Record<string, string> = {
  Observation: "現地観察",
  HistoricalSource: "歴史史料",
  Archaeology: "考古学",
  Tradition: "伝承",
  UserHypothesis: "自分の仮説",
  Alternative: "異説",
  AISuggestion: "AIによる整理",
};

function historicalTimeLabel(
  value: ReviewDataset["claims"][number]["historicalTime"],
) {
  if (!value) return "現地体験・問い";
  if (value.kind === "calendar") {
    return value.endYear
      ? `${value.startYear}–${value.endYear}年`
      : `${value.startYear}年`;
  }
  return value.label || "時代未確定";
}

export function AtlasConnectionDrawer({
  connection,
  selectedEra,
  connectedSpots,
  selectedClaims,
  onSelectSpot,
}: {
  connection: ReviewAtlasConnection;
  selectedEra?: ReviewAtlasEra;
  connectedSpots: ReviewAtlasSpot[];
  selectedClaims: ReviewDataset["claims"];
  onSelectSpot: (spotId: string) => void;
}) {
  const primaryFacet = dominantFacet(connection.facets);

  return (
    <section className={styles.connectionDrawer}>
      <div className={styles.connectionStory}>
        <p>{connection.eyebrow}</p>
        <div className={styles.primaryForce}>
          <span>PRIMARY FORCE</span>
          <strong>{primaryFacet?.label}</strong>
          <small>{primaryFacet?.weight} / 5</small>
        </div>
        <h2>{connection.title}</h2>
        <p>{connection.summary}</p>
        <FacetCloud facets={connection.facets} compact />
      </div>

      <div className={styles.connectionFacts}>
        <section>
          <span className={styles.factIcon}>◷</span>
          <div>
            <h3>選択中の時代レイヤー</h3>
            <div className={styles.eraFact}>
              <strong>{selectedEra?.label}</strong>
              <span>{selectedEra?.range}</span>
              <small>{selectedEra?.mapLabel}</small>
            </div>
          </div>
        </section>
        <section>
          <span className={styles.factIcon}>⌖</span>
          <div>
            <h3>つながる場所</h3>
            <div className={styles.chips}>
              {connectedSpots.map((spot) => (
                <button type="button" key={spot.id} onClick={() => onSelectSpot(spot.id)}>
                  {spot.name}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section>
          <span className={styles.factIcon}>◎</span>
          <div>
            <h3>つながる概念</h3>
            <div className={styles.chips}>
              {connection.concepts.map((concept) => (
                <span key={concept}>{concept}</span>
              ))}
            </div>
          </div>
        </section>
      </div>

      <details className={styles.evidenceStrip}>
        <summary className={styles.evidenceHeading}>
          <span>PRIMARY EVIDENCE / 史料根拠（{selectedClaims.length}件の言明）</span>
          <strong>なぜ、そう言えるのか</strong>
        </summary>
        <div className={styles.evidenceCards}>
          {selectedClaims.length === 0 ? (
            <p style={{ padding: "16px", color: "var(--muted)", fontSize: "0.85rem" }}>
              直接紐づく言明（Claims）は登録されていません。
            </p>
          ) : (
            selectedClaims.slice(0, 6).map((claim) => (
              <article key={claim.id}>
                <div>
                  <span>{natureLabels[claim.evidence[0]?.sourceNature] ?? "記録"}</span>
                  <span>{historicalTimeLabel(claim.historicalTime)}</span>
                </div>
                <p>{claim.statement}</p>
                <blockquote>{claim.evidence[0]?.passage.quote}</blockquote>
              </article>
            ))
          )}
        </div>
      </details>
    </section>
  );
}
