# 世界の解像度 - ResoWorld -
## PoC アーキテクチャ・開発計画

> 探索するほど、世界の解像度が上がる

---

## 1. 本ドキュメントの目的

本ドキュメントは、「世界の解像度 - ResoWorld -」のコンセプトをPoCとして成立させるために、以下を整理する。

- PoCで検証すべき体験
- 最小構成のシステムアーキテクチャ
- データモデル
- AIの役割
- 3D Atlas / Time Slider / Knowledge Graph の構成
- PoC開発の段取り
- PoCで作らないもの
- PoCの完成判定

PoCでは、機能を広く作ることではなく、

> **「自分の過去の探索記録を入れると、場所・知識・時間のつながりが立ち上がり、次に行きたい場所や新しい問いが生まれる」**

という一連の体験が成立するかを検証する。

---

## 2. PoCで成立させるコア体験

ResoWorldのPoCでは、以下の体験フローを一本通すことを最優先とする。

```text
過去の旅行記・メモ・探索記録
        ↓
AI解析
        ↓
場所・人物・神・時代・出来事・概念を抽出
        ↓
位置情報・時代情報・情報ソースを付与
        ↓
探索グラフを生成
        ↓
3D Atlas / Network View 上に表示
        ↓
場所同士・概念同士の「つながり」を発見
        ↓
AIが次の探索候補・問いを提示
```

これはResoWorldの基本ループである。

```text
探索
 ↓
記録
 ↓
知識が接続
 ↓
世界の見え方が変化
 ↓
新しい疑問・仮説
 ↓
次の探索
 ↓
探索
```

PoCでは、この循環そのものをプロダクト体験として成立させる。

---

## 3. PoCの基本方針

### 3.1 最初から大規模な歴史データベースを作らない

PoCで扱う対象地域は、まず自分の過去の探索記録に限定する。

例：

- 宗像
- 宇佐
- 国東
- 両子寺
- 大元神社
- 古羅漢
- 高千穂
- 萩
- その他の訪問地

全国・全時代を網羅することはPoCの目的ではない。

### 3.2 「地図」より先に「つながり」が面白いかを検証する

開発順は、地図から始めない。

```text
旅行記
 ↓
AI構造化
 ↓
Knowledge Graph
 ↓
Network View
 ↓
Map
 ↓
Time
 ↓
次の探索
```

この順にする。

ResoWorldの価値は、綺麗な歴史地図そのものではなく、

> **自分が探索してきた場所が、思いもしなかった形でつながること**

にあるためである。

### 3.3 AIが生成した内容を事実として直接確定しない

AIは候補を提示する。

```text
AI Suggestion
      ↓
候補Entity / Relation
      ↓
確認・採用
      ↓
Knowledge Graphへ確定登録
```

AIによる推測と、史料・考古学・伝承・現地観察などを混同しない構造にする。

---

# 4. システムアーキテクチャ

## 4.1 全体構成

```text
┌───────────────────────────────────────────────┐
│                 ResoWorld Web                  │
│                                               │
│  3D Atlas        Time Slider     Detail Panel │
│  Network View    Knowledge Layer Exploration  │
│                                               │
│              React / Next.js                  │
└──────────────────────┬────────────────────────┘
                       │ API
                       ▼
┌───────────────────────────────────────────────┐
│              Application Backend              │
│                                               │
│  Exploration API                              │
│  Knowledge Graph API                          │
│  Timeline API                                 │
│  AI Exploration API                           │
│                                               │
└──────────────┬───────────────┬────────────────┘
               │               │
               ▼               ▼
┌──────────────────────┐   ┌────────────────────┐
│ PostgreSQL / PostGIS │   │       LLM          │
│                      │   │                    │
│ Entity               │   │ Entity Extraction  │
│ Place                │   │ Relation Discovery │
│ Relation             │   │ Question Generate  │
│ Exploration          │   │ Next Place Suggest │
│ Source               │   │                    │
│ Hypothesis           │   └────────────────────┘
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Object Storage    │
│                      │
│ 写真                 │
│ 旅行記               │
│ 元資料               │
└──────────────────────┘
```

