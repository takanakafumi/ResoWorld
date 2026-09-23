# 古層祭祀景観 仕様案

- Status: Proposed
- Date: 2026-09-23
- Scope: 宮島・弥山を起点とするパイロット設計

## 1. 目的

古層祭祀景観は、古い神社や祭神を順位付けする機能ではない。山・島・海・岩・峠などの場所、そこへ至る経路、祭祀、神格、施設、共同体、政治が、時代ごとにどう接続・断絶・再編されたかを、探索記録と外部根拠を混同せずに読み直すためのTopic群である。

中心的な問いは次とする。

> 誰が、なぜ、その場所を特別な場所として選び、その意味と到達方法が時代とともにどう変化したか。

宮島・弥山で得られた `Point of Interest / Path of Interest / Layer of Interest` という視点を出発点とするが、一旅行専用の構造にはしない。宗像・沖ノ島、宇佐・御許山でも再利用できることを確認してから共通スキーマへ昇格する。

## 2. 採用する設計判断

### 2.1 第三の正本を増やさない

古層祭祀景観の情報も、既存の二つの正本へ分ける。

```text
Exploration Dataset
  実際に歩いた経路、見たもの、身体感覚、問い、ユーザーの解釈

Knowledge Pack
  史料、考古資料、地理、祭祀、神格、施設、歴史的経路に関するAssertion

        ↓ LensPreset / Projection

祭祀景観、Path比較、神格変遷、時代レイヤーとして表示
```

全国一覧、評価表、LENS画面を第三の知識正本にしない。再生成できる評価・分類・画面状態はProjectionまたはReview用の派生データとする。

### 2.2 新しいトップレベルLENSを追加しない

「古層祭祀景観」は独立した第六のLENSではなく、複数LENSから読むTopicとする。

| LENS | 主な問い |
| --- | --- |
| 宗教 | 何が神域とされ、祭祀・神格・施設がどう変化したか |
| ルート | どの経路で近づき、摩擦・関門・短絡が何を変えたか |
| 政治・社会 | 氏族、共同体、王権、国家、神仏分離がどう再編したか |
| 神・系譜 | 神名、同定、勧請、習合、合祀をどう区別できるか |
| 人物 | 僧侶、神職、政治主体、調査者などが変化へどう関与したか |

地形はMAPとルートの文脈、聖域は宗教Topic、時代は共通軸として扱う。

### 2.3 神社一社ではなく景観を集約単位にする

集約の階層は次を基本とする。

```text
日本列島
  └─ 広域地域
       └─ 祭祀景観・祭祀圏
            ├─ 自然地形
            ├─ 祭祀・宗教施設
            ├─ 遺跡・史料上の場所
            ├─ 交通・境界ノード
            └─ Path
```

ただし、階層への所属だけを理由にEntity間の歴史的関係を生成しない。内部ノードの所属と、祭祀・継承・同定等のAssertionを分ける。

## 3. 分離して保持する概念

### 3.1 神格と祭祀対象

次を同一フィールドや同一Assertionへまとめない。

- 現在祭神
- 古代史料上で確認できる神名・神格
- 中近世の本地・権現・習合神
- 近代再編後の祭神
- 自然地形や行為として推定される祭祀対象
- ユーザーが「祭祀の根源層」として立てた仮説

「祭祀の根源層」は確定した最古層を意味しない。根拠が直接確認できない場合は `interpretive-model` または `scholarly-hypothesis` とし、`reviewed-reference` にしない。

### 3.2 三つの履歴

一つの連続した物語へ畳み込まず、少なくとも次の履歴を分ける。

1. 場所の履歴：自然地形、祭祀地、交通・政治拠点、宗教施設、現代利用
2. 神格の履歴：史料上の神格、同定、勧請、習合、合祀、分離、再編
3. 施設の履歴：遥拝・露天祭祀、社殿、寺院・修験施設、近代以降の施設

同じ場所が使われ続けたことは、同じ信仰や祭祀主体が連続したことを意味しない。

### 3.3 変遷の関係

変遷を示す矢印には、少なくとも次の意味を付ける。

- 継承
- 勧請
- 同定
- 習合
- 合祀
- 分離
- 再編
- 断絶
- 関係不明

矢印ごとにSource、対象時期、Assertion nature、confidence、review statusを持つ。自由記述だけの「神格変遷チェーン」を正本にしない。

## 4. Path of Interest

### 4.1 Pathの種類

