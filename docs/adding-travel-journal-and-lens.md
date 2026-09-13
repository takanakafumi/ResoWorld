# 旅行記追加とLENS更新の運用手順

## 目的

この文書は、新しい旅行記をResoWorldへ追加し、地図・Journey・既存LENSへ反映し、必要な場合だけKnowledge PackやLENSを更新するまでの標準手順を定める。

旅行記の追加は、原則としてアプリコードの変更を必要としない。LENSは旅行記ごとの専用画面ではなく、複数の探索に再利用できる見方として追加・更新する。

## 迷ったら、この6段階に戻る

旅行記追加から画面反映までの標準ライフサイクルは次の一方向とする。

```text
1. 旅行記を追加する
   ↓
2. LLMで構造化Draftを作る
   ↓
3. 既存Knowledge・既存LENSへ接続する
   ↓
4. 不足するKnowledgeを調査・確認して補う
   ↓
5. 必要な場合だけPresetまたはLENSを更新・追加する
   ↓
6. Projectionから地図・LENS・GUIへ反映する
```

| 段階 | 主な処理 | 成果物 | 必須か |
| --- | --- | --- | --- |
| 1. 旅行記追加 | 原文を非公開Import領域へ置き、Passageを確認する | Document / Passage | 必須 |
| 2. LLM構造化 | Claim、Evidence、地点、人物・神・概念・時代、問いを候補化する | Review Draft | 必須 |
| 3. 既存体系へ接続 | 安定Entity IDで既存Knowledgeと照合し、Spot・Journey・既存LENSへ重ねる | Exploration Dataset / Atlas | 必須 |
| 4. Knowledge補完 | 不足Entity・Assertion・Source・MAP接続を調査し、人が確認する | Knowledge Packの新しい版 | 不足がある場合だけ |
| 5. LENS判断 | 既存Preset調整を優先し、再利用可能な別の問い・図法が必要な時だけ新規LENSを作る | Preset / LENS設定 | 必要な場合だけ |
| 6. 表示反映 | 正本と現在の選択からProjectionを再生成する | MapScene / Graph / Timeline / Suggestion | 原則自動 |

基本体験は段階3までで成立させる。Knowledge Packがない訪問も地図・Claim・Evidenceから消さない。段階4と5は基本体験を強化する任意工程であり、旅行記の取込完了条件にしない。

LLMが作るのは段階2のDraftと、段階4・5の候補までである。LLM出力を自動的に確認済みClaim、Reviewed Assertion、または正本へ昇格させない。

処理手段は[ADR-0009](./decisions/0009-route-processing-by-required-intelligence.md)に従い、決定的なローカルコード、ローカルLLM、Codexの順に必要最小限の段階を選ぶ。単純な集計や変換にLLMを使わず、大量抽出を最初からCodexへ渡さない。

### どこから再開するか

| 状況 | 再開する段階 |
| --- | --- |
| 新しい旅行記を受け取った | 1 |
| 旅行記はあるがClaim・地点が未整理 | 2 |
| Claimはあるが既存LENSに訪問が現れない | 3 |
| 接続先の人物・神・場所・関係がKnowledge Packにない | 4 |
| 基礎知識はあるが現在の見方では問いを読めない | 5 |
| データはあるがMAP・LENSに表示されない | 6。Projectionと診断を確認する |

段階3と4を飛ばして新規LENSを作らない。新しい旅行先や人物名が増えただけでは、段階5へ進まない。

## 変えてよいものと正本

| 対象 | 位置づけ | 更新方針 |
| --- | --- | --- |
| 原文Document・Passage | ユーザー探索の正本 | 外部知識やAIで上書きしない |
| Claim・Evidence | ユーザー探索の正本 | 候補を人が確認し、根拠を保持する |
| Knowledge Pack | 外部基礎知識の正本 | Source、Assertion、観点、版を保持する |
| Journey | 表示範囲を束ねるRead Model | Document、Spot、ConnectionのIDを参照する |
| Atlas・Connection・NEXT | 派生Read Model | 正本から再生成可能な状態を保つ |
| LENS図・ノード配置・色 | Projection / UI | EntityやAssertionへ表示都合を混ぜない |

