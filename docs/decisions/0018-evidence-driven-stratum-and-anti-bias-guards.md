# ADR-0018: 根拠駆動の地層評価と先入観ガードの設計原則 (Evidence-Driven Stratum & Anti-Bias Principles)

- Status: Accepted
- Date: 2026-10-18
- Related ADRs:
  - [`0001-local-first-evidence-graph.md`](./0001-local-first-evidence-graph.md)
  - [`0003-separate-claim-kind-from-evidence-nature.md`](./0003-separate-claim-kind-from-evidence-nature.md)
  - [`0013-project-sacred-landscapes-through-existing-lenses.md`](./0013-project-sacred-landscapes-through-existing-lenses.md)
  - [`0017-topic-grounding-and-abstraction-principles.md`](./0017-topic-grounding-and-abstraction-principles.md)
- Related Docs:
  - [`docs/source-evaluation-and-stratigraphy-policy.md`](../source-evaluation-and-stratigraphy-policy.md)
  - [`docs/adding-travel-journal-and-lens.md`](../adding-travel-journal-and-lens.md)

---

## 1. Context (背景とインシデント分析)

第8弾となる旅行記「久山・糟屋・篠栗エリア」を取り込んだ際、以下の深刻な評価不整合（インシデント）が発生した。

1. **特定旅程のみ地層（Stratum）が突出して強く表示された**:
   - 久山・糟屋・篠栗の12地点のうち大半が複数の地層（L1〜L5）に重複ヒットし、とくに延喜式内社を持たない地域であるにもかかわらず「第3層（律令神祇・式内社・一宮制度層）」に多数ヒットした。
   - 一方で、既存の7旅程（宗像・国東、宮島・弥山、朝倉、邪馬台国など）にある全国級の大社・式内社（宗像大社、宇佐神宮、厳島神社、大己貴神社、美奈宜神社、沼名前神社など）は、旅行記内に豊富な記録があるにもかかわらず地層ヒット数が少なくなっていた。

2. **修正アプローチにおける「因果の逆転（本末転倒なガード）」の発生**:
   - この不整合を是正しようとした際、開発初期のテストにおいて「宗像・国東や宮島・弥山の地層密度は、久山・糟屋・篠栗の地層密度より高くなければならない（`munakataDensity > hisayamaDensity`）」という**結論（序列・先入観）をテストで先に固定するガード**を導入してしまった。
   - これは「有名大社は層が厚いはず」「地方の村社は層が薄いはず」という人間のバイアスをルールに押し付け、データを結論に無理やり合わせるという**完全な論理の逆転**であった。

---

## 2. Root Cause (根本原因の構造的解明)

なぜこの問題が生じ、長期間見落とされていたのか。以下の4つの技術的負債と錯覚に起因していた。

### ① 「Spot」と「Claim」の責務の混同（データモデルの錯覚）
- **Spot（地点）**：空間座標（緯度経度・名称・大まかな種別）を示す「箱」。
- **Claim（主張・根拠）**：その場所で「何が観察され、どの時代のどういう信仰・遺構・史料が存在するか」を示す「実体」。
- にもかかわらず、「スポットの名称（`spot.name`）や種別（`spot.kind`）を見れば地層がわかるだろう」という安易なショートカットに逃げ、UI側から `dataset.claims` を渡さずに `spot` だけを渡すシグネチャ（`spotMatchers: (spot) => boolean`）にしてしまった。

### ② 手書き社名リスト（`knownSpotTokens`）による「動いている感」の罠
- 開発初期に代表的大社数件（`"沖ノ島"`, `"宗像"`, `"厳島"` 等）をコード内に直接書いたことで、架空の6地点を用いた単体テストが一見美しくパスしてしまった。
- その結果、「裏側で762件もの Claim が一切読まれていない」という根本的欠陥が見過ごされ、新しい旅行記が来るたびに場当たり的に社名トークンを足して辻褄を合わせる技術的負債のスパイラルに陥った。

### ③ 比較接続線（Connection）のトピックIDからの地層汚染
- 「延喜式神名帳との祭神構成比較」のような比較用 Connection に接続されただけの地域村社が、Connection の `topicId: "shikinaisha-network-preset"` を経由して機械的に L3（律令・式内社層）として誤判定されていた。

---

## 3. Decision (設計原則と正本ルール)

今後、ResoWorld における地層（STRATUM）および知識レンズ（LENS）の評価において、以下の原則を正本とする。

