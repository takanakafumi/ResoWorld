"use client";

import { useMemo, useState } from "react";

import { journeyPlaceCandidateKey, type JourneyImportCandidate } from "@/domain/imports/journey-candidate";

import styles from "./journey-candidate-review.module.css";

type Classification = "visited" | "mentioned" | "historical_candidate" | "excluded";

const choices: { value: Classification; label: string }[] = [
  { value: "visited", label: "訪問済み" },
  { value: "mentioned", label: "言及のみ" },
  { value: "historical_candidate", label: "古代地名・比定候補" },
  { value: "excluded", label: "地図から除外" },
];

export function JourneyCandidateReview({ candidate }: { candidate: JourneyImportCandidate }) {
  const initial = useMemo(() => Object.fromEntries(candidate.placeCandidates.map((place) => [
    journeyPlaceCandidateKey(place),
    place.roles.includes("observed_place") ? "visited" : "mentioned",
  ])) as Record<string, Classification>, [candidate]);
  const [classifications, setClassifications] = useState(initial);
  const totals = choices.map((choice) => ({
    ...choice,
    count: Object.values(classifications).filter((value) => value === choice.value).length,
  }));

  const download = () => {
    const draft = {
      schemaVersion: "0.1.0",
      status: "reviewed_place_classification",
      journey: { id: candidate.id, label: candidate.label },
      documentIds: candidate.documentIds,
      places: candidate.placeCandidates.map((place) => ({
        key: journeyPlaceCandidateKey(place),
        name: place.name,
        entityId: place.entityId,
        classification: classifications[journeyPlaceCandidateKey(place)],
        roles: place.roles,
        claimIds: place.claimIds,
      })),
    };
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], { type: "application/json" }));
    anchor.download = `${candidate.id}.place-review.json`;
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  return <section className={styles.panel} aria-label="Journey地点候補レビュー">
    <header>
      <div><p>JOURNEY PLACE REVIEW</p><h2>{candidate.label}</h2></div>
      <dl><div><dt>DOCUMENTS</dt><dd>{candidate.documentIds.length}</dd></div><div><dt>CLAIMS</dt><dd>{candidate.claimIds.length}</dd></div><div><dt>PLACES</dt><dd>{candidate.placeCandidates.length}</dd></div></dl>
    </header>
    <p className={styles.guidance}>Ollamaが拾った地名候補です。「訪問済み」は初期提案であり未確定です。ここでは地図に載せる意味だけを分類し、座標・接続線・LENSは次の工程で確認します。</p>
    <div className={styles.summary}>{totals.map((item) => <span key={item.value}>{item.label}<strong>{item.count}</strong></span>)}</div>
    <div className={styles.places}>{candidate.placeCandidates.map((place) => {
      const key = journeyPlaceCandidateKey(place);
      return <article key={key} className={styles.place}>
        <div><h3>{place.name}</h3><p>{place.roles.join(" / ")} · 根拠Claim {place.claimIds.length}件</p></div>
        <select aria-label={`${place.name}の分類`} value={classifications[key]} onChange={(event) => setClassifications((current) => ({ ...current, [key]: event.target.value as Classification }))}>
          {choices.map((choice) => <option value={choice.value} key={choice.value}>{choice.label}</option>)}
        </select>
      </article>;
    })}</div>
    <footer><p>保存してもAtlasは変わりません。次工程で「訪問済み」だけ位置候補を検索します。</p><button type="button" onClick={download}>地点分類Review Draftを保存</button></footer>
  </section>;
}