## 実務フロー（詳細）

```text
1 旅行記をローカルへ配置・Passage確認
  → 2 Claim候補抽出・Draft統合・人によるレビュー
  → 3 地点確認・Atlas / Journey登録・既存LENS接続
       ├─ 基本体験が成立        → 6 Projection表示を検証
       ├─ 基礎知識が不足        → 4 Knowledge Packを補完
       └─ 別の問い・図法が必要  → 5 Preset / LENSを判断
  → 6 Review画面・地図・LENS・根拠往復を検証
```

以下の章番号1〜12は、この6段階を実行するための詳細チェックリストである。

## 1. 旅行記を準備する

1. UTF-8の`.txt`として、設定済みの非公開Importディレクトリ直下へ置く。
2. 原文のバックアップを残す。
3. 氏名、連絡先、正確な生活行動、秘密情報など、処理に不要な情報がないか確認する。
4. 原文、写真、ローカルAtlas、生成途中のDatasetをGitへ追加しない。

現在はサブディレクトリ、Markdown、PDF、画像、音声の自動取込を行わない。

## 2. Passageを確認する

1. `/imports`で対象ファイルを選ぶ。
2. 文字化け、見出し分割、行範囲、Passage境界を確認する。
3. ファイルのSHA-256を記録し、プレビュー後に原文が変わった場合は再取込する。
4. AIへ渡すPassageを選択する。未選択部分は送信対象に含めない。

## 3. Claim候補を抽出する

1. Passage分割、ハッシュ、キャッシュ照合は決定的なローカルコードで行う。
2. Claim候補の大量抽出はOllamaを第一候補とし、現在の既定モデルは`qwen3.5:9b`とする。
3. JSON Schema、Evidence復元、参照整合性を検証し、失敗したバッチだけを再処理する。
4. 単一Passageまで分割しても完了しない、または評価品質を継続して満たさない範囲だけCodex CLIへ昇格できる。
5. OpenAI APIなど外部プロバイダーを使う場合は、送信範囲と同意を画面で確認する。
6. 抽出結果はすべて候補であり、自動的に事実またはReviewedへ昇格させない。
7. Quote、行範囲、Document ID、Passage hashはアプリが原文から復元した値を使う。

## 4. DatasetへDraft統合する

1. 「既存Datasetへ統合したDraftを保存」で、新しいファイルとして出力する。
2. 元Datasetを直接上書きしない。
3. Source SHA-256、Document ID、Claim ID、EvidenceのDocument境界を検証する。
4. 同一文書の再取込、本文変更、同一内容の別ID、Claim衝突を確認する。
5. 追加Document数とClaim数を記録する。

## 5. Claimをレビューする

最低限、次を確認する。

- Statementが原文の意味を過度に一般化していないか。
- 「A、B、Cを巡った」のようにClaimをまとめても、明示された訪問先が`places`へ1地点ずつ`observed_place`として残っているか。市町村などの代表地点だけへ丸めない。
- subject、predicate、objectが妥当か。
- 観察、伝承、史料、ユーザー仮説、AI整理が区別されているか。
- Historical timeとPlace roleを原文から無理に確定していないか。
- Evidence quoteからClaimへ戻れるか。
- 重複Claimや、表示価値の低い細粒度Claimを整理したか。

レビュー状態の変更は、内容が外部史料で検証済みであることとは別に扱う。

## 6. 地点候補を確認する

1. Claimの`places`から地点名候補を抽出する。
2. 原文で明示された訪問先一覧と地点候補を照合し、件数と名称の脱落がないことを確認する。
3. 地名検索結果は候補としてキャッシュする。
4. 同名地、人物名、広域地名、旧地名を自動確定しない。
5. 自治体、施設種別、周辺地名、座標を確認する。
6. `candidate / confirmed / rejected`を設定する。
7. 未確認地点を仮座標で地図へ置かない。

公共Nominatimを使う場合は、識別可能なUser-Agent、1 req/sec、結果キャッシュ、プロバイダー切替可能性を維持する。

## 7. AtlasとJourneyへ登録する

AtlasにはSpot、Connection、NEXTと、任意の`journeys`を保持できる。

