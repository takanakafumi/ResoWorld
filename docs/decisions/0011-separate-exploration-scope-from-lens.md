# ADR-0011: 探索範囲とLENSを二段階の操作モデルにする

- Status: Accepted
- Date: 2026-09-11

## Context

複数Journeyを扱うPoCで、「探索範囲を選ぶ」と「旅をまたいで見比べる」が別の領域として並んだ。しかし後者は旅ごとの件数や主要テーマを要約し、カードを押すと個別Journeyへ移るだけで、探索範囲の選択と操作が重複していた。

旅を横断して人物、宗教、政治、ルートなどの共通点・相違点を構造化する責務は、本来LENSが持つ。比較専用の入口を増やすと、同じ問いをJourney UIとLENSの双方が扱い、旅行記追加時の接続判断と画面の役割が曖昧になる。

## Decision

Workspaceの基本操作を次の二段階にする。

```text
1. Exploration scopeを選ぶ
   すべての旅 / 一つのJourney
        ↓
2. LENSを選ぶ
   神・系譜 / 宗教 / ルート / 政治・社会 / 人物
        ↓
MAP・関係図・詳細へProjection
```

### 1. Exploration scopeは材料を決める

- `すべて`は全JourneyのSpot、Claim、Connectionを対象にする。
- 個別Journeyは、そのJourneyが参照するDocument、Spot、Connectionを対象にする。
- 個別Journeyでは、旅行記に確認できる訪問順をKnowledge Connectionと区別して表示できる。
- `すべて`で複数Journeyを対象にすること自体を、独立した比較機能とは呼ばない。

### 2. LENSは選択範囲を知識として構造化する

- `すべて`＋LENSは、旅をまたいだ知識構造を見る操作である。
- 個別Journey＋LENSは、一つの旅を同じ観点から見る操作である。
- 旅の共通点・相違点・分野横断接続は、別の比較パネルではなくLENSのProjectionとして表現する。
- 将来一部の旅だけを比較する必要が確認された場合は、比較機能を増やす前にExploration scopeの複数選択を検討する。

### 3. MAPは二つの選択結果を地理へ投影する

- MAPは独立した第三の分析機能ではなく、探索範囲とLENSの結果を地理上で確認する面である。
- 訪問済み地点同士で成立するKnowledge Connectionは通常MAPでも薄く表示し、対応LENSで強調する。
- 未訪問地点や広域仮説を含むLENS固有Connectionは、対応LENSを選んだ時に表示する。
- 訪問順は個別Journeyを選んだ時だけ表示し、Knowledge Connectionの件数・代表関係・LENS構造へ混ぜない。

## Consequences

- 独立した「旅をまたいで見比べる」パネルは廃止する。
- Journeyは表示材料、LENSは見方、MAPは地理投影という役割になる。
- 新しい旅行記を追加しても、比較専用カードや画面を追加しない。
- 横断分析の品質はLENSのTopic解決とProjectionで改善する。
- 当面は`すべて`か一つのJourneyだけを選び、必要性が確認されるまで複数選択UIを導入しない。

関連するLENSとTopicの分離は[ADR-0008](./0008-separate-lens-perspective-from-topic.md)、トップレベルLENS数は[ADR-0010](./0010-limit-top-level-lenses-and-use-shared-axes.md)に従う。