---

## 4.2 推奨技術構成

### Frontend

- Next.js
- React
- TypeScript
- MapLibre GL
- deck.gl

3D地形や大規模地理表現の要求が強くなった場合は、CesiumJSを将来候補とする。

### Backend

PoCでは過度に分離せず、以下のどちらかとする。

- Next.js API Route / Server Actions
- 軽量な独立APIサーバ

### Database

- PostgreSQL
- PostGIS
- pgvector（必要になった場合のみ）

### Storage

- S3互換Object Storage

保存対象：

- 写真
- 旅行記原文
- PDF・資料
- 将来の音声・画像記録

### AI

外部LLM APIを利用する。

PoCではAI基盤を独自開発せず、Entity抽出・Relation候補生成・問い生成・次の探索提案に集中する。

### Repository

- GitHub

CodexなどのAI開発支援から扱いやすいように、設計ドキュメント・DB定義・API仕様もリポジトリ内にMarkdownで保持する。

---

# 5. データモデル

## 5.1 Entityを中心にする

ResoWorldでは、「Place」だけを中心データにしない。

中心概念は **Entity** とする。

```text
Entity
 ├ Place
 ├ Person
 ├ Deity
 ├ Event
 ├ Period
 ├ Culture
 ├ Religion
 ├ Artifact
 ├ Concept
 └ Hypothesis
```

旅行記や探索記録から抽出する対象例：

- 場所
- 人物
- 神
- 時代
- 出来事
- 文化
- 宗教
- 遺跡
- 仮説
- 興味
- 関係

---

## 5.2 Relation

Entity同士の関係をRelationとして保持する。

```text
Entity
   ↕
Relation
```

例：

```text
宗像大社
   ├─ worships → 宗像三女神
   ├─ related_to → 沖ノ島
   ├─ theme → 海上交通
   └─ period → 古代

宇佐神宮
   ├─ worships → 八幡神
   ├─ theme → 神仏習合
   └─ theme → 海上交通
```

ここから、

```text
宗像大社
   ↓
海上交通
   ↓
宇佐神宮
```

のような、自分の探索では直接意識していなかった「線」を発見できる。

---

## 5.3 Source

ResoWorldでは、「何が書かれているか」だけでなく、

> **その情報がどこから来たのか**

を必ず保持する。

情報の性質は、以下のように区別する。

| Source Type | 意味 |
|---|---|
| Observation | 自分が現地で確認した内容 |
| Historical Source | 文献・史料 |
| Archaeology | 考古学的資料 |
| Tradition | 伝承・由緒 |
| Hypothesis | 自分の仮説 |
| Alternative | 異説・オカルト的解釈 |
| AI Suggestion | AIが提示した関連候補 |

RelationそのものにもSourceを紐付ける。

```text
Relation

宗像大社
   │
   └── 海上交通

source_type:
  Archaeology

source:
  ○○研究報告

created_by:
  user / AI / imported
```

---

## 5.4 Exploration

自分自身の探索履歴を、Knowledge Graphと分離せず保持する。

```text
Exploration
 ├ visited_at
 ├ place_id
 ├ photos
 ├ memo
 ├ observations
 ├ questions
 └ hypotheses
```

同じ場所を複数回訪れた場合も、一つのPlace Entityに複数のExplorationが紐づく。

これにより、

```text
訪問1回
│
├ 写真
├ 感想
└ 基本情報

      ↓

複数回の探索・学習

      ↓

場所
歴史
神話
考古学
地理
民俗
仮説
```

という形で、一つの土地の「解像度」が上がっていく。

---

# 6. PoC用DB構成案

PoCでは、まず以下のテーブルから開始する。