Journeyは次のID参照だけを持つ。

```json
{
  "id": "journey-id",
  "label": "表示名",
  "documentIds": ["document-id"],
  "spotIds": ["spot-id"],
  "connectionIds": ["connection-id"]
}
```

登録時の確認事項：

- Journey IDは地域名の表示変更に依存しない安定IDにする。
- 一つの旅行が複数Documentなら同じJourneyへ束ねる。
- 再取込時はJourney IDだけでなく、順序によらない同一の`documentIds`集合も同一探索の候補として照合する。一意なら既存の安定ID・Connectionを維持して更新し、複数一致なら自動統合しない。
- 過去の取込で同一`documentIds`集合のJourneyが重複した場合は、`pnpm consolidate:journeys -- <Atlasの絶対パス>`でバックアップを作成してからSpot・Connection参照を統合する。
- `visited`として登録するSpotは、訪問を直接支えるClaimを1件以上参照する。位置だけ確認できても、根拠Claimがない地点はAtlas更新Draftへ入れない。
- 旅行記にない訪問が後の対話や確認で判明した場合は、既存の別Claimへ推測で接続しない。ユーザーの追記メモをDocument / Passage / observation Claimとして保持してからSpotへ接続する。
- 追記メモはLLMへ送らず、ユーザー自身の記述を`personal-evidence`のObservation Claimとして決定的に生成する。同じ本文の再適用は重複登録しない。
- 追記メモ本文、Knowledge Dataset、Atlasはバックアップ付きの一操作で保存し、途中失敗時はDatasetとAtlasを更新前へ戻す。
- 追記先が既存Spotなら、そのSpotとJourneyへ根拠を直接追加する。
- 地図にない新規地点なら、根拠をDatasetへ保存したうえで一地点の`*.journey-candidate.json`を生成し、通常の位置候補確認へ送る。位置を推測してAtlasへ直接追加しない。
- 新規地点の位置確認とAtlas反映は、旅行記インポートと同じレビュー・バックアップ経路を再利用する。手動追記専用の地図更新経路は増やさない。
- 地点が複数あるという理由だけでConnectionを作らない。
- Connectionは2地点以上と、その関係を直接支える根拠Claimを参照する。
- 移動線は訪問順序が確認できる場合だけ作り、テーマ接続とは別種として扱う。
- 訪問順は個別Journeyを選んだ時だけ表示し、`すべて`やLENSの知識接続集計へ混ぜない。
- 判断できない場合は`no_connection`を選び、SpotだけをJourneyへ登録する。
- Journeyが未知のDocument、Spot、Connectionを参照していないことを確認する。
- `すべて`と個別Journeyの双方で地点、接続線、NEXT、LENS候補が正しく切り替わることを確認する。

PoCではAtlasを非公開JSONとして保持してよい。原文と同様にGitへ追加しない。

## 8. 補完が必要かを分岐判定する

旅行記を追加しても、まず既存LENSへ探索記録を重ねる。ここでは段階3の終了時点で、Knowledge補完が必要かを仮判定する。LENSを更新するかの最終判断は、必要なKnowledgeを補った後に行う。

### A. LENSを変更しない

次の場合は地図、Claim、Evidence、Journeyだけで受け入れる。

- Knowledge Packがなくても訪問の基本体験が成立する。
- 既存LENSのEntityと旅行記ClaimがIDで接続できる。
- 新しい内容が既存Presetの範囲で読める。
- 一旅行だけにしか使わない装飾や分類である。

### B. 既存Knowledge Packを補う

次の場合は段階4として既存パックを更新する。

- 同じ問い・関係分類のままEntityやAssertionが不足している。
- 周辺人物、場所、史料、異説を追加すると既存図が自然に広がる。

### C. Knowledge補完後にPresetまたはLENSを検討する

Knowledgeを補っても既存の見方では問いを読みにくい場合だけ段階5へ進む。表示密度、展開深度、root Entityの調整や新しいPresetで足りるなら、LENSは増やさない。新規LENSは次をすべて満たす場合に限る。

