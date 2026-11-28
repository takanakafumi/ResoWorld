"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { type MutableRefObject, useCallback, useMemo, useState } from "react";

import {
  buildFieldSearchIndex,
  searchFieldTargets,
  type FieldSearchFilter,
  type FieldSearchResultItem,
  type GeoCoordinate,
} from "@/domain/map/field-search";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

type UseMapFieldSearchOptions = {
  mapRef: MutableRefObject<MapLibreMap | null>;
  spots: readonly ReviewAtlasSpot[];
  suggestions: readonly ReviewExplorationSuggestion[];
  userLocation: GeoCoordinate | null;
  suggestionsVisible: boolean;
  onEnsureSuggestionsVisible: () => void;
  onSelectSpotRef: MutableRefObject<(spotId: string) => void>;
  onSelectSuggestionRef: MutableRefObject<(suggestionId: string) => void>;
  onPanToPoint: (longitude: number, latitude: number) => void;
};

export function useMapFieldSearch({
  mapRef,
  spots,
  suggestions,
  userLocation,
  suggestionsVisible,
  onEnsureSuggestionsVisible,
  onSelectSpotRef,
  onSelectSuggestionRef,
  onPanToPoint,
}: UseMapFieldSearchOptions) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FieldSearchFilter>("all");
  const [mapCenterSnapshot, setMapCenterSnapshot] = useState<GeoCoordinate | null>(null);

  const index = useMemo(
    () => buildFieldSearchIndex([...spots], [...suggestions]),
    [spots, suggestions],
  );
  const origin = userLocation ?? mapCenterSnapshot;
  const originSource: "gps" | "map-center" = userLocation ? "gps" : "map-center";

  const results = useMemo(() => {
    if (!open) return [];
    return searchFieldTargets(index, {
      query,
      filter,
      origin,
      limit: 24,
    });
  }, [open, index, query, filter, origin]);

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        const center = mapRef.current?.getCenter();
        if (center) {
          setMapCenterSnapshot({ latitude: center.lat, longitude: center.lng });
        }
      }
      return next;
    });
  }, [mapRef]);

  const close = useCallback(() => setOpen(false), []);

  const selectResult = useCallback(
    (item: FieldSearchResultItem) => {
      if (item.kind === "visited") {
        onSelectSpotRef.current(item.id);
      } else {
        if (!suggestionsVisible) {
          onEnsureSuggestionsVisible();
        }
        onSelectSuggestionRef.current(item.id);
      }
      onPanToPoint(item.longitude, item.latitude);
      setOpen(false);
    },
    [onEnsureSuggestionsVisible, onPanToPoint, onSelectSpotRef, onSelectSuggestionRef, suggestionsVisible],
  );

  return {
    open,
    query,
    setQuery,
    filter,
    setFilter,
    originSource,
    results,
    toggle,
    close,
    selectResult,
  };
}
