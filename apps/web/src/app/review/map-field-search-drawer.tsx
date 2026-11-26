"use client";

import { memo } from "react";
import {
  formatDistanceKm,
  type FieldSearchFilter,
  type FieldSearchResultItem,
} from "@/domain/map/field-search";
import drawerStyles from "./map-field-search-drawer.module.css";

const FILTER_TABS: ReadonlyArray<{ id: FieldSearchFilter; label: string }> = [
  { id: "all", label: "すべて" },
  { id: "visited", label: "既訪" },
  { id: "suggestion", label: "探索候補" },
];

export const MapFieldSearchDrawer = memo(function MapFieldSearchDrawer({
  query,
  filter,
  originSource,
  locatingStatus,
  results,
  selectedSpotId,
  selectedSuggestionId,
  onQueryChange,
  onFilterChange,
  onRequestGps,
  onSelectResult,
  onClose,
}: {
  query: string;
  filter: FieldSearchFilter;
  originSource: "gps" | "map-center";
  locatingStatus: "idle" | "locating" | "located" | "error";
  results: readonly FieldSearchResultItem[];
  selectedSpotId: string;
  selectedSuggestionId?: string;
  onQueryChange: (value: string) => void;
  onFilterChange: (filter: FieldSearchFilter) => void;
  onRequestGps: () => void;
  onSelectResult: (item: FieldSearchResultItem) => void;
  onClose: () => void;
}) {
  return (
    <section
      className={drawerStyles.drawer}
      role="dialog"
      aria-label="スポット・周辺検索"
      onClick={(event) => event.stopPropagation()}
    >
      <div className={drawerStyles.header}>
        <div className={drawerStyles.titleGroup}>
          <span className={drawerStyles.eyebrow}>FIELD SEARCH</span>
          <strong>スポット検索・周辺探索</strong>
        </div>
        <button
          type="button"
          className={drawerStyles.closeBtn}
          onClick={onClose}
          aria-label="検索を閉じる"
        >
          ×
        </button>
      </div>
      <div className={drawerStyles.inputRow}>
        <input
          type="text"
          inputMode="search"
          className={drawerStyles.input}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="地名・神社・遺跡・地域名で絞り込み…"
          aria-label="スポット名または地域名を入力"
        />
        {query ? (
          <button
            type="button"
            className={drawerStyles.clearInputBtn}
            onClick={() => onQueryChange("")}
            aria-label="入力をクリア"
          >
            クリア
          </button>
        ) : null}
      </div>
      <div className={drawerStyles.metaRow}>
        <div className={drawerStyles.filterGroup} role="group" aria-label="検索対象の絞り込み">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={drawerStyles.filterChip}
              data-active={filter === tab.id}
              onClick={() => onFilterChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className={drawerStyles.originInfo}>
          <span>
            {originSource === "gps"
              ? "◎ GPS現在地から近い順"
              : "🗺️ 地図中心から近い順"}
          </span>
          {originSource !== "gps" ? (
            <button
              type="button"
              className={drawerStyles.gpsBtn}
              disabled={locatingStatus === "locating"}
              onClick={onRequestGps}
            >
              {locatingStatus === "locating" ? "取得中…" : "◎ GPS取得"}
            </button>
          ) : null}
        </div>
      </div>
      <div className={drawerStyles.results} role="list">
        {results.length === 0 ? (
          <p className={drawerStyles.empty}>
            条件に一致するスポットが見つかりませんでした。
          </p>
        ) : (
          results.map((item) => (
            <button
              key={`${item.kind}:${item.id}`}
              type="button"
              role="listitem"
              className={drawerStyles.resultItem}
              data-kind={item.kind}
              data-selected={
                (item.kind === "visited" && item.id === selectedSpotId) ||
                (item.kind === "suggestion" && item.id === selectedSuggestionId)
              }
              onClick={() => onSelectResult(item)}
            >
              <div className={drawerStyles.resultMain}>
                <span className={drawerStyles.resultTitle}>
                  {item.kind === "suggestion" ? "⚑ " : ""}
                  {item.title}
                </span>
                {item.subtitle ? (
                  <span className={drawerStyles.resultSub}>{item.subtitle}</span>
                ) : null}
              </div>
              <div className={drawerStyles.resultAside}>
                {item.distanceKm !== null ? (
                  <span className={drawerStyles.distance}>
                    {formatDistanceKm(item.distanceKm)}
                  </span>
                ) : null}
                <span className={drawerStyles.badge} data-kind={item.kind}>
                  {item.kind === "visited" ? "既訪" : "候補"}
                </span>
              </div>
            </button>
          ))
        )}
      </div>
    </section>
  );
});
