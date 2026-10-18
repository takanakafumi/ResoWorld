# 史料分類・確度評価・祭祀史階層 設計ポリシー (Source Evaluation & Stratigraphy Policy)

- Status: Active policy
- Date: 2026-10-18
- Background Refs:
  - [`ref/古層祭祀景観_分析原則と知識パック構想.txt`](../ref/古層祭祀景観_分析原則と知識パック構想.txt)
  - [`ref/古層祭祀景観_史料分類と評価基準.txt`](../ref/古層祭祀景観_史料分類と評価基準.txt)
- Related Specs:
  - [`docs/data-structure-policy.md`](./data-structure-policy.md)
  - [`docs/ancient-sacred-landscape-spec.md`](./ancient-sacred-landscape-spec.md)
  - [`docs/lens-knowledge-packs.md`](./lens-knowledge-packs.md)
  - [`docs/decisions/0018-evidence-driven-stratum-and-anti-bias-guards.md`](./decisions/0018-evidence-driven-stratum-and-anti-bias-guards.md)
  - [`docs/decisions/0019-sacred-site-stratigraphy-and-deity-context-architecture.md`](./decisions/0019-sacred-site-stratigraphy-and-deity-context-architecture.md)


---

## 1. 目的

ResoWorld において古層祭祀景観・神社・伝承・古代史を扱う際、**「現在の祭神や後世の社伝・古史古伝の主張」と「考古学・古代一次史料で確認できる基底層」が混同されること**を防ぎ、同時に多様な伝承や仮説を切り捨てずに構造化して比較できるようにするための設計・運用基準を定める。

---

## 2. 基本分析原則

1. **「現在の祭神」と「その場所の祭祀の歴史」を分離する**
   - 現在祀られている神名が古いことは、その場所で古代から同じ神が同じ形で祀られていたことを意味しない。
   - 遷座、合祀、勧請、神仏習合、神仏分離、明治以降の近代社格制度・祭神再編を、古代の基層祭祀と分けて保持する。
2. **後世の再編を古代へ無条件に遡及させない**
   - 中近世の社伝・縁起や近世〜近代の伝承文献が「神代・縄文の創建」を主張していても、それをそのまま古代の地層（事実層）として地図上に投影しない。
3. **「文献にそう書かれていること」と「それが史実であること」を区別する**
   - 出典の性格（いつ・誰が・どのような目的で編纂したか）と、個別の記述の確度（独立した物証や同時代史料があるか）を2軸で分離して評価する。

---

## 3. 史料の「3つの年代」の分離

文献・史料（`Source`）および主張（`Claim` / `Assertion`）を扱う際は、以下の3つの年代を混同せず分離する。

| 年代区分 | 意味 | スキーマ上の対応 |
| :--- | :--- | :--- |
| **① 作品の成立年代 (`compilationTime`)** | その文献・史料がいつ編纂・執筆されたか（例：『出雲国風土記』天平5年／733年） | `Source.compilationTime` / `Assertion.sourceTime` |
| **② 現存資料の年代 (`extantManuscriptTime`)** | 現存する最古の写本・刊本がいつのものか（例：細川家本＝室町末〜安土桃山期写本） | `Source.extantManuscriptTime`（任意） |
| **③ 記述対象の年代 (`historicalTime`)** | 記述が語っている出来事・祭祀・関係の時期（例：古墳時代中期、神代など） | `Claim.historicalTime` / `Assertion.historicalTime` |

---

## 4. 2軸評価モデル：史料分類（A〜D）× 記述の確度区分（A〜D）

### 4.1 史料の性格分類（Source Category: `A` | `B` | `C` | `D`）

文献全体の性格を以下の4区分で分類する。これは「価値の上下」ではなく**「どの時代の何を直接証明できる資料か」という史料の性格区分**である。

