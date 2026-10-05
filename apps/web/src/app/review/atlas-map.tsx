"use client";

import * as maplibregl from "maplibre-gl";
import type { ErrorEvent, Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import Link from "next/link";
import { type CSSProperties, type MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from "react";

import type { MapConnectionProjection } from "@/domain/map/connections";
import { findVisitedSpotAtScreenPoint } from "@/domain/map/hit-testing";
import { projectMapMarkers, type TopicMapScope } from "@/domain/map/markers";
import type { MapSceneProjection } from "@/domain/map/scene";
import { mapSpotCategoryDefinitions } from "@/domain/map/spot-presentation";
import type { ReviewAtlasSpot, ReviewExplorationSuggestion } from "@/domain/review/types";

import { usePaleoLayer, type PaleoThreshold } from "./use-paleo-layer";
import { useConnectionLines, type ConnectionLayerVisibility } from "./use-connection-lines";
import { AtlasConnectionLayerControl } from "./atlas-connection-layer-control";
import styles from "./atlas.module.css";

const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL ?? "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION ?? "© OpenStreetMap contributors";

const connectionKindLabels: Record<MapConnectionProjection["connectionKind"], string> = {
  documented: "記録に基づく接続",
  comparative: "比較による接続",
  interpretive: "解釈による接続",
  itinerary: "訪問順・移動",
  knowledge: "外部Knowledge",
  suggestion: "次の探索候補",
};
const relationFamilyLabels: Record<string, string> = {
  genealogy: "系譜", succession: "継承", route: "経路", identification: "比定",
  "textual-attestation": "史料記載", "historical-context": "歴史的背景", influence: "影響",
  syncretism: "習合", classification: "分類", "conceptual-comparison": "概念比較",
  ritual: "祭祀", enshrinement: "祭神", association: "関連",
};
const confidenceLabels: Record<string, string> = {
  high: "確度 高", medium: "確度 中", low: "確度 低", disputed: "異説あり", "not-rated": "確度未評価",
};

function mapStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: {
        type: "raster",
        tiles: [tileUrl],
        tileSize: 256,
        attribution: tileAttribution,
      },
      hillshade: {
        type: "raster",
        tiles: ["https://cyberjapandata.gsi.go.jp/xyz/hillshademap/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      },
      "paleo-water-3": {
        type: "image",
        url: "/maps/paleo/japan-sea-level-3m.png?v=japan-levels-1",
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-5": {
        type: "image",
        url: "/maps/paleo/japan-sea-level-5m.png?v=japan-levels-1",
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-10": {
        type: "image",
        url: "/maps/paleo/japan-sea-level-10m.png?v=japan-levels-1",
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-15": {
        type: "image",
        url: "/maps/paleo/japan-sea-level-15m.png?v=japan-levels-1",
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-20": {
        type: "image",
        url: "/maps/paleo/japan-sea-level-20m.png?v=japan-levels-1",
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
      "paleo-water-30": {
        type: "image",
        url: "/maps/paleo/japan-sea-level-30m.png?v=japan-levels-1",
        coordinates: [[120.9375, 46.07323062540835], [154.6875, 46.07323062540835], [154.6875, 19.31114335506464], [120.9375, 19.31114335506464]],
      },
    },
    layers: [
      { id: "basemap", type: "raster", source: "basemap", paint: { "raster-saturation": -0.75, "raster-brightness-max": 0.62, "raster-contrast": 0.22 } },
      { id: "paleo-hillshade", type: "raster", source: "hillshade", layout: { visibility: "none" }, paint: { "raster-opacity": 0.32, "raster-contrast": 0.2 } },
      { id: "paleo-water-3-fill", type: "raster", source: "paleo-water-3", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-5-fill", type: "raster", source: "paleo-water-5", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-10-fill", type: "raster", source: "paleo-water-10", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-15-fill", type: "raster", source: "paleo-water-15", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-20-fill", type: "raster", source: "paleo-water-20", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
      { id: "paleo-water-30-fill", type: "raster", source: "paleo-water-30", layout: { visibility: "none" }, paint: { "raster-opacity": 0.9, "raster-resampling": "nearest" } },
    ],
  };
}

function mapEvidenceLabel(connection: MapConnectionProjection) {
  const origin = connection.origin === "exploration"
    ? "旅行記"
    : connection.origin === "knowledge-pack"
      ? "Knowledge Pack"
      : "探索候補";
  const evidence = connection.claimIds.length > 0
    ? `${connection.claimIds.length}件のClaim`
    : `${connection.assertionIds.length}件のAssertion · ${connection.sourceIds.length}件のSource`;
  const status = connection.reviewStatus === "reviewed"
    ? "確認済み"
    : connection.reviewStatus === "draft"
      ? "Draft"
      : "派生表示";
  return `${origin} · ${evidence} · ${status}`;
}

export function AtlasMap({
  spots,
  suggestions,
  selectedSpotId,
  highlightedSpotIds,
  scene,
  selectedSuggestion,
  suggestionsVisible: suggestionsVisibleProp,
  recognitionLens,
  selectedJourneyId,
  selectedLensLabel,
  topicScope,

  onSelectLensEntity,
  onSelectRecognitionLens,
  onClearMapConnection,
  onSelectMapConnection,
  onSelectSpot,
  onSelectSuggestion,
  onToggleSuggestionsVisible,
  onClearFocus,
}: {
  spots: ReviewAtlasSpot[];
  suggestions: ReviewExplorationSuggestion[];
  selectedSpotId: string;
  highlightedSpotIds: string[];
  scene: MapSceneProjection;
  selectedSuggestion?: ReviewExplorationSuggestion;
  suggestionsVisible?: boolean;
  recognitionLens: string;
  selectedJourneyId?: string;
  selectedLensLabel?: string;
  topicScope?: TopicMapScope | null;

  onSelectLensEntity: (entityId: string) => void;
  onSelectRecognitionLens: (lensId: string, topicId?: string, nodeId?: string) => void;
  onClearMapConnection: () => void;
  onSelectMapConnection: (connection: MapConnectionProjection) => void;
  onSelectSpot: (spotId: string) => void;
  onSelectSuggestion: (suggestionId: string) => void;
  onToggleSuggestionsVisible?: (visible: boolean) => void;
  onClearFocus?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [mapRevision, setMapRevision] = useState(0);
  const [tileError, setTileError] = useState(false);
  const paleo = usePaleoLayer({ map: mapRef.current, mapRevision });
  const [internalSuggestionsVisible, setInternalSuggestionsVisible] = useState(true);
  const suggestionsVisible = suggestionsVisibleProp ?? internalSuggestionsVisible;
  const handleToggleSuggestions = (visible: boolean) => {
    setInternalSuggestionsVisible(visible);
    onToggleSuggestionsVisible?.(visible);
  };

  const { camera, connections: mapConnections, diagnostics, viewportPoints } = scene;
  const focusedViewport = viewportPoints.length > 0;
  const cameraRef = useRef(camera);
  const cameraKey = camera.mode === "point"
    ? `point:${camera.reason}:${camera.point.id}:${camera.point.longitude}:${camera.point.latitude}`
    : camera.mode === "bounds"
      ? `bounds:${camera.reason}:${camera.maxZoom}:${camera.points.map((point) => `${point.id}:${point.longitude}:${point.latitude}`).join("|")}`
      : "none";
  useEffect(() => {
    cameraRef.current = camera;
  }, [camera]);
  const activeMapConnectionId = mapConnections.find((connection) => connection.selected)?.id ?? "";
  const [connectionVisibility, setConnectionVisibility] = useState<ConnectionLayerVisibility>({
    itinerary: false,
    lens: true,
  });

  const { renderableLines } = useConnectionLines({
    map: mapRef.current,
    mapRevision,
    connections: mapConnections,
    activeConnectionId: activeMapConnectionId,
    visibility: connectionVisibility,
    recognitionLens,
  });

  const connectionCounts = useMemo(() => {
    let itinerary = 0;
    let lens = 0;
    for (const c of mapConnections) {
      if (c.connectionKind === "itinerary") {
        itinerary++;
      } else if (recognitionLens && recognitionLens !== "overview") {
        const lensId = c.lensId;
        const matches =
          (recognitionLens === "mythology" && lensId === "mythology") ||
          (recognitionLens === "route" && lensId === "route") ||
          (recognitionLens === "people" && (lensId === "people" || (c.lensRefs?.some((r) => r.lensId === "people")))) ||
          (recognitionLens === "politics" && (lensId === "politics" || (c.lensRefs?.some((r) => r.lensId === "politics")))) ||
          (recognitionLens === "religion" && lensId === "religion");
        if (matches) lens++;
      }
    }
    return { itinerary, lens };
  }, [mapConnections, recognitionLens]);
  const [connectionChoiceIds, setConnectionChoiceIds] = useState<string[]>([]);
  const describedConnection = mapConnections.find((connection) => connection.selected);
  const onSelectSpotRef = useRef(onSelectSpot);
  const onSelectSuggestionRef = useRef(onSelectSuggestion);
  const onSelectLensEntityRef = useRef(onSelectLensEntity);
  const onSelectMapConnectionRef = useRef(onSelectMapConnection);
  const onClearFocusRef = useRef(onClearFocus);
  useEffect(() => {
    onSelectSpotRef.current = onSelectSpot;
    onSelectSuggestionRef.current = onSelectSuggestion;
    onSelectLensEntityRef.current = onSelectLensEntity;
    onSelectMapConnectionRef.current = onSelectMapConnection;
    onClearFocusRef.current = onClearFocus;
  }, [onClearFocus, onSelectLensEntity, onSelectMapConnection, onSelectSpot, onSelectSuggestion]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle(),
      center: [130.8, 33.55],
      zoom: 7,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    map.on("click", () => {
      onClearFocusRef.current?.();
    });
    map.on("error", (event: ErrorEvent) => {
      const message = String(event.error?.message ?? "").toLowerCase();
      if (message.includes("tile") || message.includes("fetch")) setTileError(true);
    });
    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    mapRef.current = map;
    setMapRevision((revision) => revision + 1);
    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);


  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const unifiedMarkers = projectMapMarkers({
      spots,
      suggestions,
      suggestionsVisible,
      selectedSpotId,
      selectedSuggestionId: selectedSuggestion?.id,
      highlightedSpotIds,
      mapConnections,
      activeMapConnectionId,
      focusedViewport,
      topicScope,
    });

    for (const marker of unifiedMarkers) {
      if (!marker.isVisible) continue;
      const element = document.createElement("button");
      element.type = "button";
      element.className = styles.mapMarker;
      element.dataset.kind = marker.kind;
      element.dataset.active = String(marker.isActive);
      element.dataset.connected = String(marker.isHighlighted);
      if (marker.isGhost) {
        element.dataset.ghost = "true";
        element.classList.add(styles.mapGhostMarker);
      }
      if (marker.positionStatus) element.dataset.positionStatus = marker.positionStatus;
      element.dataset.markerId = marker.id;
      element.dataset.spotId = marker.id;
      element.title = marker.title;
      element.style.setProperty("--marker-color", marker.color);
      element.style.setProperty("--spot-color", marker.color);
      if (marker.category) element.dataset.category = marker.category;

      if (marker.kind === "visited") element.classList.add(styles.mapSpotMarker);
      if (marker.kind === "suggestion") element.classList.add(styles.mapSuggestionMarker);
      if (marker.kind === "reference") element.classList.add(styles.mapRouteMarker);

      const icon = document.createElement("span");
      icon.className = styles.mapMarkerIcon;
      if (marker.kind === "visited") icon.classList.add(styles.mapSpotType);
      if (marker.kind === "suggestion") icon.classList.add(styles.mapSuggestionType);
      icon.textContent = marker.icon;
      icon.setAttribute("aria-hidden", "true");

      if (marker.isGhost) {
        element.append(icon);
      } else {
        let eyebrow: HTMLElement | null = null;
        if (marker.eyebrow) {
          eyebrow = document.createElement("span");
          eyebrow.className = styles.mapMarkerEyebrow;
          if (marker.kind === "visited") eyebrow.classList.add(styles.mapSpotNumber);
          if (marker.kind === "suggestion") eyebrow.classList.add(styles.mapSuggestionEyebrow);
          eyebrow.textContent = marker.eyebrow;
        }

        const label = document.createElement("strong");
        label.className = styles.mapMarkerLabel;
        if (marker.kind === "suggestion") label.classList.add(styles.mapSuggestionLabel);
        label.textContent = marker.label;

        if (eyebrow) {
          element.append(icon, eyebrow, label);
        } else {
          element.append(icon, label);
        }

        element.addEventListener("click", (event) => {
          event.stopPropagation();
          if (marker.kind === "visited") {
            const boxes = [...containerRef.current!.querySelectorAll<HTMLElement>(`.${styles.mapMarker}[data-kind="visited"]`)].flatMap((candidate) => {
              const id = candidate.dataset.markerId;
              if (!id) return [];
              const bounds = candidate.getBoundingClientRect();
              return [{ id, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }];
            });
            onSelectSpotRef.current(findVisitedSpotAtScreenPoint(boxes, { x: event.clientX, y: event.clientY }) ?? marker.id);
          } else if (marker.kind === "suggestion") {
            onSelectSuggestionRef.current(marker.id);
            if (marker.referenceConnections && marker.referenceConnections.length > 0) {
              const activeConnection = marker.referenceConnections.find((c) => c.id === activeMapConnectionId);
              const connection = activeConnection ?? marker.referenceConnections[0];
              onSelectMapConnectionRef.current(connection);
              if (recognitionLens === "route") {
                onSelectLensEntityRef.current(marker.targetId);
              }
              setConnectionChoiceIds(marker.referenceConnections.map(({ id }) => id));
            }
          }
        });
      }

      markersRef.current.push(new maplibregl.Marker({ element, anchor: "bottom" }).setLngLat([marker.longitude, marker.latitude]).addTo(mapRef.current!));
    }
  }, [activeMapConnectionId, focusedViewport, highlightedSpotIds, mapConnections, mapRevision, recognitionLens, selectedSpotId, selectedSuggestion, spots, suggestions, suggestionsVisible, topicScope]);

  useEffect(() => {
    if (!mapRevision || !mapRef.current) return;
    const nextCamera = cameraRef.current;
    if (nextCamera.mode === "point") {
      mapRef.current.easeTo({
        center: [nextCamera.point.longitude, nextCamera.point.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 12),
        duration: 650,
      });
      return;
    }
    if (nextCamera.mode === "bounds" && nextCamera.points.length > 0) {
      const coordinates = nextCamera.points.map((point) => [point.longitude, point.latitude] as [number, number]);
      const bounds = coordinates.reduce((result, coordinate) => result.extend(coordinate), new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
      mapRef.current.fitBounds(bounds, { padding: 72, duration: 650, maxZoom: nextCamera.maxZoom });
    }
  }, [cameraKey, mapRevision]);

  return (
    <div className={styles.mapLibreShell}>
      <div ref={containerRef} className={styles.mapLibreCanvas} aria-label="OpenStreetMap背景とローカルLENSレイヤー" />
      <svg className={styles.mapConnectionOverlay} aria-label="地図上の接続線">
        {renderableLines.map(({ id, connection, selected, emphasized, origin, lensCategory, segments, lineStyle, haloStyle }) => {
          const openMapConnection = (event?: ReactMouseEvent<SVGElement>) => {
            if (event && containerRef.current) {
              const boxes = [...containerRef.current.querySelectorAll<HTMLElement>(`.${styles.mapSpotMarker}`)].flatMap((element) => {
                const spotId = element.dataset.spotId;
                if (!spotId) return [];
                const bounds = element.getBoundingClientRect();
                return [{ id: spotId, left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom }];
              });
              const spotId = findVisitedSpotAtScreenPoint(boxes, { x: event.clientX, y: event.clientY });
              if (spotId) {
                onSelectSpot(spotId);
                return;
              }
            }
            const wasSelected = connection.selected;
            onSelectMapConnection(connection);
            setConnectionChoiceIds(wasSelected ? [] : [connection.id]);
          };

          return (
            <g
              key={id}
              className={styles.mapProjectedConnection}
              data-selected={selected}
              data-emphasized={emphasized}
              data-origin={origin}
              data-lens-category={lensCategory}
            >
              {segments.map((segment) => (
                <g key={segment.id}>
                  {segment.hitPath ? (
                    <path
                      d={segment.hitPath}
                      className={styles.mapConnectionHit}
                      role="button"
                      tabIndex={0}
                      aria-label={`${connection.title}の説明を表示`}
                      onClick={openMapConnection}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openMapConnection();
                        }
                      }}
                    />
                  ) : null}
                  <polyline
                    points={segment.points}
                    className={styles.mapConnectionHalo}
                    style={haloStyle}
                  />
                  <polyline
                    points={segment.points}
                    className={styles.mapConnectionLine}
                    style={lineStyle}
                  />
                </g>
              ))}
            </g>
          );
        })}
      </svg>
      {describedConnection ? <aside className={styles.mapConnectionInfo} aria-label="接続線の説明" aria-live="polite">
        <button className={styles.mapConnectionInfoClose} type="button" aria-label="接続の説明を閉じる" onClick={() => { setConnectionChoiceIds([]); onClearMapConnection(); }}>×</button>
        <small>MAP CONNECTION</small>
        <strong>{describedConnection.title}</strong>
        <span>{mapEvidenceLabel(describedConnection)}</span>
        <div className={styles.mapConnectionMetadata}>
          <span>{connectionKindLabels[describedConnection.connectionKind]}</span>
          {describedConnection.relationFamilies.map((family) => <span key={family}>{relationFamilyLabels[family] ?? family}</span>)}
          {describedConnection.confidences.map((confidence) => <span key={confidence}>{confidenceLabels[confidence] ?? confidence}</span>)}
        </div>
        <p>{describedConnection.summary}</p>
        {describedConnection?.lensRefs.length ? <div className={styles.mapConnectionLinks}>
          <small>対応するLENS / TOPIC</small>
          {describedConnection.lensRefs.map((reference) => <button
            key={`${reference.lensId}:${reference.topicId ?? ""}`}
            type="button"
            onClick={() => onSelectRecognitionLens(reference.lensId, reference.topicId)}
          >{reference.topicLabel ?? reference.lensId}<span>LENSで見る →</span></button>)}
        </div> : describedConnection.connectionKind === "itinerary" ? <small>旅程線は移動順を示すため、LENSには割り当てません。</small> : null}
        {describedConnection?.claimIds.length ? <Link className={styles.mapConnectionEvidenceLink} href={`/review?view=graph&claim=${encodeURIComponent(describedConnection.claimIds[0])}`}>根拠のClaimを見る →</Link> : null}
        {describedConnection?.origin === "knowledge-pack" && describedConnection.lensRefs.length ? <span>{describedConnection.assertionIds.length}件のAssertionと{describedConnection.sourceIds.length}件のSourceは、対応LENSで確認できます。</span> : null}
        {describedConnection.knowledgeEvidence ? <details className={styles.mapConnectionEvidenceDetails}>
          <summary>Assertion / Sourceを確認</summary>
          <ul>
            {describedConnection.knowledgeEvidence.assertions.map((assertion) => <li key={assertion.id}>
              <strong>{assertion.subjectLabel} → {assertion.objectLabel}</strong>
              <small>{relationFamilyLabels[assertion.relationFamily] ?? assertion.predicate} · {confidenceLabels[assertion.confidence] ?? assertion.confidence} · {assertion.reviewStatus === "reviewed" ? "確認済み" : assertion.reviewStatus === "draft" ? "Draft" : "不採用"}</small>
              {assertion.note ? <p>{assertion.note}</p> : null}
            </li>)}
          </ul>
          <ul>
            {describedConnection.knowledgeEvidence.sources.map((source) => <li key={source.id}>
              <strong>{source.title}</strong>
              <small>{[source.authors.join("・"), source.publisher, source.publishedAt, source.locator].filter(Boolean).join(" / ")}</small>
              {source.url ? <a href={source.url} target="_blank" rel="noreferrer">参照先を開く ↗</a> : null}
            </li>)}
          </ul>
        </details> : null}
        {connectionChoiceIds.length > 1 ? <div className={styles.mapConnectionChoices}>
          {connectionChoiceIds.map((id) => {
            const connection = mapConnections.find((candidate) => candidate.id === id);
            if (!connection) return null;
            return <button key={id} type="button" data-active={connection.id === activeMapConnectionId} onClick={() => {
              onSelectMapConnection(connection);
            }}>{connection.title}</button>;
          })}
        </div> : null}
      </aside> : null}
      {diagnostics.length > 0 ? <div className={styles.mapDiagnostics} title={diagnostics.map((diagnostic) => diagnostic.message).join("\n")}>MAP DATA · {diagnostics.length}件を要確認</div> : null}
      <aside className={styles.paleoMapControl} data-active={paleo.visible}>
        <label><input type="checkbox" checked={paleo.visible} onChange={(event) => paleo.setVisible(event.target.checked)} />古地形を重ねる <small>日本全土・概算</small></label>
        {paleo.visible ? <label className={styles.paleoScenarioControl}>仮想海抜<select aria-label="仮想海抜" value={paleo.threshold} onChange={(event) => paleo.setThreshold(Number(event.target.value) as PaleoThreshold)}><option value={3}>+3m</option><option value={5}>+5m</option><option value={10}>+10m</option><option value={15}>+15m</option><option value={20}>+20m</option><option value={30}>+30m</option></select></label> : null}
        {paleo.visible ? <span className={styles.paleoMapStatus}>{paleo.layerReady ? "表示中" : "レイヤー準備中"}</span> : null}
        {paleo.visible ? <details><summary>この表示について</summary><p>現在DEMを選択した高さまで仮想的に水没させ、現在海域と連続する範囲を水色で示します。歴史的な海面や古海岸線の復元ではなく、堆積・地盤変動・河道変化・干拓も補正していない比較表示です。</p><a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">標高・陰影：国土地理院 ↗</a></details> : null}
      </aside>
      {suggestions.length > 0 ? (
        <aside className={styles.suggestionsMapControl} data-active={suggestionsVisible}>
          <label>
            <input
              type="checkbox"
              checked={suggestionsVisible}
              onChange={(event) => handleToggleSuggestions(event.target.checked)}
            />
            次の探索候補を表示
            <small>未訪問 {suggestions.length}件</small>
          </label>
        </aside>
      ) : null}
      <AtlasConnectionLayerControl
        visibility={connectionVisibility}
        onChange={setConnectionVisibility}
        itineraryCount={connectionCounts.itinerary}
        lensCount={connectionCounts.lens}
        selectedLensLabel={selectedLensLabel}
      />
      <div className={styles.mapProviderBadge}>{tileError ? "BASEMAP OFFLINE · APP OVERLAY" : "OSM BASEMAP · APP OVERLAY"}</div>
      <div className={styles.mapCameraBadge} aria-label="地図の表示範囲" aria-live="polite"><span>表示範囲</span><strong>{camera.label}</strong></div>
      <div className={styles.mapLegend} aria-label="地図の地点状態">
        {paleo.visible ? <span><i data-kind="paleo-water" />仮想水域（+{paleo.threshold}m）</span> : null}
        <span><i data-kind="selected" />選択中</span>
        <span><i data-kind="visited" />訪問済み</span>
        <span><i data-kind="candidate" />候補</span>
        {mapSpotCategoryDefinitions.filter(({ id }) => id !== "other").map((category) => <span key={category.id}><i data-category={category.id} style={{ "--legend-color": category.color } as CSSProperties}>{category.icon}</i>{category.label}</span>)}
      </div>
    </div>
  );
}
