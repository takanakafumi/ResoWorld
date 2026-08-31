"use client";

import { useMemo, useState } from "react";

import { buildCodexExplorationBrief } from "@/domain/exploration/codex-brief";
import type { CodexResearchOutput } from "@/domain/exploration/codex-research";
import type { ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";

const actionTypeLabels: Record<
  ReviewExplorationSuggestion["actionType"],
  string
> = {
  field_visit: "現地探索",
  literature_research: "文献調査",
  revisit: "再訪・再確認",
};

type ResearchResponse =
  | { ok: true; research: CodexResearchOutput }
  | { ok: false; error?: { message?: string } };

export function CodexResearchPanel({
  datasetId,
  suggestion,
}: {
  datasetId: string;
  suggestion: ReviewExplorationSuggestion;
}) {
  const [consented, setConsented] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [requestState, setRequestState] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [research, setResearch] = useState<CodexResearchOutput | null>(null);
  const brief = useMemo(() => buildCodexExplorationBrief(suggestion), [suggestion]);

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  const runResearch = async () => {
    if (!consented || requestState === "loading") return;
    setRequestState("loading");
    setErrorMessage("");
    setResearch(null);
    try {
      const response = await fetch("/api/codex-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          suggestionId: suggestion.id,
          consent: "run_codex_cli_research",
        }),
      });
      const body = (await response.json()) as ResearchResponse;
      if (!response.ok || !body.ok) {
        throw new Error(
          !body.ok && body.error?.message
            ? body.error.message
            : "Codex CLIの調査を開始できませんでした。",
        );
      }
      setResearch(body.research);
      setRequestState("idle");
    } catch (error) {
      setRequestState("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Codex CLIの調査に失敗しました。",
      );
    }
  };

  return (
    <section className={styles.publicResearch}>
      <div className={styles.researchHeading}>
        <div>
          <span>CODEX RESEARCH / LOCAL WRAPPER</span>
          <h3>Codexで、次の候補を調査する</h3>
        </div>
        <span className={styles.codexBadge}>LOCAL CODEX CLI</span>
      </div>

      <p className={styles.researchLead}>
        インストール済みのCodex CLIをアプリから一時実行します。別のOpenAI
        APIキーは使いません。下の最小ブリーフと公開Web情報だけを使い、旅行記本文・根拠引用・訪問地点一覧・ファイルパスは渡しません。
      </p>

      <details className={styles.payloadPreview}>
        <summary>Codexへ渡す調査ブリーフを確認</summary>
        <pre className={styles.codexBrief}>{brief}</pre>
      </details>

      <label className={styles.codexConsent}>
        <input
          type="checkbox"
          checked={consented}
          onChange={(event) => setConsented(event.target.checked)}
        />
        <span>この最小ブリーフをCodexへ渡し、公開Webを検索することに同意します</span>
      </label>

      <div className={styles.codexActions}>
        <button
          type="button"
          disabled={!consented || requestState === "loading"}
          onClick={runResearch}
        >
          {requestState === "loading" ? "Codexが調査中…" : "Codexで調査する"}
        </button>
        <button type="button" data-secondary onClick={copyBrief}>
          ブリーフをコピー
        </button>
        <p>実行は1件ずつです。結果は一時表示だけで、Atlasへ自動採用されません。</p>
      </div>

      {copyState === "copied" ? (
        <p className={styles.copySuccess}>調査ブリーフをコピーしました。</p>
      ) : null}
      {copyState === "error" ? (
        <p className={styles.researchError}>
          自動コピーできませんでした。上のブリーフを開いて手動でコピーしてください。
        </p>
      ) : null}
      {requestState === "error" ? (
        <p className={styles.researchError}>{errorMessage}</p>
      ) : null}

      {research ? (
        <div className={styles.researchResults}>
          <div className={styles.researchSummary}>
            <span>CODEX SUMMARY</span>
            <p>{research.summary}</p>
          </div>
          <div className={styles.researchCandidateGrid}>
            {research.candidates.map((candidate) => (
              <article key={`${candidate.targetName}-${candidate.actionType}`}>
                <span>{actionTypeLabels[candidate.actionType]}</span>
                <h4>{candidate.targetName}</h4>
                <p>{candidate.reason}</p>
                <p><strong>確認すること：</strong>{candidate.expectedObservation}</p>
                <p><strong>不確実性：</strong>{candidate.uncertainty}</p>
                <div className={styles.researchSources}>
                  {candidate.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className={styles.humanReview}>
            <span>HUMAN REVIEW / ATLASへ入れる前に</span>
            <ul>
              {research.humanReview.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
