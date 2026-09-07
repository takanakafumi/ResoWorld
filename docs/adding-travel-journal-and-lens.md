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
- subject、predicate、objectが妥当か。
- 観察、伝承、史料、ユーザー仮説、AI整理が区別されているか。
- Historical timeとPlace roleを原文から無理に確定していないか。
- Evidence quoteからClaimへ戻れるか。
- 重複Claimや、表示価値の低い細粒度Claimを整理したか。

レビュー状態の変更は、内容が外部史料で検証済みであることとは別に扱う。

## 6. 地点候補を確認する

1. Claimの`places`から地点名候補を抽出する。
2. 地名検索結果は候補としてキャッシュする。
3. 同名地、人物名、広域地名、旧地名を自動確定しない。
4. 自治体、施設種別、周辺地名、座標を確認する。
5. `candidate / confirmed / rejected`を設定する。
6. 未確認地点を仮座標で地図へ置かない。

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
- 地点が複数あるという理由だけでConnectionを作らない。
- Connectionは2地点以上と、その関係を直接支える根拠Claimを参照する。
- 移動線は訪問順序が確認できる場合だけ作り、テーマ接続とは別種として扱う。
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

- 1地点ずつ検索し、1秒あたり1リクエストを超えない。
- 検索結果はGit外のローカルディレクトリへキャッシュする。
- 複数候補から人が選び、`status: candidate` としてJourney登録Review Draftへ保存する。
- 候補選択だけでAtlasの確定座標を上書きしない。
- 同名地、旧地名、広域概念は旅行記の文脈と地図を見て確認する。
- 公開Nominatim以外へ切り替えられるよう、エンドポイントとUser-Agentは環境設定に置く。
- 旅行記本文やClaim全文は送らず、検索対象の地名だけを送る。

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

UIは次を満たす。

- 現在の探索範囲に接続がないLENSで、登録順の先頭Topicや既存の固定テーマを代替表示しない。未接続の空状態を示す。
- 対象や時代の名前を独立LENSタブとして重複表示しない。例えば「幕末」は「政治・社会」のTopicとして切り替え、専用入口を増やさない。
- 人物群も対象名をLENS名にせず、「人物」のような再利用可能な観点へ登録する。「維新志士」はその配下のTopicとして扱う。
- LENS内の文脈説明、構造図、凡例、選択詳細は内容高の通常フローで並べる。図だけを残余高へ押し込んで説明と重ねず、情報量が増えた場合はLENSパネル内部をスクロールさせる。
- PCではMAPとLENSを並べて保ち、構造図を読む場面ではLENS側を広くする。ユーザーが「並列」と「図を広く」を切り替えられるようにし、内容量によってMAPの外枠サイズを暗黙に変えない。
- LENS自体の幅が十分なら構造図と選択詳細を左右に並べ、狭い場合は上下へ戻す。画面全体の幅ではなくLENSコンテナ幅を基準にし、図と説明を同時に読める範囲だけ左右配置する。

- 複数のMAP接続は全体を薄く表示し、選択中の関係を色、太さ、線種のいずれかで強調する。
- MAP上の入力優先順位は、未選択の訪問地点、操作ボタン、接続線、装飾背景の順に保つ。選択中マーカーや時代レイヤーの説明背景は、重なった未選択地点のクリックを奪わない。
- 接続線のクリック領域は可視viewportへクリップし、画面外の端点を含む巨大な境界ボックスを作らない。
- LENS・MAP rendererは特定の人物名・地名・Pack IDで表示対象を判定せず、Projection結果を描画する。
- Relation familyや観点の違いを視覚的に区別する。
- ノードから訪問地点へ、訪問地点からノードへ往復できる。
- 該当する自分のClaimとEvidence Graphへ戻れる。
- 外部Knowledge PackのSourceを折りたたんで確認できる。
- Knowledge Pack由来と旅行記由来を文章でも区別する。
- 小さい文字を増やしすぎず、詳細情報は折りたたむ。
- 個別Journey選択時に、別Journey専用LENSを残さない。
- 選択中Spotに接続するTopicを優先し、同じJourneyの候補を次順位にする。
- 該当Topicがない場合は無関係なテーマを固定表示しない。

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
