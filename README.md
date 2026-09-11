# ResoWorld — 世界の解像度

> 探索するほど、世界の解像度が上がる。

ResoWorldは、自分の旅行記・現地観察・疑問・仮説を、時間・空間・知識のつながりとして育てる探索支援プロダクトです。

## 現在の段階

現在はPoC（概念実証）段階です。最初の検証対象は、宗像・宇佐・国東の旅行記から、根拠をたどれる知識のつながりを立ち上げることです。

PoCでは、全国規模の歴史データベースや高精細な3D地図を先に作りません。原文から抽出した主張を人が確認できる `Evidence Graph` を作り、次の2つが実際に起こるかを検証します。

1. 過去の探索記録を横断して、根拠のある新しい接続が見つかる
2. その接続から、次に調べる問い・資料・場所が生まれる

## ドキュメント

- [コンセプト原案](./世界の解像度コンセプト原案.txt)
- [コア体験定義](./docs/core-experience.md)
- [データ・構造設計ポリシー](./docs/data-structure-policy.md)
- [旅行記追加とLENS更新の運用手順](./docs/adding-travel-journal-and-lens.md)
- [PoCアーキテクチャ・開発計画](./ResoWorld_PoC_Architecture_Development_Plan.md)
- [PoC検証戦略](./docs/poc-validation-strategy.md)
- [Claim中心データモデル](./docs/claim-centered-data-model.md)
- [Claim抽出・評価](./docs/claim-extraction.md)
- [ADR-0001: ローカルファーストのEvidence Graphから始める](./docs/decisions/0001-local-first-evidence-graph.md)
- [ADR-0004: データ処理場所と送信範囲を選択可能にする](./docs/decisions/0004-provider-selectable-data-processing.md)
- [ADR-0005: Knowledgeと表示Projectionの責務を分離する](./docs/decisions/0005-separate-knowledge-from-view-projections.md)
- [ADR-0006: MAP接続を一つのProjection契約へ統一する](./docs/decisions/0006-unify-map-connection-projection.md)
- [ADR-0007: 旅行記追加を段階的なMulti-Journey取込として維持する](./docs/decisions/0007-accept-progressive-multi-journey-import.md)
- [ADR-0008: LENS観点とTopicを分離する](./docs/decisions/0008-separate-lens-perspective-from-topic.md)
- [ADR-0009: 必要な知能レベルで処理経路を分ける](./docs/decisions/0009-route-processing-by-required-intelligence.md)
- [ADR-0010: トップレベルLENSを五つに絞り、時代を共通軸にする](./docs/decisions/0010-limit-top-level-lenses-and-use-shared-axes.md)
- [ADR-0011: 探索範囲とLENSを二段階の操作モデルにする](./docs/decisions/0011-separate-exploration-scope-from-lens.md)

## データの扱い

個人の旅行記、写真、訪問日時などは公開リポジトリに保存しません。

- `旅行記/`: ローカルにある既存の探索記録（Git管理外）
- `data/imports/`: 今後取り込む非公開データ（Git管理外）
- `data/demo/`: 将来用意する匿名化済みの公開可能なサンプル

処理場所はローカルに限定しません。旅行記、Evidence、LENSをサーバーモデル・同期基盤へ渡せる構造とし、実装されたワークフローごとに現在のプロバイダー、送信範囲、保存場所を表示します。

## PoCの対象シナリオ

```text
宗像
  └─ 海上交通・祭祀・宗像氏・ヤマト王権
        ↓
宇佐
  └─ 八幡信仰・国家・在地信仰・神仏習合
        ↓
国東
  └─ 六郷満山・山岳信仰・修験・在地社会
```

この3地域を、単に線で結ぶのではなく、各接続の根拠、情報の性質、対象時代、確認状態を保持して比較します。
