# ADR-0002: Claimの掲載確認と歴史的検証状態を分離する

- Status: Accepted for PoC
- Date: 2026-08-30

## Context

宗像・宇佐・国東のGold Datasetを作成すると、旅行記に確かに記載されたClaimであっても、その内容が外部資料で検証済みとは限らないことが明確になった。

対象文書には、現地観察、ユーザーの問い、AIによる整理、外部資料の要約、出典のない歴史説明、文書横断的な解釈が混在する。

単一の `confirmed` 状態を使うと、次の二つが混同される。

1. 原文がそのClaimを実際に述べていることを人が確認した
2. Claimの歴史的内容を信頼できる外部根拠で検証した

## Decision

PoCでは、Claimのレビュー状態と認識論的状態を分離する。

### reviewStatus

ResoWorldへそのClaimを掲載する判断を表す。

```text
suggested
confirmed
rejected
needs_review
```

`confirmed`は、Claim、情報の性質、根拠Passageの対応をユーザーが確認したことだけを意味する。

### epistemicStatus

Claimの内容がどの程度・どの方法で裏付けられているかを表す。Gold Datasetでは暫定的に、以下のような値を使用する。

```text
personal-observation
personal-experience
personal-question
personal-interpretation
source-reference-unverified
source-cited-not-checked
source-missing-in-passage
tradition-as-stated
qualified-unverified
interpretive-unverified
interpretive-synthesis
explicitly-hypothetical
actionable-suggestion
```

この一覧はIssue #2のスキーマ設計で、検証状態・確度・証拠形態などの複数軸へ分解する可能性がある。

## Provenance decision

Claimを構造化した実行者と、元文書内でその内容を語った主体も分離する。

- `originType`: user / ai / imported / system
- `documentVoice`: user-quote / ai-narrator / ai-attributed-to-user / ai-paraphrase-of-source

例えば、AIとの対話からインポートしたユーザー発言は、`originType=imported`、`documentVoice=user-quote`となる。

## Evidence decision

Gold Claimは、文書ID、文書ハッシュ、行範囲、代表引用を持つ。

- 文書ハッシュが変わった場合、行参照を無言で再利用しない
- 引用は指定行範囲に含まれることを機械検証する
- 外部URLが記載されていても、実際に内容を確認するまでは `source-cited-not-checked` とする
- 外部検証を行った場合は、インポートClaimを上書きするのではなく、新しいEvidenceとして追加する方向を優先する

## Consequences

### Positive

- AIが書いた歴史説明を、人が掲載確認しただけで史実扱いする事故を防げる
- 観察・伝承・仮説・外部資料を同じGraphに置きながら混同しない
- 後から外部検証を追加できる
- ユーザーの問いや探索提案も、事実とは別の性質でGraphへ保持できる

### Negative

- UIで表示すべき状態が増える
- `epistemicStatus`が単一enumでは複雑になりやすい
- レビュー操作と史料検証操作を別に設計する必要がある

## Follow-up

- Issue #2で暫定値をZodスキーマへ落とし込む
- Evidence Graphでは `reviewStatus` と `epistemicStatus` を別々に表示する
- 外部史料の検証フローはPoC初期のClaim抽出とは分離する