| 区分 | ラベル | 定義・対象例 | 運用ルール |
| :---: | :--- | :--- | :--- |
| **`A`** | **古代基礎史料・考古物証** | 8〜10世紀の古代一次・準一次文献（『古事記』『日本書紀』『風土記』『万葉集』『延喜式』『六国史』、木簡・金石文）および発掘調査報告等の考古物証。 | 古代の祭祀・地名・氏族・制度の基準線（ベースライン）として扱う。 |
| **`B`** | **後世編纂・社伝・系図・古文書** | 中世〜近世の神社縁起・由緒書、氏族系図、地誌、家伝文書（『九鬼文書』『但馬故事記』等を含む）。 | 成立年代・伝来を明記する。古代の直接証拠とはしないが、中近世の信仰再編・伝承形成の史料として正当に扱う。 |
| **`C`** | **古史古伝・要検証文献** | 近世〜近代以降に現れ、超古代王朝や独自神統譜・古代文字等を主張する文献群（『ホツマツタヱ』『竹内文書』『上記』『宮下文書』『東日流外三郡誌』『鞍ヶ根風土記』等）。 | 独立した考古・古代史料の裏付けなしに古代史実（確度A）へ採用しない。一方、頭ごなしに排除せず「いつ現れ、何を主張し、地域のどの聖地と結びつけられたか」を思想史・比較対象として記録する。 |
| **`D`** | **現代の研究書・自治体史・公的解説** | 現代の歴史学・考古学・神話学・歴史地理学の研究論文、自治体史、博物館・文化財解説。 | 一次史料（A/B）の引用部分と、研究者による解釈・仮説（確度C）を切り分けて参照する。 |

### 4.2 記述ごとの確度区分（Certainty Tier: `A` | `B` | `C` | `D`）

個別の主張（`Claim` / `Assertion`）について、根拠の性質を以下の4区分で分類する。

| 区分 | ラベル | 定義 |
| :---: | :--- | :--- |
| **`A`** | **独立根拠による確認（Corroborated Fact）** | 考古遺構・遺物、または同時代の複数一次史料など、独立した根拠によって直接裏付けられる事実（例：「沖ノ島で4〜9世紀の祭祀遺物が確認される」「『延喜式』神名帳に名神大社として記載される」）。 |
| **`B`** | **記述・伝承の存在確認（Textual / Traditional Attestation）** | 特定の文献・社伝・伝承に「そう記されている」こと自体は確認できるが、記述内容がそのまま古代の史実かまでは独立証明されていないもの（例：「社伝では神武天皇代の創建と伝える」「『記』『紀』に〇〇神の降臨説話が記される」）。 |
| **`C`** | **根拠を持つ仮説・解釈（Grounded Hypothesis）** | 地形・分布・史料比較等に基づく研究上の学説、または探索から導かれた構造的仮説。必ず**反証条件または代替説明**を併記できる構造とする。 |
| **`D`** | **未検証の主張・単独伝承（Unverified Claim）** | 現時点で一次資料や独立根拠が未確認の主張、または検証を要する単独伝承。 |

### 4.3 既存フィールドからの後方互換・自動導出ルール

既存の全データおよびテストとの互換性を100%保つため、`sourceCategory` と `certaintyTier` はオプショナルフィールドとし、未指定時は既存の属性（`sourceNature` / `evidenceBasis` / `nature` / `confidence`）から決定論的に導出するフォールバック関数を提供する。

- **確度区分の自動導出（未指定時）**：
  - `Archaeology` / `contemporary-record` / `reviewed-reference`（高確度） ➔ **確度 `A`**
  - `HistoricalSource` / `Tradition` / `reported-historical-record` / `institutional-tradition` / `source-statement` ➔ **確度 `B`**
  - `UserHypothesis` / `Alternative` / `scholarly-hypothesis` / `interpretive-model` ➔ **確度 `C`**
  - `AISuggestion` / `unverified` ➔ **確度 `D`**

---

