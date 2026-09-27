"use client";

import { useEffect, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

export type PaleoThreshold = 3 | 5 | 10 | 15 | 20 | 30;

export function usePaleoLayer({
  map,
  mapRevision,
}: {
  map: MapLibreMap | null;
  mapRevision: number;
}) {
  const [visible, setVisible] = useState(false);
  const [threshold, setThreshold] = useState<PaleoThreshold>(5);
  const [layerReady, setLayerReady] = useState(false);

  useEffect(() => {
    if (!mapRevision || !map) return;

    const applyVisibility = () => {
      const waterLayerIds = [
        "paleo-water-3-fill",
        "paleo-water-5-fill",
        "paleo-water-10-fill",
        "paleo-water-15-fill",
        "paleo-water-20-fill",
        "paleo-water-30-fill",
      ];
      const layerIds = ["paleo-hillshade", ...waterLayerIds];
      const ready =
        layerIds.every((id) => Boolean(map.getLayer(id))) &&
        map.isSourceLoaded(`paleo-water-${threshold}`);

      for (const id of layerIds) {
        const layerVisibility =
          visible && (id === "paleo-hillshade" || id === `paleo-water-${threshold}-fill`)
            ? "visible"
            : "none";
        if (!map.getLayer(id) || map.getLayoutProperty(id, "visibility") === layerVisibility) continue;
        map.setLayoutProperty(id, "visibility", layerVisibility);
      }
      setLayerReady(ready);
    };

    applyVisibility();
    map.on("styledata", applyVisibility);
    map.on("sourcedata", applyVisibility);

    return () => {
      map.off("styledata", applyVisibility);
      map.off("sourcedata", applyVisibility);
    };
  }, [map, mapRevision, threshold, visible]);

  return {
    visible,
    setVisible,
    threshold,
    setThreshold,
    layerReady,
  };
}
