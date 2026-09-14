# データ・構造設計ポリシー

## 目的

ResoWorldは、完成形を先に一般化するのではなく、実際の探索記録と画面を対話的に改善する。設計はその改善を妨げない最小限の境界だけを維持し、必要性が確認できてからリファクタリングする。

中心原則は次の一文に集約する。

> ユーザーの探索記録と基礎知識を正本として保持し、根拠付きの関係を安定したIDで接続し、AtlasやLENSは必要なときに投影する。

旅行記追加からKnowledge補完、LENS判断、表示確認までの実行順序は、[旅行記追加とLENS更新の運用手順](./adding-travel-journal-and-lens.md)を標準フローとする。

処理方式はデータの意味から分離する。決定的変換は通常のローカルコード、候補の大量抽出はローカルLLM、設計・実装・学際的判断はCodexを標準とし、品質基準を満たさない範囲だけ上位段階へ昇格する。詳細は[ADR-0009](./decisions/0009-route-processing-by-required-intelligence.md)に従う。

## 正本は二種類だけ

### 1. Exploration Dataset

ユーザー自身の探索の正本。

- 旅行記、訪問、観察、写真
- 問い、仮説、関心
- ClaimとEvidence
- ユーザーによる確認・保留・却下

外部情報やAI分析によって、ユーザーの記録を上書きしない。

### 2. Knowledge Pack

探索を読み直すための比較的静的な基礎知識。

- 神、人物、場所、概念、史料
- 系譜、分類、ルート、習合、比定などのAssertion
- 出典、観点、確度、レビュー状態
- LENSへ投影するPreset

Knowledge Packはユーザーの探索記録とは分離し、版を持つ。

保存場所がローカル、サーバー、ハイブリッドのどれであるかは、データの意味ではなく保存・処理方式の違いとして扱う。

## 増え続ける探索への保証

宗像・宇佐・国東は最初の検証シナリオであり、製品の固定構造ではない。訪問先、時代、分野が増えても、同じExploration Datasetへ記録を追加できることをコア要件とする。

体験は次の三段階で成立させる。

```text
すべての探索記録
  → 地図・時代・Claim・Evidenceとして必ず表示

一致するKnowledge Packがある記録
  → 既存の体系・異説・基礎知識と接続して再認識

複数の記録が蓄積した状態
  → AIが分野横断の接続候補や新しいLENSを示唆
```

Knowledge Packが存在しない訪問も、未対応として消したり取り込みを拒否したりしない。基礎知識との接続は段階的な強化であり、基本体験の前提条件にしない。

新しい旅行記の追加では、原則としてアプリコードを変更しない。新しい分野の基礎知識が必要になった場合は、コア型へ行先別フィールドや条件分岐を追加するのではなく、独立したKnowledge PackまたはPresetをデータとして追加する。

特定シナリオ専用の手動配置や表示調整はPoCで許容する。ただし、それを共通モデルの必須項目にせず、二つ目以降の異なるシナリオで同じ要求が確認されてから共通化する。

## AtlasとLENSは派生Read Model

Atlas、Connection、Era Layer、LENS図、次の探索候補、AIによる統合・要約は正本ではない。

```text
Exploration Dataset
    ＋ Knowledge Pack
    ＋ 現在の選択・関心
    ↓
Projection
    ↓
Atlas / Map Layer / Graph / Timeline / Suggestion
```

PoCでは派生結果をJSONとして保持してよい。ただし、元のClaimやKnowledge Packと競合する第二の知識正本にはしない。再生成が必要になった時点で、入力ID、パック版、生成方法などの最小メタデータを追加する。

## 操作モデルの責務

画面操作は、Journeyを材料として選ぶExploration scopeと、その材料を構造化するLENSの二段階にする。

- JourneyはDocument、Spot、Connectionを束ねる表示範囲であり、比較分析を持たない。
- LENSは選択された一件または複数Journeyを、人物・宗教・政治・ルートなどの観点で構造化する。
- MAPはExploration scopeとLENSのProjectionを地理へ表示する。
- 「旅をまたぐ」という理由だけで、第三の比較Read Modelや専用画面を作らない。
- 訪問順はJourneyの行動情報、Knowledge Connectionは意味の関係として分離する。