同じ地図上の線でも意味が異なるため、次を分離する。

| 種類 | 正本 | 意味 |
| --- | --- | --- |
| experienced path | Exploration Dataset | ユーザーが実際に通った順序と観察 |
| intended path | Exploration Dataset | 行く意図はあったが完遂していない経路 |
| historical path | Knowledge Pack | 史料・考古・研究で確認できる古道、航路、登拝路 |
| ritualized path | Knowledge Pack | 禊、遥拝、関門、結界、途中祭祀を含む経路 |
| current access path | Knowledge Packまたは外部地理情報 | 現在の道路、登山道、船、ロープウェイ等 |
| interpretive path | Knowledge Pack | 地点・史料を接続して提示する検証中の経路モデル |

`experienced path` を歴史的祭祀経路の証拠にしない。逆に、歴史的経路が存在してもユーザーが同じ身体経験をしたとはみなさない。

### 4.2 Pathの最小構造

パイロットでは次を記録候補とする。

- 安定ID、名称、種類、対象時期
- 順序付きstage
- stageが参照する地点Entityまたは観察地点
- segmentごとの移動方法
- 距離、標高差、勾配、海上隔絶、潮、視界、足場等の観測可能な摩擦
- 結界、禊、遥拝、途中祭祀等の根拠付き行為
- 現代の短絡路との関係
- SourceまたはExploration Claim
- confidence、review status

「暗く感じた」「神々しく感じた」等はExploration Claimであり、地理的属性にはしない。「森林で日照が遮られる」「巨岩の高さ」等の測定・資料化できる条件と分ける。

### 4.3 既存itineraryとの関係

現在の`itinerary`は訪問順を示す。Path of Interestは、順序に加えて意味、摩擦、時代、根拠を扱う。したがって既存itineraryへ全情報を詰め込まない。

パイロットでは既存ConnectionとClaimで表現し、宮島・宗像・宇佐の二例以上で同じ要求が確認された後に、Knowledge Packの`paths`とPresetのPath投影を検討する。

## 5. Layer of Interest

Layerは独立した正本データではなく、Entity・Assertion・Sourceを選択するViewpointまたはProjection条件とする。

初期の比較軸は次の七つとする。

1. 考古学
2. 古代史料
3. 自然地形・自然神域
4. 神域制度・アクセス
5. 地理・交通上の必然性
6. 社会・政治主体
7. 場所の持続・断絶・再編

七レイヤーを単純な有無のチェックボックスや合計点にしない。各レイヤーはSourceとAssertionの集合へ投影し、「根拠なし」「候補あり」「根拠確認済み」「競合あり」等の状態を示す。

## 6. 証拠と解釈の扱い

資料中の次の区分は、既存モデルへ対応付ける。

| 記述の性質 | ResoWorldでの扱い |
| --- | --- |
| 現地で見た・歩いた | Exploration Claim + personal evidence |
| 同時代史料の記述 | `source-statement` Assertion |
| 現代の公的・研究資料で確認 | `reviewed-reference` Assertion |
| 伝承・縁起 | 伝承を記すSourceについてのAssertion。史実Assertionとは分ける |
| 学説 | `scholarly-hypothesis` + hypothesis group |
| 分析モデル | `interpretive-model` |
| ユーザーが探索から立てたモデル | Exploration Claimまたは`user-model`。外部Knowledgeと分ける |

「史料に記述がある」と「その記述内容が史実である」を別Assertionにする。Reviewedは出典と記述の確認状態であり、歴史的真実の確定を意味しない。

## 7. 時間軸

最低限、次の時期を比較できることを目標とする。

- 先史
- 弥生
- 古墳
- 古代
- 中世
- 近世
- 明治以降
- 現在

ただし、粗い時代ラベルだけで連続性を推定しない。Assertionと変遷関係に、判明する範囲で開始・終了・おおよその時期・史料年代を付ける必要がある。

現在のKnowledge Pack Assertionには時間修飾がないため、これはパイロットで確認すべきスキーマ差分である。時代をノード名やnoteだけへ埋め込む方式は採用しない。

## 8. 景観の評価と調査成熟度

`CORE / CANDIDATE+ / CANDIDATE` は景観の価値、古さ、神聖さ、史実の確度を表さない。調査の優先度と証拠連鎖の成熟度を示すReview上の分類とする。

各評価は少なくとも次を参照する。

