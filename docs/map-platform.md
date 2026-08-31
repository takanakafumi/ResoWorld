# Map platform

## Decision

ResoWorldの地図描画にはMapLibre GL JSを使う。背景地図とLENSデータを分離し、背景プロバイダーを交換しても訪問記録・系譜・ルート・仮説データが変わらない構造にする。

```text
MapLibre GL JS
  ├─ Basemap source
  │    ├─ PoC: online raster tiles
  │    └─ Future: regional PMTiles
  └─ Local GeoJSON overlays
       ├─ visited spots
       ├─ selected connections
       ├─ exploration suggestions
       └─ Wajinden route hypotheses
```

## Current provider

既定値はOpenStreetMap標準ラスタータイルである。URLと帰属表示は次の公開環境変数で交換できる。

```dotenv
NEXT_PUBLIC_MAP_TILE_URL=https://tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_MAP_TILE_ATTRIBUTION=© OpenStreetMap contributors
```

APIキーなどの秘密情報を`NEXT_PUBLIC_`変数へ設定してはならない。キーが必要なプロバイダーを採用する場合は、ドメイン制限された公開キー、サーバー側プロキシ、またはプロバイダー推奨方式を別途設計する。

## Data boundary

背景プロバイダーへ送られるのは、ブラウザが要求するタイル座標、通常のHTTP情報、IPアドレスである。旅行記本文、Claim、LENSのGeoJSON、選択中のノードは送信しない。

ただしタイル座標から閲覧範囲は推定可能である。完全なローカル性が必要な利用ではオンライン背景を使わず、地域別PMTilesへ切り替える。

## OpenStreetMap policy

OpenStreetMap標準タイル利用時は、可視の帰属表示、ブラウザキャッシュ、通常の対話的表示を守る。バルク取得、オフライン用の事前取得、過剰利用を行わない。公開・大規模利用の前に専用プロバイダーまたは自前PMTilesへ切り替える。

- Tile policy: https://operations.osmfoundation.org/policies/tiles/
- Copyright and attribution: https://www.openstreetmap.org/copyright

## PMTiles migration

PMTiles本体は大きいためGitへ含めない。将来は次だけを追跡する。

- 対象地域・ズーム範囲を記したmanifest
- 取得元とデータ日時
- ファイルハッシュ
- ダウンロードまたは抽出スクリプト
- MapLibre style、font、spriteの版

`.pmtiles`ファイルは`data/maps/`などGit管理外のローカル領域へ置く。オンライン背景と同じMapLibreコンポーネントへ、異なるSourceとして接続する。

## Google Maps

Google MapsはPlaces検索やStreet Viewが必要になった場合の追加プロバイダー候補とする。LENSの中核依存にはせず、Google Mapsを使わない環境でも訪問地点と仮説レイヤーを表示できる状態を維持する。
