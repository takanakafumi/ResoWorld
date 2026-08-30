import Link from "next/link";

import {
  listLocalImportFiles,
  LocalImportError,
  previewLocalImport,
} from "@/server/imports/local-files";

import styles from "./imports.module.css";
import { ExtractionPanel } from "./extraction-panel";

export const dynamic = "force-dynamic";

type ImportPageProps = {
  searchParams: Promise<{
    file?: string;
    expectedHash?: string;
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

export default async function ImportPage({ searchParams }: ImportPageProps) {
  const parameters = await searchParams;
  const defaults = extractionDefaults();
  let files: Awaited<ReturnType<typeof listLocalImportFiles>> = [];
  let preview: Awaited<ReturnType<typeof previewLocalImport>> | null = null;
  let error: LocalImportError | null = null;

  try {
    files = await listLocalImportFiles();
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
        <span className={styles.localBadge}>LOCAL ONLY</span>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>DOCUMENT IMPORT PREVIEW</p>
        <h1>探索記録を、送信前に確認する。</h1>
        <p>
          この画面はローカルファイルをDocumentとPassageへ分割するだけです。
          既定ではOllamaを使い、このPC内だけでAI抽出します。OpenAI APIを選ぶ場合は送信前に明示確認します。
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
