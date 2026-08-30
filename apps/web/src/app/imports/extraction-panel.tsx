"use client";

import { useMemo, useState } from "react";

import type { ImportedPassage } from "@/domain/imports/types";
import type { Claim } from "@/domain/knowledge/schema";

import styles from "./extraction-panel.module.css";

type ExtractionResponse =
  | {
      ok: true;
      extraction: {
        model: string;
        attempts: number;
        usage: {
          inputTokens: number | null;
          outputTokens: number | null;
          totalTokens: number | null;
        };
        claims: Claim[];
      };
    }
  | { ok: false; error: { code: string; message: string } };

export function ExtractionPanel(props: {
  file: string;
  documentSha256: string;
  passages: ImportedPassage[];
  apiConfigured: boolean;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [response, setResponse] = useState<ExtractionResponse | null>(null);

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
          consent: "send_selected_passages_to_openai",
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

  return (    <>
      <section className={styles.sendPanel}>
        <div className={styles.sendHeader}>
          <div>
            <p className={styles.eyebrow}>EXTERNAL AI EXTRACTION</p>
            <h3>送信するPassageを選ぶ</h3>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={toggleAll}>
            {selectedIds.size === props.passages.length ? "選択を解除" : "すべて選択"}
          </button>
        </div>
        <p className={styles.privacyCopy}>
          チェックしたPassageの本文・行番号・セクション名と文書タイトルだけをOpenAI
          Responses APIへ送信します。ファイルパス、未選択Passage、APIキーは送信本文に含めません。
          APIでは学習に使用されませんが、通常は不正利用監視ログに最大30日保持される可能性があります。
        </p>
        <div className={styles.selectionSummary}>
          <span>{selectedPassages.length} / {props.passages.length} PASSAGES</span>
          <span>{selectedCharacters.toLocaleString("ja-JP")} CHARACTERS</span>
          <span>{props.apiConfigured ? "API KEY READY" : "API KEY NOT CONFIGURED"}</span>
        </div>
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={consented}
            onChange={(event) => setConsented(event.target.checked)}
          />
          <span>下で選択した本文が外部APIへ送信されることを確認しました</span>
        </label>
        <button
          type="button"
          className={styles.extractButton}
          disabled={
            !props.apiConfigured ||
            !consented ||
            selectedPassages.length === 0 ||
            status === "sending"
          }
          onClick={extract}
        >
          {status === "sending"
            ? "抽出中…"
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
                <span>この本文を送信対象に含める</span>
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
                {response.extraction.model} · {response.extraction.attempts} attempt(s) · {response.extraction.usage.totalTokens ?? "?"} tokens
              </p>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={downloadResult}
              >
                抽出結果JSONをローカル保存
              </button>
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

