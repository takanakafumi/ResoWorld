# ADR-0029: 5大LENSの意味境界・トピック設計基準およびガバナンス自動化 (Lens & Topic Semantic Taxonomy and Governance)

- Status: Accepted
- Date: 2026-11-21
- Related ADRs:
  - [`0008-separate-lens-perspective-from-topic.md`](./0008-separate-lens-perspective-from-topic.md)（LENS観点とTopicの分離）
  - [`0010-limit-top-level-lenses-and-use-shared-axes.md`](./0010-limit-top-level-lenses-and-use-shared-axes.md)（5大LENSの基本集合）
  - [`0017-topic-grounding-and-abstraction-principles.md`](./0017-topic-grounding-and-abstraction-principles.md)（トピックの接地と抽象化原則）
  - [`0028-map-line-legitimacy-strict-scoping-and-ui-symmetry.md`](./0028-map-line-legitimacy-strict-scoping-and-ui-symmetry.md)（地図線分・厳格トピックスコープ・UI対称性）

---

## 1. Context (背景と課題)

ResoWorld のナレッジパック・LENS トピックは 5大LENS（神・系譜 / 宗教 / ルート / 政治・社会 / 人物）配下に 30 トピック規模まで成長した。これに伴い、初期には顕在化しなかった以下の意味的・構造的ドリフトが蓄積した。

1. **5大LENS間の意味境界の揺らぎ**:
   - 環濠集落・王墓群の比較（`yayoi-archaeology-preset`）が `route` に置かれる一方、LENSディレクトリ解説では `politics` に言及されるなど、所属基準が暗黙知化していた。
   - 記紀神話の物語・系譜（`mythology`）と、実在社寺の信仰分布（`religion`）の線引き、および地域統合構造（`politics`）と歴史的人物・氏族相関（`people`）の使い分けが明文化されていなかった。
2. **情報密度の偏りと視認性低下**:
   - 33ノード・10接続のトピック（`wajinden-route-comparison`）や20ノードのトピックに `scopeClusters` が未設定のまま全ノードが一括描画されていた。
3. **`spatialScale` の文字列推測（もぐらたたき分岐）**:
   - `t.id.includes("hyuga")` のような簡易文字列マッチで `regional` / `national` を推測していたため、実態の地理スケールと逆転するトピックが多発し、サイドバーのスケールフィルタの意味が損なわれていた。
4. **`TopicFocus`（焦点タグ）の乱立と未使用キー残存**:
   - 30トピックに対して31種の `TopicFocus` が定義され、未使用キーや1トピック専用の同義タグが混在していた。
5. **レジストリ3重管理によるドリフト**:
   - `canonicalKnowledgePackTopicMappings`、`registeredLensKnowledgePacks`、`knowledgeMapRegistrations` の3箇所に手書き登録が分散し、LENS一覧に存在しない `(lensId, presetId)` の組み合わせが地図接続へ流出していた。

---

## 2. Decision (決定内容)

今後のコンテンツ拡張でも意味構造とコード品質が自律的に保たれるよう、以下の **5つの統治基準** を正本規範として制定し、純粋ドメイン監査関数 [`auditLensTopicGovernance`](../../apps/web/src/domain/lenses/taxonomy-governance.ts) と Vitest 不変条件テストで継続的に強制する。

---

### 基準 1: 5大LENSの排他的意味境界（Semantic Decision Tree）

新規・既存すべての非STRATUMトピックは、以下の決定基準に従って **単一の主レンズ（`perspectiveId`）** へ配置する。