詳細は[ADR-0011](./decisions/0011-separate-exploration-scope-from-lens.md)を参照する。

## データ設計の原則

### 根拠付きの主張として持つ

関係は単なる線ではなく、ClaimまたはAssertionとして保持する。史料記述、学説、ユーザー仮説、AIの整理を区別し、EvidenceやSourceへたどれるようにする。

地点集合や同一Journeyへの所属は関係の根拠ではない。地図上の線は、順序を持つ移動か、意味を持つテーマ関係かを区別し、その関係を支えるClaimまたはAssertionがある場合だけ投影する。

### 接続にはIDを使う

表示名は変更できるため、関係の接続キーには使わない。巨大な共通Entity辞書は先に作らず、実際に探索記録とKnowledge Packを接続する必要が生じたEntityから、明示的なID対応を追加する。

### 意味の違う関係を混ぜない

系譜、継承、歴史的影響、習合、分類、概念比較、地名比定、推定ルートは別の関係として保持する。同じ画面に重ねる場合も、色や線種、観点切替で違いを残す。

### 不確実性と異説を残す

競合する学説を一つに確定しない。確度、レビュー状態、観点、根拠の性質を保持し、確認済み情報とDraftを同一視しない。

### 表示都合を正本へ入れすぎない

色、折りたたみ、選択状態、ノードの画面座標は原則としてUIまたはPreset側の情報とする。重要な手動配置が必要になった場合も、EntityやAssertionそのものには埋め込まない。

## 実装構造の原則

役割は次の境界で考える。現在の規模では、境界ごとのディレクトリや抽象インターフェースを必ず作る必要はない。

```text
domain/knowledge    Exploration Dataset、Claim、Evidence
domain/lens-packs   Knowledge Pack、Preset、Projection
app/review          Map、LENS、レビューUI
server/imports      ローカル・サーバーからの読み込み
server/extraction   AIによる構造化
server/exploration  Codexや外部調査
```

依存方向は、UIと外部プロバイダーからドメインモデルを守る方向にする。特定のAI、地図、保存先をデータモデルの必須条件にしない。

## 表示Projectionの契約

Knowledge Packに含まれる情報と、一つの画面へ表示する情報を同一視しない。Entity・Assertion・Sourceは基礎知識として広く保持し、LENSとMAPの表示対象はPresetで宣言する。

- 関係図のEntity種別は`visibleEntityKinds`で宣言する。
- Knowledge PackのMAP地点列は`mapConnections`で宣言し、根拠Assertionを必須にする。探索由来の接続はClaimを根拠にする。
- Domain Projectionは参照整合性を検証し、origin・confidence・review status・Sourceを失わずにUIへ渡す。
- UIは特定の人物名・地名・Pack IDで表示判断を行わない。
- 複数接続は全体を薄く見せ、選択中だけを強調する。
- 旅行記Connection、Knowledge Pack、次の探索候補は、正本を混ぜずに共通の`MapConnectionProjection`へ変換してから描画する。
- 選択状態はWorkspaceとProjectionを正本とし、地図コンポーネント内に二重保持しない。
- 配列の先頭、最初の訪問地、最初のEraを暗黙の初期選択や重要度に使わない。
- LENSごとの自動選択・MAP接続グループ・併設パネルはLENS設定で宣言し、WorkspaceへPack固有の条件を増やさない。
- 表示中の訪問地点だけで成立するKnowledge MAP接続は訪問マップへ薄く表示し、LENSは対象線を強調する。未訪問地点や広域仮説を含む接続は対応LENSで表示する。
- Spotは、実際に訪れた施設・史跡を示す`visited-place`と、旅行記の理解に必要な市町村・地域名を示す`area-context`を分ける。後者は根拠や検索文脈として保持するが、訪問地点数と通常のMAPマーカーには含めない。
- 訪問地点の色と短い文字アイコンは、旅行をまたいでも意味が変わらない地点種別（歴史館・博物館、遺跡・古墳、神社・神宮、寺院、史跡・歴史建築、自然・景観）を表す。Journeyごとの色分けは使わず、旅程の違いはExploration scopeの選択と表示範囲で示す。
- 混雑が実際に確認されるまでは、関連度や地域による暗黙の自動非表示を導入しない。
- Eraによる地点絞り込みは選択中のConnectionにだけ適用し、他の接続線を消さない。
- `MapSceneProjection`が通常接続・Knowledge接続・探索候補・LENSスコープ付き接続群を合成し、AtlasMapはSceneだけを描画する。魏志倭人伝のような固有ルートもrendererでPackを直接参照しない。
- 地点、固定選択中のConnection、LENS／Topic、カメラfocusを分離する。地点やLENSノードへの移動だけで、ユーザーが読み続けているConnectionを解除しない。
- 座標不足・根拠不足・Projection ID重複は黙って非表示にせず、Sceneの診断情報として返す。