- ユーザーが再認識したい問いが既存LENSと明確に異なる。
- 系譜、ルート、習合、人物網、概念比較など、固有の関係構造がある。
- 複数の訪問または今後の探索でも再利用できる。
- 地図・通常Connectionだけでは主要な関係を読みにくい。
- 新しいコア型や行先別条件分岐を追加せず、Knowledge PackとProjectionで表現できる。

「新しい旅行先だから」「新しい人物名が出たから」だけでは新規LENSを作らない。

## 9. Knowledge Packを追加・更新する

1. 補いたい問いと、今回扱わない範囲を一文で定義する。
2. Source候補を集める。原典、公的資料、研究資料を優先する。
3. Sourceは`candidate`から始め、該当箇所まで確認して`reviewed`にする。
4. Entityへ安定ID、表示名、別名、種別を付ける。
5. Assertionへsubject / predicate / object、relation family、viewpoint、Source、確度、レビュー状態を付ける。
6. 歴史関係、系譜、習合、分類、概念比較、比定、異説を同じ線へ混ぜない。
7. 競合仮説は削除せず、viewpointまたはhypothesis groupで並存させる。
8. パック版を更新する。既存版を無言で上書きしない。
9. Presetのroot、relation family、viewpoint、展開深度を定義する。
10. 関係図へ出す種別を`visibleEntityKinds`、MAPへ出す地点列と根拠Assertionを`mapConnections`で宣言する。
11. 既存LENSの新しいTopicとして使う場合は、Knowledgeレジストリへperspective、Pack、Preset、rendererを登録する。Resolverへ旅行先別の分岐を追加しない。
12. Projectionテストで、関係図へ不要な場所が混入しないことと、MAP接続からSource・confidence・review statusへ到達できることを確認する。

WebやAIの調査結果を、そのままReviewed Assertionへしない。旅行記由来Claimと外部Assertionは別の正本として保持する。

## 9.5. 地名を位置候補へ解決する

Import画面のJourney Reviewで、必要な地点だけ「候補を検索」を押す。検索語はボタンを押した時だけNominatimへ送信し、入力中の自動検索や全地点の一括検索は行わない。

- 複数Documentを一つのJourney候補へ束ね、同じ地点候補のroleとClaim参照を統合する。
- 各候補を先に「訪問済み」「言及のみ」「古代地名・比定候補」「地図から除外」へ分類する。
- `observed_place`から提案した「訪問済み」も自動確定ではなく、人が変更できる初期値として扱う。
- 現代地図の位置検索を表示するのは「訪問済み」だけとし、古代地名や比定説を一点座標へ潰さない。
- 1地点ずつ検索し、1秒あたり1リクエストを超えない。
- 検索結果はGit外のローカルディレクトリへキャッシュする。
- 複数候補から人が選び、`status: candidate` としてJourney登録Review Draftへ保存する。
- 候補選択だけでAtlasの確定座標を上書きしない。
- 選択した位置候補はAtlas反映前プレビューで同時表示し、取り違えや遠方への誤解決を地図上で確認する。プレビューからConnectionは生成しない。
- 同名地、旧地名、広域概念は旅行記の文脈と地図を見て確認する。
- 市町村・地域名そのものは`area-context`として保持し、訪問した施設・史跡を`visited-place`として分ける。地域中心点を訪問スポットの代わりに表示しない。
- 公開Nominatim以外へ切り替えられるよう、エンドポイントとUser-Agentは環境設定に置く。
- 旅行記本文やClaim全文は送らず、検索対象の地名だけを送る。
- 分類と選択座標は一つのReview Draftへ保存し、Atlasへの反映は別工程で行う。
- 保存済みReviewを既存Atlasへ安定Entity ID、次に正規化名称で照合する。一意に一致するSpotは再利用し、未一致の訪問地点だけ位置検索へ回す。同名Spotが複数ある場合は自動再利用しない。
- Review Draftは設定済みのGit管理外Review領域へ原子的に保存し、同じJourney候補を再度開いたときに復元する。JSONダウンロードは持ち運び用の補助手段とする。
- 保存時はJourney ID、Document、地点名、role、Claim参照が元のJourney候補と一致することを検証し、候補の差し替えや古いDraftの混入を拒否する。
- 未解決の訪問地点が0件になった場合だけAtlas更新Draftを生成する。既存Spot ID、新規`positionStatus: candidate` Spot、座標を持たない古代候補を分け、正本Atlasへの適用は次の確認工程に残す。
- Atlas適用プレビューでは、再利用Spotへ今回のClaim IDを追記し、新規候補SpotとJourneyを追加する。Connectionは空のまま開始し、根拠を確認した別工程でのみ追加する。
- 正本適用時は直前Atlasを同じGit管理外ディレクトリへバックアップし、Reviewから差分を再構築してAtlasスキーマを検証した後だけ原子的に置換する。行政区域や地形の代表点は施設Spotと区別できる`kind`を付け、候補状態を維持する。
- 「古代地名・比定候補」は現代地図のSpotへせず、対象Knowledge PackのEntityへ別工程で解決する。正規化した完全一致を優先し、それがない場合だけ別名・部分一致を補助に使う。複数一致または未一致が1件でもあれば正本へ適用しない。
- Entity解決では、抽出時の暫定Entity IDをPackの安定IDへ置換する。すでに別の安定IDを持つ施設・人物・場所は、名称が部分一致しても変更しない。Claim本文、Evidence、解釈状態は変更せず、適用前Datasetをバックアップし、解決DraftをGit管理外Review領域へ残す。
- Pack Entityへの同定と、Entity間のAssertion作成を分ける。例えば「投馬国」を記録順へ表示しても、不弥国・投馬国・邪馬台国の経路解釈を確認するまでは確定Connectionを自動生成しない。