- 場所を選ぶ地理的理由を説明できるか
- 古い祭祀について独立した複数根拠があるか
- 場所、神格、施設の変化を時系列で追えるか
- 重大な競合仮説や未確認箇所が何か
- 七レイヤーのうち、どこまでSourceへ接続できているか

評価ラベルをEntityやAssertionのconfidenceへ流用しない。一覧の並び順や地図の強調を自動決定しない。

`PARALLEL TRADITION`は成熟度階層ではない。琉球、アイヌ等の異なる文化体系を神道の前段階へ吸収しないための比較上の境界であり、対象文化ごとの資料、用語、主体性に基づく別仕様が必要である。

## 9. 全国一覧の位置づけ

全国一覧はKnowledge Packの一括投入データではなく、調査候補台帳として扱う。

候補ごとに次を確認してからKnowledge Packへ昇格する。

1. 景観境界と内部ノード
2. 記述ごとのSource
3. 事実、史料記述、伝承、学説、解釈の分離
4. 古代から現在への無根拠な連続がないこと
5. 競合仮説と未解決事項
6. 対象LENSとPreset

候補台帳の名称や評価変更によって、既存Entity IDやReviewed Assertionを無言で変更しない。

## 10. 宮島・弥山パイロット

### 10.1 Exploration側

旅行記から少なくとも次を候補化し、人がレビューする。

- 実際に訪問した地点
- 大元ルートと大聖院ルートの訪問順
- 海、島、山、巨岩を連続した景観として見たというユーザー解釈
- 御山神社、観光動線、山頂周辺についての現地観察
- 現在祭神、古代史料上の神格、祭祀の根源層を分ける必要があるという問い
- 移動摩擦が情報になり得るというユーザーモデル

旅行記だけから古代祭祀、神格同定、三鬼大権現との歴史関係をReviewed Knowledgeにしない。

### 10.2 Knowledge側

Draft Packは次の問いに範囲を限定する。

> 厳島・弥山で、海・島・山岳・巨岩、神格、施設、到達経路の関係は、確認できる史料と現在景観からどこまで分けて説明できるか。

最低限必要なSource群は次とする。

- 古代史料の該当箇所
- 嚴島神社、大聖院等の公式由緒・施設資料
- 文化財・考古学資料
- 神仏習合、三鬼大権現、神仏分離に関する研究資料
- 登山道、地形、現在アクセスに関する資料

旅行記由来の観察はSource群へ混ぜず、Exploration Claimから接続する。

### 10.3 初期Preset

- 宗教：神域、神格変遷、施設変遷を比較する
- ルート：experienced path、歴史的・祭祀的経路、現代短絡路を比較する
- 政治・社会：神仏分離等による空間・施設・祭神再編を読む

最初から全国比較画面を作らない。まず一景観の根拠往復が成立することを優先する。

## 11. スキーマ差分候補

現行Knowledge Packに対して、次は不足する可能性が高い。

- 景観集約を明示するEntity kindまたは集約定義
- Assertionの時間範囲・史料年代
- 根拠付き変遷relation
- 順序付きPathとsegment
- 点ではない山体、島、海域、祭祀圏の地理表現
- 景観評価とSource充足を扱うReview Projection

これらを一度にコア型へ追加しない。宮島・弥山のPackとProjectionを作り、宗像・沖ノ島または宇佐・御許山で再利用した時点で、共通要求だけをスキーマ化する。

## 12. 受け入れ条件

1. 旅行記の観察と外部Knowledgeを画面・データの双方で区別できる。
2. 現在祭神、史料上の神格、祭祀対象の仮説を同一視しない。
3. 場所、神格、施設の履歴を別々に追跡できる。
4. 変遷の各矢印からSource、時期、確度、レビュー状態へ戻れる。
5. experienced pathとhistorical / ritualized pathを区別できる。
6. Pathの摩擦について、観測可能な条件と主観的経験を区別できる。
7. 宗教とルートの両LENSから同じ正本データを異なるProjectionで読める。
8. `CORE`等の評価をAssertion confidenceや場所の価値ランキングとして表示しない。
9. 古代から現在への連続性が不明な箇所を、線で自動接続しない。
10. 宮島固有のID・名称判定をWorkspaceや共通rendererへ追加しない。

## 13. 実装前に残る判断

