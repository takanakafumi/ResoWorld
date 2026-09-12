import Link from "next/link";

import {
  listLocalImportFiles,
  LocalImportError,
  previewLocalImport,
} from "@/server/imports/local-files";

import styles from "./imports.module.css";
import { ExtractionPanel } from "./extraction-panel";
import { JourneyCandidateReview } from "./journey-candidate-review";
import { SuggestionDraftReview, type SuggestionDraftReviewItem } from "./suggestion-draft-review";
import { buildJourneySuggestionContext, suggestionDraftId, validateSuggestionDraftReferences } from "@/domain/exploration/suggestion-drafts";
import { auditJourneyCoverage, type JourneyCoverageAudit } from "@/domain/imports/journey-coverage-audit";
import { listLocalSuggestionDrafts } from "@/server/exploration/local-suggestion-drafts";
import { listLocalJourneyCandidates, loadLocalJourneyCandidate, loadLocalJourneyPlaceReview } from "@/server/imports/local-journey-candidates";
import { loadLocalReviewDataset } from "@/server/review/local-dataset";

export const dynamic = "force-dynamic";

type ImportPageProps = {
  searchParams: Promise<{
    file?: string;
    expectedHash?: string;
    candidate?: string;
  }>;
};

function extractionDefaults() {
  const defaultProvider =
    process.env.RESOWORLD_EXTRACTION_PROVIDER === "openai"
      ? ("openai" as const)
      : ("ollama" as const);
  const defaultLocalModel =
    process.env.RESOWORLD_OLLAMA_MODEL === "gpt-oss:20b"
      ? ("gpt-oss:20b" as const)
      : ("qwen3.5:9b" as const);
  return { defaultProvider, defaultLocalModel };
}
function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  return `${(value / 1024).toFixed(1)} KB`;
}

const lensLabels: Record<string, string> = {
  mythology: "神・系譜",
  religion: "宗教",
  route: "ルート",
  politics: "政治・社会",
  people: "人物",
};

