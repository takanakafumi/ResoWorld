"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { buildEvidenceGraph } from "@/domain/review/graph";
import type {
  EntityProposal,
  ReviewDataset,
  ReviewStatus,
} from "@/domain/review/types";

import styles from "./review.module.css";

type StoredReviewDraft = {
  statuses: Record<string, ReviewStatus>;
  proposals: EntityProposal[];
};

const EMPTY_REVIEW_DRAFT = JSON.stringify({ statuses: {}, proposals: [] });
const REVIEW_DRAFT_EVENT = "resoworld-review-draft";

function subscribeToReviewDraft(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(REVIEW_DRAFT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(REVIEW_DRAFT_EVENT, callback);
  };
}

function parseReviewDraft(value: string): StoredReviewDraft {
  try {
    const parsed = JSON.parse(value) as Partial<StoredReviewDraft>;
    return {
      statuses: parsed.statuses ?? {},
      proposals: parsed.proposals ?? [],
    };
  } catch {
    return { statuses: {}, proposals: [] };
  }
}

function useReviewDraft(storageKey: string) {
  const getSnapshot = useCallback(
    () => window.localStorage.getItem(storageKey) ?? EMPTY_REVIEW_DRAFT,
    [storageKey],
  );
  const rawDraft = useSyncExternalStore(
    subscribeToReviewDraft,
    getSnapshot,
    () => EMPTY_REVIEW_DRAFT,
  );
  return useMemo(() => parseReviewDraft(rawDraft), [rawDraft]);
}

function writeReviewDraft(storageKey: string, draft: StoredReviewDraft) {
  window.localStorage.setItem(storageKey, JSON.stringify(draft));
  window.dispatchEvent(new Event(REVIEW_DRAFT_EVENT));
}
const statusLabels: Record<ReviewStatus, string> = {
  suggested: "提案",
  needs_review: "要確認",
  confirmed: "確認済み",
  rejected: "却下",
};

const sourceNatureLabels: Record<string, string> = {
  Observation: "現地観察",
  HistoricalSource: "歴史史料",
  Archaeology: "考古学",
  Tradition: "伝承",
  UserHypothesis: "自分の仮説",
  Alternative: "異説・代替解釈",
  AISuggestion: "AIによる整理・提案",
};

const originLabels: Record<string, string> = {
  user: "ユーザー",
  ai: "AI生成",
  imported: "記録から取込",
  system: "システム",
};

const claimKindLabels: Record<string, string> = {
  assertion: "主張",
  observation: "観察",
  question: "問い",
  hypothesis: "仮説",
  suggestion: "提案",
  synthesis: "統合的な見方",
};

function historicalTimeLabel(value: ReviewDataset["claims"][number]["historicalTime"]) {
  if (!value) return "時代情報なし";
  if (value.kind === "calendar") {
    return value.endYear
      ? `${value.startYear}–${value.endYear}年`
      : `${value.startYear}年`;
  }
  return value.label || "時代不明";
}

function objectLabel(claim: ReviewDataset["claims"][number]) {
  return claim.object.kind === "entity"
    ? claim.object.entity.name
    : String(claim.object.value);
}

function compactLabel(value: string, maximum = 14) {
  return value.length > maximum ? `${value.slice(0, maximum)}…` : value;
}