| LENS (`perspectiveId`) | 主たる問い | 対象とする主題 | 境界ルール（迷いやすいケース） |
|---|---|---|---|
| **`mythology`**（神・系譜） | どんな物語・神統譜・伝承が語られたか？ | 記紀・風土記等の神話物語、神統譜、建国・遠征伝承サーガ、海神伝承体系 | 神武東征・神功皇后・海幸山幸などの**神話上の移動ルート**は `mythology` に置く。実在社寺の広域信仰分布は `religion` へ分ける。 |
| **`religion`**（宗教） | どんな祭祀空間・信仰圏・宗教制度が実在したか？ | 神社・寺院の聖域景観、古層祭礼、神仏習合、式内社・一宮制度、特定神格の社寺分布網 | 「記紀の物語」ではなく「**実在する社寺・信仰空間の分布や制度**」が主軸であれば `religion` とする。 |
| **`route`**（ルート） | どの道・海路・流通路で人・物・軍が動いたか？ | 史実・考古・地形に基づく航路、古代官道、登拝路、鉱物サプライチェーン、史料比定ルート | 空間的な**連続移動・流通・行程**が主軸のものに限定する。集落・王墓の比較構造は `politics` へ置く。 |
| **`politics`**（政治・社会） | どう統治し、対立し、社会・対外基盤を築いたか？ | 国家形成、王権と地方首長の統合/対立比較、環濠集落・王墓基盤、国防・山城網、藩政・近世対外港湾管理 | **構造・制度・地域間比較・時代差**が主語のテーマを置く。 |
| **`people`**（人物） | 誰と誰が結びつき、どう行動したか？ | 歴史的人物・氏族の人間関係、師弟・同盟・対決陣営、活動軌跡 | **具体的な人物・氏族が主語**の相関網を置く（広域の地政構造比較は `politics` に委ねる）。 |

---

### 基準 2: トピック情報密度ガード（Density Governance）

構造図・地図の認知負荷を防ぐため、以下のいずれかを満たす非STRATUMトピックは **`scopeClusters`（2クラスタ以上）を必須** とする。

1. `mapConnections.length >= 4`
2. `mapConnections.length >= 3` かつ 投影ノード数 `nodes.length >= 18`

※ 単一接続の純粋な神統譜ツリー（`genealogy` 等）は全体樹形の保持を優先し、接続数条件により対象外とする。

---

### 基準 3: `spatialScale`（`regional` / `national`）の明示宣言原則

- `knowledge-registry.ts` におけるトピックID・パックIDの文字列部分一致による自動推測（`id.includes("hyuga")` 等）を**全面禁止**する（`AGENTS.md` 原則 ①・⑪）。
- `KnowledgePackTopicMapping` の型定義で `spatialScale: TopicSpatialScale` を**必須プロパティ**とし、すべてのトピックに意味的な空間スケールを明示する：
  - **`regional`**: 単一県域・単一平野・海峡周辺・島嶼聖域など、地域フィールドワーク単位のトピック。
  - **`national`**: 複数地方を跨ぐ列島広域（瀬戸内〜大和、糸魚川〜伽耶、九州〜畿内比定、西日本広域制度網など）のマクロ構想トピック。

---

### 基準 4: `TopicFocus`（焦点タグ）の衛生と識別性バランス

- 定義済みの `TopicFocus` キーは **100% いずれかの登録トピックで使用されていること**（未使用キーの放置を CI で禁止）。
- `focusLabel` はサイドバーの各トピック行に小バッジとして表示されるため、無制限な1トピック専用タグ乱立を避けつつ、同一レンズ内で識別力を保てる **15〜20軸程度** の整理された語彙を維持する。

---

### 基準 5: レジストリ単一正本（SSOT）と未登録資産の衛生管理

- [`canonicalKnowledgePackTopicMappings`](../../apps/web/src/domain/lens-packs/knowledge-registry.ts) を LENS 登録の唯一の正本（SSOT）とする。
- `registeredLensKnowledgePacks` および [`knowledgeMapRegistrations`](../../apps/web/src/domain/map/registry.ts) は正本から自動導出（または 100% 一致を CI 保証）し、LENS 一覧に存在しない `(lensId, presetId)` の組み合わせが地図接続・探索候補へ流出することを構造的に防止する。
- パック内に未登録のゾンビプリセットやテスト専用パックを放置せず、用途を明確化または整理する。

---

## 3. Verification & Rollout (検証と段階適用)

- ガバナンス監査モジュール: [`apps/web/src/domain/lenses/taxonomy-governance.ts`](../../apps/web/src/domain/lenses/taxonomy-governance.ts)
- 自動不変条件テスト: [`apps/web/src/domain/lenses/taxonomy-governance-invariants.test.ts`](../../apps/web/src/domain/lenses/taxonomy-governance-invariants.test.ts)
- 段階適用 Issue:
  - `#45`: ADR-0029 制定・原則追記・監査エンジン導入
  - `#46`: レンズ所属適正化・`spatialScale` 明示必須化・`TopicFocus` 整理・レジストリ SSOT 化・ディレクトリ刷新
  - `#47`: 高密度トピックへの `scopeClusters` 拡充
  - `#48`: 人物・政治・神話トピック間の重複整理と未登録パック/プリセット棚卸し
