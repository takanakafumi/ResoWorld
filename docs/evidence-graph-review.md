# Evidence Graph review workspace

Issue #6 introduces a local working surface for validating the core ResoWorld
experience: select a Relation, inspect the Claim that creates it, return to the
supporting passage, and make a human review decision.

## Product hypothesis

The graph is not the source of truth. Every visible line is derived from one
Claim with at least one Evidence passage. The main interaction is therefore:

1. select a Relation in the graph;
2. read the Claim and its epistemic classification;
3. inspect the highlighted local quote and line range;
4. confirm, hold, or reject the Claim;
5. optionally record an Entity merge or split candidate.

The three-pane layout keeps the source text, connection, and decision visible
at the same time. `sourceNature` is presented as the nature of the evidence,
while `originType` is presented separately as who or what produced the Claim.

## Local configuration

The review dataset is read only on the server and must be located inside the
configured local root. The source path is removed before data crosses the
Server Component boundary.

```dotenv
RESOWORLD_REVIEW_ENABLED=true
RESOWORLD_REVIEW_DIR=<absolute path to a private local data directory>
RESOWORLD_REVIEW_FILE=<relative path to a schema-0.2.0 dataset JSON>
RESOWORLD_REVIEW_INITIAL_STATUS=needs_review
```

`RESOWORLD_REVIEW_INITIAL_STATUS` creates a review-session working copy. It
does not modify the source Gold JSON. The committed `.env.example` keeps review
disabled and contains no private path.

## Review persistence

Status overrides and Entity merge/split proposals are stored in browser
`localStorage`, namespaced by dataset ID. They survive a page reload on the same
browser profile. The source dataset remains immutable and no review mutation is
sent to an API, external AI provider, Git, or a database.

This is sufficient for interaction validation, not durable curation. A later
slice should add explicit local JSON export/import or a local persistence API
before review decisions become authoritative.

## Graph rules

- A Relation is created only from a Claim containing Evidence.
- Rejected Claims are excluded from the normal graph.
- A reviewer may temporarily show rejected Relations as dashed lines.
- The selected Relation focuses its Claim and nearby Entity connections.
- The graph intentionally limits visible edges to keep the review surface
  readable; the complete Claim queue remains searchable and filterable.
- Entity merge and split actions create proposals only. They never mutate an
  Entity automatically.

## Current validation boundary

The workspace uses the local 44-Claim curated dataset to test the desired
experience before investing further in automatic extraction quality. The next
decision is subjective: whether this source → connection → Claim → decision
flow feels useful enough to continue into document-crossing insights and maps.
