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

## Map-first product decision

The initial Evidence Graph validated traceability, but it did not make the
discovery itself feel compelling. The primary experience therefore moves to a
map-first flow:

1. select a place that was actually visited;
2. reveal the curated connection themes that start or pass through that place;
3. see the related historical periods, other places, and concepts together;
4. inspect the Claims and Evidence that support the connection;
5. open the Evidence Graph only when a structural review is needed.

The map and graph are complementary rather than competing views. The map is the
discovery surface; the graph is the verification surface.

The local Atlas JSON contains only presentation metadata: geographic
coordinates, labels, Claim references, and curated cross-place themes. It lives
under the ignored private import root and is configured with:

```dotenv
RESOWORLD_REVIEW_ATLAS_FILE=<relative path to a local Atlas JSON>
```

The server validates every referenced Spot and Claim before returning Atlas
data to the client. The first prototype uses a local coordinate field rather
than external map tiles, so opening the review workspace does not send visited
locations or browsing metadata to a map provider.

This slice intentionally displays historical periods instead of implementing a
full time filter. The next validation question is whether selecting a visited
spot and seeing its cross-time connections produces a meaningful discovery.
Only after that should the time filter and basemap fidelity be expanded.

## Meaning Lens and historical layers

A selected connection now carries two additional local-only structures:

- facets: semantic forces such as myth, ritual, politics, exchange, landscape,
  belief, society, or military, each with a relative weight from 1 to 5;
- eras: named historical slices with their own Spot and Claim references plus
  a conceptual map-layer type.

The dominant facet controls the connection color across the route, markers, and
detail panel. Facet weight controls bubble area so the user can recognize the
connection's composition before reading its prose explanation.

Selecting an era changes three things together: the conceptual historical layer
drawn over the coordinate map, the connected Spots, and the supporting Claims.
This prevents a broad connection from visually implying that every place and
piece of evidence belonged to the same moment.

The current overlays describe structures such as maritime corridors, religious
networks, domains, or modern separation. They are explicitly labeled as
conceptual historical layers, not reconstructed coastlines or authoritative
political boundaries. A later slice may replace them with sourced historical
geodata after this interaction model is validated.

## Next exploration prototype

Phase 5 adds evidence-backed exploration suggestions to the local Atlas. A
suggestion contains the unresolved question, missing information, recommended
action type, target, reason, expected observation, uncertainty, supporting
Claims, anchor Spots, and related Connections.

Suggestions appear as visually distinct NEXT markers. Selecting one replaces
the connection detail with a task-oriented view that answers:

- what should be checked next;
- which question it tests;
- what the current record is missing;
- what to observe or collect;
- which Claims justify the recommendation.

The suggestion lifecycle is device-local. Suggested, accepted, and rejected
states are stored in browser localStorage and do not mutate the private source
dataset. Rejected suggestions remain faintly visible so the user can reconsider
them without losing the decision history.

The first validation uses a few manually curated suggestions rather than
automatic ranking. This isolates the important product question: whether a
well-explained recommendation feels worth acting on. A real basemap, travel
routing, popularity, and distance ranking remain deferred until this loop is
useful.
