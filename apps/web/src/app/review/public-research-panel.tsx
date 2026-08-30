"use client";

import { useMemo, useState } from "react";

import { buildCodexExplorationBrief } from "@/domain/exploration/codex-brief";
import type { ReviewExplorationSuggestion } from "@/domain/review/types";

import styles from "./atlas.module.css";

export function CodexResearchPanel({
  suggestion,
}: {
  suggestion: ReviewExplorationSuggestion;
}) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const brief = useMemo(
    () => buildCodexExplorationBrief(suggestion),
    [suggestion],
  );

  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(brief);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  };

  return (
    <section className={styles.publicResearch}>
      <div className={styles.researchHeading}>
        <div>
          <span>CODEX RESEARCH / MANUAL</span>
          <h3>Codexで、次の候補を調査する</h3>
        </div>
        <span className={styles.codexBadge}>NO APP API CALL</span>
      </div>

      <p className={styles.researchLead}>
        アプリからOpenAI APIは呼びません。選択中の問いを最小ブリーフにして、Codexへ明示的に依頼します。旅行記本文・根拠引用・訪問地点一覧・ファイルパスはブリーフへ含めません。
      </p>

      <details className={styles.payloadPreview}>
        <summary>Codexへ渡す調査ブリーフを確認</summary>
        <pre className={styles.codexBrief}>{brief}</pre>
      </details>

      <div className={styles.codexActions}>
        <button type="button" onClick={copyBrief}>
          Codex調査ブリーフをコピー
        </button>
        <p>
          コピー後、このCodexタスクへ貼り付けてください。調査結果は出典を確認してからAtlasへ反映します。
        </p>
      </div>

      {copyState === "copied" ? (
        <p className={styles.copySuccess}>コピーしました。このタスクへ貼り付けられます。</p>
      ) : null}
      {copyState === "error" ? (
        <p className={styles.researchError}>
          自動コピーできませんでした。上のブリーフを開いて手動でコピーしてください。
        </p>
      ) : null}
    </section>
  );
}