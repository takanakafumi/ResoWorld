"use client";

import { useState } from "react";

import {
  buildJourneyRegistrationDraft,
  journeyPlaceCandidateKey,
  type JourneyImportCandidate,
  type JourneyConnectionDecision,
  type JourneyLensDecision,
} from "@/domain/imports/journey-candidate";
import type { PlaceResolutionCandidate, PlaceResolutionSelection } from "@/domain/imports/place-resolution";

import styles from "./extraction-panel.module.css";

type PlaceSearchResponse =
  | { ok: true; query: string; cached: boolean; candidates: PlaceResolutionCandidate[] }
  | { ok: false; error: { code: string; message: string } };

export function JourneyReviewSection({
  journeyCandidate,
  existingJourneys,
}: {
  journeyCandidate: JourneyImportCandidate;
  existingJourneys: { id: string; label: string; documentCount: number; spotCount: number }[];
}) {
  const [journeyMode, setJourneyMode] = useState<"new" | "existing">("new");
  const [targetJourneyId, setTargetJourneyId] = useState(existingJourneys[0]?.id ?? "");
  const [includedPlaceKeys, setIncludedPlaceKeys] = useState<Set<string>>(
    () => new Set(journeyCandidate.placeCandidates.map(journeyPlaceCandidateKey)),
  );
  const [placeSearch, setPlaceSearch] = useState<Record<string, { status: "loading" | "done" | "error"; message?: string; candidates: PlaceResolutionCandidate[] }>>({});
  const [placeResolutions, setPlaceResolutions] = useState<Record<string, PlaceResolutionSelection>>({});
  const [connectionDecision, setConnectionDecision] = useState<JourneyConnectionDecision>("no_connection");
  const [lensDecision, setLensDecision] = useState<JourneyLensDecision | "">("");

  const toggleJourneyPlace = (key: string) => {
    setIncludedPlaceKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const searchJourneyPlace = async (key: string, query: string) => {
    setPlaceSearch((current) => ({ ...current, [key]: { status: "loading", candidates: [] } }));
    try {
      const response = await fetch("/api/place-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, consent: "search_place_name_with_nominatim" }),
      });
      const body = (await response.json()) as PlaceSearchResponse;
      if (!body.ok) {
        setPlaceSearch((current) => ({ ...current, [key]: { status: "error", message: body.error.message, candidates: [] } }));
        return;
      }
      setPlaceSearch((current) => ({
        ...current,
        [key]: {
          status: "done",
          message: body.cached ? "ローカルキャッシュ" : "OpenStreetMapから取得",
          candidates: body.candidates,
        },
      }));
    } catch {
      setPlaceSearch((current) => ({ ...current, [key]: { status: "error", message: "地名候補を取得できませんでした。", candidates: [] } }));
    }
  };

  const selectPlaceResolution = (key: string, query: string, selected: PlaceResolutionCandidate) => {
    setPlaceResolutions((current) => ({ ...current, [key]: { query, status: "candidate", selected } }));
  };

  const downloadJourneyRegistrationDraft = () => {
    if (!journeyCandidate || !lensDecision) return;
    const existingJourney = existingJourneys.find((journey) => journey.id === targetJourneyId);
    if (journeyMode === "existing" && !existingJourney) return;
    const draft = buildJourneyRegistrationDraft(journeyCandidate, {
      mode: journeyMode,
      targetJourney: journeyMode === "existing"
        ? { id: existingJourney!.id, label: existingJourney!.label }
        : { id: journeyCandidate.id, label: journeyCandidate.label },
      includedPlaceKeys,
      placeResolutions,
      connectionDecision,
      lensDecision,
    });
    const blob = new Blob([JSON.stringify(draft, null, 2) + String.fromCharCode(10)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resoworld.journey-registration.draft.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.journeyCandidate}>
      <div>
        <p className={styles.eyebrow}>JOURNEY REVIEW</p>
        <h4>{journeyCandidate.label}</h4>
      </div>
      <p>Atlasへはまだ反映していません。登録先、位置解決へ回す地点、LENS方針を確認してReview Draftを保存します。</p>
      <dl>
        <div><dt>DOCUMENT</dt><dd>{journeyCandidate.documentIds.length}</dd></div>
        <div><dt>CLAIMS</dt><dd>{journeyCandidate.claimIds.length}</dd></div>
        <div><dt>PLACES TO RESOLVE</dt><dd>{includedPlaceKeys.size} / {journeyCandidate.placeCandidates.length}</dd></div>
        <div><dt>LENS</dt><dd>{lensDecision || "判断待ち"}</dd></div>
      </dl>
      <fieldset className={styles.journeyChoice}>
        <legend>Journey登録先</legend>
        <label>
          <input type="radio" name="journey-mode" checked={journeyMode === "new"} onChange={() => setJourneyMode("new")} />
          新しいJourneyとして登録候補にする
        </label>
        <label>
          <input type="radio" name="journey-mode" checked={journeyMode === "existing"} disabled={existingJourneys.length === 0} onChange={() => setJourneyMode("existing")} />
          既存Journeyへ追加する
        </label>
        {journeyMode === "existing" ? (
          <select value={targetJourneyId} onChange={(event) => setTargetJourneyId(event.target.value)}>
            {existingJourneys.map((journey) => (
              <option value={journey.id} key={journey.id}>
                {journey.label} · {journey.documentCount}文書 · {journey.spotCount}地点
              </option>
            ))}
          </select>
        ) : null}
      </fieldset>
      <fieldset className={styles.journeyChoice}>
        <legend>位置解決へ回す地点名</legend>
        <p className={styles.placeSearchNotice}>
          候補検索を押した地名だけをNominatim（OpenStreetMap）へ送ります。結果はローカルにキャッシュし、選んでも確定座標にはせずReview候補として保存します。
        </p>
        <div className={styles.journeyPlaces}>
          {journeyCandidate.placeCandidates.map((place) => {
            const key = journeyPlaceCandidateKey(place);
            const search = placeSearch[key];
            const resolution = placeResolutions[key];
            return (
              <div className={styles.journeyPlace} key={key}>
                <label>
                  <input type="checkbox" checked={includedPlaceKeys.has(key)} onChange={() => toggleJourneyPlace(key)} />
                  <span>{place.name}<small>{place.roles.join(" / ")}</small></span>
                </label>
                <button
                  type="button"
                  className={styles.placeSearchButton}
                  disabled={!includedPlaceKeys.has(key) || search?.status === "loading"}
                  onClick={() => searchJourneyPlace(key, place.name)}
                >
                  {search?.status === "loading" ? "検索中…" : "候補を検索"}
                </button>
                {search?.message ? (
                  <small className={styles.placeSearchStatus} data-error={search.status === "error"}>
                    {search.message}
                  </small>
                ) : null}
                {search?.candidates.length ? (
                  <div className={styles.placeResults}>
                    {search.candidates.map((candidate) => (
                      <label key={candidate.id} data-selected={resolution?.selected.id === candidate.id}>
                        <input
                          type="radio"
                          name={`place-${key}`}
                          checked={resolution?.selected.id === candidate.id}
                          onChange={() => selectPlaceResolution(key, place.name, candidate)}
                        />
                        <span>
                          {candidate.displayName}
                          <small>
                            {candidate.category} / {candidate.type} · {candidate.latitude.toFixed(5)}, {candidate.longitude.toFixed(5)}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </fieldset>
      <fieldset className={styles.journeyChoice}>
        <legend>地図上の接続線</legend>
        <p className={styles.placeSearchNotice}>
          地点が複数あるだけでは線を作りません。訪問順序または共通テーマを根拠で確認できる場合だけ、次のReviewへ回します。
        </p>
        <div className={styles.journeyDecision}>
          {([
            ["no_connection", "線を作らない（既定）"],
            ["review_ordered_route", "訪問順序を確認してルート化"],
            ["review_thematic_connection", "共通テーマの根拠を確認して接続"],
          ] as const).map(([value, label]) => (
            <label key={value} data-active={connectionDecision === value}>
              <input type="radio" name="connection-decision" checked={connectionDecision === value} onChange={() => setConnectionDecision(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className={styles.journeyChoice}>
        <legend>LENS判断</legend>
        <div className={styles.journeyDecision}>
          {([
            ["reuse_existing", "既存LENSで十分"],
            ["update_pack_or_preset", "Knowledge Pack / Preset更新"],
            ["create_new_lens", "新規LENSを検討"],
          ] as const).map(([value, label]) => (
            <label key={value} data-active={lensDecision === value}>
              <input type="radio" name="lens-decision" checked={lensDecision === value} onChange={() => setLensDecision(value)} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={!lensDecision || (journeyMode === "existing" && !targetJourneyId)}
        onClick={downloadJourneyRegistrationDraft}
      >
        Journey登録Review Draftを保存
      </button>
    </section>
  );
}
