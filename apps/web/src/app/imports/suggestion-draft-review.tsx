"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "./imports.module.css";

export type SuggestionDraftReviewItem = {
  file: string;
  journeyLabel: string;
  createdAt: string;
  model: string;
  suggestions: Array<{
    index: number;
    title: string;
    question: string;
    missingInformation: string;
    targetName: string;
    actionType: "field_visit" | "literature_research" | "revisit";
    reason: string;
    expectedObservation: string;
    uncertainty: string;
    anchorNames: string[];
    connectionTitles: string[];
    claimStatements: string[];
    alreadyAdopted: boolean;
  }>;
};

const actionLabels = { field_visit: "現地探索", literature_research: "資料調査", revisit: "再訪" } as const;

function DraftGroup({ item }: { item: SuggestionDraftReviewItem }) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const toggle = (index: number) => setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index]);
  const apply = async () => {
    if (selected.length === 0 || state === "saving") return;
    setState("saving");
    setMessage("");
    try {
      const response = await fetch("/api/suggestion-draft-apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ draftFile: item.file, selectedIndexes: selected, consent: "apply_reviewed_suggestion_drafts" }) });
      const result = await response.json() as { ok?: boolean; added?: number; error?: { message?: string } };
      if (!response.ok || !result.ok) throw new Error(result.error?.message || "Suggestionを適用できませんでした。");
      setState("done");
      setMessage(result.added ? result.added + "件をAtlasへ採用しました。" : "選択した候補はすでに採用済みです。");
      setSelected([]);
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Suggestionを適用できませんでした。");
    }
  };
  return <article className={styles.suggestionDraftGroup}>
    <header><div><p className={styles.eyebrow}>旅から見つかった次の候補</p><h3>{item.journeyLabel}</h3></div><p>{item.model} · {new Date(item.createdAt).toLocaleString("ja-JP")}</p></header>
    <div className={styles.suggestionDraftList}>{item.suggestions.map((suggestion) => <label className={styles.suggestionDraft} data-adopted={suggestion.alreadyAdopted} key={suggestion.index}>
      <input type="checkbox" checked={selected.includes(suggestion.index)} disabled={suggestion.alreadyAdopted || state === "saving"} onChange={() => toggle(suggestion.index)} />
      <span className={styles.suggestionDraftBody}>
        <span className={styles.suggestionDraftMeta}>{actionLabels[suggestion.actionType]}{suggestion.alreadyAdopted ? " · 採用済み" : " · 未採用"}</span>
        <strong>{suggestion.title}</strong>
        <span className={styles.suggestionQuestion}>{suggestion.question}</span>
        <span><b>補うと見えやすい情報：</b>{suggestion.missingInformation}</span>
        <span><b>次の候補：</b>{suggestion.targetName}</span>
        <details><summary>この候補の根拠と注意点</summary><div className={styles.suggestionEvidence}>
          <p><b>これまでとのつながり：</b>{suggestion.reason}</p><p><b>確かめる手がかり：</b>{suggestion.expectedObservation}</p><p><b>解釈上の注意：</b>{suggestion.uncertainty}</p>
          <p><b>訪問地点：</b>{suggestion.anchorNames.join("、")}</p><p><b>接続：</b>{suggestion.connectionTitles.join("、")}</p>
          <ul>{suggestion.claimStatements.map((statement, index) => <li key={index}>{statement}</li>)}</ul>
        </div></details>
      </span>
    </label>)}</div>
    <footer><button type="button" disabled={selected.length === 0 || state === "saving"} onClick={apply}>{state === "saving" ? "適用中…" : selected.length + "件をAtlasへ採用"}</button>{message ? <p data-kind={state}>{message}{state === "done" ? <> <Link href="/review">Reviewで確認 →</Link></> : null}</p> : null}</footer>
  </article>;
}

export function SuggestionDraftReview({ items }: { items: SuggestionDraftReviewItem[] }) {
  if (items.length === 0) return null;
  return <section className={styles.suggestionReviewPanel} aria-label="Suggestion下書きレビュー">
    <div><p className={styles.eyebrow}>次のつながりを確認</p><h2>旅から見つかった候補を選ぶ</h2><p>ローカルLLMが、これまでの訪問と知識のつながりから整理した下書きです。関心に合うものだけを選んでください。</p></div>
    {items.map((item) => <DraftGroup item={item} key={item.file} />)}
  </section>;
}