```text
explorations
entities
places
relations
sources
observations
hypotheses
```

### entities

```text
id
entity_type
name
description
start_year
end_year
period
created_at
updated_at
```

### places

```text
entity_id
latitude
longitude
altitude
geometry
```

### relations

```text
id
from_entity_id
to_entity_id
relation_type
description
source_id
created_by
status
```

`status`は、例えば以下を想定する。

```text
suggested
confirmed
rejected
```

### sources

```text
id
source_type
title
reference
url
memo
```

### explorations

```text
id
place_entity_id
visited_at
title
memo
```

### observations

```text
id
exploration_id
entity_id
text
```

### hypotheses

```text
id
text
status
created_at
```

PoC段階ではNeo4j等のGraph DBは導入せず、PostgreSQLのEntity / Relation構造で開始する。

Graph DBは、データ量・探索クエリの複雑性・性能要件が明確になった段階で再評価する。

---

# 7. 3D Atlas

## 7.1 役割

3D AtlasはResoWorldの中心UIとする。

将来的には以下の情報を重ねる。

- 地形
- 山・谷・河川
- 現在の海岸線
- 古代の海岸線
- 遺跡
- 古墳
- 神社
- 寺院
- 祭祀遺跡
- 港・交通路
- 歴史的拠点
- 自分の探索地点
- 探索ルート

ただしPoCでは、以下程度から開始する。

```text
Terrain
＋
探索地点
＋
Relation
＋
古代海岸線 1レイヤー
```

---

## 7.2 Map上の状態表現

```text
● 探索済み
○ 未探索
★ AI Suggested
```

Knowledge Graph上のRelationも、必要に応じて地図上に可視化する。

```text
● 宗像
       ╲
        ● 宇佐
          ╲
           ● 国東
```

---

# 8. Network View

Mapより先に実装する。

Network Viewでは、Entity / Relationを直接可視化する。

例：

```text
宗像 ───── 海上交通 ───── 宇佐
 │                           │
沖ノ島                      八幡
 │                           │
 └────── 国東 ─────────────┘
              │
           神仏習合
```

PoC初期では、この画面で、

> 「自分がこれまで探索してきた世界が、こんなふうにつながっていたのか」

という感覚が発生するかを最初に確認する。

---

# 9. Time Slider

## 9.1 基本方針

PoCでは、複雑な歴史時系列エンジンを作らない。

Entityに以下を持たせる。

```text
start_year
end_year
period
```

例：

```text
古墳A
start_year: 350
end_year: 450

寺院B
start_year: 720

伝承C
period: mythology
```

---

## 9.2 UI

```text
縄文 ─ 弥生 ─ 古墳 ─ 飛鳥 ─ 奈良 ─ 平安 ─ 中世 ─ 現代
                         ●
```

スライダー変更時に、

- Entity
- Relation
- Knowledge Layer

をフィルタリングする。

これにより、同じ土地でも時代によって意味が変化することを表現する。

---

# 10. Knowledge Layers

一つの土地に複数の知識レイヤーを重ねる。

将来的なレイヤー：

- 地理
- 考古学
- 歴史
- 神話
- 宗教・信仰
- 伝承
- 異説
- Personal Layer

PoCではすべて実装せず、以下程度に絞る。

```text
☑ 探索済み
☑ 神社
☑ 古墳・遺跡
☑ 古代海岸線
```

---

# 11. AIの役割

AIは「歴史の先生」ではない。

ResoWorldでは、AIが世界を説明することより、

> **ユーザー自身が世界を発見すること**

を優先する。

PoCでは、AI機能を以下の4つに限定する。

---

## 11.1 Extract

旅行記や探索記録からEntity / Relation候補を抽出する。

```text
POST /ai/extract

旅行記
 ↓
Entity / Relation候補
```

出力例：

