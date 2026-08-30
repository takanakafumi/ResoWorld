# ResoWorld Web PoC

ResoWorldのローカルファーストPoCです。現在は、非公開の探索記録を根拠付きClaimへ変換するためのドメインスキーマと検証基盤を実装しています。

## Requirements

- Node.js 22
- pnpm 11

## Setup

```powershell
cd apps/web
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

`.env.local`へ実際の秘密情報やローカルパスを設定します。`.env.local`はGit管理されません。

## Commands

```powershell
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Private data

- 個人の旅行記はリポジトリ直下の`旅行記/`または`data/imports/`で管理し、Gitへ追加しません。
- 秘密情報を`NEXT_PUBLIC_`付き環境変数へ保存しません。この接頭辞の値はブラウザへ公開されます。
- `RESOWORLD_IMPORT_DIR`はサーバー側だけで読み取る予定です。
- 現段階では外部AI APIへの送信処理を実装していません。実装時には送信前プレビューと明示的な実行操作を追加します。
- 匿名化fixtureだけをソースコードとテストへ含めます。

## Current structure

```text
src/
├─ app/                         Next.js App Router
└─ domain/
   └─ knowledge/
      ├─ schema.ts              Zod schemas and TypeScript types
      ├─ json-schema.ts         JSON Schema export
      ├─ fixtures.ts            anonymized fixtures
      └─ schema.test.ts         schema validation tests
```

## Schema principles

- すべてのClaimは一つ以上のEvidenceを持つ
- Claimの掲載確認と歴史的検証状態を分離する
- AI提案などの`claimKind`と、根拠の`sourceNature`を分離する
- 訪問日、記録日、歴史上の時間を分離する
- 文書ハッシュが変わったEvidence参照を拒否する
