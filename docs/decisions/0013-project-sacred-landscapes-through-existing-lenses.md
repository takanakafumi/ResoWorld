# ADR-0013: 古層祭祀景観を既存正本から複数LENSへ投影する

- Status: Accepted
- Date: 2026-09-23

## Context

宮島・弥山の探索から、地点だけでなく、海から島へ渡り、山へ入り、巨岩や奥宮へ至るPathと、現在祭神・史料上の神格・祭祀対象の仮説を分けて読む必要が確認された。

一方、ResoWorldはExploration DatasetとKnowledge Packだけを正本とし、五つのトップレベルLENSへProjectionする方針を採っている。古層祭祀景観専用の正本、Atlas、LENSを追加すると、旅行記由来の観察、外部史料、全国候補一覧、画面上の分類が競合する。

現行実装にはもう一つ制約がある。政治・人物はRegistryからTopicを解決するが、宗教・ルートはrendererが固定Knowledge Packを直接参照している。この状態では同じ祭祀景観Packを宗教・ルート・政治へ再利用できない。

## Decision

古層祭祀景観は第三の正本または第六のLENSにしない。

- 現地観察、実歩行、身体経験、ユーザーの問いと解釈はExploration Datasetへ置く。
- 史料、考古資料、地理、神格、施設、歴史的経路はKnowledge Packへ置く。
- 景観単位は初期段階ではPackとPresetで表し、新しいLandscape Entityを追加しない。
- 宗教、ルート、政治・社会、神・系譜、人物から、同じEntity・Assertion・Sourceを異なるPresetで投影する。
- `CORE`等の分類は調査成熟度を示すReview Projectionとし、Assertion confidenceまたは場所の価値へ変換しない。
- 全国一覧は調査候補台帳とし、一括してReviewed Knowledgeへ投入しない。

Pathは種類ごとに正本を分ける。

- 実際に歩いたPathはJourneyのitineraryとExploration Claimで保持する。
- 歴史的・祭祀的・解釈的PathはKnowledge Packのroute Assertion、Viewpoint、Sourceで保持する。
- 現代の短絡路は歴史的Pathと別Assertionまたは別Viewpointにする。

最初のパイロットでは現行スキーマを基本とする。宮島・弥山と宗像・沖ノ島の双方で必要になった時間修飾と典拠区分はAssertionへ追加する。Path segment、面的geometry、Landscape Entityは、第二の景観でも構造化の必要性が確認された場合だけ追加する。

## Internal architecture

五つのLENSを同じTopic Registry契約へ揃える。

```text
LensPerspectiveId
  mythology | religion | route | politics | people
        ↓
RegisteredLensTopic(pack, preset, renderer)
        ↓
resolveLensTopics(exploration scope, selected spot)
        ↓
LensProjection + LensMapConnectionProjection
```

ReligionLensとRouteLensは固定Packをimportせず、解決済みTopicまたはProjectionを受け取る。固有図法はrendererとして維持できるが、入力Packの選択責務を持たない。

MAPは既存の`LensMapConnectionProjection → MapConnectionProjection → MapSceneProjection`を再利用する。宮島固有の地名やPack IDによる条件分岐をWorkspace、Map Scene、rendererへ追加しない。

## Invariants

1. Exploration ClaimとKnowledge Assertionを相互に上書きしない。
2. 現在祭神、史料上の神格、祭祀対象の仮説を同一Entity関係として確定しない。
3. 同じ場所の継続利用を、同じ信仰の連続性とみなさない。
4. itineraryを歴史的祭祀経路の証拠にしない。
5. MAPの意味的な線はClaimまたはAssertionを必要とする。
6. Reviewed AssertionはReviewed Sourceを必要とする。
7. Topic適用は安定Entity IDを優先し、名称照合は補助に留める。
8. Packの表示都合をEntity・Assertionへ埋め込まない。
9. Source未接続の全国一覧記述をReviewedへ昇格しない。
10. 異なる文化体系を神道の前段階として階層化しない。

## Consequences

古層祭祀景観は既存のEvidence Graph、Journey、Knowledge Pack、MAP根拠表示を再利用できる。宮島・宗像・宇佐の比較でも、同じデータを複製せず複数LENSから読める。

Topic Registryは五つのLENSで一般化し、宗教・ルートを含めて同じPack / Preset契約から解決する。Assertionの対象時期・史料成立時期・典拠区分は、宮島・弥山と宗像・沖ノ島で共通要件として確認され、共通スキーマとtimeline表示へ反映した。

Pathの詳細な摩擦、面的神域、Landscape Entity、調査成熟度Projectionは、第二事例でまだ共通要件を確認できていないため保留する。

詳細なデータ対応と導入順序は[古層祭祀景観 仕様案](../ancient-sacred-landscape-spec.md)に従う。
