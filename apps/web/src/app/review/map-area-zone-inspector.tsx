"use client";

import { memo } from "react";
import type { MapSceneProjection } from "@/domain/map/scene";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import styles from "./atlas.module.css";

export const MapAreaZoneInspector = memo(function MapAreaZoneInspector({
  zone,
  spots,
  onSelectSpot,
  onClose,
}: {
  zone: MapSceneProjection["areaZones"][number];
  spots: readonly ReviewAtlasSpot[];
  onSelectSpot: (spotId: string) => void;
  onClose: () => void;
}) {
  return (
    <aside
      className={styles.mapAreaZoneInspector}
      aria-label={`${zone.label}の広域エリア詳細`}
    >
      <div className={styles.mapAreaZoneInspectorHeader}>
        <div>
          <span
            className={styles.mapAreaZoneInspectorBadge}
            data-explored={String(zone.visitedSpotCount > 0)}
          >
            {zone.visitedSpotCount > 0
              ? `◎ 広域エリア · 半径${zone.radiusKm}km · ${zone.visitedSpotCount}地点踏査済`
              : `◇ 広域エリア · 半径${zone.radiusKm}km · 未踏査`}
          </span>
          <strong>{zone.label}</strong>
        </div>
        <button
          type="button"
          className={styles.mapAreaZoneInspectorCloseBtn}
          onClick={onClose}
          aria-label="広域エリア詳細を閉じる"
        >
          ×
        </button>
      </div>
      {spots.length > 0 ? (
        <div
          className={styles.mapAreaZoneSpotList}
          aria-label="この広域エリアに含まれる訪問済みスポット"
        >
          {spots.map((spot) => (
            <button
              key={spot.id}
              type="button"
              className={styles.mapAreaZoneSpotBtn}
              onClick={() => onSelectSpot(spot.id)}
            >
              <span className={styles.mapAreaZoneSpotName}>📍 {spot.name}</span>
              <small className={styles.mapAreaZoneSpotMeta}>{spot.region}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className={styles.mapAreaZoneEmptyNote}>
          この半径内（{zone.radiusKm}km圏）にはまだ訪問済みスポットがありません。
        </p>
      )}
    </aside>
  );
});