## 5. 神社・聖地の「祭祀史7項目（Stratigraphy Profile）」と STRATUM 厳格分離原則

### 5.1 祭祀史7項目（Sacred Site Stratigraphy Profile）

重層聖域や主要神社スポットについては、単一の「由緒テキスト」に畳み込まず、以下の7項目に分解して保持・表示できるようにする（すべてオプショナルとし、判明している項目から段階的に記述する）。

1. **現在の祭神 (`currentDeities`)**：現在祀られている主祭神・配祀神。
2. **由緒が主張する創建・起源 (`claimedOrigin`)**：社伝・縁起・要検証文献が主張する創建時期や起源伝承（史料B/C・確度B/D）。
3. **祭祀が確認できる最古史料 (`oldestAttestedRecord`)**：『風土記』『六国史』『延喜式』等でその神社の祭祀が確認できる最古の記録（史料A・確度A/B）。
4. **現在地での最古確認 (`oldestCurrentSiteRecord`)**：旧鎮座地からの遷座がある場合、現在地での祭祀が確認できる時期・根拠。
5. **遷座・合祀・祭神変更・習合の履歴 (`reorganizationHistory`)**：山宮から里宮への移動、神宮寺・本地垂迹による習合、明治の神仏分離・近代社格・合祀による祭神変更など。
6. **関連遺跡・古墳・自然祭祀対象 (`archaeologyAndNaturalTarget`)**：社殿以前の磐座、神体山、島、湧水、周辺の古墳・祭祀遺跡（確度A）。
7. **関与した氏族・政治権力・交通路 (`clanAndRouteContext`)**：奉斎氏族（宗像氏、阿曇氏、出雲臣等）、王権・藩政の関与、海路・街道・峠との位置関係。

> [!NOTE]
> 拠点の位置づけと「大社中心主義」の脱却、および全神社共通の基礎台帳（公称祭神＋古層神格）から多層プロファイル（7項目）への成長型モデルについては、[ADR-0019: 祭祀拠点（旧・重要聖地）の重層構造・祭神コンテキスト・探索ジャーニー統合アーキテクチャ](./decisions/0019-sacred-site-stratigraphy-and-deity-context-architecture.md) を参照。


### 5.2 STRATUM（時代地層）モードにおける厳格分離原則

地図および左パネルの **STRATUM（祭祀景観の地層）モード** において、後世の伝承と古代の事実層が混ざることを防ぐため、以下の**厳格分離（案1）**を採用する。

- **地図上の地層ヒット＆重層聖域オーラ（`[X層]`・金色二重同心円）**：
  - **考古物証・自然地形の祭祀遺構・古代基礎史料・明確な歴史的施設（確度A相当）**によって裏付けられる地層のみをカウント・描画対象とする。
  - 社伝や古史古伝（史料B/C）が「神代・超古代の創建」を主張していても、それだけを根拠に第I層（自然崇拝・基層）や第II層（古代国家）の地図マーカーを光らせない。
- **スポット詳細パネル（右パネル）での表示**：
  - スポットを選択した際、右パネルの**「祭祀史の層構造（Stratigraphy Card）」**において、「🏺 考古・最古史料で確認できる基底層（確度A）」と「📜 社伝・伝承が主張する起源（史料B/C・確度B）」と「🔄 遷座・習合・近代再編の履歴」を並べて対比表示する。

---

## 6. 知識パックの4分類体系と地域間比較の6観点

### 6.1 知識パックの4分類（Pack Category）

Knowledge Pack を作成・拡充する際は、パックの役割を以下の4分類のいずれか（または複合）として位置づける。

1. **① 史料パック (`source-pack`)**
   - 『出雲国風土記』『播磨国風土記』『豊後国風土記』『肥前国風土記』、または個別検証文献の記述・地名・神名・書誌情報（3つの年代）を構造化するパック。
