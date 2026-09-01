"use client";

import { useMemo, useState } from "react";

import {
  buildJourneyRegistrationDraft,
  journeyPlaceCandidateKey,
  type JourneyImportCandidate,
  type JourneyConnectionDecision,
  type JourneyLensDecision,
} from "@/domain/imports/journey-candidate";
import type { ImportedPassage } from "@/domain/imports/types";
import type { Claim } from "@/domain/knowledge/schema";
import type { PlaceResolutionCandidate, PlaceResolutionSelection } from "@/domain/imports/place-resolution";

import styles from "./extraction-panel.module.css";

type ExtractionProvider = "ollama" | "openai" | "codex";

type ExtractionResponse =
  | {
      ok: true;
      extraction: {
        provider: ExtractionProvider;
        model: string;
        attempts: number;
        durationMs: number;
        usage: {
          inputTokens: number | null;
          outputTokens: number | null;
          totalTokens: number | null;
        };
        claims: Claim[];
      };
    }
  | { ok: false; error: { code: string; message: string } };

type DraftResponse =
  | { ok: true; status: "added" | "unchanged"; addedClaimCount: number; draft: unknown; journeyCandidate: JourneyImportCandidate; existingJourneys: { id: string; label: string; documentCount: number; spotCount: number }[] }
  | { ok: false; error: { code: string; message: string } };

type PlaceSearchResponse =
  | { ok: true; query: string; cached: boolean; candidates: PlaceResolutionCandidate[] }
  | { ok: false; error: { code: string; message: string } };

