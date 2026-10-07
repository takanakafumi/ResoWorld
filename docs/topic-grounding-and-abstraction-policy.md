# TOPICの抽象度基準と設計運用ガイドライン (Topic Grounding & Abstraction Policy)

## 1. 目的

ResoWorldにおいて、LENSから選択される「TOPIC」は、**「現地スポット（点）の体験を、歴史・神話・社会の文脈（線・面）へと引き上げる視座」**である。

本書は、[ADR-0017](decisions/0017-topic-grounding-and-abstraction-principles.md) に基づき、TOPICの命名、抽象度基準、地域性の扱い、および「物語型」「構造型」特性の付与に関する具体的な設計運用基準を定める。

---

## 2. TOPICの2大系統と命名規則

### 系統A: 風土・史跡固有型 (Locality-Grounding)
- **対象**: 特定の地域、島、山、聖域、藩に固有の歴史・信仰空間を扱うナレッジパック。
- **命名規則**: **固有の地域名・聖地名を明記する。**
- **抽象度の基準**: 「その地域を訪れた旅行者が、1日〜2日かけて巡る信仰・史跡空間の全体像」を捉えるサイズ。
- **好例**:
  - `宗像・沖ノ島の国家祭祀変遷と三宮景観` (Munakata Pack)
  - `厳島・弥山の神域景観と社殿・登拝路` (Miyajima Pack)
  - `出雲国譲り神話と大国主系譜` (Izumo Pack)
  - `長州藩の政治体制と近代化への道` (Hagi Bakumatsu Pack)
  - `筑紫中部の古層祭祀と平塚川添遺跡` (Asakura Pack)
- **禁止事項**: 境内の中の小さな祠の移転など、ミクロすぎる事象を独立TOPICにしない（地域テーマの1ノードへ内包する）。

### 系統B: 普遍テーマ・制度・通史型 (Structural & Thematic)
- **対象**: 国家制度、通史的な宗教変遷、交通インフラ、海人族系統、神話体系などを扱うナレッジパック。
- **命名規則**: **客観的・学術的なテーマ名とする。個人的な旅行先の地域名（「西国」「西海道」「旅行で訪れた神社」など）は一切冠しない。**
- **抽象度の基準**: 列島規模の制度や歴史的潮流を、空間的な広がり（回廊・ネットワーク）として捉えるサイズ。
- **好例**:
  - `延喜式神名帳と式内名神大社制度` (Shikinaisha Pack)
  - `令制国体制と諸国一宮の祭祀網` (Ichinomiya Pack)
  - `古代官道と七道駅路ネットワーク` (Ancient Highways Pack)
  - `海洋神話と海人族三系統の航路掌握` (Marine Deities Pack)
  - `原初祭祀景観と巨石・海浜の自然崇拝` (Religion Pack)
  - `神仏習合と山岳修験の重層` (Religion Pack)
- **旅行記との関係**: ユーザーが訪れたスポット（宗像、宇佐、国東、鞆の浦等）は、**そのテーマの「具体例（Instance）」としてAtlas上に光る**。

---

## 3. 物語型（Narrative）と構造型（Structural）の特性定義

TOPICは「物語」または「構造」のいずれか一方のみに属するのではなく、**両方の特性を兼ね備えることができる**。

| 特性 | 定義 | ユーザーの問い・体験 |
| :--- | :--- | :--- |
| **📖 物語（Narrative）** | 時間の不可逆な進行、移動、因果の連鎖、ドラマ | 「次に何が起きたか？」「なぜそこへ向かったのか？」「旅のどの場面か？」 |
| **🏛️ 構造（Structural）** | 同時代における関係網、空間配置、制度・格付け、対比 | 「どういう仕組み・力関係か？」「空間・制度としてどう位置づけられているか？」 |
| **📖🏛️ 両方（Narrative × Structural）** | 歴史的出来事・神話物語が、空間配置や制度構造を生み出したテーマ | 「あの出来事によって、この場所や制度がどう形作られたのか？」 |

### データモデル表現
```typescript
export type TopicFeature = "narrative" | "structural";

export type RegisteredLensTopic = {
  id: string;
  perspectiveId: LensPerspectiveId;
  label: string;
  description: string;
  pack: LensKnowledgePack;
  presetId: string;
  renderer: LensTopicRenderer;
  features: readonly TopicFeature[]; // ["narrative"], ["structural"], または ["narrative", "structural"]
};
```

