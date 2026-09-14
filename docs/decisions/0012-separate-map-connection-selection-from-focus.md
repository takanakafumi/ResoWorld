# ADR-0012: MAP接続線の固定選択をナビゲーションfocusから分離する

- Status: Accepted
- Date: 2026-09-14
- Supersedes: ADR-0006の排他的focusに関する部分

## Context

MAP上の黄色い接続線は、ユーザーが意味を読んでいる接続を示す。しかし現在は地点、接続線、探索候補、LENSノードを一つの排他的なfocusで管理しているため、地点へ移動しただけで接続線の強調と説明が消える。

さらに、LENSが対象線を強調した状態と、ユーザーが線を明示選択した状態が同じselectedへ畳み込まれている。接続線から対応LENSへ移動するための識別情報もProjectionで十分に保持されていない。

## Decision

接続線の選択は「一時的なカメラfocus」ではなく「ユーザーが読み続けている固定選択」とする。

    selected spot ──────────────┐
    pinned connection ─────────┼─ Map scene / detail
    camera intent ──────────────┤
    selected Lens / Topic ──────┘

これらは独立状態とし、相互作用によって必要な部分だけを更新する。

### 接続線の種類

| 種類 | 正本・根拠 | 意味 | LENS導線 |
|---|---|---|---|
| 旅程 | Journey / itinerary Connection | 実際の訪問順・移動 | 原則なし |
| 探索接続 | Exploration Connection / Claim | 旅行記から確認した地点間の意味的関係 | facetに対応するLENSがある場合だけ |
| Knowledge接続 | Knowledge Pack / Assertion / Source | 外部知識で補完した関係 | Pack・Preset・Topicへ接続 |
| 候補接続 | Suggestionと根拠Connection | 未訪問候補へ伸びる示唆 | 根拠ConnectionのLENSへ接続可能 |

同じ地域、近い座標、同じJourneyという理由だけで意味的な接続線を生成しない。

### 選択と解除

- 線をクリックすると、その線を固定選択し黄色で強調する。
- 地点、参照地点、LENSノードをクリックしても固定選択を維持する。
- 別の線をクリックすると固定選択を置き換える。
- 同じ線の再クリック、説明の閉じる操作で解除する。
- Journey・探索範囲・LENSの変更後に対象線がSceneから消えた場合は解除する。
- 初期表示や配列順による暗黙選択は行わない。

カメラは最後に行われた地理操作へ応答する。線選択時は線の範囲、地点選択時は地点を表示するが、カメラ移動によって固定選択を変更しない。

### 視覚状態

- selected: ユーザーが固定選択した一本。黄色のhaloと太線を使う。
- emphasized: 選択中LENS／Topicが対象とする線。Pack指定色や不透明度で強調するが、黄色の固定選択とは区別する。
- 通常線: 表示対象を薄く示す。
- hover/focus-visible: 操作可能性だけを一時表示し、選択とは扱わない。

### 説明と根拠

線の選択中は、少なくとも次を一つの詳細UIで表示する。

- 接続名と平易な要約
- 関係種別
- 旅程／探索／Knowledge／候補という由来
- Claim、Assertion、Sourceの件数とreview status
- confidenceまたは不確実性
- 対応LENSとTopic（存在する場合）
- 「対応するLENSで見る」と「根拠を見る」の導線

旅程線は「訪問順・移動」であり知識上の関係ではないことを明記する。対応LENSがない線へ便宜的なLENSを割り当てない。

### Projection契約

MapConnectionProjectionは描画情報に加え、関係の意味と遷移先を失わない。

- origin / connection kind / relation families
- Claim / Assertion / Source / confidence / review status
- lensRefs: lensId、任意のtopicId、packId、presetId
- selectedとemphasizedを別々に投影する

AtlasMap内部に固定選択や説明対象の正本を持たず、Workspaceの状態とProjectionから描画する。

## Acceptance criteria

1. 線を選択後に地点をクリックしても黄色と線の説明が残る。
2. 地点クリック時のカメラは地点へ移動し、選択線全域へ戻らない。
3. 同じ線の再クリックと閉じる操作で選択解除でき、カメラ位置は維持される。
4. 別線を選ぶと黄色は一本だけになる。
5. LENSの自動強調だけでは黄色にならない。
6. Knowledge接続から正しいLENS／TopicとAssertion／Sourceへ到達できる。
7. 旅程線は知識接続と誤認されず、LENS導線を表示しない。
8. 訪問地点のクリック領域は接続線より優先される。

## Consequences

AtlasSelection.focusだけで全状態を表す現在の実装は移行が必要になる。一方、地点選択、線の読解、LENS探索、カメラ移動を互いに壊さず、接続線の黄色が何を意味するかを一貫して説明できる。