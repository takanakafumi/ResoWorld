# ADR-0030: STRATUM 時代地層判定ガバナンスと誤判定防止の仕組み化 (Stratum Classification Governance & Anti-False-Positive Guards)

- Status: Accepted
- Date: 2026-11-22
- Related ADRs:
  - [`0012-single-workspace-fsm-and-stratum-lens.md`](./0012-single-workspace-fsm-and-stratum-lens.md)（STRATUM / LENS 探索モデル）
  - [`0029-lens-topic-semantic-taxonomy-and-governance.md`](./0029-lens-topic-semantic-taxonomy-and-governance.md)（LENS・トピックの意味境界とガバナンス自動化）
- Related Issues: `#49`, `#50`

---

## 1. Context (背景と課題)

ResoWorld の時代地層（STRATUM：L1 先史自然崇拝 〜 L5 近世藩政・近代再編）判定エンジン（[`stratum-types.ts`](../../apps/web/src/domain/review/stratum-types.ts)）は、Guard 1〜9 の積み上げによって主座・衛星分離や近世都市神社の古層誤流入を防いできた。
しかし、祇園山古墳〜高良山の探索記録取り込みに伴う全185地点横断監査により、以下の**4つの構造的脆弱性**がシステム全体に潜在していることが判明した。

1. **構造化年代（`calendar` 数値）の未活用と文字列推測リスク**:
   - `Claim.historicalTime` が `kind: "calendar"` として構造化された `startYear` / `endYear` を保持しているにもかかわらず、時代整合判定が自由文字列 `label` の正規表現にのみ依存していた（例: 境界未保護の `[89]\d{2}年` が `1879年` に誤一致するリスク）。
2. **広域まとめ Claim（3地点以上横断）の他地点汚染**:
   - `claimKind: "synthesis"` だけでなく、旅行記の総括として記録された `observation` / `hypothesis`（例: 8地点横断の `claim-fukuoka-020`、5地点横断の `claim-fcm-2026-018`・`claim-kashii-016`、4地点横断の `claim-dazaifu-024`）が、主語と無関係な周辺スポットへ他時代の語彙（`"弥生時代"`・`"防衛拠点"`・`"神仏習合"`・`"御霊信仰"` 等）を漏洩させていた。
3. **`spot_kind` の広すぎる部分一致による先史 L1 誤流入**:
   - `spot.kind.includes("遺跡")` が無条件に L1（先史・縄文〜弥生）へ分類されていたため、古墳（`船原古墳`）・古代官衙（`大宰府客館跡`）・文学碑（`香椎潟 万葉歌碑`）が先史層へ自動流入していた。
4. **危険な短語正規表現・アーキタイプ部分一致の再混入リスク**:
   - 裸の `/山城/` や `/祇園/` のような境界未保護の短語パターンが、`古代山城`・`福山城`・`祇園山古墳` を中世 L4 へ誤分類する構造的温床となっていたが、ルール辞書自体を継続検査する CI ガバナンス監査器が存在しなかった。

---

## 2. Decision (決定内容)

LENS における ADR-0029（[`taxonomy-governance.ts`](../../apps/web/src/domain/lenses/taxonomy-governance.ts)）と対になる形で、STRATUM にも **4つの統治基準** と純粋ドメイン監査器 [`auditStratumGovernance`](../../apps/web/src/domain/review/stratum-governance.ts) を制定し、CI 不変条件テスト（[`stratum-governance-invariants.test.ts`](../../apps/web/src/domain/review/stratum-governance-invariants.test.ts)）で違反 0 件を継続的に強制する。

### 基準 1: 構造化 `calendar` 年代レンジ優先評価（`STRATUM_CALENDAR_YEAR_BOUNDS`）

`Claim.historicalTime.kind === "calendar"` の場合、自由文字列 `label` の正規表現より先に構造化数値 `(startYear, endYear)` と以下の単一正本レンジ表で地層適格性を判定する（`AGENTS.md` 原則 ⑪）。