export function ExtractionPanel(props: {
  file: string;
  documentSha256: string;
  passages: ImportedPassage[];
  openAIConfigured: boolean;
  codexConfigured: boolean;
  defaultProvider: "ollama" | "openai";
  defaultLocalModel: "gpt-oss:20b" | "qwen3.5:9b";
}) {
  const [provider, setProvider] = useState<ExtractionProvider>(
    props.defaultProvider,
  );
  const [model, setModel] = useState(
    props.defaultProvider === "ollama"
      ? props.defaultLocalModel
      : "gpt-5.6-sol",
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [response, setResponse] = useState<ExtractionResponse | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [draftMessage, setDraftMessage] = useState("");
  const [journeyCandidate, setJourneyCandidate] = useState<JourneyImportCandidate | null>(null);
  const [existingJourneys, setExistingJourneys] = useState<{ id: string; label: string; documentCount: number; spotCount: number }[]>([]);
  const [journeyMode, setJourneyMode] = useState<"new" | "existing">("new");
  const [targetJourneyId, setTargetJourneyId] = useState("");
  const [includedPlaceKeys, setIncludedPlaceKeys] = useState<Set<string>>(new Set());
  const [placeSearch, setPlaceSearch] = useState<Record<string, { status: "loading" | "done" | "error"; message?: string; candidates: PlaceResolutionCandidate[] }>>({});
  const [placeResolutions, setPlaceResolutions] = useState<Record<string, PlaceResolutionSelection>>({});
  const [connectionDecision, setConnectionDecision] = useState<JourneyConnectionDecision>("no_connection");
  const [lensDecision, setLensDecision] = useState<JourneyLensDecision | "">("");

  const selectedPassages = useMemo(
    () => props.passages.filter((passage) => selectedIds.has(passage.id)),
    [props.passages, selectedIds],
  );
  const selectedCharacters = selectedPassages.reduce(
    (total, passage) => total + passage.text.length,
    0,
  );

  const togglePassage = (passageId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(passageId)) next.delete(passageId);
      else next.add(passageId);
      return next;
    });
    setResponse(null);
    setStatus("idle");
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.size === props.passages.length
        ? new Set()
        : new Set(props.passages.map((passage) => passage.id)),
    );
    setResponse(null);
    setStatus("idle");
  };

  const extract = async () => {
    setStatus("sending");
    setResponse(null);
    try {
      const result = await fetch("/api/extractions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: props.file,
          documentSha256: props.documentSha256,
          passageIds: selectedPassages.map((passage) => passage.id),
          provider,
          model,
          consent:
            provider === "ollama"
              ? "process_selected_passages_locally"
              : provider === "codex"
                ? "send_selected_passages_via_codex_cli"
                : "send_selected_passages_to_openai",
        }),
      });
      const body = (await result.json()) as ExtractionResponse;
      setResponse(body);
      setStatus(body.ok ? "done" : "error");
    } catch {
      setResponse({
        ok: false,
        error: {
          code: "network_error",
          message: "ローカルアプリから抽出APIへ接続できませんでした。",
        },
      });
      setStatus("error");
    }
  };

  const downloadResult = () => {
    if (!response?.ok) return;
    const blob = new Blob([`${JSON.stringify(response.extraction, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const baseName = props.file
      .replace(/\.txt$/i, "")
      .replace(/[^\p{L}\p{N}._-]+/gu, "-");
    anchor.href = url;
    anchor.download = `${baseName || "resoworld"}.extraction.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const generateDraftDataset = async () => {
    if (!response?.ok) return;
    setDraftStatus("saving");
    setDraftMessage("");
    setJourneyCandidate(null);
    try {
      const result = await fetch("/api/import-drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: props.file,
          documentSha256: props.documentSha256,
          claims: response.extraction.claims,
        }),
      });
      const body = (await result.json()) as DraftResponse;
      if (!body.ok) {
        setDraftStatus("error");
        setDraftMessage(body.error.message);
        return;
      }
      const blob = new Blob(
        [JSON.stringify(body.draft, null, 2) + String.fromCharCode(10)],
        { type: "application/json" },
      );
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "resoworld.dataset.draft.json";
      anchor.click();
      URL.revokeObjectURL(url);
      setDraftStatus("done");
      setJourneyCandidate(body.journeyCandidate);
      setExistingJourneys(body.existingJourneys);
      setJourneyMode("new");
      setTargetJourneyId(body.existingJourneys[0]?.id ?? "");
      setIncludedPlaceKeys(new Set(body.journeyCandidate.placeCandidates.map(journeyPlaceCandidateKey)));
      setPlaceSearch({});
      setPlaceResolutions({});
      setConnectionDecision("no_connection");
      setLensDecision("");
      setDraftMessage(
        body.status === "unchanged"
          ? "同じ文書は既にDatasetに含まれています。"
          : String(body.addedClaimCount) + "件のClaimを含むDraft Datasetを保存しました。",
      );
    } catch {
      setDraftStatus("error");
      setDraftMessage("Draft Datasetを生成できませんでした。");
    }
  };
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
      const body = await response.json() as PlaceSearchResponse;
      if (!body.ok) {
        setPlaceSearch((current) => ({ ...current, [key]: { status: "error", message: body.error.message, candidates: [] } }));
        return;
      }
      setPlaceSearch((current) => ({ ...current, [key]: { status: "done", message: body.cached ? "ローカルキャッシュ" : "OpenStreetMapから取得", candidates: body.candidates } }));
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
    anchor.download = `${draft.targetJourney.id}.registration-draft.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <section className={styles.sendPanel}>
        <div className={styles.sendHeader}>
          <div>
            <p className={styles.eyebrow}>
              {provider === "ollama"
                ? "LOCAL AI EXTRACTION"
                : provider === "codex"
                  ? "CODEX CLI EXTRACTION"
                  : "EXTERNAL AI EXTRACTION"}
            </p>
            <h3>処理方法とPassageを選ぶ</h3>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={toggleAll}>
            {selectedIds.size === props.passages.length ? "選択を解除" : "すべて選択"}
          </button>
        </div>
        <label>
          処理プロバイダー
          <select
            value={provider}
            onChange={(event) => {
              const next = event.target.value as ExtractionProvider;
              setProvider(next);
              setModel(
                next === "ollama"
                  ? props.defaultLocalModel
                  : "gpt-5.6-sol",
              );
              setConsented(false);
              setResponse(null);
              setStatus("idle");
            }}
          >
            <option value="ollama">Ollama（このPC内・既定）</option>
            <option value="codex">Codex CLI（既存ログイン・外部送信）</option>
            <option value="openai">OpenAI API（外部送信）</option>
          </select>
        </label>
        <label>
          モデル
          <select value={model} onChange={(event) => setModel(event.target.value)}>
            {provider === "ollama" ? (
              <>
                <option value="qwen3.5:9b">qwen3.5:9b（推奨・Gold recall 97.7%）</option>
                <option value="gpt-oss:20b">gpt-oss:20b（実験的）</option>
              </>
            ) : (
              <option value="gpt-5.6-sol">gpt-5.6-sol</option>
            )}
          </select>
        </label>
        <p className={styles.privacyCopy}>
          {provider === "ollama"
            ? "選択したPassageは、このPCのOllama（ループバック接続）だけで処理します。外部API、Git、データベースへは送信しません。"
            : provider === "codex"
              ? "チェックしたPassageの本文・行番号・セクション名と文書タイトルだけを、既存ログイン済みのCodex CLI経由でOpenAIへ送信します。未選択Passageとファイルパスは含めず、APIキーは使用しません。"
              : "チェックしたPassageの本文・行番号・セクション名と文書タイトルだけをOpenAI Responses APIへ送信します。ファイルパス、未選択Passage、APIキーは送信本文に含めません。"}
        </p>
        <div className={styles.selectionSummary}>
          <span>{selectedPassages.length} / {props.passages.length} PASSAGES</span>
          <span>{selectedCharacters.toLocaleString("ja-JP")} CHARACTERS</span>
          <span>
            {provider === "ollama"
              ? "LOCAL ONLY"
              : provider === "codex"
                ? props.codexConfigured
                  ? "CODEX CLI READY"
                  : "CODEX CLI NOT ENABLED"
                : props.openAIConfigured
                  ? "API KEY READY"
                  : "API KEY NOT CONFIGURED"}
          </span>
        </div>
        {provider !== "ollama" ? (
          <label className={styles.consentRow}>
            <input
              type="checkbox"
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
            />
            <span>{provider === "codex" ? "選択した本文がCodex CLI経由でOpenAIへ送信されることを確認しました" : "選択した本文が外部APIへ送信されることを確認しました"}</span>
          </label>
        ) : null}
        <button
          type="button"
          className={styles.extractButton}
          disabled={
            (provider === "openai" && (!props.openAIConfigured || !consented)) ||
            (provider === "codex" && (!props.codexConfigured || !consented)) ||
            selectedPassages.length === 0 ||
            status === "sending"
          }
          onClick={extract}
        >
          {status === "sending"
            ? "抽出中…"
            : provider === "ollama"
              ? "このPC内で抽出"
              : provider === "codex"
                ? "選択したPassageをCodexで抽出"
                : "選択したPassageをOpenAIへ送信して抽出"}
        </button>
      </section>

      <div className={styles.passages}>
        {props.passages.map((passage) => {
          const selected = selectedIds.has(passage.id);
  return (
            <article
              className={styles.passage}
              data-selected={selected}
              key={passage.id}
            >
              <label className={styles.passageSelection}>
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => togglePassage(passage.id)}
                />
                <span>この本文を抽出対象に含める</span>
              </label>
              <div className={styles.passageMeta}>
                <span>L{passage.startLine}–{passage.endLine}</span>
                <span>{passage.sectionPath.join(" / ") || "ROOT"}</span>
              </div>
              <pre>{passage.text}</pre>
            </article>
          );
        })}
      </div>

      {response ? (
        <section className={styles.resultPanel} data-kind={response.ok ? "success" : "error"}>
          {response.ok ? (
            <>
              <p className={styles.eyebrow}>EXTRACTION RESULT</p>
              <h3>{response.extraction.claims.length}件のClaim候補</h3>
              <p className={styles.resultMeta}>
                {response.extraction.provider} / {response.extraction.model} · {response.extraction.attempts} attempt(s) · {(response.extraction.durationMs / 1000).toFixed(1)} sec · {response.extraction.usage.totalTokens ?? "?"} tokens
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={downloadResult}
              >
                抽出結果JSONをローカル保存
              </button>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={draftStatus === "saving"}
                onClick={generateDraftDataset}
              >
                {draftStatus === "saving" ? "統合中…" : "既存Datasetへ統合したDraftを保存"}
              </button>
              {draftMessage ? <p>{draftMessage}</p> : null}
              {journeyCandidate ? <section className={styles.journeyCandidate}>
                <div><p className={styles.eyebrow}>JOURNEY REVIEW</p><h4>{journeyCandidate.label}</h4></div>
                <p>Atlasへはまだ反映していません。登録先、位置解決へ回す地点、LENS方針を確認してReview Draftを保存します。</p>
                <dl>
                  <div><dt>DOCUMENT</dt><dd>{journeyCandidate.documentIds.length}</dd></div>
                  <div><dt>CLAIMS</dt><dd>{journeyCandidate.claimIds.length}</dd></div>
                  <div><dt>PLACES TO RESOLVE</dt><dd>{includedPlaceKeys.size} / {journeyCandidate.placeCandidates.length}</dd></div>
                  <div><dt>LENS</dt><dd>{lensDecision || "判断待ち"}</dd></div>
                </dl>
                <fieldset className={styles.journeyChoice}>
                  <legend>Journey登録先</legend>
                  <label><input type="radio" name="journey-mode" checked={journeyMode === "new"} onChange={() => setJourneyMode("new")} />新しいJourneyとして登録候補にする</label>
                  <label><input type="radio" name="journey-mode" checked={journeyMode === "existing"} disabled={existingJourneys.length === 0} onChange={() => setJourneyMode("existing")} />既存Journeyへ追加する</label>
                  {journeyMode === "existing" ? <select value={targetJourneyId} onChange={(event) => setTargetJourneyId(event.target.value)}>{existingJourneys.map((journey) => <option value={journey.id} key={journey.id}>{journey.label} · {journey.documentCount}文書 · {journey.spotCount}地点</option>)}</select> : null}
                </fieldset>
                <fieldset className={styles.journeyChoice}>
                  <legend>位置解決へ回す地点名</legend>
                  <p className={styles.placeSearchNotice}>候補検索を押した地名だけをNominatim（OpenStreetMap）へ送ります。結果はローカルにキャッシュし、選んでも確定座標にはせずReview候補として保存します。</p>
                  <div className={styles.journeyPlaces}>{journeyCandidate.placeCandidates.map((place) => {
                    const key = journeyPlaceCandidateKey(place);
                    const search = placeSearch[key];
                    const resolution = placeResolutions[key];
                    return <div className={styles.journeyPlace} key={key}>
                      <label><input type="checkbox" checked={includedPlaceKeys.has(key)} onChange={() => toggleJourneyPlace(key)} /><span>{place.name}<small>{place.roles.join(" / ")}</small></span></label>
                      <button type="button" className={styles.placeSearchButton} disabled={!includedPlaceKeys.has(key) || search?.status === "loading"} onClick={() => searchJourneyPlace(key, place.name)}>{search?.status === "loading" ? "検索中…" : "候補を検索"}</button>
                      {search?.message ? <small className={styles.placeSearchStatus} data-error={search.status === "error"}>{search.message}</small> : null}
                      {search?.candidates.length ? <div className={styles.placeResults}>{search.candidates.map((candidate) => <label key={candidate.id} data-selected={resolution?.selected.id === candidate.id}><input type="radio" name={`place-${key}`} checked={resolution?.selected.id === candidate.id} onChange={() => selectPlaceResolution(key, place.name, candidate)} /><span>{candidate.displayName}<small>{candidate.category} / {candidate.type} · {candidate.latitude.toFixed(5)}, {candidate.longitude.toFixed(5)}</small></span></label>)}</div> : null}
                    </div>;
                  })}</div>
                </fieldset>
                <fieldset className={styles.journeyChoice}>
                  <legend>地図上の接続線</legend>
                  <p className={styles.placeSearchNotice}>地点が複数あるだけでは線を作りません。訪問順序または共通テーマを根拠で確認できる場合だけ、次のReviewへ回します。</p>
                  <div className={styles.journeyDecision}>
                    {([
                      ["no_connection", "線を作らない（既定）"],
                      ["review_ordered_route", "訪問順序を確認してルート化"],
                      ["review_thematic_connection", "共通テーマの根拠を確認して接続"],
                    ] as const).map(([value, label]) => <label key={value} data-active={connectionDecision === value}><input type="radio" name="connection-decision" checked={connectionDecision === value} onChange={() => setConnectionDecision(value)} />{label}</label>)}
                  </div>
                </fieldset>                <fieldset className={styles.journeyChoice}>
                  <legend>LENS判断</legend>
                  <div className={styles.journeyDecision}>
                    {([
                      ["reuse_existing", "既存LENSで十分"],
                      ["update_pack_or_preset", "Knowledge Pack / Preset更新"],
                      ["create_new_lens", "新規LENSを検討"],
                    ] as const).map(([value, label]) => <label key={value} data-active={lensDecision === value}><input type="radio" name="lens-decision" checked={lensDecision === value} onChange={() => setLensDecision(value)} />{label}</label>)}
                  </div>
                </fieldset>
                <button type="button" className={styles.secondaryButton} disabled={!lensDecision || (journeyMode === "existing" && !targetJourneyId)} onClick={downloadJourneyRegistrationDraft}>Journey登録Review Draftを保存</button>
              </section> : null}
              <div className={styles.claims}>
                {response.extraction.claims.map((claim) => (
                  <article key={claim.id} className={styles.claim}>
                    <p>{claim.statement}</p>
                    <dl>
                      <div><dt>KIND</dt><dd>{claim.claimKind}</dd></div>
                      <div><dt>ORIGIN</dt><dd>{claim.originType}</dd></div>
                      <div><dt>EVIDENCE</dt><dd>{claim.evidence.length}</dd></div>
                      <div><dt>REVIEW</dt><dd>{claim.reviewStatus}</dd></div>
                    </dl>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className={styles.noticeCode}>{response.error.code}</p>
              <h3>抽出できませんでした</h3>
              <p>{response.error.message}</p>
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
