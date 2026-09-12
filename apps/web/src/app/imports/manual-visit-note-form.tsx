"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./imports.module.css";

export type ManualVisitJourneyOption = {
  id: string;
  label: string;
  spots: Array<{ id: string; name: string; needsEvidence: boolean }>;
};

export function ManualVisitNoteForm({ journeys }: { journeys: ManualVisitJourneyOption[] }) {
  const router = useRouter();
  const [journeyId, setJourneyId] = useState(journeys[0]?.id ?? "");
  const spots = useMemo(() => journeys.find(({ id }) => id === journeyId)?.spots ?? [], [journeyId, journeys]);
  const [spotId, setSpotId] = useState(journeys[0]?.spots[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [observedAt, setObservedAt] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  if (journeys.length === 0) return null;
  const changeJourney = (nextJourneyId: string) => {
    setJourneyId(nextJourneyId);
    setSpotId(journeys.find(({ id }) => id === nextJourneyId)?.spots[0]?.id ?? "");
  };
  const submit = async () => {
    if (!journeyId || !spotId || note.trim().length < 3 || !confirmed || status === "saving") return;
    setStatus("saving");
    setMessage("");
    try {
      const response = await fetch("/api/manual-visit-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeyId, spotId, note, observedAt: observedAt || undefined, consent: "save_manual_visit_evidence" }),
      });
      const result = await response.json() as { ok?: boolean; status?: "added" | "unchanged"; error?: { message?: string } };
      if (!response.ok || !result.ok) throw new Error(result.error?.message || "訪問メモを保存できませんでした。");
      setStatus("done");
      setMessage(result.status === "unchanged" ? "同じメモはすでに保存されています。" : "訪問メモを根拠として保存しました。");
      setNote("");
      setConfirmed(false);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "訪問メモを保存できませんでした。");
    }
  };

  return <details className={styles.manualVisitPanel}>
    <summary><span><strong>旅行記にない訪問を追記</strong><small>既存の地図地点へ、自分の観察を根拠として追加します</small></span><span>開く</span></summary>
    <div className={styles.manualVisitForm}>
      <label>旅程<select value={journeyId} onChange={(event) => changeJourney(event.target.value)}>{journeys.map((journey) => <option value={journey.id} key={journey.id}>{journey.label}</option>)}</select></label>
      <label>訪問地点<select value={spotId} onChange={(event) => setSpotId(event.target.value)}>{spots.map((spot) => <option value={spot.id} key={spot.id}>{spot.needsEvidence ? "要追記 · " : ""}{spot.name}</option>)}</select></label>
      <label>訪問日（任意）<input type="date" value={observedAt} onChange={(event) => setObservedAt(event.target.value)} /></label>
      <label className={styles.manualVisitNote}>訪問メモ<textarea value={note} maxLength={4000} rows={4} placeholder="例：旧宅を訪問し、建物の配置と展示を確認した。" onChange={(event) => setNote(event.target.value)} /></label>
      <label className={styles.manualVisitConsent}><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>このメモを、自分の訪問記録としてローカルDatasetへ保存する</span></label>
      <div className={styles.manualVisitActions}><button type="button" disabled={!spotId || note.trim().length < 3 || !confirmed || status === "saving"} onClick={submit}>{status === "saving" ? "保存中…" : "訪問の根拠を保存"}</button>{message ? <p data-status={status}>{message}</p> : null}</div>
    </div>
  </details>;
}