| Stratum (`StratumCode`) | 対象時代 | 許容 `calendar` レンジ |
|---|---|---|
| **`animism`**（L1） | 先史・縄文〜弥生 | `startYear <= 350` |
| **`ancient-state`**（L2） | 古墳〜飛鳥・奈良 | `endYear >= 200 && startYear <= 850` |
| **`ritsuryo`**（L3） | 律令・平安・延喜式・一宮 | `endYear >= 645 && startYear <= 1200` |
| **`syncretism`**（L4） | 平安〜中世・戦国 | `endYear >= 750 && startYear <= 1603` |
| **`modern-reconstruction`**（L5） | 安土桃山〜近世・近代 | `endYear >= 1550` |

`kind === "named"` の場合は双方向時代整合（近世近代→古代中世の遮断、および古代限定→中世近世・古墳飛鳥限定→先史L1の遮断）と数値境界 `(?<!\d)` を併用する。

### 基準 2: 広域まとめ Claim の地点隔離（`isUmbrellaCrossSpotClaim`）

`claimKind`（`synthesis` / `observation` / `hypothesis`）にかかわらず、以下をすべて満たす Claim は「広域まとめ・複数地点総括」とみなし、主語以外の地点の一次地層根拠（`claim_observation`）から隔離する：

1. `claim.places.length >= 3`（または `claim.claimKind === "synthesis" && claim.places.length >= 2`）
2. `claim.subject.type === "Place"` であり、`claim.subject`（`id` / `name`）が評価対象スポットと一致しない

※ 当該 Claim 自体はスポットの記録一覧・LENS・接続解説から消滅せず、**「地層判定の自動根拠」として他地点を汚染することのみを遮断**する。

### 基準 3: `spot_kind` 判定の厳格化（L1 非先史遺構の遮断）

- L1（先史・縄文〜弥生）の `spot_kind` 自動判定から裸の `spot.kind.includes("遺跡")` を廃止し、先史・自然聖地を明示する種別（`磐座`・`島嶼`・`弥生`・`縄文`・`環濠`・`貝塚`・`遺跡・歴史公園`）に限定する。
- スポット名称または種別に非先史遺構（`古墳`・`官衙`・`歌碑`・`記念碑`・`文学`・`城跡`・`天満宮`・`寺院`）が含まれる場合は、`spot_kind` のみで L1 を成立させない（真正な先史・自然崇拝物証がある場合は一次 Claim 根拠で成立させる）。

### 基準 4: ルール辞書・全地点の CI 継続自動監査（`auditStratumGovernance`）

[`auditStratumGovernance`](../../apps/web/src/domain/review/stratum-governance.ts) が以下 5 項目を機械的に監査し、CI で 0 違反を保証する：

1. `calendarYearViolations`: `calendar` 年代レンジと矛盾する地層マッチの検出
2. `umbrellaClaimBleedViolations`: 広域まとめ Claim による他地点汚染の検出
3. `kindMismatchViolations`: 非先史遺構（古墳・官衙・歌碑・城跡等）の L1 `spot_kind` 誤流入および近世城郭の L4 誤流入の検出
4. `unsafeRegexRuleViolations`: `STRATUM_EVIDENCE_RULES` 内の境界未保護短語（裸の `祇園`・`山城` 等）の静的検出
5. `archetypeSubstringViolations`: 名称・地域アーキタイプ部分一致による近世城郭・古代山城の L4 誤流入検出

---

## 3. Verification & Rollout (検証と段階適用)

- ガバナンス監査モジュール: [`apps/web/src/domain/review/stratum-governance.ts`](../../apps/web/src/domain/review/stratum-governance.ts)
- 自動不変条件テスト: [`apps/web/src/domain/review/stratum-governance-invariants.test.ts`](../../apps/web/src/domain/review/stratum-governance-invariants.test.ts)
- 段階適用 Issue:
  - `#49`: ADR-0030 制定・原則㉗追記・監査エンジンおよびテスト基盤の導入
  - `#50`: 判定エンジン改修（`calendar` 数値整合・`isUmbrellaCrossSpotClaim`・L1 `spot_kind` 厳格化）と全185地点の監査違反ゼロ固定
