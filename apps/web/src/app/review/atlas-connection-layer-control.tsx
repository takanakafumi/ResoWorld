"use client";

import type { ConnectionLayerVisibility } from "./use-connection-lines";
import styles from "./atlas.module.css";

export function AtlasConnectionLayerControl({
  visibility,
  onChange,
  itineraryCount = 0,
  lensCount = 0,
  selectedLensLabel,
  isStratumMode = false,
}: {
  visibility: ConnectionLayerVisibility;
  onChange: (visibility: ConnectionLayerVisibility) => void;
  itineraryCount?: number;
  lensCount?: number;
  selectedLensLabel?: string;
  isStratumMode?: boolean;
}) {
  const toggle = (key: keyof ConnectionLayerVisibility) => {
    onChange({
      ...visibility,
      [key]: !visibility[key],
    });
  };

  const lensButtonText = isStratumMode
    ? "知識線"
    : selectedLensLabel && selectedLensLabel !== "標準（全体俯瞰）"
      ? `LENS線 (${selectedLensLabel})`
      : "LENS線";

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
            : "知識・史料ネットワーク線を表示します"}
        >
          <span className={styles.layerDotLens} />
          <span>{lensButtonText}</span>
          {lensCount > 0 ? <small>{lensCount}</small> : null}
        </button>
      </div>
    </div>
  );
}