2. **② 地域パック (`regional-pack`)**
   - 特定地域（北部九州・筑紫、出雲、瀬戸内・宮島、飛驒、熊野、富士、津軽など）の自然地形・考古遺跡・神社・交通路をまとめるパック。
3. **③ 系譜・伝承パック (`genealogy-pack`)**
   - 文献ごとの神統譜・氏族系譜・伝承を扱うパック。異なる文献の類似神名を最初から1つのEntityに潰さず、文献単位の記述差や同定仮説（`identification`）を保持する。
4. **④ 祭祀景観パック (`sacred-landscape-pack`)**
   - 自然地形（山・岩・島・水）× 考古遺構 × 古代史料 × 後世再編の重層構造を読み解くパック。

### 6.2 地域間比較の6観点

複数の地域や祭祀景観を横断比較する際（「似ている」という印象論を防ぐため）、以下の6観点を構造化の基準とする。

1. **共通性**：何が共通しているか（神名、自然祭祀形態、地形配置、氏族名など）
2. **差異**：何が異なるか（祭祀対象、社殿の有無、神話体系での役割など）
3. **年代**：それぞれの証拠はいつの時代か（古代からか、中近世の勧請か）
4. **接触可能性**：海路・河川・峠・移住・交易などで実際に繋がり得る経路があるか
5. **独立性**：律令制や記紀神話・中近世の勧請による後発の制度的波及か、それ以前の独自性があるか
6. **代替説明**：別の説明（偶然の一致、後世の付会、全国的な修験・勧請ネットワーク等）でも説明できるか

---

## 7. 段階的実装ロードマップ（GitHub Issues）

本ポリシーの実装は、既存データ・テストへの後方互換性を100%保ちつつ、以下の4ステップ（Issue #27〜#30）で段階的に進める。