```json
{
  "places": [],
  "people": [],
  "deities": [],
  "periods": [],
  "concepts": [],
  "relations": [],
  "hypotheses": []
}
```

---

## 11.2 Connect

現在の探索グラフから、既存の場所・概念間の共通点を発見する。

```text
POST /ai/connect

既存Graph
 ↓
「宗像と宇佐に共通して、海上交通というテーマがあります」
```

---

## 11.3 Suggest

現在のKnowledge Graphから、次に探索すると面白そうな場所・資料・テーマを提示する。

```text
POST /ai/suggest

現在のGraph
 ↓
「国東を探索すると、神仏習合という観点が広がりそうです」
```

---

## 11.4 Question

答えを直接出すのではなく、新しい問いを生む。

```text
POST /ai/question

現在のGraph
 ↓
「この3地域の祭祀拠点としての共通点は何でしょう？」
```

PoCでは、AIによる長文の歴史解説機能は優先しない。

---

# 12. PoC開発フェーズ

## Phase 0 — 素材収集

コードを書く前に、実際の自分の探索記録を集める。

対象：

- 旅行記
- メモ
- 写真
- 訪問地
- 当時調べた資料
- 自分の考察

まず10〜30件程度でよい。

目的は、架空データではなく、自分自身の探索履歴でPoCを評価することである。

---

## Phase 1 — AI抽出

最初の実装はMapではない。

```text
旅行記
 ↓
LLM
 ↓
Structured JSON
```

を成立させる。

この段階で検証すること：

- 場所を正しく抽出できるか
- 人物・神・時代・出来事を分離できるか
- Relation候補が面白いか
- 自分が忘れていたつながりが出るか

ここでKnowledge Graphそのものが面白くなければ、地図を作っても価値は生まれにくい。

---

## Phase 2 — Exploration Graph

以下をDB化する。

```text
Entity
Relation
Source
Exploration
```

そしてNetwork Viewを作る。

まず、以下のような構造が実際の自分のデータから生成されることを確認する。

```text
宗像 ─── 海上交通 ─── 宇佐
 │                       │
沖ノ島                   八幡
 │                       │
 └──── 国東 ────────────┘
```

---

## Phase 3 — 2D / 3D Atlas

Network Viewで価値を確認できた後に、地図へ展開する。

実装対象：

- 探索済み地点
- Entityの位置表示
- Relation表示
- 簡易3D地形

この段階で、

> 「自分がこれまで探索してきた世界が、こんなふうにつながっていたのか」

と思えるかを確認する。

---

## Phase 4 — Knowledge Layer

Map上に知識レイヤーを追加する。

PoC対象：

```text
☑ 探索済み
☑ 神社
☑ 古墳・遺跡
☑ 古代海岸線
```

レイヤー数を増やすことより、複数レイヤーを重ねたときに新しい見え方が生まれるかを確認する。

---

## Phase 5 — Time Slider

時間軸を追加する。

```text
弥生 ─ 古墳 ─ 飛鳥 ─ 奈良 ─ 平安 ─ 現代
                 ●
```

スライダー操作によって、表示するEntity / Relation / Layerが変わる。

これにより、

> **時間 × 空間 × 知識**

というResoWorld固有の体験を成立させる。

---

## Phase 6 — 次の探索

最後にAIを再投入する。

現在の探索状況が、

```text
宗像
宇佐
国東
```

であれば、AIが、

```text
「この3地域を祭祀と海上交通という観点で見ると、
 間に位置する○○を調べると面白そうです。」
```

のような候補を提示する。

Map上では、

```text
● 探索済み
○ 未探索
★ AI Suggested
```

として表示する。

ここまでできれば、

```text
探索
 ↓
理解
 ↓
新しい疑問
 ↓
次の探索
```

というループが成立する。

---

# 13. PoCで作らないもの

PoCでは、以下は対象外とする。