詳細は[ADR-0005](./decisions/0005-separate-knowledge-from-view-projections.md)と[ADR-0006](./decisions/0006-unify-map-connection-projection.md)を参照する。

## LENS観点とTopicの分離

LENSは「政治・社会」「宗教」「ルート」のような見方であり、邪馬台国、幕末、宗像三女神などの対象そのものではない。対象はTopicとしてKnowledge PackのPresetへ接続し、現在のJourney、Spot、Connection、Claimとの適用度から候補を解決する。

- 一つのLENS観点に複数Topicを表示できる。
- 選択中Spotへ直接つながるTopicを優先する。
- 直接接続がなければ、選択中Journey内のClaim接続数を使う。
- 候補が複数ある場合は切替UIを残し、自動順位だけで他候補を隠さない。
- LENS IDからPack IDを直接決めない。
- 新しい旅行記やTopicを理由にWorkspaceへ行先固有条件を追加しない。

詳細は[ADR-0008](./decisions/0008-separate-lens-perspective-from-topic.md)を参照する。

## トップレベルLENSと共通軸

トップレベルは「神・系譜」「宗教」「ルート」「政治・社会」「人物」の五つを基本集合とする。サブ項目が充実した観点を名称の近さだけで統合せず、ユーザーが尋ねる問いと必要な図法が異なる間は独立させる。

- 時代は独立LENSではなく、Connectionと各LENSに共通する切替軸として扱う。
- 地形はルート・MAPの文脈、聖域は宗教のTopicまたは比較表示として扱う。
- 学説差は対象別LENSの中でViewpointやHypothesisを比較する横断表現とする。
- 新しい旅行先、人物、時代が増えたことだけを理由にトップレベルLENSを追加しない。
- 新規LENSは、既存と異なる問い、固有の図法、複数Topicでの再利用性、独立入口の必要性をすべて満たす場合に限る。

詳細は[ADR-0010](./decisions/0010-limit-top-level-lenses-and-use-shared-axes.md)を参照する。

## PoC段階で行わないこと

- 将来の全分野を想定した巨大なオントロジー
- 先回りした共通Entity Registry
- 汎用グラフ描画エンジンの独自開発
- 必要性を確認する前のDB・ジョブ基盤導入
- すべてのLENSを一つの万能コンポーネントへ統合
- AI生成結果の自動的なReviewed Knowledgeへの昇格

## リファクタリングの判断基準

次のいずれかが実際に起きたときに構造を見直す。

1. 同じ変換や表示ロジックが三か所以上へ重複した。
2. 一つのデータ追加に複数の無関係な画面修正が必要になった。
3. 名前による対応付けや派生データで誤接続・不整合が起きた。
4. 現在の構造が、検証したいユーザー体験の実装を妨げた。
5. データ量や同時実行が、実測上の問題になった。

「将来必要そう」だけでは共通化しない。小さな重複は許容し、実例から安定した共通部分だけを抽出する。

## 変更時の確認事項

新しいデータやLENSを追加するときは、次だけを確認する。

- これは正本か、派生Read Modelか。
- ユーザーの記録と外部知識を混ぜていないか。
- 接続を表示名ではなくIDで表現できているか。
- 根拠、異説、不確実性を失っていないか。
- 現在の体験検証に必要な範囲を超えて一般化していないか。
- Knowledge Packがない新しい旅行記でも基本体験が成立するか。
- 特定の地名・旅行ルートをコアコードへ埋め込んでいないか。
