# 旅行記追加とLENS更新の運用手順

## 目的

この文書は、新しい旅行記をResoWorldへ追加し、地図・Journey・既存LENSへ反映し、必要な場合だけKnowledge PackやLENSを更新するまでの標準手順を定める。

旅行記の追加は、原則としてアプリコードの変更を必要としない。LENSは旅行記ごとの専用画面ではなく、複数の探索に再利用できる見方として追加・更新する。

## 変えてよいものと正本

| 対象 | 位置づけ | 更新方針 |
| --- | --- | --- |
| 原文Document・Passage | ユーザー探索の正本 | 外部知識やAIで上書きしない |
| Claim・Evidence | ユーザー探索の正本 | 候補を人が確認し、根拠を保持する |
| Knowledge Pack | 外部基礎知識の正本 | Source、Assertion、観点、版を保持する |
| Journey | 表示範囲を束ねるRead Model | Document、Spot、ConnectionのIDを参照する |
| Atlas・Connection・NEXT | 派生Read Model | 正本から再生成可能な状態を保つ |
| LENS図・ノード配置・色 | Projection / UI | EntityやAssertionへ表示都合を混ぜない |

## 全体フロー

```text
旅行記をローカルへ配置
  → Passageプレビュー
  → Claim候補抽出
  → 既存DatasetへDraft統合
  → Claimレビュー
  → 地点候補の確認
  → AtlasとJourneyへ登録
  → 既存LENSとの接続確認
       ├─ 十分に見える          → LENS変更なし
       ├─ 同じ見方の知識が不足  → Knowledge Pack / Preset更新
       └─ 異なる見方が必要      → 新規LENSを検討
  → Review画面と根拠往復を検証
```

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

1. 現在のPoCでは、長文旅行記はCodex CLIを第一候補とする。
2. Ollamaはローカル比較・短いバッチに利用できるが、JSON失敗と過剰抽出を前提に確認する。
3. OpenAI APIなど外部プロバイダーを使う場合は、送信範囲と同意を画面で確認する。
4. 抽出結果はすべて候補であり、自動的に事実またはReviewedへ昇格させない。
5. Quote、行範囲、Document ID、Passage hashはアプリが原文から復元した値を使う。

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

## 8. LENSを変更するか判断する

旅行記を追加しても、まず既存LENSへ探索記録を重ねる。次の順番で判断する。

### A. LENSを変更しない

次の場合は地図、Claim、Evidence、Journeyだけで受け入れる。

- Knowledge Packがなくても訪問の基本体験が成立する。
- 既存LENSのEntityと旅行記ClaimがIDで接続できる。
- 新しい内容が既存Presetの範囲で読める。
- 一旅行だけにしか使わない装飾や分類である。

### B. 既存Knowledge PackまたはPresetを更新する

次の場合は新規LENSを作らず、既存パックを更新する。

- 同じ問い・関係分類のままEntityやAssertionが不足している。
- 周辺人物、場所、史料、異説を追加すると既存図が自然に広がる。
- 表示密度や展開深度、root Entityの調整で表現できる。
- 同じ基礎知識を別の切り口で見せるだけなので、新しいPresetで十分である。

### C. 新規LENSを検討する

次をすべて満たす場合に限る。

- ユーザーが再認識したい問いが既存LENSと明確に異なる。
- 系譜、ルート、習合、人物網、概念比較など、固有の関係構造がある。
- 複数の訪問または今後の探索でも再利用できる。
- 地図・通常Connectionだけでは主要な関係を読みにくい。
- 新しいコア型や行先別条件分岐を追加せず、Knowledge PackとProjectionで表現できる。

「新しい旅行先だから」「新しい人物名が出たから」だけでは新規LENSを作らない。

## 9. Knowledge Packを追加・更新する

1. LENSが答える問いと、表示しない範囲を一文で定義する。
2. Source候補を集める。原典、公的資料、研究資料を優先する。
3. Sourceは`candidate`から始め、該当箇所まで確認して`reviewed`にする。
4. Entityへ安定ID、表示名、別名、種別を付ける。
5. Assertionへsubject / predicate / object、relation family、viewpoint、Source、確度、レビュー状態を付ける。
6. 歴史関係、系譜、習合、分類、概念比較、比定、異説を同じ線へ混ぜない。
7. 競合仮説は削除せず、viewpointまたはhypothesis groupで並存させる。
8. パック版を更新する。既存版を無言で上書きしない。
9. Presetのroot、relation family、viewpoint、展開深度を定義する。
10. Projectionテストで、必要ノード・線・Source・review statusを確認する。

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

UIは次を満たす。

- 選択中の関係を色、太さ、線種のいずれかで強調する。
- Relation familyや観点の違いを視覚的に区別する。
- ノードから訪問地点へ、訪問地点からノードへ往復できる。
- 該当する自分のClaimとEvidence Graphへ戻れる。
- 外部Knowledge PackのSourceを折りたたんで確認できる。
- Knowledge Pack由来と旅行記由来を文章でも区別する。
- 小さい文字を増やしすぎず、詳細情報は折りたたむ。
- 個別Journey選択時に、別Journey専用LENSを残さない。

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
pnpm build
```

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
