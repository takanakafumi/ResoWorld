# ResoWorldの正本と外部情報

ResoWorldでは、ユーザーの探索、外部の学術情報、確認済み知識、AI分析を一つの正本へ混ぜない。

正本と派生Read Modelの最小構造、共通化の判断基準は[データ・構造設計ポリシー](./data-structure-policy.md)に従う。旅行記を追加した後に、どの順序で既存Knowledgeへ接続し、KnowledgeやLENSを更新するかは[旅行記追加とLENS更新の運用手順](./adding-travel-journal-and-lens.md)を標準とする。

## 1. Exploration Record

ユーザーがどこを訪れ、何を見て、何に関心を持ち、どう考えたかの正本。旅行記、観察、写真、問い、仮説はローカル、サーバー、または両方に保持できる。保存場所にかかわらず、外部資料によって上書きしない。

## 2. Reference Source

Webや書籍から得た外部情報。URLだけでなく、タイトル、著者・発行主体、公開日、取得日、該当箇所、内容ハッシュを保持する。公的機関、博物館、大学、原典・一次史料を優先する。Webの変更やリンク切れを前提に、参照時点を記録する。

## 3. Reviewed Knowledge

探索記録とReference Sourceに基づき、人が確認したClaim、Entity、Relation。事実、推論、伝承、異説、ユーザー仮説を区別する。Knowledge Graphで正本として扱うのはこの確認済みレイヤーまでとする。

## 4. Derived Synthesis

AIが生成した分類、系譜、ルート、学説比較、再認識レンズ、任意の示唆。生成モデル、プロンプト版、入力データのハッシュ、生成日時を記録する。再生成可能な派生成果であり、確認なしにReviewed Knowledgeへ昇格しない。

## Web調査の流れ

Web検索結果は直接Knowledge Graphへ登録しない。

1. AIが探索全体から調査すべき論点を選ぶ。
2. WebからReference Source候補を収集する。
3. 出典付きClaim候補としてResearch Inboxへ入れる。
4. ユーザーまたはシステムの検証工程で採用・保留・異説を判断する。
5. 採用された内容だけをReviewed Knowledgeへ反映する。

この構造により、Web情報を豊富に利用しながら、ユーザー自身の探索記録とAIの推測を失わずに分離できる。
