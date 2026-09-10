# ADR-0007: 旅行記追加を段階的なMulti-Journey取込として維持する

- Status: Accepted
- Date: 2026-09-02

## Context

最初のPoCは宗像・宇佐・国東の探索記録を中心に作ったため、新しい地域・時代・関心を追加するたびに画面やコア型の変更が必要になる懸念があった。

性質の異なる2件目の探索として萩の記録を追加し、非公開のローカルデータだけを使って取込から表示までを検証した。検証時点のRead Modelは4 Documents、73 Claims、20 Spots、2 Journeysで、各Journeyは8地点と12地点を持つ。原文、Evidence引用、ローカルパスはリポジトリへ含めない。

実データでは次を確認した。

- 新しいDocumentとClaimを既存Datasetへ追加できる。
- 2件目のJourneyを既存Journeyと同じAtlasへ登録できる。
- Document、Claim、Spot、Connection、Journeyの未知ID参照は0件である。
- 既存Journeyと2件目のJourneyを同じ訪問マップとEvidence Graphへ表示できる。
- Knowledge Packに未接続のClaim・Spotも基本表示から消えない。
- 対応するEntityだけが既存または追加Knowledge PackによってLENS上で強化される。

## Decision

旅行記追加は、行先別のアプリ機能追加ではなく、次の段階的なデータ処理として維持する。

```text
Document / Passage
  → Review Draft
  → Exploration Datasetへ統合
  → Spot / Journeyを確認登録
  → 既存Knowledge・LENSへ接続
  → 不足時だけKnowledge Pack / Preset / LENSを追加
  → Projectionから表示
```

- Exploration DatasetとKnowledge Packを別の正本として保持する。
- Journeyは探索範囲を束ねるRead Modelとし、Claimへ旅行先固有フィールドを追加しない。
- Journeyの再取込は安定IDを第一とし、IDが変わっていても同一の非空`documentIds`集合が一意に一致する場合は既存Journeyを更新する。既存IDとConnectionを保持し、曖昧な複数一致は拒否する。
- 地点とLENSの接続は安定Entity IDを優先し、名称照合は取込直後の候補生成に限定する。
- Knowledge PackやLENSの有無を旅行記取込の完了条件にしない。
- 新しい旅行記、人物、地域が増えたという理由だけで専用画面を作らない。
- 旅行記本文、ローカルDataset、AtlasはGit管理外に保ち、公開可能なスキーマ・Projection・Knowledge Pack・テストだけを共有する。

## Consequences

3件目以降の旅行記は、まず同じ取込フローへ通す。コア型や画面の変更が必要になった場合は、行先固有の要求ではなく、複数Journeyに共通する不足かを確認してから構造を変更する。

当面はDB、汎用オントロジー、自動LENS生成を導入しない。実際の追加作業で手動工程が繰り返し負担になった時点で、その工程だけを自動化する。

運用の詳細は[旅行記追加とLENS更新の運用手順](../adding-travel-journal-and-lens.md)に従う。
