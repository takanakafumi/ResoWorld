"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

import type {
  ReviewAtlas,
  ReviewAtlasConnection,
  ReviewDataset,
} from "@/domain/review/types";

import {
  dominantFacet,
  EraSelector,
  FacetCloud,
  facetColor,
  HistoricalMapLayer,
} from "./atlas-lenses";
import styles from "./atlas.module.css";

function makeFallbackAtlas(dataset: ReviewDataset): ReviewAtlas {
  const spots = dataset.documents.map((document, index) => ({
    id: document.id,
    name: document.title,
    region: `記録 ${index + 1}`,
    kind: "旅の記録",
    latitude: 33.75 - index * 0.1,
    longitude: 130.55 + index * 0.52,
    claimIds: dataset.claims
      .filter((claim) =>
        claim.evidence.some(
          (evidence) => evidence.passage.documentId === document.id,
        ),
      )
      .map((claim) => claim.id),
  }));
  return {
    title: "訪問記録マップ",
    spots,
    connections: spots.length > 1
      ? [{
          id: "record-connection",
          eyebrow: "DOCUMENT CROSSING",
          title: "旅の記録を横断して見る",
          summary:
            "ローカルのAtlas設定を追加すると、訪問スポットごとの時代・場所・概念の接続を表示できます。",
          spotIds: spots.map((spot) => spot.id),
          claimIds: dataset.claims.slice(0, 8).map((claim) => claim.id),
          concepts: ["訪問記録", "場所", "時代"],
          facets: [
            { id: "society", label: "記録", weight: 5 },
            { id: "landscape", label: "場所", weight: 4 },
          ],
          eras: [{
            id: "recorded-time",
            label: "記録された時間",
            range: "年代未設定",
            mapLabel: "旅の記録レイヤー",
            mapLayer: "present",
            spotIds: spots.map((spot) => spot.id),
            claimIds: dataset.claims.slice(0, 8).map((claim) => claim.id),
          }],
        }]
      : [],
  };
}

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

function compact(value: string, maximum = 26) {
  return value.length > maximum ? `${value.slice(0, maximum)}…` : value;
}

const natureLabels: Record<string, string> = {
  Observation: "現地観察",
  HistoricalSource: "歴史史料",
  Archaeology: "考古学",
  Tradition: "伝承",
  UserHypothesis: "自分の仮説",
  Alternative: "異説",
  AISuggestion: "AIによる整理",
};

