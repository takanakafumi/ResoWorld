# 15. LENS・接続データの一級市民化と投影レイヤーアーキテクチャ

- **Status**: Accepted (Revised 2026-09-27)
- **Date**: 2026-09-27
- **Author**: Pair Programming Session
- **Supersedes**: 初版 ADR 0015（UnifiedAtlasConnection 新型の導入提案）

## 文脈と課題 (Context & Problems)

ResoWorld は旅行記（訪問地・Claim）に外部ナレッジや考察を重ねて構造化し、LENS（視点）を通じて多角的に再認識し、次の旅の候補地（フロンティア）へ繋げるシステムである。

現状の実装において、以下の3系統のデータモデルが並存し、歪みが生じていた：

### 3系統の並存問題

| 系統 | 型 | 所在 | lensIdの有無 |
|---|---|---|---|
| ① 旅行記由来 | `ReviewAtlasConnection` | `travel-atlas.*.json` | ❌ facetsのみ |
| ② ナレッジパック由来 | `LensMapConnection` → `registry.ts`で投影 | `seed-packs.ts` | ✅ registry登録時に付与 |
| ③ 候補地 | `ReviewExplorationSuggestion` / `KnowledgeVisitFrontier` | 各所 | ❌ |

具体的な問題：

1. **出自によるデータ構造の分断**: 旅行記接続は `facets: [{ id: "geography", weight: 5 }]` のみで「どのLENSか」を保持せず、ナレッジパック接続は `registry.ts` で `lensIds` 付与済み。同じ「接続線」なのに構造が違う。
2. **UI側での場当たり的な推測・フィルタリング**: `atlas-workspace.tsx` で `facetIds` マッチ、`use-connection-lines.ts` で `detectLensCategory` と、UIが「この接続はどのLENSで出すべきか」を推測していた。結果、「人物」LENSに「海の入口から内陸回廊へ」が混入するなどの不具合が頻発。
3. **候補地の二重構造**: 吉野ヶ里（`ReviewExplorationSuggestion` / ⚑ピン）と対馬・壱岐・奈良等（`KnowledgeVisitFrontier` / ◎ピン）が別々の型・UIに分断。

## 決定事項 (Decisions)

### 基本方針：新型を作らず、既存型を拡張する

初版 ADR では `UnifiedAtlasConnection` / `UnifiedAtlasCandidate` という新型の導入を提案していたが、**これは既存のリッチなスキーマ（`LensKnowledgePack` の349行のZodバリデーション付きナレッジグラフ構造）を無視して退行を招くリスクがある**。

代わりに、以下のアーキテクチャを採用する：

```
ナレッジパック（LensKnowledgePack）    旅行記JSON（travel-atlas.*.json）
    ├ entities（主語・目的語）               ├ connections（接続線）
    ├ assertions（トリプル）                  ├ suggestions（候補地）
    ├ sources（典拠）                        └ spots（訪問地）
    ├ viewpoints（視点）
    └ presets → mapConnections（地図投影）
              ↓ projection.ts                    ↓ そのまま読み込み
              ↓ registry.ts（lensIds付与）
              ↓                                  ↓
         ┌────────────────────────────────────────┐
         │  ReviewAtlasConnection（UI消費の共通形状）│
         │  + lensId（★追加）                      │
         │  + topicId（★追加）                     │
         └────────────────────────────────────────┘
                          ↓
              atlas-workspace.tsx
              connections.filter(c => c.lensId === selectedLensId)
```

**ナレッジパック（`LensKnowledgePack`）がナレッジの正典（canonical）であり、`ReviewAtlasConnection` はUIが消費する投影（projection）である。**

### 1. `ReviewAtlasConnection` への `lensId` / `topicId` 追加

新型を定義せず、既存の `ReviewAtlasConnection`（`apps/web/src/domain/review/types.ts`）にフィールドを追加する：

```ts
export type ReviewAtlasConnection = {
  id: string;
  connectionKind: "documented" | "comparative" | "interpretive" | "itinerary";
  initialStatus: "suggested" | "confirmed" | "rejected";
  eyebrow: string;
  title: string;
  summary: string;
  spotIds: string[];
  claimIds: string[];
  concepts: string[];
  facets: ReviewConnectionFacet[];
  eras: ReviewAtlasEra[];

  // ★ 一級市民として追加（UIフィルタ推測を全廃するため）
  lensId?: "route" | "mythology" | "religion" | "people" | "politics" | "itinerary";
  topicId?: string;  // 例: "wajinden-routes", "maritime-inland-network"
};
```

> [!NOTE]
> `lensId` は optional（`?`）とする。移行期間中、旧データに `lensId` がないものは `connectionKind === "itinerary"` なら `"itinerary"`、それ以外は `facets` からの一時的な推定で埋める。新規データは必ず `lensId` を持つ。

### 2. 候補地の統一：`ReviewExplorationSuggestion` の拡張

新型 `UnifiedAtlasCandidate` を作らず、既存の `ReviewExplorationSuggestion` に `lensId` / `topicId` を追加する：

```ts
export type ReviewExplorationSuggestion = {
  // ... 既存フィールドは全て維持 ...

  // ★ 追加
  lensId?: "route" | "mythology" | "religion" | "people" | "politics";
  topicId?: string;
};
```

`KnowledgeVisitFrontier`（`registry.ts`）からの変換時に、`lensId` は `knowledgeMapRegistrations` の登録情報から自動付与する。

### 3. UIの「素直なデータ表示（データドリブン）」化

- **LENS選択時**: `connections.filter(c => c.lensId === selectedLensId)`
- **トピック選択時**: `connections.filter(c => c.topicId === selectedTopicId)`
- **候補地表示時**: `suggestions.filter(s => s.lensId === selectedLensId)`
- **標準（全体俯瞰）時**: `connections.filter(c => c.connectionKind === "itinerary")` のみ（トグル時）

### 4. 廃止するUI側のフィルタ・推測ロジック

| 対象 | ファイル | 理由 |
|---|---|---|
| `detectLensCategory()` | `use-connection-lines.ts` | `lensId` 直接参照で不要 |
| `recognitionLens` パラメータ | `filterConnectionsByVisibility()` | 同上 |
| `facetIds` によるフィルタ | `atlas-workspace.tsx` L290-330 | `lensId` フィルタに置換 |
| `lensRefs` 派生ロジック | `connections.ts` L158-160 | `lensId` 直接保持で不要 |

---

## 移行ステップ (Next Steps)

1. **Step 1**: `ReviewAtlasConnection` と `ReviewExplorationSuggestion` の型に `lensId?` / `topicId?` を追加。
2. **Step 2**: `travel-atlas.yamatai.json` の各接続に `lensId` / `topicId` を付与。
   - `connection-yamatai-maritime-inland-network` → `lensId: "route"`, `topicId: "maritime-inland-network"`
   - `ritual-to-state` → `lensId: "mythology"`, `topicId: "sea-ritual-state"`
   - `shinbutsu-as-space` → `lensId: "religion"`, `topicId: "shinbutsu-shugo"`
   - `itinerary-*` → `lensId: "itinerary"`
3. **Step 3**: `registry.ts` の `knowledgeSuggestionConnectionsForVisitedSpots()` が生成する `ReviewAtlasConnection` に `lensId` を付与（`registration.lensIds[0]` から）。
4. **Step 4**: `atlas-workspace.tsx` のフィルタを `c.lensId === selectedLensId` に簡素化。`detectLensCategory` / `recognitionLens` 分岐を削除。
5. **Step 5**: テスト修正 & 全パス確認（`pnpm test` & `pnpm typecheck`）。
