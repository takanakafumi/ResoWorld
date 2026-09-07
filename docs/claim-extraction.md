# Claim extraction and evaluation

Issue #5 uses a local-first, privacy-aware boundary between private exploration
documents and AI providers.

## Decision

Extraction providers are selectable. Long-document bulk extraction uses
Ollama by default. Deterministic parsing, hashing, checkpoint reuse, validation,
and consolidation remain ordinary local code rather than LLM tasks. Codex CLI
is an explicit escalation path for only the batches that fail the local quality
gates, not the default bulk processor. OpenAI remains optional and is never
called without the external-send consent value.

The recommended local model is `qwen3.5:9b`. `gpt-oss:20b` remains selectable
for experiments. Provider-specific performance is an observed implementation
constraint, not a reason to change the Claim schema or source-of-truth model.

The general routing and escalation decision is recorded in
[ADR-0009](./decisions/0009-route-processing-by-required-intelligence.md).

```dotenv
RESOWORLD_EXTRACTION_PROVIDER=ollama
RESOWORLD_OLLAMA_BASE_URL=http://127.0.0.1:11434
RESOWORLD_OLLAMA_MODEL=qwen3.5:9b

# Optional external provider
OPENAI_API_KEY=
```

The Ollama URL is validated server-side and only plain HTTP loopback hosts
(`127.0.0.1`, `localhost`, or `::1`) are accepted. This prevents an apparently
local selection from silently targeting a remote Ollama-compatible endpoint.

## Flow

1. `/imports` parses a local UTF-8 text file into immutable Passages.
2. No Passage is selected by default.
3. The user chooses Codex CLI, Ollama, or OpenAI, and the exact Passages.
4. Ollama requests stay on loopback. OpenAI requests require an additional
   explicit external-send checkbox.
5. The server re-reads the document and rejects the request if its SHA-256 has
   changed since preview.
6. Local requests are split into batches of at most 12 Passages and 2,000
   characters. This avoids incomplete, runaway JSON on long documents.
7. Model-facing Passage IDs are temporary `P001` aliases constrained as a JSON
   Schema enum. The server restores the original immutable IDs and rejects any
   unknown alias.
8. The model returns Claim candidates. The local server materializes quotes,
   hashes, document IDs, and line anchors only from the original local text.
9. Every result is validated with Zod and returned with provider, model,
   duration, attempts, and token counts. Nothing is committed automatically.

Ollama uses `/api/chat`, `stream: false`, temperature 0, a 32k context, a 4k
output limit, and the full Claim JSON Schema. A failed request is retried at
most once in the application. The OpenAI path uses Responses Structured
Outputs with `store: false`, medium reasoning, and the same Claim schema.

## Privacy boundary

Only the selected Passage text, temporary Passage aliases, line ranges, section
paths, and document title enter a model request. File paths, unselected text,
and API keys are excluded from request content.

Ollama processing is local-only by construction. OpenAI states that API data is
not used to train models unless an organization opts in. Default API data
controls can still retain abuse-monitoring logs for up to 30 days; `store:
false` disables Responses application-state storage but is not a zero-retention
setting.

Official references:

- [Ollama structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- [Ollama chat API](https://docs.ollama.com/api/chat)
- [OpenAI gpt-oss-20b](https://developers.openai.com/api/docs/models/gpt-oss-20b)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data)

## Local model evaluation (2026-08-30)

An anonymous two-Passage smoke test was run locally before any private input:

| Model | Schema valid | Claims | Model duration | Tokens |
| --- | ---: | ---: | ---: | ---: |
| `gpt-oss:20b` | yes | 3 | 76.6 s | 3,515 |
| `qwen3.5:9b` | yes | 5 | 15.6 s | 2,832 |

The long-document Gold run used three local documents and 44 curated Claims.
No document content or detailed prediction was committed or sent externally.
The gitignored detailed report is under `data/imports/evaluations/`.

| Model/configuration | Completed batches | Failed batches | Predicted | Matched | Recall | Precision |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `qwen3.5:9b`, 12-Passage/2k-character batches | 38 | 2 | 272 | 43/44 | 97.7% | 15.8% |

Interpretation: the local 9B model is viable for recall-oriented candidate
generation and exceeds the provisional 80% recall target. Its low precision
shows that it extracts much more finely than the curated inclusion rule. Claims
must remain `suggested`; deduplication, importance filtering, and human review
are required before confirmation. The two failed batches make the recall figure
conservative, but borderline matches still require manual review.

`gpt-oss:20b` produced valid anonymous output, but with the dynamic Passage enum
it returned empty completed messages across reasoning settings. It is therefore
not the default for this pipeline until the Ollama/model combination improves.

## Large-document execution

With the local review server running, one or more complete documents can be
processed or resumed without selecting every Passage in the browser:

```powershell
pnpm extract:local -- "邪馬台国探索1.txt" "邪馬台国探索2.txt"
```

Use `--dry-run` first to validate the file boundary and report only Passage and
character counts without invoking a model.

The command previews each file through the same local import boundary and calls
the existing extraction API with all immutable Passage IDs. It is intentionally
a thin local client: batching, adaptive splitting, checkpoint reuse, schema
validation, and Evidence materialization remain in the shared application
path. Combined results are written atomically under the private import root at
`.resoworld/extraction-results/`; stdout contains counts and duration, not Claim
text or Evidence quotes. Re-running the command reuses compatible checkpoints.

Validate the private combined results against the current source documents with:

```powershell
pnpm validate:local-extraction -- "邪馬台国探索1.txt" "邪馬台国探索2.txt"
```

This checks the Claim schema, document identity, selected Passage coverage,
Evidence quote/hash/line anchors, cross-result Claim ID uniqueness, and reports
only aggregate review-tier counts.

Validated extraction results can then be folded into one private review draft
without changing the configured baseline:

```powershell
pnpm materialize:local-extractions -- --output yamatai-review-draft.json "邪馬台国探索1.txt" "邪馬台国探索2.txt"
```

The command always starts from `RESOWORLD_REVIEW_FILE`, applies the same domain
merge used by the import API in argument order, and writes atomically inside
`RESOWORLD_REVIEW_DIR`. The output remains a review draft: imported Claims keep
their proposed review status, and no Journey, Spot, Connection, or LENS is
created implicitly. Point `RESOWORLD_REVIEW_FILE` at the generated filename
only when a reviewer is ready to inspect it.

Codex CLI and Ollama extractions are split into deterministic, ordered Passage
batches before provider execution. A Passage is never split merely to satisfy a
batch limit. A maximum of 16 Passages or 12,000 characters was the initial
Codex bound, but live Gold execution showed that a
12,000-character extraction could exceed five minutes before producing its
first checkpoint. Codex therefore uses at most 8 Passages or 4,000 characters.
Ollama batches contain at most 12 Passages or 2,000 characters.
Codex extraction uses low reasoning effort because this stage performs
schema-constrained evidence extraction rather than interdisciplinary synthesis;
the latter continues to use a higher reasoning setting where needed.
If a configured version-specific Codex desktop executable disappears after an
app update, extraction falls back to the `codex` command available on PATH.
When a multi-Passage Codex batch fails or times out, only that batch is divided
in half and retried recursively. Successful halves are checkpointed
independently. A failure is surfaced only after a single-Passage batch also
fails, avoiding a globally tiny batch size while isolating unusually heavy
sections. A single Codex batch is capped at 90 seconds so adaptive splitting
starts within a practical review session even when a larger environment timeout
was configured previously.
On Windows the timeout terminates the dedicated extraction process tree, not
the Codex desktop process. This is required because terminating only the
immediate CLI process can leave a child holding its output pipe and prevent
adaptive splitting from starting.

Ollama uses the same adaptive split for invalid structured output or provider
failure. Completed parent batches remain reusable; only the failed batch is
halved, and successful child batches receive their own checkpoints. A
single-Passage failure is surfaced for review rather than silently discarded.

Each successful Codex CLI or Ollama batch is persisted immediately as local
JSON under `.resoworld/extractions/` inside the configured private import
root. The checkpoint key includes the immutable document hash, provider,
model, and prompt version. Each batch also records its exact Passage IDs and
Passage-derived batch ID.

Re-running the same extraction loads matching successful batches and invokes
the model only for missing work. Changing the document, provider, model, prompt
version, Passage IDs, or Passage hashes prevents stale reuse. Checkpoints store
extracted candidates and identifiers, not another copy of the source Passage
text. They remain outside Git with the private import data. The implementation
uses atomic JSON replacement rather than introducing a database during the
PoC.

After all reusable and newly completed batches are collected, candidates with
identical semantic fields are consolidated across batch boundaries. Their
distinct Evidence entries are merged. This deliberately does not merge merely
similar wording: broader semantic consolidation remains a review-stage concern
so the extraction layer does not silently discard the user's observations.

Review presentation is a separate projection over the retained candidates. Its
default order favors unresolved Claims, the user's own observations and
questions, interpretive or exploratory Claim kinds, and Claims connected to a
place or historical time. Confirmed and rejected Claims remain available but
move behind unresolved work. This ordering is deterministic and must not be
treated as an epistemic truth score or as permission to delete a candidate.
The Evidence Graph defaults to the focus tier and lets the reviewer switch to
all, supporting, or resolved candidates. Opening a Claim through a direct link
defaults to all candidates so the requested item is never hidden by the view.

Cross-document synthesis uses confirmed Claims as its default factual input.
Atlas connections separately declare whether they are documented relations,
comparative views, or interpretive connections. Older local Atlas files load as
interpretive until reviewed, which avoids silently presenting a comparison or
model as a direct historical relation.
Connection proposals also have a separate suggested, confirmed, or rejected
review lifecycle stored locally per dataset. Rejected exploration connections
are hidden from the normal Atlas and map projection but can be restored with
the explicit rejected-connections toggle. This lifecycle does not alter the
connection's documented/comparative/interpretive meaning.

## Gold evaluation

Run extraction outputs and reports only inside a gitignored directory. From
`apps/web`, evaluate one or more prediction files with:

Live provider evaluation files under the ignored evaluation directory can be
run explicitly without adding them to the normal test suite:

```powershell
$env:RESOWORLD_LIVE_GOLD_TEST="true"
$env:RESOWORLD_GOLD_OLLAMA_MODEL="qwen3.5:9b"
pnpm vitest run --config vitest.gold.config.mts
```

```powershell
node --experimental-strip-types scripts/evaluate-extraction.ts `
  [--tier=focus|supporting|resolved|all] `
  <gold-dataset.json> `
  <evaluation-report.json> `
  <prediction-1.extraction.json> `
  [prediction-2.extraction.json ...]
```

The optional tier evaluates the same projection exposed in the Evidence Graph.
Use `all` (the default) to measure extraction coverage and `focus` to measure
the initial review experience. Tier evaluation never rewrites the prediction
file or changes Claim review status.

The evaluator performs deterministic one-to-one matching. Evidence overlap uses
the overlap coefficient so a narrow Gold quote fully contained in a wider
Passage counts as overlapping. Statement bigrams and subject/object agreement
provide the remaining score. The metric is a review aid, not an automatic truth
judgment.