- 景観集約を新しいEntity kindにするか、Pack内の明示的なaggregateにするか
- PathをKnowledge Pack本体へ置くか、根拠Assertionから生成するProjectionにするか
- 時間修飾をAssertionへ直接持たせるか、Event Entityとの関係で表すか
- 山体・島・海域等のgeometryをどの段階で扱うか
- 七レイヤーのSource充足状態を手動レビューするか、決定的に導出するか
- 調査成熟度ラベルをローカルReviewだけに置くか、公開可能なPackメタデータに含めるか

これらは宮島・弥山の具体的なEntity、Assertion、Source、Path候補を作った後に決定する。

## 14. 段階的な導入順序

1. 本仕様案をレビューする。
2. 宮島・弥山旅行記を通常フローでExploration Datasetへ取り込む。
3. Claim、地点、実歩行Pathをレビューする。
4. 宮島・弥山の外部Sourceを調査し、Draft Knowledge Packを作る。
5. 現行スキーマで表現できる範囲をProjectionする。
6. 表現できなかった要求をスキーマ差分として確定する。
7. 宗像・沖ノ島、宇佐・御許山のいずれかへ同じモデルを適用する。
8. 二例以上で一致した要求だけを共通スキーマとUIへ実装する。
9. 全国一覧から次の調査候補を一件ずつ昇格する。

## 15. 現行内部構造への対応

### 15.1 Exploration Dataset

旅行記から得た内容は`domain/knowledge/schema.ts`の既存構造へ置く。このファイル名のKnowledgeはローカルDataset全体を指すが、意味上はユーザー探索の正本である。

| 古層祭祀景観の内容 | 現行構造 |
| --- | --- |
| 旅行記原文 | `Document` |
| 現地観察 | `Claim` / `claimKind: observation` / `SourceNature: Observation` |
| ユーザーの解釈 | `Claim` / `claimKind: hypothesis`または`synthesis` / `UserHypothesis` |
| 未解決の問い | `Claim` / `claimKind: question` |
| 訪問地点 | `PlaceReference` / `observed_place` |
| 景観理解に必要だが訪問地点ではない場所 | `subject_place`または`evidence_place` |
| 実際の訪問時刻・歴史時期 | `historicalTime`。両者を同じ時刻として扱わない |
| 原文箇所 | `Evidence.passage` |

海、島、山、巨岩が言及されたという理由だけで、すべてを`ReviewAtlasSpot`へ変換しない。`ReviewAtlasSpot`は確認済みの訪問地点を中心とし、景観を構成する非訪問地点はClaimまたはKnowledge Entityとして保持する。

宮島・弥山で実際に歩いた順序は、確認済みSpotとClaimを参照する`ReviewAtlasConnection.connectionKind: itinerary`で表現できる。海・島・山・巨岩を一つの意味構造として読んだユーザー解釈は、同じitineraryへ混ぜず、根拠Claimを持つ`interpretive` Connection候補とする。

### 15.2 Knowledge Pack

外部根拠は`domain/lens-packs/schema.ts`へ置く。

| 古層祭祀景観の内容 | 現行構造 |
| --- | --- |
| 山、島、神社、寺院、港、岩等 | `LensEntity`。初期は既存kindを使う |
| 史料、論文、公的解説 | `LensSource` |
| 史料・学説・分析の違い | `LensAssertion.nature` |
| 七レイヤー | `LensViewpoint`とPresetによる投影 |
| 変遷関係 | 意味別predicateと既存relation family |
| 競合仮説 | `hypothesisGroupId` |
| 歴史的・祭祀的Path | `route` Assertionの順序列と専用Viewpoint |
| 景観の表示単位 | `LensPreset` |
| 地図上の根拠付き地点列 | `LensMapConnection` |

パイロットでは「厳島・弥山祭祀景観」自体を新しいEntity kindにしない。Packが正本の境界、Presetが一つの見方・景観集約を表す。全国比較で祭祀景観同士を直接Assertion接続する必要が確認された時だけ、`landscape` kindまたは明示的aggregateを再検討する。

歴史的Pathは、既存の`route` relation family、`sequence`、Viewpoint、Sourceで最初の実例を表現する。Path固有スキーマは、segment単位の摩擦や複数経路比較がこの構造で失われることを実例で確認してから追加する。

### 15.3 Atlas / Journey

Atlasは探索範囲と地理表示のRead Modelであり、祭祀景観の知識正本にはしない。

- `ReviewJourney`は宮島・弥山旅行記のDocument、訪問Spot、探索Connectionを束ねる。
- `ReviewAtlasSpot`は訪問済み地点と確認済み座標を表す。
- `ReviewAtlasConnection`は実歩行順または旅行記から確認した意味接続だけを持つ。
- 古代の神格変遷、歴史的経路、祭祀圏所属をAtlas JSONへ複製しない。
- Knowledge由来の地点・線は`LensMapConnectionProjection`からMap Sceneへ合成する。