1. **[Issue #27: [Epistemic Schema] 史料分類(A〜D)・確度区分(A〜D)・3年代分離・祭祀史7項目の共通型と後方互換導出の実装](https://github.com/takanakafumi/ResoWorld/issues/27)**
   - `domain/knowledge/source-evaluation.ts` に共通スキーマと既存属性からの自動導出（フォールバック）関数を実装し、アトラス系・レンズ知識パック系の双方へオプショナル統合する。
2. **[Issue #28: [UI / Stratigraphy Card] スポット詳細への「祭祀史7項目カード」および「史料A〜D×確度A〜D 2軸バッジ」の表示実装](https://github.com/takanakafumi/ResoWorld/issues/28)**
   - スポット詳細パネルに「現在の祭神・社伝の主張」と「考古・古代史料で確認できる基底層」を対比する祭祀史カードと2軸バッジを実装する（STRATUM地図の重層オーラは確度Aベースの厳格分離を維持）。
3. **[Issue #29: [Pilot Data] 代表的重層聖域（宗像・沖ノ島、志賀海神社、厳島・弥山）への祭祀史7項目＆史料・確度データの付与](https://github.com/takanakafumi/ResoWorld/issues/29)**
   - 既存の代表的重層聖域スポットに7項目プロファイルおよび史料分類・確度データを投入し、画面上で検証する。
4. **[Issue #30: [Knowledge Packs] 4分類体系（史料・地域・系譜・祭祀景観）と地域間比較6観点に基づく知識パック拡充](https://github.com/takanakafumi/ResoWorld/issues/30)**
   - パック4分類メタデータと地域間比較6観点を導入し、『出雲国風土記』等の史料パック・地域パックを段階的に拡充する。

---

## 8. 構造設計仕様（Module & Schema Architecture）

### 8.1 モジュール責務と配置

2つのスキーマ体系（`domain/knowledge` と `domain/lens-packs`）の二重管理を防ぎ、既存の全データ・テストと完全な後方互換を保つため、以下のモジュール構成を採用する。

```text
apps/web/src/domain/knowledge/
  ├─ source-evaluation.ts        [新設] 史料分類(A-D)・確度(A-D)・3年代・祭祀史7項目・パック4分類・比較6観点の共通型と自動導出関数
  ├─ stratigraphy-profiles.ts    [新設] 代表的重層聖域スポットの祭祀史7項目プロファイル定義と解決関数
  └─ schema.ts                   [拡張] Source / Claim にオプショナルな評価・年代フィールドを追加

apps/web/src/domain/lens-packs/
  ├─ schema.ts                   [拡張] LensSource / LensAssertion / LensKnowledgePack にオプショナルな評価・分類フィールドを追加
  ├─ assertion-presentation.ts   [拡張] 2軸評価ラベル（史料A-D × 確度A-D）と3年代の表示整形
  └─ spot-knowledge.ts           [拡張] スポット接続知識に確度区分・史料分類バッジ情報を付与

apps/web/src/app/review/
  ├─ stratigraphy-profile-card.tsx [新設] 神社・聖地の祭祀史7項目分解カード（基底層 vs 社伝主張 vs 再編履歴の対比UI）
  ├─ stratum-landscape-lens.tsx    [拡張] STRATUMモードでスポット選択時に祭祀史7項目カードを表示
  ├─ atlas-spot-inspector.tsx      [拡張] スポット詳細パネルに祭祀史7項目カードおよび2軸評価バッジを表示
  └─ lens-source-details.tsx       [拡張] 「この表示は何に基づく？」内で出典の史料分類(A-D)・主張の確度区分(A-D)を表示
```

### 8.2 共通型インターフェース仕様 (`source-evaluation.ts`)

1. **`SourceCategory`**: `"A" | "B" | "C" | "D"`
2. **`CertaintyTier`**: `"A" | "B" | "C" | "D"`
3. **`SourceChronology`**:
   - `compilationEra?: string`（①作品の成立年代）
   - `extantManuscriptEra?: string`（②現存資料・写本の年代）
   - `targetEra?: string`（③記述対象の年代）
4. **`SacredSiteStratigraphyProfile`（祭祀史7項目）**:
   - `id: string`
   - `spotNames: readonly string[]`（照合用スポット名・別名）
   - `title: string`
   - `summary: string`
   - `currentDeities: string`（①現在の祭神）
   - `claimedOrigin: { statement: string; sourceTitle: string; sourceCategory: SourceCategory; certaintyTier: CertaintyTier; chronology?: SourceChronology }`（②由緒が主張する創建時期）
   - `oldestAttestedRecord: { statement: string; sourceTitle: string; sourceCategory: SourceCategory; certaintyTier: CertaintyTier; chronology: SourceChronology }`（③祭祀が確認できる最古史料）
   - `oldestCurrentSiteRecord: { statement: string; certaintyTier: CertaintyTier }`（④現在地での最古確認）
   - `reorganizationHistory: readonly { era: string; description: string; certaintyTier: CertaintyTier }[]`（⑤遷座・合祀・習合・近代再編の履歴）
   - `archaeologyAndNaturalTarget: { statement: string; features: readonly string[]; certaintyTier: CertaintyTier }`（⑥関連遺跡・古墳・自然祭祀対象）
   - `clanAndRouteContext: { clans: readonly string[]; routeAndPoliticalContext: string; certaintyTier: CertaintyTier }`（⑦関与した氏族・政治権力・交通路）
5. **`KnowledgePackCategory`（知識パック4分類）**:
   - `"source-pack"` | `"regional-pack"` | `"genealogy-pack"` | `"sacred-landscape-pack"`
6. **`RegionalComparisonEntry`（地域間比較6観点）**:
   - `id: string`
   - `title: string`
   - `regions: readonly [string, string, ...string[]]`
   - `commonality: string`（①共通性）
   - `difference: string`（②差異）
   - `chronology: string`（③年代）
   - `contactPossibility: string`（④接触可能性）
   - `independence: string`（⑤独立性）
   - `alternativeExplanation: string`（⑥代替説明）
