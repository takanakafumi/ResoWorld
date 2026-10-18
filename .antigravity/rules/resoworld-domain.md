# ResoWorld Domain & Architecture Rules

## 1. Three-Tier Division of Labor (ADR-0009)
1. **Deterministic Conversion**: Handled by local code/scripts (Node.js/TS, PowerShell).
2. **Bulk Candidate Extraction & Literature Parsing**: Handled by local LLM (LM Studio via `node scripts/local-llm.mjs`).
3. **Structured Design & UI Synthesis**: Handled by cloud AI (Antigravity).

## 2. Exploration Candidate (NEXT) Policy
- **Strictly Unvisited Only**:
  - Revisit (`revisit`), Visited (`visited`), and pure Literature Research (`research`) must **NOT** appear in the NEXT candidate queue or map suggestion markers.
  - Only genuine, unvisited frontiers (`knowledge_unvisited`) are displayed as suggestions.
- Suggestions on the map must be visually distinct with animated pulse/dashed styling and togglable via the suggestions checkbox.

## 3. Tech Stack Conventions
- Package Manager: `pnpm` (`corepack enable`).
- Framework: Next.js (App Router), CSS Modules (`.module.css`).
- Maps: MapLibre GL (`AtlasMap`).
- Local LLM Endpoint: LM Studio at `http://127.0.0.1:1234/v1`.

## 4. Evidence-Driven Stratum & Anti-Bias Rules (ADR-0018)
- **Forward Causality Only**:
  - Stratum classification must be derived strictly from `Claim` statements, `historicalTime`, and spot `kind` (Claims -> Stratum Engine -> Observation).
  - NEVER hardcode spot names into stratum recognition tokens (`knownSpotTokens`) to favor newly added journeys.
  - NEVER write tests that assert ranking/density hierarchies between journeys (e.g. `munakataDensity > hisayamaDensity`). Stratum distribution is an observation output of recorded facts, not a pre-determined hierarchy.
- **Connection Leakage Prevention**:
  - A spot must NOT inherit historical strata (like L3 ritsuryo) from the `topicId` of comparative `Connection` lines it touches.
- **Utility Spot Exclusion**:
  - Modern utility spots (museums, stations, hotels, restaurants, michi-no-eki) must never match ritual/historical strata.

