# Claim extraction and evaluation

Issue #5 adds an explicit, privacy-aware boundary between local exploration
documents and the OpenAI API.

## Flow

1. `/imports` parses a local UTF-8 text file into immutable Passages.
2. No Passage is selected by default.
3. The user selects the exact Passages to send and reviews their full text.
4. The user acknowledges external transmission and starts extraction.
5. The server re-reads the document and rejects the request if its SHA-256 has
   changed since preview.
6. Only the document title and selected Passage IDs, text, line ranges, and
   section paths are sent to the OpenAI Responses API.
7. Structured Outputs returns Claim candidates that reference Passage IDs.
8. The local server replaces all evidence anchors with the original local
   Passage text, hashes, document ID, and line ranges, then validates each Claim
   with the domain Zod schema.
9. The user may download the result as a local JSON file. Nothing is committed
   or persisted by the application automatically.

The fixed endpoint is the OpenAI Responses API. The default model is
`gpt-5.6-sol` with `reasoning.effort: medium`, `store: false`, and strict JSON
Schema output. `RESOWORLD_EXTRACTION_MODEL` can override the model for a
controlled comparison.

## Privacy boundary

Set the API key only in `apps/web/.env.local` or the process environment. Never
use a `NEXT_PUBLIC_` variable for a secret.

```dotenv
OPENAI_API_KEY=...
RESOWORLD_EXTRACTION_MODEL=gpt-5.6-sol
```

OpenAI states that API data is not used to train models unless the organization
opts in. With the default data controls, prompts and responses can still appear
in abuse-monitoring logs retained for up to 30 days. `store: false` prevents
Responses application-state storage; it does not by itself remove the default
abuse-monitoring retention. The UI displays this distinction before sending.

Official references:

- [Create a model response](https://developers.openai.com/api/reference/resources/responses/methods/create)
- [GPT-5.6 Sol](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- [Data controls](https://developers.openai.com/api/docs/guides/your-data)

## Validation and retry policy

- Request JSON, selection size, unique Passage IDs, document hash, and local
  file boundaries are checked before any API request.
- Structured output is parsed and validated again with Zod.
- References to unselected or nonexistent Passages are rejected locally.
- HTTP 408, 409, 429, and 5xx responses, network failures, and schema-invalid
  output are retried at most once (two total attempts).
- Refusals and completed-but-incomplete model responses are not retried blindly.
- API error bodies are not returned to the browser, avoiding accidental leakage
  of provider diagnostics or request content.

## Gold evaluation

After downloading extraction JSON locally, run:

```powershell
node --experimental-strip-types scripts/evaluate-extraction.ts `
  <gold-dataset.json> `
  <evaluation-report.json> `
  <prediction-1.extraction.json> `
  <prediction-2.extraction.json> `
  <prediction-3.extraction.json>
```

Run the command from `apps/web`. Inputs and output should stay under a
gitignored local directory.

The evaluator performs deterministic one-to-one candidate matching. Half of
the score comes from overlap of document/line evidence anchors; the remainder
uses statement bigram similarity and subject/object agreement. It reports
recall, precision, unmatched IDs, and disagreements in Claim kind, origin,
source nature, modality, historical time, subject, and object.

The metric is a review aid, not an automatic truth judgment. Borderline matches
and all unmatched Claims require human review before accepting the final recall
figure or the approximately 80% target.