必要なローカル設定：

```dotenv
RESOWORLD_GEOCODING_ENABLED=true
RESOWORLD_GEOCODING_CACHE_DIR=<Git管理外の絶対パス>
RESOWORLD_NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
RESOWORLD_NOMINATIM_USER_AGENT=ResoWorld-PoC/0.1 (+https://github.com/takanakafumi/ResoWorld)
```

利用時は[Nominatim Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)と[Search API](https://nominatim.org/release-docs/latest/api/Search/)を確認し、OpenStreetMap attributionを表示する。大量データの自動ジオコーディングには公開エンドポイントを使わず、別プロバイダーまたは自前運用を選ぶ。
## 10. LENS UIを追加・更新する

LENSは観点、Topicは対象として扱う。例えば「政治・社会」はLENSであり、「邪馬台国の政治構造」「長州藩の政治と近代化」はTopicである。現在のJourney・Spot・Claimから適用可能なTopicを解決し、複数ある場合は切り替えて表示する。LENS選択だけを理由に一つのPackを固定表示しない。

トップレベルの基本集合は「神・系譜」「宗教」「ルート」「政治・社会」「人物」とする。時代は共通軸、地形はルート・MAP、聖域は宗教、学説差は各LENS内の比較として扱い、入口の数を増やさない。

UIは次を満たす。

- LENSタブの表示可否はAtlas Connectionの有無だけで決めず、現在のJourneyのClaim・Spotが登録Knowledge Pack / Topicへ接続できるかで決める。根拠確認前でConnectionが0件の新規Journeyでも、安定Entityへ接続済みなら対応LENSを表示する。
- 適用可否はPresetの`rootEntityIds`を入口とし、Claimの主語または訪問場所との直接接続で判定する。目的語・周辺文脈で名前が言及されただけのTopicは表示せず、Atlas Connectionのfacetで未接続LENSを代替表示しない。
- 表示中の訪問地点同士で成立するKnowledge Pack由来のMAP接続は、Overviewでも薄く表示する。未訪問地点、具体的な外部参照地点、広域仮説を含む接続はLENS別Registryから選び、対応LENSでだけ投影する。
- 複数Journeyを横断する構造化はLENSが担当する。Journey選択と重複する比較カードや専用パネルを追加しない。
- 現在の探索範囲に接続がないLENSで、登録順の先頭Topicや既存の固定テーマを代替表示しない。未接続の空状態を示す。
- 対象や時代の名前を独立LENSタブとして重複表示しない。例えば「幕末」は「政治・社会」のTopicとして切り替え、専用入口を増やさない。
- 人物群も対象名をLENS名にせず、「人物」のような再利用可能な観点へ登録する。「維新志士」はその配下のTopicとして扱う。
- 既存LENSと問いまたは図法が異なるだけでは新規LENSにしない。両方が異なり、複数Topicで再利用でき、独立入口が必要な場合だけ追加する。
- LENS内の文脈説明、構造図、凡例、選択詳細は内容高の通常フローで並べる。図だけを残余高へ押し込んで説明と重ねず、情報量が増えた場合はLENSパネル内部をスクロールさせる。
- PCではMAPとLENSを並べて保ち、構造図を読む場面ではLENS側を広くする。ユーザーが「並列」と「図を広く」を切り替えられるようにし、内容量によってMAPの外枠サイズを暗黙に変えない。
- LENS自体の幅が十分なら構造図と選択詳細を左右に並べ、狭い場合は上下へ戻す。画面全体の幅ではなくLENSコンテナ幅を基準にし、図と説明を同時に読める範囲だけ左右配置する。

- 複数のMAP接続は全体を薄く表示し、選択中の関係を色、太さ、線種のいずれかで強調する。
- MAP上の入力優先順位は、未選択の訪問地点、LENS参照マーカー、操作可能な接続線、装飾背景の順に保つ。重なり順は状態別の見た目ルールへ分散させず一か所で定義し、選択中マーカーや時代レイヤーの説明背景も、重なった未選択地点のクリックを奪わない。
- 接続線のクリック領域は可視viewportへクリップし、画面外の端点を含む巨大な境界ボックスを作らない。
- 接続線の端点保護幅は画面上の線長に応じて縮小し、短い線にも最小クリック区間を残す。訪問地点との重なりはz-indexとクリック時の地点判定で地点側を優先する。
- LENS・MAP rendererは特定の人物名・地名・Pack IDで表示対象を判定せず、Projection結果を描画する。
- Relation familyや観点の違いを視覚的に区別する。
- ノードから訪問地点へ、訪問地点からノードへ往復できる。
- 訪問地点の周辺Knowledgeは、Spot名の直接一致に加え、そのSpotに属するClaimの安定Entity IDから解決する。画面では「地点そのものから」か「この場所の記録から」かを示し、Journey内の古代候補を全地点へ一律付与しない。
- 該当する自分のClaimとEvidence Graphへ戻れる。
- 外部Knowledge PackのSourceを折りたたんで確認できる。
- Knowledge Pack由来と旅行記由来を文章でも区別する。
- 小さい文字を増やしすぎず、詳細情報は折りたたむ。
- 個別Journey選択時に、別Journey専用LENSを残さない。
- 選択中Spotに接続するTopicを優先し、同じJourneyの候補を次順位にする。
- 該当Topicがない場合は無関係なテーマを固定表示しない。
- LENS末尾の「次の接続」は、選択LENSのfacetを持つConnectionへ`connectionIds`で接続されたSuggestionだけを投影する。問いと未確認点を先に示し、具体的な場所・資料名は補助情報として扱う。
- 具体候補は、`行けなかった場所`、Knowledge Connectionの先にある`未訪問地`、`資料調査`、`重大な見落としを補う再訪`の順に扱う。再訪を通常の観察補完として生成しない。
- 旅行記で訪問意図と未訪問が明示された場所は`intended_place`として抽出し、人が`行きたかった・未訪問`を確認する。訪問済みSpotへは混ぜず、Journeyの`unvisitedPlaces`に座標・根拠Claimとともに保持する。単なる地名言及や一般的な興味はこの扱いにしない。
- 未訪問候補は自由記述の地名ではなく、Knowledge PackのPlace ID・座標・Assertion・接続元Spotを持つ候補として生成する。候補座標を訪問済みSpotの重心で代用しない。
- SuggestionがないJourneyやLENSでは空の推薦枠を出さず、必要なら段階4のKnowledge補完後に、根拠ClaimとConnectionを持つSuggestionを追加する。

### ローカルLLMで「次の接続」の下書きを作る

既存ConnectionまでレビューしたJourneyでは、Ollamaを使ってSuggestion候補を作れる。これは大量の候補整理をローカルLLMへ任せる補助工程であり、LENS、Atlas、正本Datasetを自動更新しない。

`apps/web`で、先に入力件数だけを確認する。

```powershell
pnpm suggest:local -- --dry-run hagi yamatai
```

問題がなければJourney IDを指定して生成する。

```powershell
pnpm suggest:local -- hagi yamatai
```

- 入力は対象JourneyのSpot、知識Connection、`confirmed`または`needs_review`のClaim要約である。移動順を表す`itinerary` Connection、`rejected` Connection、`rejected` Claim、Evidence引用、旅行記全文、ユーザー名、ローカルファイルパスは送らない。知識ConnectionがないJourneyでは生成せず、先にConnectionをレビューする。
- 知識ConnectionはAtlasに保持された接続と、現在の訪問Spotすべてに対応するKnowledge Packの接続を共通Projectionとして束ねる。Pack接続をAtlasへ複製せず、同じ接続が複数LENSに属する場合はfacetを統合する。
- Connectionが参照するClaim、問い、仮説を優先し、最大60 Claimに絞る。これは文脈長の暴走を避ける処理上の上限であり、正本からClaimを削除するものではない。
- 出力は最大2候補とし、各候補は対象Journey内のClaim、Spot、Connection IDを最低1件ずつ参照する。未知IDと読者向け文章への内部ID混入は保存前に検査する。
- モデルには長い正規IDではなく、`C001`（Claim）、`S001`（Spot）、`K001`（Connection）の一時IDを渡し、検証前にサーバーで正規IDへ戻す。モデルがIDらしい文字列を新しく作っても正本へ採用しない。
- `needs_review`だけを根拠とする内容は不確実性として残す。ローカルLLMの文章は史実の確認済みAssertionとして扱わない。
- 下書きはGit管理外の`<RESOWORLD_REVIEW_DIR>/.resoworld/suggestion-drafts/<journey-id>.ollama.json`へ原子的に保存する。
- 読者向けの問いは自然な日本語で表現し、`構造上の空白`や`入力データ`など生成・編集工程の内部用語を露出させない。`この記録`や`この接続`のような参照先が曖昧な代名詞も避け、固有名詞か内容の短い言い換えを使う。保存前検証で検出した場合は再生成する。
- 問い末尾の疑問符欠落は意味を変えない表記揺れとして決定的に補正し、ローカルLLMの再試行を消費しない。
- 9Bモデルが意味上の品質ゲートを満たさない場合は最大3回までローカルで再生成する。品質基準を緩和して採用しない。
- Ollamaのthinking設定はモデル能力に合わせる。`qwen3.5:9b`は無効、構造化出力がthinking無効時に崩れる`gpt-oss:20b`は有効にする。生成・検証・採用の本体は共通化したままにする。
- ローカル提案生成は二段階とする。第一段階では短縮IDと行動種別だけを選び、第二段階では選択済みの固有名詞・Claim本文・接続概要だけから読者向け文章を作る。第二段階へ内部IDを渡さず、両段階の結果はコードで決定的に結合する。保存形式と採用APIは変更しない。
- 複数Journeyの一括生成ではJourneyごとに失敗を隔離する。一件が品質ゲートを通らなくても後続Journeyを処理し、最後に失敗終了コードを返す。
- 必須説明欄を`none`や`needs_review`等で埋めた候補、および質問文をそのままタイトルへ複製した候補は不採用として再生成する。
- 説明欄は短い完結文に制限し、文字数上限で途切れた文、`詳細情報を追加`、`旅行者`、`AIナレーター`等の生成工程由来の表現も不採用にする。
- 欄ごとの具体性も保存前に検証する。`missingInformation`は不足する史料・年代・展示等、`expectedObservation`は現地や資料で比較できる対象、`uncertainty`は解釈・伝承・比定・出典等の限界を明示する。一般的な「理解が深まる」だけでは採用しない。
- `/imports`の「次の接続候補を確認する」で、問いの有用性、根拠Claim、訪問地点、Connection、不確実性、具体的すぎないこと、外部Knowledge補完の必要性を確認する。候補は初期未選択とする。
- 納得できる候補だけを選んで「Atlasへ採用」を実行する。サーバーは下書きファイルと現在Datasetを再読込し、Journey内参照を再検証する。画面から文章や参照IDを差し替えて適用できない。
- 採用したSuggestionの座標はanchor Spotの重心、IDはJourneyと候補内容から決定的に生成する。同じ候補を再適用しても重複せず、Atlas更新前にはバックアップを作成する。
- 不採用候補を正本へ保存する必要はない。下書き品質に問題があれば採用せず、Claim・Connectionまたは生成条件を直して再生成する。

既存LENSと同じ表示で足りる場合は、専用コンポーネントを増やさずPresetまたは共通Projectionを再利用する。固有の図法が体験上必要な場合だけ専用UIを許容する。
現在の主な実装位置：

| 役割 | 位置 |
| --- | --- |
| Knowledge Pack schema・Projection | `apps/web/src/domain/lens-packs/` |
| Pack固有データとProjection test | `apps/web/src/domain/lens-packs/*-pack.ts`、`*-pack.test.ts` |
| LENS UI | `apps/web/src/app/review/*-lens.tsx` |
| WORLD LENSESへの登録・Journey scope | `apps/web/src/app/review/atlas-workspace.tsx` |
| 地図オーバーレイ | `apps/web/src/app/review/atlas-map.tsx` |

LENS更新時は、Issueへ次を残す。

```text
対象Journey:
ユーザーが再認識したい問い:
判断: 変更なし / 既存Pack更新 / Preset追加 / 新規LENS
追加・変更したEntityとAssertion:
確認したSourceと該当箇所:
旅行記Claimとの接続方法:
競合仮説・不確実性:
Pack version:
画面とテストの確認結果:
```

## 11. 検証する

最低限、`apps/web`で次を実行する。

```powershell
pnpm typecheck
pnpm lint
pnpm test -- --run
pnpm test:ui
pnpm build
```

`pnpm test:ui`は匿名fixtureで実行し、少なくともMAP/LENSの幅切替と、構造図・凡例・説明が重ならないことを実ブラウザーで確認する。新しい図法や大きなLENSを追加した場合は、そのLENSを同じ回帰テストへ加える。

実データでは次も確認する。

- `/imports`で対象旅行記を選択できる。
- `/review`がHTTP 200で表示される。
- `すべて`の地点数が増えている。
- 新しいJourneyだけを選択できる。
- Journey切替で地図が対象地点へfitする。
- 地点選択、Connection線、LENS、Claim、Evidenceを往復できる。
- 出典折りたたみと不確実性表示が残っている。
- 既存Journeyと既存LENSがデグレしていない。

ブラウザー自動確認が利用できない場合は、その事実をIssueへ残し、HTTP、SSR、ビルド検証で代替した範囲を明記する。

## 12. 保存・同期する

GitHubへ同期するもの：

- アプリコード
- スキーマ、純粋変換、テスト
- 公開可能なKnowledge PackとSourceメタデータ
- 設計・運用文書

GitHubへ同期しないもの：

- 個人の旅行記と写真
- 非公開Dataset、Atlas、座標候補キャッシュ
- プロバイダーの生レスポンス
- APIキー、ローカルパス、個人情報

コミットまたはIssueには、入力件数、追加Claim数、地点候補数、Journey、LENS判断、検証結果を記録する。原文やEvidence quoteは必要がなければ記載しない。

## 完了条件

- 新しい旅行記がDocumentとClaimとして既存Datasetへ追加されている。
- ClaimからEvidenceへ戻れる。
- 確認済み地点だけが正しい位置に表示される。
- 新しいJourneyが`すべて`と個別表示の両方で使える。
- LENS変更の要否と理由が記録されている。
- LENSを変更した場合、Source・Assertion・旅行記Claimの由来が区別されている。
- 自動検査と実画面確認の結果が残っている。
- 非公開データがGit差分へ含まれていない。

## 関連文書

- [ローカル文書取込](./local-import.md)
- [Claim抽出・評価](./claim-extraction.md)
- [Evidence Graph review](./evidence-graph-review.md)
- [LENS基礎知識パック](./lens-knowledge-packs.md)
- [データ・構造設計ポリシー](./data-structure-policy.md)
- [正本の境界](./source-of-truth.md)