- 全国の全遺跡データベース
- 完全な日本史データベース
- 高精細な3D都市モデル
- 完璧な神話系譜
- 自動生成された長文歴史解説
- ソーシャル機能
- ゲーム内ポイント
- ランキング
- AR
- ネイティブモバイルアプリ
- 独自CMS
- 独自Vector DB
- Elasticsearch
- Neo4j等のGraph DB
- 高度なユーザー管理

PoCでは「自分の探索記録から、自分だけの探索世界が立ち上がる」ことを優先する。

---

# 14. 推奨リポジトリ構成

```text
resoworld/
│
├─ apps/
│  └─ web/
│     ├─ app/
│     ├─ components/
│     │  ├─ atlas/
│     │  ├─ network/
│     │  ├─ timeline/
│     │  └─ exploration/
│     └─ api/
│
├─ packages/
│  ├─ domain/
│  ├─ database/
│  ├─ ai/
│  └─ shared/
│
├─ data/
│  ├─ imports/
│  └─ seed/
│
├─ docs/
│  ├─ concept.md
│  ├─ architecture.md
│  ├─ data-model.md
│  ├─ api.md
│  └─ poc-plan.md
│
├─ prisma-or-drizzle/
│  └─ schema.*
│
└─ README.md
```

PoC初期はモノレポ構成を過度に複雑化せず、Frontend / Backend / Domain / AI / Databaseの責務が分かれる程度でよい。

---

# 15. 実装Issueの推奨順

```text
01. プロジェクト雛形作成
02. Entity / Relation / Sourceスキーマ定義
03. 旅行記Import
04. AI Entity Extraction
05. AI Relation Extraction
06. AI候補確認UI
07. PostgreSQLへの保存
08. Network View
09. Place座標管理
10. Map表示
11. 探索済み地点表示
12. Relation Map Overlay
13. Knowledge Layer
14. Time Slider
15. AI Connect
16. AI Question
17. AI Suggest
18. 次の探索候補をMap表示
19. 宗像→宇佐→国東シナリオ評価
20. PoCレビュー
```

---

# 16. PoC完成判定

PoCの完成は、機能数では判断しない。

実際の宗像・宇佐・国東などの探索記録を投入して、次の2つが起きるかで判断する。

## 判定1

> **「あ、ここにつながりがあったのか」**

という発見が1回以上発生する。

## 判定2

> **「じゃあ次はここに行ってみよう」**

という次の探索意欲が1回以上発生する。

この2つが成立すれば、ResoWorldのコア体験はPoCとして成立したと判断できる。

---

# 17. PoCの最小完成形

最終的なPoC画面は、まず一画面に集約してよい。

```text
┌───────────────────────────────────────────────┐
│ RESOWORLD / EXPLORATION ATLAS                 │
│                                               │
│            [ 3D / 2.5D MAP ]                 │
│                                               │
│     ● 宗像                                    │
│          ╲                                    │
│           ● 宇佐                              │
│             ╲                                 │
│              ● 国東                           │
│                                               │
│  Time                                         │
│  弥生 ─── 古墳 ─── 奈良 ─── 中世 ─── 現代   │
│                    ●                          │
│                                               │
│  Layers                                       │
│  ☑ 探索済み                                   │
│  ☑ 神社                                       │
│  ☑ 遺跡                                       │
│  ☑ 古代海岸線                                 │
│                                               │
│  Connections                                  │
│  宗像 ─ 海上交通 ─ 宇佐                      │
│                                               │
│  AI Insight                                   │
│  「次は○○を探索すると、この関係を確認できます」│
│                                               │
└───────────────────────────────────────────────┘
```

まずはこの一画面で、

> **自分がこれまで探索してきた世界が、こんなふうにつながっていたのか**

という感覚を成立させる。

---

# 18. One Sentence Architecture Principle

> **自分の探索記録をEntityとRelationに変換し、時間・空間・知識として可視化し、そのつながりから次の探索を生み出す。**

