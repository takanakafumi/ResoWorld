"use client";

import { useState } from "react";

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

type ResearchResult = {
  model: string;
  summary: string;
  candidates: Array<{
    targetName: string;
    actionType: ReviewExplorationSuggestion["actionType"];
    reason: string;
    expectedObservation: string;
    uncertainty: string;
    sources: Array<{ title: string; url: string }>;
  }>;
};

export function PublicResearchPanel({
  datasetId,
  suggestion,
}: {
  datasetId: string;
  suggestion: ReviewExplorationSuggestion;
}) {
  const [consented, setConsented] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [research, setResearch] = useState<ResearchResult | null>(null);

  const runResearch = async () => {
    if (!consented || loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/exploration-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetId,
          suggestionId: suggestion.id,
          consent: "send_minimized_research_brief_to_openai",
        }),
      });
      const body = (await response.json()) as {
        ok: boolean;
        research?: ResearchResult;
        error?: { code?: string };
      };
      if (!response.ok || !body.ok || !body.research) {
        throw new Error(
          body.error?.code === "disabled"
            ? "公開情報検索が無効です。.env.local の設定を確認してください。"
            : body.error?.code === "not_configured"
              ? "OPENAI_API_KEY が設定されていません。"
              : "公開情報の検索を完了できませんでした。",
        );
      }
      setResearch(body.research);
    } catch (researchError) {
      setError(
        researchError instanceof Error
          ? researchError.message
          : "公開情報の検索を完了できませんでした。",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.publicResearch}>
      <div className={styles.researchHeading}>
        <div>
          <span>AI WEB RESEARCH / OPTIONAL</span>
          <h3>公開情報から、次の候補を広げる</h3>
        </div>
        <span className={styles.externalBadge}>OPENAI · EXTERNAL</span>
      </div>

      <p className={styles.researchLead}>
        この操作をした時だけ公開Webを検索します。旅行記本文・根拠引用・訪問地点一覧・ファイルパスは送信しません。
      </p>

      <details className={styles.payloadPreview}>
        <summary>OpenAIへ送る最小情報を確認</summary>
        <dl>
          <div><dt>候補</dt><dd>{suggestion.targetName}</dd></div>
          <div><dt>行動</dt><dd>{actionTypeLabels[suggestion.actionType]}</dd></div>
          <div><dt>問い</dt><dd>{suggestion.question}</dd></div>
          <div><dt>不足情報</dt><dd>{suggestion.missingInformation}</dd></div>
          <div><dt>観察したいこと</dt><dd>{suggestion.expectedObservation}</dd></div>
        </dl>
      </details>

      <div className={styles.researchConsent}>
        <label>
          <input
            type="checkbox"
            checked={consented}
            onChange={(event) => setConsented(event.target.checked)}
          />
          上記の最小情報をOpenAIへ送信し、公開Webを検索することに同意する
        </label>
        <button type="button" disabled={!consented || loading} onClick={runResearch}>
          {loading ? "公開情報を探索中…" : research ? "もう一度探索する" : "公開情報から候補を探す"}
        </button>
      </div>

      {error ? <p className={styles.researchError}>{error}</p> : null}

      {research ? (
        <div className={styles.researchResults}>
          <div className={styles.researchSummary}>
            <span>{research.model} · 未採用の調査候補</span>
            <p>{research.summary}</p>
          </div>
          <div className={styles.researchCandidateGrid}>
            {research.candidates.map((candidate, index) => (
              <article key={`${candidate.targetName}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")} · {actionTypeLabels[candidate.actionType]}</span>
                <h4>{candidate.targetName}</h4>
                <p>{candidate.reason}</p>
                <dl>
                  <div><dt>確認すること</dt><dd>{candidate.expectedObservation}</dd></div>
                  <div><dt>不確実性</dt><dd>{candidate.uncertainty}</dd></div>
                </dl>
                <div className={styles.researchSources}>
                  {candidate.sources.map((source) => (
                    <a key={source.url} href={source.url} target="_blank" rel="noreferrer">
                      {source.title} ↗
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <p className={styles.researchFootnote}>
            AIが見つけた未採用候補です。出典を開いて確認後、Atlasへ取り込みます。この画面を再読込すると結果は消えます。
          </p>
        </div>
      ) : null}
    </section>
  );
}
