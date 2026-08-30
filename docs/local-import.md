# ローカル文書取込

ResoWorld PoCは、個人の探索記録を外部へ送信せず、ローカルでDocumentとPassageへ分割できる。

## 有効化

`apps/web/.env.example`を`apps/web/.env.local`へコピーし、次を設定する。

```dotenv
RESOWORLD_LOCAL_IMPORT_ENABLED=true
RESOWORLD_IMPORT_DIR=C:\path\to\private-records
```

`RESOWORLD_IMPORT_DIR`には絶対パスを指定する。設定後、開発サーバーを起動し、`http://127.0.0.1:3000/imports`を開く。

## 現在の処理

1. 設定されたディレクトリ直下の`.txt`だけを一覧表示する
2. 選択したファイルが通常ファイルであることを確認する
3. 最大サイズとUTF-8妥当性を検証する
4. 原文バイト列のSHA-256を計算する
5. Markdown風の見出しと空行からSection・Passageへ分割する
6. 行範囲、Section path、Passage hashを付けてブラウザへプレビューする

AI API呼び出し、DB保存、原文のGit追加は行わない。

## 安全境界

- `RESOWORLD_LOCAL_IMPORT_ENABLED=true`を明示しない限り無効
- 取込ルートは絶対パスだけを許可
- 取込対象はルート直下の`.txt`だけ
- 絶対ファイルパス、`..`、サブディレクトリ指定を拒否
- シンボリックリンクと通常ファイル以外を拒否
- 既定上限5MBを超えるファイルを拒否
- 不正なUTF-8を拒否
- ブラウザへ取込ルートの絶対パスを返さない
- 動的ローカルパスをTurbopackのビルド追跡対象から除外

## 変更検知

Documentは原文バイト列のSHA-256を持つ。既知のハッシュと現在のハッシュが異なる場合、古いPassageの行参照やオフセットを無言で再利用してはならない。

Document IDは相対ファイル名から生成するため、内容変更後も同じ文書として認識できる。一方、各Passage IDは開始行とPassage hashを含むため、内容変更を区別できる。

## PoC上の制約

- 再帰的なディレクトリ探索はしない
- `.md`、PDF、画像、音声は扱わない
- ファイル監視や自動再取込はしない
- observedAt、documentedAtは原文から自動推測しない
- AI送信前の匿名化と送信確認はIssue #5で扱う