export default async function ImportPage({ searchParams }: ImportPageProps) {
  const parameters = await searchParams;
  const defaults = extractionDefaults();
  let files: Awaited<ReturnType<typeof listLocalImportFiles>> = [];
  let preview: Awaited<ReturnType<typeof previewLocalImport>> | null = null;
  let error: LocalImportError | null = null;
  let journeyCandidates: Awaited<ReturnType<typeof listLocalJourneyCandidates>> = [];
  let selectedJourneyCandidate: Awaited<ReturnType<typeof loadLocalJourneyCandidate>> | null = null;
  let selectedPlaceReview: Awaited<ReturnType<typeof loadLocalJourneyPlaceReview>> = null;
  let existingAtlasSpots: NonNullable<Awaited<ReturnType<typeof loadLocalReviewDataset>>["atlas"]>["spots"] = [];
  let suggestionReviewItems: SuggestionDraftReviewItem[] = [];
  let journeyAudits: JourneyCoverageAudit[] = [];

  try {
    files = await listLocalImportFiles();
    journeyCandidates = await listLocalJourneyCandidates();
    const dataset = await loadLocalReviewDataset();
    existingAtlasSpots = dataset.atlas?.spots ?? [];
    journeyAudits = auditJourneyCoverage(dataset);
    const localDrafts = await listLocalSuggestionDrafts();
    const atlas = dataset.atlas;
    if (atlas) {
      const journeyById = new Map((atlas.journeys ?? []).map((journey) => [journey.id, journey]));
      const spotById = new Map(atlas.spots.map((spot) => [spot.id, spot]));
      const connectionById = new Map(atlas.connections.map((connection) => [connection.id, connection]));
      const claimById = new Map(dataset.claims.map((claim) => [claim.id, claim]));
      const adoptedIds = new Set(atlas.suggestions.map((suggestion) => suggestion.id));
      suggestionReviewItems = localDrafts.flatMap(({ file, draft }) => {
        const journey = journeyById.get(draft.journeyId);
        if (!journey) return [];
        let context: ReturnType<typeof buildJourneySuggestionContext>;
        try {
          context = buildJourneySuggestionContext(dataset, draft.journeyId);
          validateSuggestionDraftReferences({ suggestions: draft.suggestions }, context);
        } catch {
          return [];
        }
        return [{ file, journeyLabel: journey.label, createdAt: draft.createdAt, model: draft.model, suggestions: draft.suggestions.map((suggestion, index) => ({
          index, title: suggestion.title, question: suggestion.question, missingInformation: suggestion.missingInformation, targetName: suggestion.targetName, actionType: suggestion.actionType, reason: suggestion.reason, expectedObservation: suggestion.expectedObservation, uncertainty: suggestion.uncertainty,
          anchorNames: suggestion.anchorSpotIds.map((id) => spotById.get(id)?.name ?? id),
          connectionTitles: suggestion.connectionIds.map((id) => connectionById.get(id)?.title ?? context.connections.find((connection) => connection.id === id)?.title ?? id),
          claimStatements: suggestion.claimIds.map((id) => claimById.get(id)?.statement ?? id),
          alreadyAdopted: adoptedIds.has(suggestionDraftId(draft.journeyId, suggestion)),
        })) }];
      });
    }
    if (parameters.candidate) {
      selectedJourneyCandidate = await loadLocalJourneyCandidate(parameters.candidate);
      selectedPlaceReview = await loadLocalJourneyPlaceReview(parameters.candidate);
    }
    if (parameters.file) {
      preview = await previewLocalImport(parameters.file, {
        expectedSha256: parameters.expectedHash,
      });
    }
  } catch (caught) {
    error =
      caught instanceof LocalImportError
        ? caught
        : new LocalImportError("not_found", "Local import failed.");
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← RESOWORLD
        </Link>
        <div className={styles.headerActions}>
          <Link href="/review" className={styles.mapLink}>地図を見る →</Link>
          <span className={styles.localBadge}>LOCAL IMPORT</span>
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>DOCUMENT IMPORT PREVIEW</p>
        <h1>探索記録を、送信前に確認する。</h1>
        <p>
          この画面はローカルファイルをDocumentとPassageへ分割するだけです。
          既定ではOllamaを使い、このPC内だけでAI抽出します。Codex CLIまたはOpenAI APIを選ぶ場合は、選択した本文の外部送信を実行前に明示確認します。
        </p>
      </section>

      {error ? (
        <section className={styles.notice} data-kind="warning">
          <p className={styles.noticeCode}>{error.code}</p>
          <h2>ローカル取込を利用できません</h2>
          <p>
            <code>apps/web/.env.local</code>で
            <code> RESOWORLD_LOCAL_IMPORT_ENABLED=true</code>と
            <code> RESOWORLD_IMPORT_DIR</code>の絶対パスを設定してください。
          </p>
        </section>
      ) : (
        <>
          <section className={styles.selectorPanel}>
            <form method="get" className={styles.form}>
              <label htmlFor="file">ローカル文書</label>
              <select id="file" name="file" defaultValue={parameters.file ?? ""}>
                <option value="" disabled>
                  文書を選択
                </option>
                {files.map((file) => (
                  <option value={file.relativePath} key={file.relativePath}>
                    {file.name} — {formatBytes(file.size)}
                  </option>
                ))}
              </select>
              <button type="submit">ローカルでプレビュー</button>
            </form>
            <p>{files.length}件のUTF-8 .txtを取込候補として検出</p>
          </section>

          {journeyAudits.length > 0 ? <section className={styles.coveragePanel}>
            <div><p className={styles.eyebrow}>JOURNEY COVERAGE</p><h2>地図・知識への反映状況</h2><p>旅行記から地点、接続、LENSまでの参照切れを確認します。LENSが未接続でも、地点とClaimは失われません。</p></div>
            <div className={styles.coverageList}>{journeyAudits.map((audit) => {
              const actionable = audit.issues.filter((issue) => issue.severity !== "info");
              return <details className={styles.coverageItem} key={audit.journeyId} data-status={actionable.some((issue) => issue.severity === "error") ? "error" : actionable.length > 0 ? "warning" : "ok"}>
                <summary><span><strong>{audit.journeyLabel}</strong><small>{audit.documentCount}文書 · {audit.spotCount}地点 · {audit.connectionCount}接続</small></span><span>{actionable.length > 0 ? `${actionable.length}件を要確認` : "参照は正常"}</span></summary>
                <div><p><b>利用できるLENS：</b>{audit.lensIds.length > 0 ? audit.lensIds.map((id) => lensLabels[id] ?? id).join("、") : "まだありません"}</p>{audit.issues.length > 0 ? <ul>{audit.issues.map((issue, index) => <li key={`${issue.code}-${issue.referenceId ?? index}`} data-severity={issue.severity}>{issue.message}</li>)}</ul> : <p>JourneyからMAP・LENSまでの参照に問題はありません。</p>}</div>
              </details>;
            })}</div>
          </section> : null}

          {journeyCandidates.length > 0 ? <section className={styles.candidatePanel}>
            <div><p className={styles.eyebrow}>MULTI-DOCUMENT JOURNEYS</p><h2>統合した探索を確認する</h2></div>
            <div className={styles.candidateLinks}>{journeyCandidates.map(({ file, candidate }) => <Link key={file} href={`/imports?candidate=${encodeURIComponent(file)}`} data-active={parameters.candidate === file}><strong>{candidate.label}</strong><span>{candidate.documentIds.length}文書 · {candidate.claimIds.length} Claims · {candidate.placeCandidates.length}地点候補</span></Link>)}</div>
          </section> : null}

          {selectedJourneyCandidate && parameters.candidate ? <JourneyCandidateReview candidate={selectedJourneyCandidate} candidateFile={parameters.candidate} initialReview={selectedPlaceReview} existingSpots={existingAtlasSpots} /> : null}

          <SuggestionDraftReview items={suggestionReviewItems} />

          {preview ? (
            <section className={styles.preview}>
              <div className={styles.documentMeta}>
                <div>
                  <p className={styles.eyebrow}>DOCUMENT</p>
                  <h2>{preview.title}</h2>
                </div>
                <dl>
                  <div>
                    <dt>LINES</dt>
                    <dd>{preview.lineCount}</dd>
                  </div>
                  <div>
                    <dt>PASSAGES</dt>
                    <dd>{preview.passages.length}</dd>
                  </div>
                  <div>
                    <dt>SHA-256</dt>
                    <dd title={preview.sha256}>{preview.sha256.slice(0, 12)}…</dd>
                  </div>
                </dl>
              </div>

              {preview.changedFromExpectedHash ? (
                <div className={styles.changedWarning}>
                  文書ハッシュが以前の参照から変わっています。古いPassageアンカーを再利用しないでください。
                </div>
              ) : null}

              <ExtractionPanel
                file={preview.relativePath}
                documentSha256={preview.sha256}
                passages={preview.passages}
                openAIConfigured={Boolean(process.env.OPENAI_API_KEY?.trim())}
                codexConfigured={process.env.RESOWORLD_CODEX_CLI_ENABLED === "true"}
                defaultProvider={defaults.defaultProvider}
                defaultLocalModel={defaults.defaultLocalModel}
              />
            </section>
          ) : null}
        </>
      )}
    </main>
  );
}