### 15.4 Projection

既存の投影経路を維持する。

```text
Exploration Claim / Atlas Connection
                    ┐
                    ├─ MapConnectionProjection ─ MapSceneProjection ─ AtlasMap
Knowledge Pack      │
  └─ LensPreset ─ LensMapConnectionProjection

Knowledge Pack ─ LensProjection ─ LENS renderer
Exploration Claim ─ LensExplorationLink ─ LENS内の「自分の記録」
```

古層祭祀景観専用のMAP描画経路を作らない。地点が二つ未満、AssertionまたはSource不足、Projection ID重複は既存の`MapSceneDiagnostic`へ流す。

## 16. LENS Registryの整合化

### 16.1 現在の非対称

現在、`registeredLensKnowledgePacks`は神・系譜、宗教、ルート、政治、人物のPack登録を扱える。一方、Topic解決を行う`registeredLensTopics`と`LensPerspectiveId`は政治・人物だけに限定されている。

また、`ReligionLens`と`RouteLens`はコンポーネント内でそれぞれ`religionRelationsPack`と`wajindenRoutesPack`を直接importしている。このまま宮島Packを登録しても、MAP接続は表示できるが、宗教・ルートの右側LENS本文は既存の固定Packを表示する。

これは古層祭祀景観を入れる前に解消する。

### 16.2 目標構造

`overview`を除く五つのLENSを、同じTopic解決契約へ寄せる。

```text
Recognition Lens
  mythology | religion | route | politics | people
        ↓
RegisteredLensTopic
  perspectiveId
  pack
  presetId
  renderer
        ↓
resolveLensTopics(claims, spots, selectedSpot)
        ↓
選択TopicのLensProjection / MapProjection
```

`LensPerspectiveId`の目標値は`mythology | religion | route | politics | people`とする。新しい旅行先ごとにWorkspaceへ条件分岐を追加しない。

`ReligionLens`と`RouteLens`は固定Packをimportせず、解決済みTopicまたはProjectionをpropsとして受け取る。既存の固有図法はrendererとして残してよいが、入力データの選択をrenderer内部で行わない。

宮島・弥山では少なくとも次のTopic登録を想定する。

| perspective | Topic | 初期renderer |
| --- | --- | --- |
| religion | 厳島・弥山の神域と神格変遷 | 共通relationshipまたはtimeline |
| route | 海から弥山へ至るPath | 共通route |
| politics | 神仏習合・神仏分離による空間再編 | 共通relationship |

同じPackを複数Topicから参照し、Entity・Assertion・Sourceを複製しない。

### 16.3 Topic適用判定

現行の`resolveApplicableLensPresets`と`buildLensExplorationLinksByIdentity`を再利用する。

- Presetの`rootEntityIds`を入口とする。
- Claimの安定Entity ID一致を最優先する。
- IDが未解決な場合だけlabel / alias照合を補助にする。
- `observed_place`または`subject_place`として直接接続するClaimを入口にする。
- 旅行記内で周辺的に言及しただけのEntityを、Topic表示の入口にしない。
- selected Spotへ直接接続するTopicを優先するが、他候補を隠さない。

宮島・弥山PackのPreset rootには、抽象的な「古層祭祀景観」概念だけでなく、宮島、弥山、嚴島神社、御山神社等の旅行記から安定接続できるEntityを含める。

## 17. パイロットで採用する最小モデル

初回実装ではスキーマversionを上げず、現行型で次までを表現する。

### Exploration

- `Document`: 宮島・弥山旅行記
- `Claim`: 観察、問い、ユーザー仮説、経路経験
- `ReviewJourney`: 宮島・弥山
- `ReviewAtlasSpot`: 実際に訪問し位置確認した地点
- `itinerary` Connection: 実歩行順
- 必要な場合だけ`interpretive` Connection: 複数地点を結ぶユーザー解釈

### Knowledge Pack

- Entity: 場所、神格、宗教施設、事件、時代、概念
- Source: 史料、公的資料、研究資料
- Viewpoint: 古代史料、自然・地理、神格変遷、施設変遷、歴史的経路等
- Assertion: 史料記載、鎮座・祭祀、同定、習合、分離、再編、経路
- Preset: 宗教、ルート、政治・社会向け
- Map Connection: 二地点以上と根拠Assertionを持つものだけ

