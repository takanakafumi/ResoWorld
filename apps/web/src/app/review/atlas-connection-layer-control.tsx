"use client";

import type { ConnectionLayerVisibility } from "./use-connection-lines";
import styles from "./atlas.module.css";

export function AtlasConnectionLayerControl({
  visibility,
  onChange,
  itineraryCount = 0,
  lensCount = 0,
  selectedLensLabel,
}: {
  visibility: ConnectionLayerVisibility;
  onChange: (visibility: ConnectionLayerVisibility) => void;
  itineraryCount?: number;
  lensCount?: number;
  selectedLensLabel?: string;
}) {
  const toggle = (key: keyof ConnectionLayerVisibility) => {
    onChange({
      ...visibility,
      [key]: !visibility[key],
    });
  };

  return (
    <div className={styles.connectionLayerControl} aria-label="地図の接続線レイヤー">
      <span className={styles.connectionLayerTitle}>LINES</span>
      <div className={styles.connectionLayerButtons}>
        <button
          type="button"
          className={styles.connectionLayerButton}
          data-active={visibility.itinerary}
          onClick={() => toggle("itinerary")}
          title="旅行記の移動順・足跡ルート"
        >
          <span className={styles.layerDotItinerary} />
          <span>訪問ルート</span>
          {itineraryCount > 0 ? <small>{itineraryCount}</small> : null}
        </button>

        <button
          type="button"
          className={styles.connectionLayerButton}
          data-active={visibility.lens}
          onClick={() => toggle("lens")}
          title={selectedLensLabel && selectedLensLabel !== "標準（全体俯瞰）"
            ? `${selectedLensLabel}の知識・史料ネットワーク線`
            : "LENSを選ぶと知識・史料ネットワーク線が表示されます"}
        >
          <span className={styles.layerDotLens} />
          <span>LENS接続線{selectedLensLabel && selectedLensLabel !== "標準（全体俯瞰）" ? ` (${selectedLensLabel})` : ""}</span>
          {lensCount > 0 ? <small>{lensCount}</small> : null}
        </button>
      </div>
    </div>
  );
}