### 原則 1: 順方向の因果性（Evidence-to-Stratum Causality）
地層の判定は、必ず以下の**順方向の因果（根拠から結果へ）**を貫徹する。
$$\text{各地点の観察事実・史料根拠（Claims）} \longrightarrow \text{各層の成立条件（統一ルール）} \longrightarrow \text{結果としての地層分布（Stratum）}$$
- **「有名神社だから層が厚いはずだ」「地方の神社だから層が薄いはずだ」という結論の序列を先付けしてはならない。**
- 地方の無名神社であっても、現地に磐座や古墳があり（L1/L2）、中世の修験・御霊信仰が重なり（L4）、江戸期に藩主が再建した（L5）という記録（Claim）が存在するなら、それは**探索における正当な発見（出力）**として多層的に評価されなければならない。

### 原則 2: Spot の社名・旅程非依存（Zero Bias & Neutrality）
- スポットの地層判定において、**特定の社名や地名を優遇・ハードコード（`knownSpotTokens`）することを禁止する**。
- 同一の `kind` と同一の `Claim`（根拠記述）を持つスポットは、それが宗像にあろうが糟屋にあろうが、大社であろうが村社であろうが、**完全に同一の地層判定結果を出力しなければならない**。

### 原則 3: Claim 命題（`statement`）に基づく根拠駆動評価
- 地層判定エンジン（`spotMatchesStratum`）は、必ず `context.claimsById` を受け取り、そのスポット自身に紐づく Claim の命題テキスト（`claim.statement`）および時代区分（`claim.historicalTime`）を正規表現パターンで評価する。
- 聖地7項目プロファイル（`SacredSiteStratigraphyProfile`）のテキストは、そのプロファイルの筆頭代表社（`spotNames[0]`）にのみ適用し、地域内の小社へ漫然と継承させて過剰ヒットを起こしてはならない。

### 原則 4: 接続線（Connection）からの地層汚染の禁止
- 比較や回廊のために引かれた Connection の `topicId`（例: `shikinaisha-network-preset`）は、2地点間の「関係性のテーマ」を示すメタデータであり、**端点となったスポット自身の歴史的所属地層を決定してはならない**。

### 原則 5: 現代ユーティリティ施設のハード除外
- 博物館、資料館、記念館、駅、ホテル、飲食店、道の駅、温泉施設などの現代ユーティリティスポットは、名称に「平塚川添」や「広島」などの歴史地名を含んでいても、**祭祀・歴史地層（L1〜L5）から無条件に除外する**。

---

## 4. Guard Rails (自動テストにおける再発防止ガード)

CI（`pnpm test`）で常時実行される [stratum-types.test.ts](file:///b:/09_Technology/22_ResoWorld_bionic/apps/web/src/domain/review/stratum-types.test.ts) には、以下の**3つの順方向ガード**を配備する。

| ガード | 検証内容 | 防ぐ障害 |
| :--- | :--- | :--- |
| **Guard 1<br>根拠駆動の公平性** | 架空の「無名古社A（朝倉）」と「無名村社B（糟屋）」に同一の重層Claimを与えた場合、社名や旅程を問わず全く同一の地層（L1, L2, L4, L5）が出力されることを検証。 | 社名リストへの手書き依存、新規旅程の過剰優遇、過去旅程の過小評価の再発。 |
| **Guard 2<br>接続線汚染防止** | 式内社の根拠を持たない村社に「延喜式神名帳との比較」Connection を接続しても、L3（律令・式内社層）が漏洩ヒットしないことを検証。 | 比較トピックによる地層カウントの水増し。 |
| **Guard 3<br>非祭祀施設除外** | 実データセット内の全博物館・資料館・駅・ホテル・道の駅が、どの地層にも1件もマッチしないことを検証。 | 現代施設の誤判定による地層ノイズ。 |

---

## 5. Travel Journal Ingestion Checklist (旅行記取り込み時の必守手順)

今後新しい旅行記を取り込む際は、以下のチェックリストを順守する。

1. **Claim の抽出・正規化**:
   - 旅行記テキストから、各スポットの観察事実・伝承・史料言及を Claim の `statement` として正確に抽出する。
2. **社名トークン手書きの禁止**:
   - `stratum-types.ts` の `knownSpotTokens` に新旅程の神社名を手動で書き足してはならない（Claim の記述によって自然に地層が判定されることを確認する）。
3. **全旅程横断の地層分布監査**:
   - スクリプトを実行し、**全8旅程（既存旅程＋新規旅程）の L1〜L5 ヒット数を横並びで出力**し、不自然な偏りや過去旅程の脱落がないか確認する。
4. **ガードテストの通過確認**:
   - `pnpm --dir apps/web typecheck` および `pnpm --dir apps/web test src/domain/review/stratum-types.test.ts` が正常にパスすることを確認する。