export function AtlasWorkspace({ dataset }: { dataset: ReviewDataset }) {
  const atlas = useMemo(
    () => dataset.atlas ?? makeFallbackAtlas(dataset),
    [dataset],
  );
  const [selectedSpotId, setSelectedSpotId] = useState(
    atlas.spots[0]?.id ?? "",
  );
  const initialConnection =
    atlas.connections.find((connection) =>
      connection.spotIds.includes(atlas.spots[0]?.id ?? ""),
    ) ?? atlas.connections[0];
  const [selectedConnectionId, setSelectedConnectionId] = useState(
    initialConnection?.id ?? "",
  );
  const [selectedEraId, setSelectedEraId] = useState(
    initialConnection?.eras[0]?.id ?? "",
  );

  const claimById = useMemo(
    () => new Map(dataset.claims.map((claim) => [claim.id, claim])),
    [dataset.claims],
  );
  const spotById = useMemo(
    () => new Map(atlas.spots.map((spot) => [spot.id, spot])),
    [atlas.spots],
  );
  const selectedSpot =
    spotById.get(selectedSpotId) ?? atlas.spots[0];
  const spotConnections = atlas.connections.filter((connection) =>
    connection.spotIds.includes(selectedSpot?.id ?? ""),
  );
  const selectedConnection =
    spotConnections.find(
      (connection) => connection.id === selectedConnectionId,
    ) ?? spotConnections[0] ?? atlas.connections[0];
  const selectedEra = selectedConnection?.eras.find(
    (era) => era.id === selectedEraId,
  ) ?? selectedConnection?.eras[0];
  const primaryFacet = dominantFacet(selectedConnection?.facets ?? []);
  const connectionColor = facetColor(primaryFacet?.id);
  const eraSpotIds = selectedEra?.spotIds ?? selectedConnection?.spotIds ?? [];

  const selectedClaimIds = new Set(
    selectedEra?.claimIds ?? selectedConnection?.claimIds ?? [],
  );
  const selectedClaims = [...selectedClaimIds]
    .map((id) => claimById.get(id))
    .filter((claim): claim is ReviewDataset["claims"][number] => Boolean(claim));

  const connectedSpots = eraSpotIds
    .map((id) => spotById.get(id))
    .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot));

  const longitudes = atlas.spots.map((spot) => spot.longitude);
  const latitudes = atlas.spots.map((spot) => spot.latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const project = (latitude: number, longitude: number) => ({
    x: 115 + ((longitude - minLongitude) / Math.max(maxLongitude - minLongitude, 0.1)) * 770,
    y: 530 - ((latitude - minLatitude) / Math.max(maxLatitude - minLatitude, 0.1)) * 390,
  });

  const connectionPath = selectedConnection
    ? eraSpotIds
        .map((id) => spotById.get(id))
        .filter((spot): spot is NonNullable<typeof spot> => Boolean(spot))
        .map((spot, index) => {
          const point = project(spot.latitude, spot.longitude);
          return `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`;
        })
        .join(" ")
    : "";

  const selectSpot = (spotId: string) => {
    setSelectedSpotId(spotId);
    const nextConnection = atlas.connections.find((connection) =>
      connection.spotIds.includes(spotId),
    );
    if (nextConnection) {
      setSelectedConnectionId(nextConnection.id);
      setSelectedEraId(nextConnection.eras[0]?.id ?? "");
    }
  };

  const selectConnection = (connection: ReviewAtlasConnection) => {
    setSelectedConnectionId(connection.id);
    setSelectedEraId(connection.eras[0]?.id ?? "");
    if (!connection.spotIds.includes(selectedSpot?.id ?? "")) {
      setSelectedSpotId(connection.spotIds[0]);
    }
  };

  return (
    <main
      className={styles.page}
      style={{ "--connection-color": connectionColor } as CSSProperties}
    >
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="ResoWorld home">
          <span aria-hidden="true">◉</span>
          <span>RESOWORLD</span>
        </Link>
        <div className={styles.titleBlock}>
          <span>TRAVEL CONNECTION ATLAS</span>
          <strong>{atlas.title}</strong>
        </div>
        <div className={styles.topMeta}>
          <Link href="/review?view=graph" className={styles.viewLink}>関係図で検証</Link>
          <span>{atlas.spots.length} VISITED SPOTS</span>
          <span>{atlas.connections.length} CONNECTIONS</span>
          <span className={styles.localBadge}>LOCAL ONLY</span>
        </div>
      </header>

      <section className={styles.introBar}>
        <div>
          <span className={styles.step}>01</span>
          <strong>地図上の訪問スポットを選ぶ</strong>
          <span className={styles.arrow}>→</span>
          <span>時代と「何による接続か」を見る</span>
        </div>
        <p>色は接続の主成分、円の大きさはその強さ。時代を変えると地図と根拠も切り替わります。</p>
      </section>

      <section className={styles.atlasGrid}>
        <section className={styles.mapPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>MAP</span>
              <h1>訪問スポット</h1>
            </div>
            <span>GEOGRAPHIC POSITION / LOCAL DATA</span>
          </div>

          <div className={styles.mapCanvas}>
            <svg
              viewBox="0 0 1000 620"
              role="img"
              aria-label="訪問スポットと選択したテーマの地理的なつながり"
            >
              <defs>
                <radialGradient id="map-glow">
                  <stop offset="0" stopColor="#68c7bd" stopOpacity=".14" />
                  <stop offset="1" stopColor="#68c7bd" stopOpacity="0" />
                </radialGradient>
                <filter id="marker-glow">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <rect width="1000" height="620" fill="url(#map-glow)" />
              {[150, 300, 450, 600, 750, 900].map((x) => (
                <line key={`v-${x}`} x1={x} y1="70" x2={x} y2="560" className={styles.gridLine} />
              ))}
              {[120, 230, 340, 450, 560].map((y) => (
                <line key={`h-${y}`} x1="70" y1={y} x2="930" y2={y} className={styles.gridLine} />
              ))}
              <path
                d="M72 180 C205 100 360 125 435 225 C505 318 560 330 675 270 C765 223 879 242 943 348 L943 566 L72 566 Z"
                className={styles.landField}
              />
              <HistoricalMapLayer era={selectedEra} />
              <text x="110" y="545" className={styles.regionText}>WEST / 宗像</text>
              <text x="455" y="545" className={styles.regionText}>CENTER / 宇佐</text>
              <text x="755" y="545" className={styles.regionText}>EAST / 国東</text>

              {connectionPath ? (
                <>
                  <path d={connectionPath} className={styles.connectionHalo} />
                  <path d={connectionPath} className={styles.connectionLine} />
                </>
              ) : null}

              {atlas.spots.map((spot, index) => {
                const point = project(spot.latitude, spot.longitude);
                const active = spot.id === selectedSpot?.id;
                const connected = eraSpotIds.includes(spot.id);
                return (
                  <g
                    key={spot.id}
                    transform={`translate(${point.x} ${point.y})`}
                    className={styles.marker}
                    data-active={active}
                    data-connected={connected}
                    role="button"
                    tabIndex={0}
                    aria-label={`${spot.name}を選択`}
                    onClick={() => selectSpot(spot.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectSpot(spot.id);
                      }
                    }}
                  >
                    <circle r={active ? 24 : 18} className={styles.markerPulse} />
                    <circle r={active ? 10 : 7} className={styles.markerCore} filter={active ? "url(#marker-glow)" : undefined} />
                    <text y="-29" className={styles.markerNumber}>
                      {String(index + 1).padStart(2, "0")}
                    </text>
                    <text y="35" className={styles.markerLabel}>{compact(spot.name, 12)}</text>
                  </g>
                );
              })}
            </svg>

            {selectedConnection ? (
              <EraSelector
                eras={selectedConnection.eras}
                selectedEraId={selectedEra?.id ?? ""}
                onSelect={setSelectedEraId}
              />
            ) : null}

            <div className={styles.mapLegend}>
              <span><i data-kind="selected" />選択中</span>
              <span><i data-kind="visited" />訪問済み</span>
              <span><i data-kind="link" />概念の接続</span>
            </div>
          </div>
        </section>

        <aside className={styles.spotPanel}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>SPOT</span>
              <h2>ここから何につながる？</h2>
            </div>
          </div>

          {selectedSpot ? (
            <div className={styles.spotBody}>
              <p className={styles.spotKind}>{selectedSpot.kind} · {selectedSpot.region}</p>
              <h2>{selectedSpot.name}</h2>
              <p className={styles.spotLead}>
                この場所で得た記録を起点に、別の時代・場所・概念へ線を伸ばします。
              </p>

              {selectedConnection ? (
                <section className={styles.meaningLens}>
                  <div>
                    <span className={styles.microLabel}>MEANING LENS / 接続の主成分</span>
                    <strong style={{ color: connectionColor }}>
                      {primaryFacet?.label} が中心
                    </strong>
                  </div>
                  <FacetCloud facets={selectedConnection.facets} />
                </section>
              ) : null}

              <div className={styles.connectionList}>
                <span className={styles.microLabel}>つながりを選ぶ</span>
                {spotConnections.map((connection) => (
                  <button
                    type="button"
                    key={connection.id}
                    data-active={connection.id === selectedConnection?.id}
                    style={{ "--item-color": facetColor(dominantFacet(connection.facets)?.id) } as CSSProperties}
                    onClick={() => selectConnection(connection)}
                  >
                    <span>{connection.eyebrow}</span>
                    <strong>{connection.title}</strong>
                    <small>{connection.spotIds.length}地点 · {connection.claimIds.length}件の根拠</small>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </aside>
      </section>

      {selectedConnection ? (
        <section className={styles.connectionDrawer}>
          <div className={styles.connectionStory}>
            <p>{selectedConnection.eyebrow}</p>
            <div className={styles.primaryForce}>
              <span>PRIMARY FORCE</span>
              <strong>{primaryFacet?.label}</strong>
              <small>{primaryFacet?.weight} / 5</small>
            </div>
            <h2>{selectedConnection.title}</h2>
            <p>{selectedConnection.summary}</p>
            <FacetCloud facets={selectedConnection.facets} compact />
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
                    <button type="button" key={spot.id} onClick={() => selectSpot(spot.id)}>
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
                  {selectedConnection.concepts.map((concept) => <span key={concept}>{concept}</span>)}
                </div>
              </div>
            </section>
          </div>

          <div className={styles.evidenceStrip}>
            <div className={styles.evidenceHeading}>
              <span>WHY CONNECTED?</span>
              <strong>なぜ、そう言えるのか</strong>
            </div>
            <div className={styles.evidenceCards}>
              {selectedClaims.slice(0, 4).map((claim) => (
                <article key={claim.id}>
                  <div>
                    <span>{natureLabels[claim.evidence[0]?.sourceNature] ?? "記録"}</span>
                    <span>{historicalTimeLabel(claim.historicalTime)}</span>
                  </div>
                  <p>{claim.statement}</p>
                  <blockquote>{claim.evidence[0]?.passage.quote}</blockquote>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className={styles.emptyState}>
          Atlas設定に2地点以上を結ぶテーマを追加すると、つながりが表示されます。
        </section>
      )}
    </main>
  );
}
