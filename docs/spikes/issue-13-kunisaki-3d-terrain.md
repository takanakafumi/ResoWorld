# Issue #13 3D Map Spike: 国東半島・六郷満山 2D / 3D Terrain 比較検証メモ

- **Issue**: [#13 `[3D Map Spike] 国東の地形表現が再認識を高めるか検証する`](https://github.com/takanakafumi/ResoWorld/issues/13)
- **目的**: 既存 MapLibre GL JS 地図へ交換可能な `raster-dem` ソースと 2D / 3D Terrain 切替 PoC を組み込み、国東半島・宇佐御許山・六郷満山の垂直構造および移動経路の再認識が 2D より高まるか、ラベル・LENS 線視認性や外部タイル依存とのトレードオフを含めて検証する。

---

## 1. Raster DEM プロバイダー選定・実測結果

### 採用した既定プロバイダー（PoC）

| 項目 | 仕様・実測値 |
| --- | --- |
| プロバイダー | AWS Open Data Terrain Tiles（Mapzen Terrarium PNG） |
| タイル URL（環境変数で交換可能） | `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`（`NEXT_PUBLIC_TERRAIN_DEM_URL`） |
| エンコーディング | `terrarium`（MapLibre GL JS ネイティブ対応、クライアント側デコード変換不要） |
| タイルサイズ / maxzoom | `256px` / `z=15` |
| 国東半島カバー元データ（`x-amz-meta-x-imagery-sources` 実測） | `srtm/N33E131.tif, gmted/30N120E_20101117_gmted_mea075.tif`（SRTM 1-arcsec / 約 30m） |
| 提供条件・認証 | API キー不要・パブリックオープンデータ |
| CORS（`Origin: https://takanakafumi.github.io` 実測） | `Access-Control-Allow-Origin: *`（GET 応答で確認済、WebGL テクスチャ利用可） |
| 単一タイル容量 / レイテンシ実測（国東 `11/1772/820.png`） | `49,823 bytes`（約 50KB） / 約 `222ms`（初回ミス時） |
| 帰属表示 | `Terrain: AWS Open Data (Mapzen / SRTM)`（MapLibre AttributionControl ＋ PoC パネルに明示） |

### 見送った候補とその理由

- **国土地理院 標高タイル（`dem_png`）を素の `custom` エンコーディングで直接読込**:
  - 地理院 `dem_png` は海域・欠測ピクセルに RGB `(128, 0, 0)` を格納するため、MapLibre の `custom` 係数では欠測値が約 `+83,886m` の巨大な壁としてレンダリングされる（国東半島は周防灘・伊予灘に囲まれているため沿岸全体が破綻する）。
  - 将来的に 10m 精度の地理院 DEM を使う場合は、`maplibregl.addProtocol` で欠測値 `(128, 0, 0) -> 0m` マスクを挟んだ Terrarium 変換層を別途導入すれば、ソース設定インターフェースを変えずに差し替え可能。

---

## 2. アーキテクチャとフォールバック設計

- **遅延ロード（Zero Overhead in 2D）**:
  - 初期ロードは従来どおり 2D 表示。`terrain-dem` ソースはユーザーがツールバーの `⛰️ 3D地形 (PoC)` を ON にするまで追加されないため、通常利用時の通信量・初期化時間・外部障害リスクはゼロ。
- **単一状態機械（原則 ⑦）**:
  - [`terrain-config.ts`](../../apps/web/src/domain/map/terrain-config.ts) の `TerrainState`（`2d` | `3d-terrain(loading|active)` | `2d-fallback`）で表現し、不正な中間状態を排除。
- **失敗時自動フォールバック**:
  - DEM タイルの取得失敗（オフライン・プロバイダ障害・CORS ブロック）や WebGL `setTerrain` 例外を検知すると、`map.setTerrain(null)` で 3D を安全解除し、既存の国土地理院陰影タイル（`terrain-fallback-hillshade`、古地形レイヤーの `paleo-hillshade` とは独立）を用いた **2D＋陰影表示** へ自動退避する。訪問地点・LENS 接続・インスペクタ操作は一切阻害されない。
- **SVG 接続線・オーバーレイの 3D 追従**:
  - [`use-connection-lines.ts`](../../apps/web/src/app/review/use-connection-lines.ts) / [`use-historical-overlay.ts`](../../apps/web/src/app/review/use-historical-overlay.ts) / [`use-artifact-overlay.ts`](../../apps/web/src/app/review/use-artifact-overlay.ts) で `pitch` / `rotate` / `terrain` / `idle` イベントを再投影トリガーへ追加し、標高面上のマーカーと LENS 接続線がズレないように整合。

---

## 3. 国東・六郷満山 検証手順と採用判定チェックリスト

1. 地図ヘッダーの `⛰️ 3D地形 (PoC)` を ON にする。
2. 検証カードの `⛰️ 国東・六郷満山へ寄る` をクリック（宇佐神宮・御許山・熊野磨崖仏・両子寺・大分県立歴史博物館を俯瞰、`pitch: 56° / bearing: -16°`）。
3. 標高強調倍率（`1.0×` / `1.5×` / `2.2×`）と `2Dへ戻す` を往復しつつ、以下を実地確認する：

- [ ] **山岳信仰・修験・移動経路の理解**: 宇佐神宮（里宮）と御許山（山宮 647m）、両子山（721m）を中心とした放射状開析谷・熊野磨崖仏の地形的文脈が 2D＋陰影より明確に読み取れるか。
- [ ] **ラベル・LENS 線視認性**: `usa-rokugo-syncretism-preset`（宇佐・六郷満山）選択時に、訪問地点ピン・ラベル・LENS 接続線が地形起伏や斜角によって過度に重ならず操作可能か。
- [ ] **性能・外部依存の許容性**: PoC パネルに表示される DEM 読込時間（ms）と操作レスポンスが許容範囲か。オフライン／エラー時に 2D 陰影へ滑らかにフォールバックするか。

> 条件を満たさなければ `2D + hillshade`（および既存の STRATIGRAPHY 垂直断面・聖地7項目層序プロファイル）を正本として維持し、本格 3D の常設化は見送る。
