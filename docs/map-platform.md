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

## Interaction invariant

背景地図やLENSを切り替えても、訪問地点を選び、その地点に接続するConnectionと根拠へ戻れる操作を失ってはならない。LENSは訪問マップを置き換える別画面ではなく、訪問地点・選択中Connection・知識レイヤーを同じ地理面へ重ねる表示モードとして扱う。

- `訪問マップ`へ常に1クリックで戻れる。
- LENS表示中でも訪問地点を選択でき、地点名と接続テーマをその場で確認できる。
- 密集地点は点で残し、選択中・接続中の地点だけラベルを展開する。
- 選択中Connectionの線とLENS固有の線は、異なるレイヤーと凡例で区別する。
- 背景タイルの読み込み完了を、訪問地点・次候補・ローカルConnectionの初期化条件にしない。背景が遅延・停止してもアプリのオーバーレイは操作可能にする。

## Data transport

現在のMapLibre実装では、背景プロバイダーへタイル座標、通常のHTTP情報、IPアドレスが送られ、旅行記本文、Claim、LENSのGeoJSONはブラウザ内で重ねる。これは現在の実装方式であり、製品全体の送信禁止要件ではない。

将来の同期、サーバー検索、共同利用、AI分析では、構成されたワークフローに応じて旅行記、Claim、LENS、選択状態、Derived Synthesisをサーバーへ送信・保存できる。背景地図プロバイダーと分析・同期プロバイダーは別の接続として管理する。

完全なローカル性が必要な利用では、地域別PMTilesとローカル分析を選択できる状態も維持する。

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

## 古地形の最小PoC

古海岸線は独立LENSや3D地形として始めず、MAPの共通時代レイヤーとして扱う。最初の対象は北部九州だけとし、画面では「古地形を重ねる（推定）」のON/OFFと仮想海抜の比較だけを提供する。

- 陰影は国土地理院の`hillshademap`タイルを薄く重ねる。
- 推定水域は国土地理院DEM10Bで現在海域と連続する低地から現在海域を除いて抽出する。仮想海抜+3m・+5m・+10mを比較できる生成済み透過PNGマスクを使い、切替時も地図範囲を維持する。
- ON/OFFでは現在の地図範囲を変更せず、ユーザーが見ている場所を保つ。
- アプリ起動時や表示切替時にDEM計算を行わない。
- 堆積、隆起・沈降、河道変化、干拓・埋立を補正した学術的復元ではないことを常に表示する。
- 訪問地点とConnectionは古地形レイヤーより前面に保つ。
- 仮想海抜は見た目を比較する実験値であり、歴史的海面の復元値としてKnowledgeに昇格させない。時代スライダーと3D Terrainは、体験上の有効性を確認するまで追加しない。

生成コマンドは`pnpm --dir apps/web generate:paleo-water`。出力GeoJSONと生成スクリプトを追跡し、元DEMタイルは保存しない。