---

## 4. 全TOPIC再編マッピング

| LENS | TOPIC ID | 正本TOPIC名称 | 系統 | 特性 |
| :--- | :--- | :--- | :---: | :---: |
| **神・系譜** | `munakata-genealogy` | 宗像三女神神話と古代航海安全祭祀 | 風土 | 📖 🏛️ |
| **神・系譜** | `jinmu-yamato-conquest-preset` | 難波敗退・熊野山越えと大和即位 | 普遍 | 📖 |
| **神・系譜** | `marine-deities-preset` | 海洋神話と海人族三系統の航路掌握 | 普遍 | 🏛️ |
| **神・系譜** | `hyuga-mythology-preset` | 天孫降臨・日向神話と海幸山幸 | 風土 | 📖 |
| **神・系譜** | `izumo-kunitsukami-preset` | 出雲国譲り神話と大国主系譜 | 風土 | 📖 🏛️ |
| **神・系譜** | `jingu-kogo-legend-preset` | 神功皇后伝承と古代筑紫・八幡起源 | 普遍 | 📖 |
| **神・系譜** | `asakura-kami-connections` | 大己貴信仰と筑紫中部の古層祭祀 | 風土 | 🏛️ |
| **宗教** | `shikinaisha-network-preset` | 延喜式神名帳と式内名神大社制度 | 普遍 | 🏛️ |
| **宗教** | `ichinomiya-western-preset` | 令制国体制と諸国一宮の祭祀網 | 普遍 | 🏛️ |
| **宗教** | `religion-archaic-nature` | 原初祭祀景観と巨石・海浜の自然崇拝 | 普遍 | 🏛️ |
| **宗教** | `religion-syncretism` | 神仏習合と山岳修験の重層 | 普遍 | 📖 🏛️ |
| **宗教** | `munakata-sacred-landscape` | 宗像・沖ノ島の国家祭祀変遷と三宮景観 | 風土 | 📖 🏛️ |
| **宗教** | `miyajima-sacred-landscape` | 厳島・弥山の神域空間と摂末社信仰 | 風土 | 🏛️ |
| **宗教** | `jingu-kogo-hachiman-religion` | 神功皇后伝承と八幡信仰ネットワーク | 普遍 | 🏛️ |
| **宗教** | `asakura-religious-places` | 筑紫平野の内陸祭祀と神仏習合 | 風土 | 🏛️ |
| **ルート** | `ancient-highways-preset` | 古代官道と七道駅路ネットワーク | 普遍 | 🏛️ |
| **ルート** | `wajinden-route-comparison` | 魏志倭人伝の記述順と比定説 | 普遍 | 📖 🏛️ |
| **ルート** | `jinmu-setouchi-route-preset` | 神武東征・瀬戸内海路と風待ち津 | 普遍 | 📖 |
| **ルート** | `yayoi-archaeology-preset` | 北部九州弥生拠点遺跡群 | 普遍 | 🏛️ |
| **ルート** | `miyajima-current-paths` | 厳島・弥山信仰と山岳登拝路 | 風土 | 📖 🏛️ |
| **ルート** | `asakura-yamatai-context` | 邪馬台国東遷・内陸説と平塚川添 | 風土 | 📖 |
| **政治** | `yamatai-politics` | 邪馬台国の政治構造 | 普遍 | 🏛️ |
| **政治** | `dazaifu-defense-preset` | 白村江後の古代国防・山城 | 普遍 | 📖 🏛️ |
| **政治** | `hagi-domain-politics` | 長州藩の政治体制と近代化への道 | 風土 | 🏛️ |
| **政治** | `miyajima-patronage-and-space` | 平氏政権と瀬戸内海壇・厳島社殿 | 風土 | 📖 🏛️ |
| **政治** | `asakura-social-structure` | 筑後川流域の弥生拠点集落構造 | 風土 | 🏛️ |
| **人物** | `ishin-figures-network` | 維新志士の人物相関網 | 普遍 | 🏛️ |
| **人物** | `shoka-sonjuku-action-preset` | 松下村塾門下生と長州志士の行動網 | 風土 | 📖 🏛️ |
