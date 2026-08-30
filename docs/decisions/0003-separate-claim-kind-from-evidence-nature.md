# ADR-0003: Claimの種類とEvidenceの由来を分離する

- Status: Accepted for PoC
- Date: 2026-08-30

## Context

Gold Datasetでは当初、`sourceNature`をClaimへ直接付与していた。しかし、文書横断のAI提案を考えると、一つのClaimを異なる性質のEvidenceが支える場合がある。

例えば「次に地点Aを調べるとよい」というAI提案は、それ自体はSuggestionであっても、根拠には現地Observation、Archaeology、HistoricalSourceが同時に使われる可能性がある。

Claimへ単一の`sourceNature`を付けるだけでは、提案の種類と根拠の由来が混同される。

## Decision

PoC schema 0.2では、次を分離する。

### claimKind

Claimがどのような発話・知識操作かを表す。

```text
assertion
observation
question
hypothesis
suggestion
synthesis
```

### evidence.sourceNature

各Evidenceがどのような情報に由来するかを表す。

```text
Observation
HistoricalSource
Archaeology
Tradition
UserHypothesis
Alternative
AISuggestion
```

一つのClaimは一つ以上のEvidenceを持ち、Evidenceごとに`sourceNature`、`documentVoice`、Passage、支持・反証・文脈のroleを保持する。

## Related decisions

- `originType`はClaimを生成・取り込んだ主体を表す
- `documentVoice`は元Passage内で誰の声として語られているかを表す
- `reviewStatus`は掲載判断を表す
- `epistemic.verification`は検証状態を表す
- `epistemic.modality`は断定・仮説・解釈・問い・提案などの様態を表す

## Consequences

### Positive

- AI提案と、その提案を支える考古学・史料・観察を混同しない
- 一つのClaimへ支持Evidenceと反証Evidenceを同時に付けられる
- UIで「何を主張しているか」と「何を根拠にしているか」を別々に表示できる
- 将来の外部史料検証をEvidence追加として扱える

### Negative

- Gold Dataset 0.1からschema 0.2への移行が必要になる
- Claim単体では根拠の性質が一つに決まらないため、一覧UIに集約表示が必要になる
- AI出力スキーマが少し複雑になる

## Implementation

- ZodとTypeScript型を`apps/web/src/domain/knowledge/schema.ts`へ定義する
- JSON Schemaを`apps/web/src/domain/knowledge/json-schema.ts`から出力する
- Gold Dataset 0.1は移行スクリプトで0.2へ変換し、変換後にZod検証する
