# Ref（コンセプト原案・考え方検討・調査ドラフト）

このディレクトリ（`ref/`）には、ResoWorld の構想段階で作成された**コンセプト原案、歴史・神話・祭祀景観の考え方検討メモ、および初期調査ドラフト**を保管しています。

> [!IMPORTANT]
> **仕様・設計ドキュメントとの区別**
> - **`ref/`（本ディレクトリ）**：着想・思考プロセス・歴史分析の枠組み検討・全国候補ドラフトなどの**参照資料（Reference / Thought Documents）**。
> - **[`docs/`](../docs/)**：実際のプロダクト実装・スキーマ・UI・運用手順を規定する**正式な仕様書・設計ポリシー・ADR（Architecture Decision Records）**。
>
> `ref/` の検討内容のうち、システム仕様およびデータモデルとして採用が決まった事項は、`docs/` 配下の設計ドキュメントへ昇格・反映されます。

---

## 収録資料一覧

### 1. プロダクト構想・初期計画
- **[世界の解像度コンセプト原案.txt](./世界の解像度コンセプト原案.txt)**
  - 「探索するほど、世界の解像度が上がる」という ResoWorld の原点となるコンセプト原案。
- **[ResoWorld_PoC_Architecture_Development_Plan.md](./ResoWorld_PoC_Architecture_Development_Plan.md)**
  - PoC 立ち上げ時の初期アーキテクチャおよび開発計画ドラフト（現在の正式な設計原則は [`docs/data-structure-policy.md`](../docs/data-structure-policy.md) 等を参照）。
- **コンセプトイメージ画像**
  - `ChatGPT Image 2026年8月30日 08_59_58.png`
  - `Gemini_Generated_Image_uybp78uybp78uybp.jpg`

### 2. 古層祭祀景観・神話分析の考え方検討
- **[古層祭祀景観_分析原則と知識パック構想.txt](./古層祭祀景観_分析原則と知識パック構想.txt)**（旧 `考え方検討.txt`）
  - 「現在の祭神」と「その場所の祭祀の歴史」の分離、後世の再編を古代へ遡及させない原則、知識パックの4分類（史料・地域・系譜伝承・祭祀景観）、地域間比較の6観点の検討メモ。
  - 👉 正式設計への反映先：[`docs/source-evaluation-and-stratigraphy-policy.md`](../docs/source-evaluation-and-stratigraphy-policy.md)
- **[古層祭祀景観_史料分類と評価基準.txt](./古層祭祀景観_史料分類と評価基準.txt)**（旧 `考え方検討2.txt`）
  - 3つの年代（作品成立年代・現存資料年代・記述対象年代）の分離、史料の性格分類（A〜D）× 記述の確度区分（A〜D）の2軸評価、古史古伝・社伝の扱い、神社の祭祀史7項目の検討メモ。
  - 👉 正式設計への反映先：[`docs/source-evaluation-and-stratigraphy-policy.md`](../docs/source-evaluation-and-stratigraphy-policy.md)
- **[神話―考古学 国家形成レイヤーモデル.txt](./神話―考古学%20国家形成レイヤーモデル.txt)**
  - 神話上の神を特定の歴史人物へ短絡させず、「生産・生態基盤／技術／政治／宗教・祭祀」の4層構造として考古学と神話を並置して読む思考モデル。

### 3. 古層祭祀景観の選定基準・全国候補ドラフト
- **[古層祭祀景観_選定基準_v1.2.md](./古層祭祀景観_選定基準_v1.2.md)**
  - 神社単体ではなく「祭祀景観（Sacred Landscape）」を単位として7レイヤーで検出・比較するための初期選定基準ドラフト（正式仕様は [`docs/ancient-sacred-landscape-spec.md`](../docs/ancient-sacred-landscape-spec.md) を参照）。
- **[日本列島_古層祭祀景観_階層別一覧_Draft1.2.md](./日本列島_古層祭祀景観_階層別一覧_Draft1.2.md)**
  - 選定基準 v1.2 に基づく全国の祭祀景観候補（CORE / CANDIDATE+ / CANDIDATE / PARALLEL TRADITION）の調査台帳ドラフト。
