# ADR-0006: MAP接続を一つのProjection契約へ統一する

- Status: Accepted
- Date: 2026-09-02

## Context

PoCでは、旅行記のConnection、Knowledge Packの`mapConnections`、次の探索候補を別々の描画経路でMAPへ渡していた。このため、ある線だけがクリック可能、LENSには線があるがMAPにはない、配列の先頭要素だけが初期表示で強調される、といった表示規則の不一致が起きた。

特に「宗像大社―宇佐神宮だけが見える」状態は、その関係が特別扱いされた結果ではなく、先頭Connectionと先頭Eraを暗黙に選択していた実装上の副作用だった。データ順序に意味上の重要度を持たせてはならない。

## Decision

MAP rendererへ渡す線は、由来にかかわらず`MapConnectionProjection`へ正規化し、`MapSceneProjection`で一つの表示Sceneへ合成する。

```text
Exploration Connection ─┐
Knowledge mapConnection ├─ MapConnectionProjection ─ MapSceneProjection ─ AtlasMap
Exploration Suggestion ─┘                              ↑
Special map overlay ───────────────────────────────────┘
```

共通契約は、最低限次を持つ。

- 接続ID、名称、説明
- `origin`: `exploration` / `knowledge-pack` / `suggestion`
- 選択状態
- 順序を持つ2地点以上の座標列
- Claim / Assertion / Source / confidence / review status

選択状態の正本はWorkspaceの`AtlasSelection`とProjectionに置き、AtlasMap内部で別の選択状態を持たない。地点、探索Connection、Knowledge Connection、探索候補、専用ルートノードは排他的な`focus`として保持し、画面遷移時に古い選択を残さない。通常の初期表示ではConnectionを暗黙に選択せず、表示可能な線を同じ弱さで示す。ユーザーが線、地点、接続カードを選んだ時だけ、その接続を強調する。

Projection IDはoriginを含む名前空間付きIDとし、正本側のIDは`sourceId`として保持する。座標不足、根拠不足、ID重複で描画できない接続は黙って捨てず、Sceneの`diagnostics`へ返す。

時代レイヤーは選択中の探索Connectionにだけ適用する。未選択のConnectionは全体経路を保ち、別Connectionの時代選択によって消さない。

## Display rules

- 根拠を持つ表示対象の接続はすべて薄く表示する。
- 選択中の接続だけを強調する。
- 線は由来ごとに色・線種を変えるが、クリックと説明表示の操作は共通にする。
- 同じJourney、同じ地域、近い座標という理由だけでは線を生成しない。
- 配列順、最初の訪問地、最初のEraを重要度や初期選択の根拠にしない。
- LENSが探索Connectionを自動選択するかはLENS設定で明示し、専用LENSでは暗黙に最上位Connectionを選ばない。
- 旅行記、Knowledge Pack、選択中の探索候補は同じSceneへ合成でき、一方の表示を理由に他方を消さない。
- 登録済みKnowledge MAP接続は訪問マップを含む通常Sceneへすべて薄く表示し、LENSは明示した接続IDを強調する。混雑が実際に確認されるまでは、自動的な関連度フィルターを入れない。
- 特殊な地理表現（例: 魏志倭人伝の競合ルート）は専用レイヤーを維持できるが、説明・根拠表示の操作規則は共通にする。

## Consequences

新しい旅行記やKnowledge Packを追加しても、AtlasMapを個別修正せずProjection変換を追加・更新すればよい。描画の一貫性を回帰テストでき、LENS側の関係とMAP側の地理接続を混同しにくくなる。

新しいKnowledge MAP接続は共通レジストリへ登録する。登録有無が通常MAPへの表示条件となり、個別LENSを選択したかどうかを表示条件にしない。

共通化するのはMAPへ渡す読み取りモデルであり、Exploration DatasetとKnowledge Packの正本を一つに統合するものではない。
