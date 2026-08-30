import type { CSSProperties } from "react";

import type {
  ReviewAtlasEra,
  ReviewConnectionFacet,
} from "@/domain/review/types";

import styles from "./atlas.module.css";

const facetColors: Record<string, string> = {
  myth: "#a98bea",
  ritual: "#d9b45f",
  politics: "#e2766e",
  exchange: "#58c3c9",
  landscape: "#76b982",
  belief: "#c88dc7",
  society: "#b59a7a",
  military: "#e58b58",
};

export function facetColor(facetId?: string) {
  return facetColors[facetId ?? ""] ?? "#68c7bd";
}

export function dominantFacet(facets: ReviewConnectionFacet[]) {
  return [...facets].sort((left, right) => right.weight - left.weight)[0];
}

export function FacetCloud({
  facets,
  compact = false,
}: {
  facets: ReviewConnectionFacet[];
  compact?: boolean;
}) {
  const maximum = Math.max(...facets.map((facet) => facet.weight), 1);
  return (
    <div className={styles.facetCloud} data-compact={compact}>
      {facets.map((facet) => {
        const color = facetColor(facet.id);
        const size = (compact ? 28 : 38) + facet.weight * (compact ? 5 : 8);
        return (
          <div
            key={facet.id}
            className={styles.facetBubble}
            data-dominant={facet.weight === maximum}
            style={{
              "--facet-color": color,
              "--facet-size": `${size}px`,
            } as CSSProperties}
            title={`${facet.label}: ${facet.weight}/5`}
          >
            <strong>{facet.label}</strong>
            <span>{facet.weight}</span>
          </div>
        );
      })}
    </div>
  );
}

export function EraSelector({
  eras,
  selectedEraId,
  onSelect,
}: {
  eras: ReviewAtlasEra[];
  selectedEraId: string;
  onSelect: (eraId: string) => void;
}) {
  return (
    <div className={styles.eraRail} aria-label="時代レイヤー">
      <div>
        <span>TIME LAYER</span>
        <strong>時代を切り替える</strong>
      </div>
      {eras.map((era) => (
        <button
          type="button"
          key={era.id}
          data-active={era.id === selectedEraId}
          onClick={() => onSelect(era.id)}
        >
          <span>{era.label}</span>
          <small>{era.range}</small>
        </button>
      ))}
    </div>
  );
}

export function HistoricalMapLayer({
  era,
}: {
  era: ReviewAtlasEra | undefined;
}) {
  if (!era) return null;
  return (
    <g className={styles.historicalLayer} data-layer={era.mapLayer}>
      {era.mapLayer === "mythic" ? (
        <>
          <circle cx="245" cy="188" r="95" />
          <circle cx="505" cy="250" r="120" />
          <path d="M245 188 C360 105 430 335 505 250" />
        </>
      ) : null}
      {era.mapLayer === "maritime" ? (
        <>
          <path d="M70 230 C230 92 356 128 458 252 C570 385 710 205 938 268" />
          <path d="M96 282 C250 170 350 186 455 292" />
        </>
      ) : null}
      {era.mapLayer === "religious" ? (
        <>
          <circle cx="545" cy="318" r="118" />
          <circle cx="758" cy="285" r="154" />
          <path d="M545 318 L758 285 L860 195" />
        </>
      ) : null}
      {era.mapLayer === "domain" ? (
        <>
          <path d="M430 230 L905 150 L945 515 L500 548 L390 375 Z" />
          <path d="M520 430 L695 230 L872 370" />
        </>
      ) : null}
      {era.mapLayer === "modern" ? (
        <>
          <path d="M405 92 L430 560" />
          <path d="M715 82 L690 560" />
          <path d="M70 385 L945 390" />
        </>
      ) : null}
      {era.mapLayer === "present" ? (
        <>
          <path d="M90 470 C320 410 640 452 920 342" />
          <circle cx="500" cy="360" r="170" />
        </>
      ) : null}
      <text x="92" y="98">{era.mapLabel}</text>
      <text x="92" y="119" className={styles.layerCaveat}>
        CONCEPTUAL HISTORICAL LAYER / 史実境界ではない
      </text>
    </g>
  );
}