### 現行型へ無理に入れないもの

- 島全体、山体、海域、祭祀圏のpolygon
- segmentごとの標高・勾配・潮流等の構造化値
- 根拠のない自然祭祀開始年代
- 全国景観ランキング
- Source未接続の神格変遷矢印

## 18. スキーマ拡張の判定ゲート

次の要求が宮島・弥山と第二の景観で共通して確認された場合だけ、スキーマ拡張を行う。

| 要求 | 拡張候補 |
| --- | --- |
| Assertionの対象時期をPeriodノードだけでは正確に表せない | `temporalScope` |
| Path segmentの摩擦・行為・短絡比較がnoteでは失われる | `paths` / `segments` |
| 山体・島・海域の範囲が点・線では誤解を生む | geometry / area projection |
| 景観同士を正本上で比較・接続する必要がある | `landscape` Entity kindまたはaggregate |
| 七レイヤーのSource充足を複数Packで同じ方法で判定する | assessment projection |

拡張時は`LensKnowledgePackSchema`のversionを更新し、旧Packの移行または後方互換読込を用意する。既存フィールドの意味を無言で変更しない。

## 19. IDと参照整合性

- Pack IDは行先表示名ではなく安定したASCII IDにする。例：`miyajima-misen-sacred-landscape`。
- Entity IDはPack内で安定させ、旅行記Claimの`entity.id`と接続できるようにする。
- 神名表記、旧称、異体字は`aliases`へ置き、別Entityか同一Entityか未確定の場合は自動統合しない。
- 同じ名称でも時代的・制度的に異なる施設は、継続性を確認するまで別Entityとして関係を記述する。
- Assertion IDは文言や配列順から生成せず、版をまたいで維持する。
- Preset IDはLENS名ではなく問い・投影単位を表す。
- Map Connection IDはPreset内で安定させ、対象地点の並び替えだけで変更しない。

## 20. 実装モジュールの配置

初期実装は既存境界へ配置し、`domain/sacred-landscape`のような新しい独立サブシステムを作らない。

| 責務 | 配置候補 |
| --- | --- |
| 宮島・弥山Knowledge | `domain/lens-packs/miyajima-misen-pack.ts` |
| Pack検証 | `domain/lens-packs/miyajima-misen-pack.test.ts` |
| Topic登録 | `domain/lens-packs/knowledge-registry.ts` |
| Topic解決 | `domain/lenses/topic-resolver.ts` |
| 汎用宗教・ルート投影 | `domain/lens-packs/projection.ts`または専用の純粋Projection |
| MAP合成 | 既存`domain/map/scene.ts`と`connections.ts` |
| LENS表示 | `app/review`のrenderer。Packを直接選ばない |

固有データはPackへ、再利用できる判定はDomain Projectionへ、見た目はrendererへ置く。

## 21. 実装順序の依存関係

```text
1. 五つのLENSでTopic Registry契約を統一
   ↓
2. ReligionLens / RouteLensから固定Pack選択を除去
   ↓
3. 宮島・弥山のExploration Claim / Journey / itineraryをレビュー
   ↓
4. 宮島・弥山Draft Knowledge Packを追加
   ↓
5. religion / route / politics Topicとして登録
   ↓
6. 既存Projectionで画面と根拠往復を検証
   ↓
7. 表現不能だった要求だけをスキーマ拡張
```

この順序により、宮島固有の条件分岐をWorkspaceへ追加せず、既存Journeyと既存LENSへのデグレを先に防ぐ。

## 関連文書

- [データ・構造設計ポリシー](./data-structure-policy.md)
- [旅行記追加とLENS更新の運用手順](./adding-travel-journal-and-lens.md)
- [LENS基礎知識パック](./lens-knowledge-packs.md)
- [ADR-0005: Knowledgeと表示Projectionの責務を分離する](./decisions/0005-separate-knowledge-from-view-projections.md)
- [ADR-0010: トップレベルLENSを五つに絞り、時代を共通軸にする](./decisions/0010-limit-top-level-lenses-and-use-shared-axes.md)
- [ADR-0011: 探索範囲とLENSを二段階の操作モデルにする](./decisions/0011-separate-exploration-scope-from-lens.md)
- [ADR-0013: 古層祭祀景観を既存正本から複数LENSへ投影する](./decisions/0013-project-sacred-landscapes-through-existing-lenses.md)
