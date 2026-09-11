# ADR-0008: LENSの観点と探索テーマを分離する

- Status: Accepted
- Date: 2026-09-04

## Context

「政治・社会」を選ぶと、選択中のJourneyやSpotに関係なく魏志倭人伝の政治図が固定表示される実装が生まれた。これはLENSという観点と、邪馬台国というテーマを同一視したためである。同じ問題は、宗教、人物、ルートなどでも新しい旅行記を追加するたびに再発し得る。

また、旅行記からClaimを抽出しただけでは、訪問地点はAtlasへ自動的に現れない。Document / Claim、Spot / Journey、外部Knowledge、画面Projectionは別の段階であり、途中段階を飛ばして専用LENSを作ると「図には出るがMAPには出ない」状態になる。

## Decision

LENSを「何を見るかという観点」、Topicを「その観点で見る対象」として分離する。

```text
Exploration scope（すべて / Journey）
  + Selection（Spot / Connection / Entity）
  + Lens perspective（政治・社会 / 宗教 / ルート ...）
  + Knowledge Pack presets
      ↓ Topic Resolver
Applicable Lens Topics
      ↓ Projection
MAP / relation diagram / detail
```

- `politics`などのLENS IDから特定のPackを直接表示しない。
- TopicはPack ID、Preset ID、表示方式、対応するLENS観点を宣言する。
- Topic Resolverは現在のClaim、Spot、Journey scope、選択中Spotとの接続量から候補を求める。
- LENS / Topicの適用入口はPresetの`rootEntityIds`を正本とし、現在のClaimの主語または訪問場所が入口Entityへ直接接続するときだけ候補にする。
- Claimの目的語や周辺文脈に入口Entity名が現れるだけでは、そのLENS / Topicを起動しない。文脈上の関連は、起動後の図内リンクとして保持する。
- Atlas ConnectionのfacetはMAP上の分類・強調に使うが、登録Knowledge Packが適用できないLENSを表示する代替条件にはしない。
- 選択中Spotに直接つながるTopicを優先し、なければ現在のJourney内で接続が多いTopicを優先する。
- 複数候補がある場合は自動的に一つへ隠さず、ユーザーがTopicを切り替えられるようにする。
- 適用候補がないLENSは、特定テーマを代わりに固定表示しない。
- rendererはPackの内容を判定せず、選択されたProjectionを描画する。固有図法が必要な間はrenderer registryで明示的に対応付ける。

旅行記追加は次の順序を守る。

```text
Document / Passage
  → Claim
  → Spot / Journey登録
  → 外部Knowledge補完
  → Connection / Topic候補解決
  → MAP / LENS Projection
```

Claim抽出済みでもSpot登録が終わっていなければ、取込完了とは表示しない。外部Knowledgeは訪問地点を上書きせず、古墳、神社、資料館、人物、史料、仮説などの関連情報として接続する。

## Consequences

- 邪馬台国、幕末、宗像・国東を同じ「政治・社会」観点から切り替えて見られる。
- 新しい旅行記の追加だけで、Workspaceに行先固有の条件分岐を追加しなくてよい。
- Topic候補の精度はEntity接続とSpot登録の品質に依存する。
- 当面は小さなTopic registryと既存rendererを使い、万能グラフrendererや巨大なオントロジーは導入しない。

運用の詳細は[旅行記追加とLENS更新の運用手順](../adding-travel-journal-and-lens.md)に従う。
