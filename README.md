# ResoWorld — 世界の解像度

> 探索するほど、世界の解像度が上がる。

ResoWorldは、自分の旅行記・現地観察・疑問・仮説を、時間・空間・知識のつながりとして育てる探索支援プロダクトです。

## 現在の段階

現在はPoC（概念実証）からコア機能の実装段階（v0.4.0）へ進展しています。
九州・山陰など各地の探訪ジャーニー（宗像、宇佐・国東、朝倉、出雲、日向、対馬、長崎平戸など）を統合し、個人の足跡（Claim）を根拠として**「垂直の時代地層（STRATUM）」**と**「水平のテーマ接続（LENS）」**の2軸で空間・歴史のつながりを観察できるマルチジャーニー・アトラスを構築しています。

1. **垂直地層断面（STRATUM）**: 原初アニミズムから近代国家再編まで、列島聖地に重なる全5層の歴史的堆積（重層度）を地図上でフラットに重畳・可視化
2. **水平テーマ探索（LENS）**: 海上交通・宗像氏、神功皇后伝承、出雲国津神、八幡信仰・神仏習合、幕末維新などのテーマ別関係図
3. **聖地7項目層序プロファイル & 2軸史料評価**: 15大聖地の祭祀史7項目分解、地域間6観点比較、一次史料（A）から社伝（C）までの客観的批判
4. **根拠駆動・バイアス防止（ADR-0018）**: 恣意的な神社格付けやテーマ汚染を排除し、すべて現地観察・旅行記Claimから演繹される判定ガード

## 探索モデル

```text
[STEP 1] 旅の選択 (JOURNEY)
   └─ 全体俯瞰、または特定の探訪地域を選択
        ↓
[STEP 2] 探索視点の適用
   ├─ 📜 祭祀景観の地層 (STRATUM) ※デフォルト
   │     ├─ 全5層の時代スタック重畳（L1先史〜L5近代）
   │     ├─ 重層度（1層〜5層）に応じた金色の光輪オーラ・バッジ
   │     ├─ 聖地15拠点の祭祀史7項目層序プロファイル
   │     └─ 地域間6観点比較・史料A/B/C確度評価
   │
   └─ 🔍 テーマ探索 (LENS)
         ├─ 宗像・玄界灘・海洋民
         ├─ 神功皇后伝承と筑紫・玄界灘
         ├─ 出雲・国津神と日本海航路
         ├─ 日向神話と古代回廊
         ├─ 朝倉・筑後川水運
         ├─ 幕末志士ネットワーク
         └─ 倭人伝航路・政治状況
```

## 取り込み済み探訪ジャーニー（代表地域）

- **宗像・玄界灘**: 宗像三女神、沖ノ島祭祀、海民勢力
- **宇佐・国東**: 宇佐神宮、八幡信仰発祥、六郷満山神仏習合
- **朝倉**: 朝倉宮、斉明天皇、筑後川水運
- **出雲**: 出雲大社、日御碕、荒神谷遺跡、国津神の古層
- **日向・宮崎**: 高千穂、西都原古墳群、都萬神社、神武東征伝承
- **対馬**: 和多都美神社、古代航路、防人・金田城
- **長崎・平戸**: 平戸城、鄭成功、キリシタン・異文化混交

## ドキュメント体系

仕様・設計ドキュメント（`docs/`）と、着想・考え方検討・初期ドラフト（`ref/`）を明確に分離して管理しています。

