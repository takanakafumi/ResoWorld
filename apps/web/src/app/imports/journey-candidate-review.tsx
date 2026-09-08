"use client";

import { useMemo, useState } from "react";

import { journeyPlaceCandidateKey, type JourneyImportCandidate } from "@/domain/imports/journey-candidate";
import type { JourneyPlaceClassification, JourneyPlaceReviewDraft } from "@/domain/imports/journey-place-review";
import type { PlaceResolutionCandidate, PlaceResolutionSelection } from "@/domain/imports/place-resolution";

import styles from "./journey-candidate-review.module.css";
import { JourneyPositionPreview } from "./journey-position-preview";

type Classification = JourneyPlaceClassification;
type SearchState = { status: "loading" | "done" | "error"; message?: string; candidates: PlaceResolutionCandidate[] };

const choices: { value: Classification; label: string }[] = [
  { value: "visited", label: "訪問済み" },
  { value: "mentioned", label: "言及のみ" },
  { value: "historical_candidate", label: "古代地名・比定候補" },
  { value: "excluded", label: "地図から除外" },
];

export function JourneyCandidateReview({ candidate, candidateFile, initialReview }: { candidate: JourneyImportCandidate; candidateFile: string; initialReview: JourneyPlaceReviewDraft | null }) {
  const initial = useMemo(() => Object.fromEntries(candidate.placeCandidates.map((place) => [
    journeyPlaceCandidateKey(place),
    initialReview?.places.find(({ key }) => key === journeyPlaceCandidateKey(place))?.classification ??
      (place.roles.includes("observed_place") ? "visited" : "mentioned"),
  ])) as Record<string, Classification>, [candidate, initialReview]);
  const [classifications, setClassifications] = useState(initial);
  const [searches, setSearches] = useState<Record<string, SearchState>>({});
  const [resolutions, setResolutions] = useState<Record<string, PlaceResolutionSelection>>(() => Object.fromEntries(
    initialReview?.places.flatMap((place) => place.positionCandidate ? [[place.key, place.positionCandidate]] : []) ?? [],
  ));
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(initialReview ? "saved" : "idle");
  const [saveMessage, setSaveMessage] = useState(initialReview ? "保存済みReview Draftから再開しました。" : "");
  const totals = choices.map((choice) => ({
    ...choice,
    count: Object.values(classifications).filter((value) => value === choice.value).length,
  }));
  const previewPoints = candidate.placeCandidates.flatMap((place) => {
    const key = journeyPlaceCandidateKey(place);
    const resolution = classifications[key] === "visited" ? resolutions[key] : undefined;
    return resolution ? [{ id: key, name: place.name, latitude: resolution.selected.latitude, longitude: resolution.selected.longitude }] : [];
  });

  const buildDraft = (): JourneyPlaceReviewDraft => ({
      schemaVersion: "0.1.0",
      status: "reviewed_place_classification" as const,
      journey: { id: candidate.id, label: candidate.label },
      documentIds: candidate.documentIds,
      places: candidate.placeCandidates.map((place) => ({
        key: journeyPlaceCandidateKey(place),
        name: place.name,
        entityId: place.entityId,
        classification: classifications[journeyPlaceCandidateKey(place)],
        roles: place.roles,
        claimIds: place.claimIds,
        positionCandidate: classifications[journeyPlaceCandidateKey(place)] === "visited"
          ? resolutions[journeyPlaceCandidateKey(place)]
          : undefined,
      })),
    });

  const download = () => {
    const draft = buildDraft();
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    anchor.download = `${candidate.id}.place-review.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const save = async () => {
    setSaveStatus("saving");
    setSaveMessage("");
    try {
      const response = await fetch("/api/journey-place-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateFile, draft: buildDraft() }),
      });
      const body = await response.json() as { ok: true; file: string } | { ok: false; error: { message: string } };
      if (!body.ok) {
        setSaveStatus("error");
        setSaveMessage(body.error.message);
        return;
      }
      setSaveStatus("saved");
      setSaveMessage("このPCの非公開Review領域へ保存しました。再読込しても続きから確認できます。");
    } catch {
      setSaveStatus("error");
      setSaveMessage("ローカル保存に失敗しました。");
    }
  };

  const changeClassification = (key: string, classification: Classification) => {
    setSaveStatus("idle");
    setSaveMessage("");
    setClassifications((current) => ({ ...current, [key]: classification }));
    if (classification !== "visited") {
      setResolutions((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  };

  const searchPlace = async (key: string, query: string) => {
    setSearches((current) => ({ ...current, [key]: { status: "loading", candidates: [] } }));
    try {
      const response = await fetch("/api/place-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, consent: "search_place_name_with_nominatim" }),
      });
      const body = await response.json() as
        | { ok: true; cached: boolean; candidates: PlaceResolutionCandidate[] }
        | { ok: false; error: { message: string } };
      if (!body.ok) {
        setSearches((current) => ({ ...current, [key]: { status: "error", message: body.error.message, candidates: [] } }));
        return;
      }
      setSearches((current) => ({ ...current, [key]: {
        status: "done",
        message: body.cached ? "ローカルキャッシュ" : "OpenStreetMapから取得",
        candidates: body.candidates,
      } }));
    } catch {
      setSearches((current) => ({ ...current, [key]: { status: "error", message: "位置候補を取得できませんでした。", candidates: [] } }));
    }
  };

  return <section className={styles.panel} aria-label="Journey地点候補レビュー">
    <header>
      <div><p>JOURNEY PLACE REVIEW</p><h2>{candidate.label}</h2></div>
      <dl><div><dt>DOCUMENTS</dt><dd>{candidate.documentIds.length}</dd></div><div><dt>CLAIMS</dt><dd>{candidate.claimIds.length}</dd></div><div><dt>PLACES</dt><dd>{candidate.placeCandidates.length}</dd></div></dl>
    </header>
    <p className={styles.guidance}>Ollamaが拾った地名候補です。「訪問済み」は初期提案であり未確定です。分類後、「訪問済み」だけ位置候補をOpenStreetMapで検索できます。地名は検索時にNominatimへ送られますが、選択してもまだ確定座標にはなりません。</p>
    <div className={styles.summary}>{totals.map((item) => <span key={item.value}>{item.label}<strong>{item.count}</strong></span>)}</div>
    <div className={styles.places}>{candidate.placeCandidates.map((place) => {
      const key = journeyPlaceCandidateKey(place);
      const classification = classifications[key];
      const search = searches[key];
      const resolution = resolutions[key];
      return <article key={key} className={styles.place}>
        <div className={styles.placeRow}><div><h3>{place.name}</h3><p>{place.roles.join(" / ")} · 根拠Claim {place.claimIds.length}件</p></div>
        <div className={styles.actions}><select aria-label={`${place.name}の分類`} value={classification} onChange={(event) => changeClassification(key, event.target.value as Classification)}>
          {choices.map((choice) => <option value={choice.value} key={choice.value}>{choice.label}</option>)}
        </select>{classification === "visited" ? <button type="button" disabled={search?.status === "loading"} onClick={() => searchPlace(key, place.name)}>{search?.status === "loading" ? "検索中…" : "位置候補を検索"}</button> : null}</div></div>
        {classification === "visited" && search ? <div className={styles.searchResult}>
          {search.message ? <p data-error={search.status === "error"}>{search.message}</p> : null}
          {search.candidates.map((position) => <label key={position.id} data-selected={resolution?.selected.id === position.id}>
            <input type="radio" name={`position-${key}`} checked={resolution?.selected.id === position.id} onChange={() => { setResolutions((current) => ({ ...current, [key]: { query: place.name, status: "candidate", selected: position } })); setSaveStatus("idle"); setSaveMessage(""); }} />
            <span><strong>{position.displayName}</strong><small>{position.category} / {position.type} · {position.latitude.toFixed(5)}, {position.longitude.toFixed(5)}</small></span>
          </label>)}
        </div> : null}
      </article>;
    })}</div>
    <JourneyPositionPreview points={previewPoints} />
    <footer><div><p>保存してもAtlasは変わりません。選択済み位置候補もReview状態で保持します。</p>{saveMessage ? <strong data-status={saveStatus}>{saveMessage}</strong> : null}</div><div className={styles.saveActions}><button type="button" className={styles.downloadButton} onClick={download}>JSONをダウンロード</button><button type="button" disabled={saveStatus === "saving"} onClick={save}>{saveStatus === "saving" ? "保存中…" : "このPCに保存"}</button></div></footer>
  </section>;
}
