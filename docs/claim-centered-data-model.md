# Claim中心データモデル

## 1. なぜClaimを中心にするか

EntityとRelationだけのモデルでは、表示された関係が、観察、史料、伝承、本人の仮説、AIの推論のどれに由来するか分からなくなる。

ResoWorldでは、世界について述べられた一つの主張を `Claim` として保持し、その主張が参照するEntity、根拠、時間、場所、生成元、レビュー状態を記録する。

```text
Document
  └─ Passage
       └─ Claim
            ├─ Entity references
            ├─ Evidence
            ├─ Source nature
            ├─ Time scope
            ├─ Place scope
            ├─ Origin
            └─ Review status
```

Graph上のRelationは、Claimから導出される表示または索引であり、根拠を持たない独立した線にはしない。

## 2. 中核オブジェクト

### Document

旅行記、メモ、資料、AIとの対話、写真説明など、取り込んだ原資料を表す。

```text
id
title
document_type
file_path
author_type
documented_at
privacy_level
content_hash
```

### Passage

Claimの根拠として引用できる、Document内の位置付き断片。

```text
id
document_id
start_offset
end_offset
text
section_path
```

行番号だけに依存すると原文編集でずれるため、文字オフセットと内容ハッシュの利用を検討する。

### Entity

複数のDocumentやClaimから参照される対象。

PoC初期の型：

```text
Place
Person
Group
Deity
Event
Period
Belief
Artifact
Concept
```

型を過度に固定せず、別名、同一候補、分離候補を保持する。

### Claim

原文または推論が述べている、世界についての最小限の主張。

```text
id
subject_entity_id
predicate
object_entity_id | literal_value
qualifiers
source_nature
origin_type
review_status
created_at
```

`qualifiers`には、テーマ、否定、程度、条件、歴史上の時間範囲、場所範囲などを持たせる。

Claimは必ず一つ以上のEvidenceを持つ。ただし、AIが文書横断で生成した候補は、複数のEvidenceと推論説明を持てる。

### Evidence

Claimを支持または反証する根拠。

```text
id
claim_id
passage_id | source_id
evidence_role
note
```

`evidence_role`の例：

```text
supports
contradicts
context
```

### Source

旅行記外の書籍、論文、史料、展示、Webページなどを表す。

PoCでは書誌情報を完全に正規化せず、タイトル、URL、閲覧日、メモを保持できればよい。

## 3. 情報の性質

`source_nature`は、真偽の点数ではなく、情報がどのように得られたかを表す。

```text
Observation       現地で本人が観察した
HistoricalSource  文献・史料に由来する
Archaeology       発掘・遺物・考古学的説明に由来する
Tradition         由緒・神話・伝承として語られている
UserHypothesis    ユーザー自身の仮説
Alternative       異説・周縁的解釈
AISuggestion      AIが生成した接続・問い・候補
```

同じ内容に複数の性質が関係する場合、Claimを分けるか、Evidence単位で由来を記録する。単一のラベルへ無理に押し込めない。

## 4. OriginとSource Natureを分ける

`origin_type`は、そのClaim表現を誰・何が生成したかを表す。

```text
user
ai
imported
system
```

例えば、AIが「展示にこう書かれていた」という旅行記の文章からClaimを抽出した場合、次のように区別する。

```text
origin_type: ai
source_nature: Archaeology
```

これは「AIが考古学的事実を新しく作った」という意味ではない。AIは構造化処理の実行者であり、Claimが述べる根拠の性質は考古学である。

一方、AIが複数文書から新しい比較軸を提案した場合は次のようになる。

```text
origin_type: ai
source_nature: AISuggestion
```

## 5. Review Status

PoC初期は次の状態を使う。

```text
suggested
confirmed
rejected
needs_review
```

`confirmed`は歴史的真実を保証する状態ではない。「このClaimが、この情報の性質と根拠を伴ってグラフへ載ることをユーザーが確認した」という意味に限定する。

## 6. 時間モデル

次の時間を分離する。

```text
observed_at       現地で観察した時点
documented_at     文書へ記録した時点
historical_start  Claimが対象とする歴史期間の開始
historical_end    Claimが対象とする歴史期間の終了
period_label      弥生、古墳、奈良、中世などの表示用分類
```

神話時代、不明、複数時代にまたがる継承などを、西暦へ無理に変換しない。

## 7. 空間モデル

Place Entityは現在の座標だけでなく、Claim内での役割を持つ。

```text
observed_place    ユーザーが観察した場所
subject_place     Claimの主題となる場所
evidence_place    根拠が得られた場所
suggested_place   次の探索候補
```

古代海岸線や歴史的領域は、現代の一点座標とは別の時系列付きGeometryとして将来扱う。

## 8. 例

```json
{
  "claim": {
    "subject": "宗像",
    "predicate": "shares_theme_with",
    "object": "宇佐",
    "qualifiers": {
      "theme": "海上交通"
    },
    "sourceNature": "AISuggestion",
    "originType": "ai",
    "reviewStatus": "suggested"
  },
  "evidence": [
    {
      "document": "宗像探索.txt",
      "role": "supports",
      "passage": "宗像は大陸・朝鮮半島と日本列島をつなぐ海上交通の入口…"
    },
    {
      "document": "北東九州・宇佐への旅 1日目.txt",
      "role": "context",
      "passage": "宇佐は古代の主要交易路から大きく外れているように見えるのに…"
    }
  ]
}
```

この例では、宗像と宇佐の直接的な歴史関係を確定していない。「海上交通」という比較テーマをAIが提案し、原文を根拠としてレビュー待ちにしている。

## 9. 未決事項

Gold Dataset作成時に、以下を実データから決める。

- Claimを分割する最小粒度
- Entity型の初期集合
- 直接記述と推論の境界
- 複数Evidenceを持つClaimの表示方法
- 同一Entity候補の統合ルール
- `confirmed` 後の再評価方法
- Claim間の支持・反証・派生関係