### 📐 仕様・設計ドキュメント (`docs/`)
- [コア体験定義](./docs/core-experience.md)
- [データ・構造設計ポリシー](./docs/data-structure-policy.md)
- [史料分類・確度評価・祭祀史階層 設計ポリシー](./docs/source-evaluation-and-stratigraphy-policy.md)
- [古層祭祀景観 仕様案](./docs/ancient-sacred-landscape-spec.md)
- [TOPICの抽象度基準と設計運用ガイドライン](./docs/topic-grounding-and-abstraction-policy.md)
- [LENS基礎知識パック](./docs/lens-knowledge-packs.md)
- [旅行記追加とLENS更新の運用手順](./docs/adding-travel-journal-and-lens.md)
- [PoC検証戦略](./docs/poc-validation-strategy.md)
- [Claim中心データモデル](./docs/claim-centered-data-model.md)
- [Claim抽出・評価](./docs/claim-extraction.md)
- **Architecture Decision Records (`docs/decisions/`)**
  - [ADR-0001: ローカルファーストのEvidence Graphから始める](./docs/decisions/0001-local-first-evidence-graph.md)
  - [ADR-0002: レビュー状態と認識論的状態を分離する](./docs/decisions/0002-separate-review-from-epistemic-status.md)
  - [ADR-0003: Claim種別とEvidenceの性質を分離する](./docs/decisions/0003-separate-claim-kind-from-evidence-nature.md)
  - [ADR-0004: データ処理場所と送信範囲を選択可能にする](./docs/decisions/0004-provider-selectable-data-processing.md)
  - [ADR-0005: Knowledgeと表示Projectionの責務を分離する](./docs/decisions/0005-separate-knowledge-from-view-projections.md)
  - [ADR-0006: MAP接続を一つのProjection契約へ統一する](./docs/decisions/0006-unify-map-connection-projection.md)
  - [ADR-0007: 旅行記追加を段階的なMulti-Journey取込として維持する](./docs/decisions/0007-accept-progressive-multi-journey-import.md)
  - [ADR-0008: LENS観点とTopicを分離する](./docs/decisions/0008-separate-lens-perspective-from-topic.md)
  - [ADR-0009: 必要な知能レベルで処理経路を分ける](./docs/decisions/0009-route-processing-by-required-intelligence.md)
  - [ADR-0010: トップレベルLENSを五つに絞り、時代を共通軸にする](./docs/decisions/0010-limit-top-level-lenses-and-use-shared-axes.md)
  - [ADR-0011: 探索範囲とLENSを二段階の操作モデルにする](./docs/decisions/0011-separate-exploration-scope-from-lens.md)
  - [ADR-0012: MAP接続線の固定選択をfocusから分離する](./docs/decisions/0012-separate-map-connection-selection-from-focus.md)
  - [ADR-0013: 古層祭祀景観を既存正本から複数LENSへ投影する](./docs/decisions/0013-project-sacred-landscapes-through-existing-lenses.md)
  - [ADR-0014: 知識フロンティア接続と次なる探索候補](./docs/decisions/0014-knowledge-frontier-connections-and-next-candidates.md)
  - [ADR-0015: 統一LENS接続データモデル](./docs/decisions/0015-unified-lens-connection-data-model.md)
  - [ADR-0016: 外部知識インジェスチョン戦略](./docs/decisions/0016-external-knowledge-ingestion-strategy.md)
  - [ADR-0017: TOPICの根拠付けと抽象化原則](./docs/decisions/0017-topic-grounding-and-abstraction-principles.md)
  - [ADR-0018: 根拠駆動の地層判定とバイアス防止ガード原則](./docs/decisions/0018-evidence-driven-stratum-and-anti-bias-guards.md)

### 💡 コンセプト原案・考え方検討資料 (`ref/`)
- **[Ref ディレクトリ索引](./ref/README.md)**
  - [世界の解像度コンセプト原案](./ref/世界の解像度コンセプト原案.txt)
  - [初期PoCアーキテクチャ・開発計画ドラフト](./ref/ResoWorld_PoC_Architecture_Development_Plan.md)
  - [古層祭祀景観 — 分析原則と知識パック構想](./ref/古層祭祀景観_分析原則と知識パック構想.txt)
  - [古層祭祀景観 — 史料分類と評価基準](./ref/古層祭祀景観_史料分類と評価基準.txt)
  - [神話―考古学 国家形成レイヤーモデル](./ref/神話―考古学%20国家形成レイヤーモデル.txt)
  - [古層祭祀景観 選定基準 v1.2（検討ドラフト）](./ref/古層祭祀景観_選定基準_v1.2.md)
  - [日本列島 古層祭祀景観 階層別一覧 Draft 1.2](./ref/日本列島_古層祭祀景観_階層別一覧_Draft1.2.md)

## データの扱い

個人の旅行記、写真、訪問日時などは公開リポジトリに保存しません。

- `旅行記/`: ローカルにある既存の探索記録（Git管理外）
- `data/imports/`: 今後取り込む非公開データ（Git管理外）
- `data/demo/`: 将来用意する匿名化済みの公開可能なサンプル

処理場所はローカルに限定しません。旅行記、Evidence、LENSをサーバーモデル・同期基盤へ渡せる構造とし、実装されたワークフローごとに現在のプロバイダー、送信範囲、保存場所を表示します。
