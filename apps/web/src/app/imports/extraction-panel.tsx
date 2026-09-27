"use client";

import { useMemo, useState } from "react";

import type { JourneyImportCandidate } from "@/domain/imports/journey-candidate";
import type { ImportedPassage } from "@/domain/imports/types";
import type { Claim } from "@/domain/knowledge/schema";

import { JourneyReviewSection } from "./journey-review-section";
import styles from "./extraction-panel.module.css";

type ExtractionProvider = "lmstudio";

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
  | { ok: false; error: { code: string; message: string; passageIds?: string[] } };

type DraftResponse =
  | { ok: true; status: "added" | "unchanged"; addedClaimCount: number; draft: unknown; journeyCandidate: JourneyImportCandidate; existingJourneys: { id: string; label: string; documentCount: number; spotCount: number }[] }
  | { ok: false; error: { code: string; message: string } };



export function ExtractionPanel(props: {
  file: string;
  documentSha256: string;
  passages: ImportedPassage[];
  defaultModel?: string;
}) {
  const provider: ExtractionProvider = "lmstudio";
  const [model, setModel] = useState(props.defaultModel || "qwen/qwen3-14b");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [response, setResponse] = useState<ExtractionResponse | null>(null);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [draftMessage, setDraftMessage] = useState("");
  const [journeyCandidate, setJourneyCandidate] = useState<JourneyImportCandidate | null>(null);
  const [existingJourneys, setExistingJourneys] = useState<{ id: string; label: string; documentCount: number; spotCount: number }[]>([]);

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
          consent: "process_selected_passages_locally",
        }),
      });
      const body = (await result.json()) as ExtractionResponse;
      setResponse(body);
      if (!body.ok && body.error.passageIds?.length) {
        setSelectedIds(new Set(body.error.passageIds));
      }
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

  return (
    <>
      <section className={styles.sendPanel}>
        <div className={styles.sendHeader}>
          <div>
            <p className={styles.eyebrow}>LM STUDIO LOCAL AI</p>
            <h3>処理方法とPassageを選ぶ</h3>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={toggleAll}>
            {selectedIds.size === props.passages.length ? "選択を解除" : "すべて選択"}
          </button>
        </div>
        <label>
          処理エンジン
          <input type="text" value="LM Studio（ローカル推論）" readOnly />
        </label>
        <label>
          モデル識別子
          <input
            type="text"
            value={model}
            placeholder="e.g. qwen/qwen3-14b"
            onChange={(event) => setModel(event.target.value)}
          />
        </label>
        <p className={styles.privacyCopy}>
          選択したPassageは、このPCのLM Studio（ローカル推論）だけで処理します。外部へのデータ送信はありません。
        </p>
        <div className={styles.selectionSummary}>
          <span>{selectedPassages.length} / {props.passages.length} PASSAGES</span>
          <span>{selectedCharacters.toLocaleString("ja-JP")} CHARACTERS</span>
          <span>LOCAL LM STUDIO</span>
        </div>
        
        <button
          type="button"
          className={styles.extractButton}
          disabled={selectedPassages.length === 0 || status === "sending"}
          onClick={extract}
        >
          {status === "sending" ? "抽出中…" : "LM Studioで抽出を実行"}
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
              {journeyCandidate ? (
                <JourneyReviewSection
                  journeyCandidate={journeyCandidate}
                  existingJourneys={existingJourneys}
                />
              ) : null}
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
              {response.error.passageIds?.length ? (
                <p>
                  失敗した{response.error.passageIds.length}件だけを選択しました。LM Studioサーバーの稼働状態やモデルロードを確認して再実行してください。
                </p>
              ) : null}
              <p>成功済みバッチはローカルに保持されています。同じ条件で再実行すると、未完了バッチから再開します。</p>
            </>
          )}
        </section>
      ) : null}
    </>
  );
}