export function ReviewWorkspace({ dataset }: { dataset: ReviewDataset }) {
  const storageKey = `resoworld-review:${dataset.datasetId}`;
  const [selectedClaimId, setSelectedClaimId] = useState(
    dataset.claims[0]?.id ?? "",
  );
  const [activeEvidenceIndex, setActiveEvidenceIndex] = useState(0);
  const { statuses, proposals } = useReviewDraft(storageKey);
  const [documentFilter, setDocumentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [includeRejected, setIncludeRejected] = useState(false);

  const documentById = useMemo(
    () => new Map(dataset.documents.map((document) => [document.id, document])),
    [dataset.documents],
  );
  const effectiveStatus = (claimId: string) =>
    statuses[claimId] ??
    dataset.claims.find((claim) => claim.id === claimId)?.reviewStatus ??
    "needs_review";
  const selectedClaim =
    dataset.claims.find((claim) => claim.id === selectedClaimId) ??
    dataset.claims[0];

  const queueClaims = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ja-JP");
    return dataset.claims.filter((claim) => {
      const documentMatches =
        documentFilter === "all" ||
        claim.evidence.some(
          (evidence) => evidence.passage.documentId === documentFilter,
        );
      const status = statuses[claim.id] ?? claim.reviewStatus;
      const statusMatches = statusFilter === "all" || status === statusFilter;
      const queryMatches =
        !normalizedQuery ||
        `${claim.statement} ${claim.subject.name} ${objectLabel(claim)}`
          .toLocaleLowerCase("ja-JP")
          .includes(normalizedQuery);
      return documentMatches && statusMatches && queryMatches;
    });
  }, [dataset.claims, documentFilter, query, statusFilter, statuses]);

  const graphClaims = useMemo(
    () =>
      dataset.claims.filter(
        (claim) =>
          documentFilter === "all" ||
          claim.evidence.some(
            (evidence) => evidence.passage.documentId === documentFilter,
          ),
      ),
    [dataset.claims, documentFilter],
  );
  const graph = useMemo(
    () =>
      buildEvidenceGraph({
        claims: graphClaims,
        statuses,
        selectedClaimId,
        includeRejected,
      }),
    [graphClaims, includeRejected, selectedClaimId, statuses],
  );
  const positions = useMemo(() => {
    const width = 760;
    const height = 480;
    const radiusX = 292;
    const radiusY = 174;
    return new Map(
      graph.nodes.map((node, index) => {
        const angle = (Math.PI * 2 * index) / Math.max(graph.nodes.length, 1) - Math.PI / 2;
        return [
          node.id,
          {
            x: width / 2 + Math.cos(angle) * radiusX,
            y: height / 2 + Math.sin(angle) * radiusY,
          },
        ];
      }),
    );
  }, [graph.nodes]);

  const counts = useMemo(() => {
    const result: Record<ReviewStatus, number> = {
      suggested: 0,
      needs_review: 0,
      confirmed: 0,
      rejected: 0,
    };
    dataset.claims.forEach((claim) => {
      result[statuses[claim.id] ?? claim.reviewStatus] += 1;
    });
    return result;
  }, [dataset.claims, statuses]);

  const selectClaim = (claimId: string) => {
    setSelectedClaimId(claimId);
    setActiveEvidenceIndex(0);
  };

  const updateStatus = (status: ReviewStatus) => {
    if (!selectedClaim) return;
    writeReviewDraft(storageKey, {
      statuses: { ...statuses, [selectedClaim.id]: status },
      proposals,
    });
  };

  const toggleProposal = (kind: "merge" | "split", entityNames: string[]) => {
    const id = `${kind}:${entityNames.join("|")}`;
    const nextProposals = proposals.some((proposal) => proposal.id === id)
      ? proposals.filter((proposal) => proposal.id !== id)
      : [
          ...proposals,
          { id, kind, entityNames, createdAt: new Date().toISOString() },
        ];
    writeReviewDraft(storageKey, { statuses, proposals: nextProposals });
  };

  const selectedObject = selectedClaim ? objectLabel(selectedClaim) : "";
  const mergeProposalId = selectedClaim
    ? `merge:${selectedClaim.subject.name}|${selectedObject}`
    : "";
  const splitProposalId = selectedClaim
    ? `split:${selectedClaim.subject.name}`
    : "";

  return (
    <main className={styles.reviewPage}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="ResoWorld home">
          <span aria-hidden="true">◉</span>
          <span>RESOWORLD</span>
        </Link>
        <div className={styles.workspaceTitle}>
          <span>EVIDENCE GRAPH</span>
          <strong>宗像 → 宇佐 → 国東</strong>
        </div>
        <div className={styles.topbarMeta}>
          <Link href="/review" className={styles.localBadge}>地図へ戻る</Link>
          <span>{dataset.documents.length} DOCUMENTS</span>
          <span>{dataset.claims.length} CLAIMS</span>
          <span className={styles.localBadge}>LOCAL ONLY</span>
        </div>
      </header>

      <section className={styles.commandBar} aria-label="Review summary and filters">
        <div className={styles.reviewProgress}>
          <span className={styles.progressLabel}>REVIEW STATE</span>
          <div className={styles.progressTrack}>
            <span
              style={{
                width: `${((counts.confirmed + counts.rejected) / dataset.claims.length) * 100}%`,
              }}
            />
          </div>
          <strong>{counts.confirmed + counts.rejected} / {dataset.claims.length}</strong>
        </div>
        <label>
          文書
          <select value={documentFilter} onChange={(event) => setDocumentFilter(event.target.value)}>
            <option value="all">すべての文書</option>
            {dataset.documents.map((document) => (
              <option key={document.id} value={document.id}>{document.title}</option>
            ))}
          </select>
        </label>
        <label>
          状態
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">すべて</option>
            {(Object.keys(statusLabels) as ReviewStatus[]).map((status) => (
              <option key={status} value={status}>{statusLabels[status]}</option>
            ))}
          </select>
        </label>
        <label className={styles.searchField}>
          検索
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Entity・Claimを検索"
          />
        </label>
      </section>

      <section className={styles.workspace}>
        <aside className={`${styles.panel} ${styles.evidencePanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>01</span>
              <h1>原文とClaim</h1>
            </div>
            <span>{queueClaims.length}</span>
          </div>

          {selectedClaim ? (
            <section className={styles.sourceSection}>
              <div className={styles.sectionLabel}>
                <span>SELECTED EVIDENCE</span>
                <span>{selectedClaim.evidence.length}</span>
              </div>
              {selectedClaim.evidence.map((evidence, index) => (
                <button
                  type="button"
                  key={evidence.id ?? `${selectedClaim.id}-${index}`}
                  className={styles.evidenceCard}
                  data-active={index === activeEvidenceIndex}
                  onClick={() => setActiveEvidenceIndex(index)}
                >
                  <span className={styles.evidenceMeta}>
                    {documentById.get(evidence.passage.documentId)?.title ?? "Document"}
                    {" · "}L{evidence.passage.startLine}–{evidence.passage.endLine}
                  </span>
                  <mark>{evidence.passage.quote}</mark>
                  <span className={styles.evidenceNature} data-nature={evidence.sourceNature}>
                    {sourceNatureLabels[evidence.sourceNature] ?? evidence.sourceNature}
                  </span>
                </button>
              ))}
            </section>
          ) : null}

          <div className={styles.claimQueue}>
            <div className={styles.sectionLabel}>
              <span>CLAIM QUEUE</span>
              <span>クリックで接続を表示</span>
            </div>
            {queueClaims.map((claim) => {
              const status = effectiveStatus(claim.id);
              return (
                <button
                  type="button"
                  key={claim.id}
                  className={styles.queueItem}
                  data-selected={claim.id === selectedClaim?.id}
                  onClick={() => selectClaim(claim.id)}
                >
                  <span className={styles.queueStatus} data-status={status}>
                    {statusLabels[status]}
                  </span>
                  <strong>{claim.subject.name} → {objectLabel(claim)}</strong>
                  <span>{claim.statement}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={`${styles.panel} ${styles.graphPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>02</span>
              <h2>Evidence Graph</h2>
            </div>
            <label className={styles.rejectedToggle}>
              <input
                type="checkbox"
                checked={includeRejected}
                onChange={(event) => setIncludeRejected(event.target.checked)}
              />
              却下を表示
            </label>
          </div>
          <div className={styles.legend}>
            <span><i data-kind="selected" />選択中</span>
            <span><i data-kind="confirmed" />確認済み</span>
            <span><i data-kind="review" />未確認</span>
          </div>
          <div className={styles.graphCanvas}>
            <svg viewBox="0 0 760 480" role="img" aria-label="根拠のあるClaimから構成したEntity関係図">
              {graph.edges.map((edge) => {
                const source = positions.get(edge.sourceId);
                const target = positions.get(edge.targetId);
                if (!source || !target) return null;
                const selected = edge.claimId === selectedClaim?.id;
                return (
                  <g
                    key={edge.id}
                    className={styles.graphEdge}
                    data-selected={selected}
                    data-status={edge.status}
                    role="button"
                    tabIndex={0}
                    aria-label={`${edge.label} のClaimを表示`}
                    onClick={() => selectClaim(edge.claimId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectClaim(edge.claimId);
                      }
                    }}
                  >
                    <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
                    <rect
                      x={(source.x + target.x) / 2 - 46}
                      y={(source.y + target.y) / 2 - 11}
                      width="92"
                      height="22"
                      rx="11"
                    />
                    <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 + 4}>
                      {compactLabel(edge.label, 16)}
                    </text>
                  </g>
                );
              })}
              {graph.nodes.map((node) => {
                const position = positions.get(node.id);
                if (!position) return null;
                return (
                  <g key={node.id} className={styles.graphNode} transform={`translate(${position.x} ${position.y})`}>
                    <circle r="28" />
                    <text y="-39" className={styles.nodeType}>{node.type}</text>
                    <text y="4">{compactLabel(node.label, 11)}</text>
                  </g>
                );
              })}
            </svg>
            <div className={styles.graphHint}>
              <span>線を選ぶ</span>
              <strong>→</strong>
              <span>Claimを読む</span>
              <strong>→</strong>
              <span>原文へ戻る</span>
            </div>
          </div>
        </section>

        <aside className={`${styles.panel} ${styles.detailPanel}`}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelIndex}>03</span>
              <h2>Claim詳細</h2>
            </div>
            {selectedClaim ? (
              <span className={styles.detailStatus} data-status={effectiveStatus(selectedClaim.id)}>
                {statusLabels[effectiveStatus(selectedClaim.id)]}
              </span>
            ) : null}
          </div>

          {selectedClaim ? (
            <div className={styles.detailBody}>
              <p className={styles.claimKind}>{claimKindLabels[selectedClaim.claimKind]}</p>
              <h3>{selectedClaim.statement}</h3>

              <div className={styles.relationFormula}>
                <strong>{selectedClaim.subject.name}</strong>
                <span>{selectedClaim.predicate}</span>
                <strong>{selectedObject}</strong>
              </div>

              <dl className={styles.factGrid}>
                <div>
                  <dt>根拠の性質</dt>
                  <dd data-accent="nature">
                    {sourceNatureLabels[selectedClaim.evidence[activeEvidenceIndex]?.sourceNature] ?? "不明"}
                  </dd>
                </div>
                <div>
                  <dt>記述の生成元</dt>
                  <dd data-accent="origin">{originLabels[selectedClaim.originType]}</dd>
                </div>
                <div>
                  <dt>対象時代</dt>
                  <dd>{historicalTimeLabel(selectedClaim.historicalTime)}</dd>
                </div>
                <div>
                  <dt>確実性</dt>
                  <dd>{selectedClaim.epistemic.modality} / {selectedClaim.epistemic.verification}</dd>
                </div>
              </dl>

              <section className={styles.entitySection}>
                <div className={styles.sectionLabel}>
                  <span>ENTITY CANDIDATES</span>
                  <span>{proposals.length} saved</span>
                </div>
                <button
                  type="button"
                  data-active={proposals.some((proposal) => proposal.id === mergeProposalId)}
                  onClick={() => toggleProposal("merge", [selectedClaim.subject.name, selectedObject])}
                >
                  <span>⇄</span>
                  <div>
                    <strong>同一Entity候補として束ねる</strong>
                    <small>{selectedClaim.subject.name} / {selectedObject}</small>
                  </div>
                </button>
                <button
                  type="button"
                  data-active={proposals.some((proposal) => proposal.id === splitProposalId)}
                  onClick={() => toggleProposal("split", [selectedClaim.subject.name])}
                >
                  <span>⑂</span>
                  <div>
                    <strong>分離候補として記録</strong>
                    <small>{selectedClaim.subject.name}の表記・時代を再確認</small>
                  </div>
                </button>
              </section>

              <section className={styles.reviewActions}>
                <div className={styles.sectionLabel}>
                  <span>HUMAN REVIEW</span>
                  <span>このブラウザに保存</span>
                </div>
                <div>
                  <button type="button" data-action="confirm" onClick={() => updateStatus("confirmed")}>✓ 確認</button>
                  <button type="button" data-action="review" onClick={() => updateStatus("needs_review")}>? 保留</button>
                  <button type="button" data-action="reject" onClick={() => updateStatus("rejected")}>× 却下</button>
                </div>
              </section>
            </div>
          ) : (
            <p className={styles.emptyState}>Claimを選択してください。</p>
          )}
        </aside>
      </section>
    </main>
  );
}
