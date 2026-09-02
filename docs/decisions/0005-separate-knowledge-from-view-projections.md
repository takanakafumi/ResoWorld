# ADR-0005: Knowledgeと表示Projectionの責務を分離する

- Status: Accepted
- Date: 2026-09-02

## Context

PoCでLENSとMAPを増やす過程で、同じKnowledge Packに対し、各UIが独自にEntityを除外したり、地点・線・根拠文言を組み立てる実装が生まれた。その結果、場所Entityが人物関係図へ混入する一方、地理接続がMAPへ出ないという不整合が起きた。

Knowledge Packは人物・場所・出来事・関係・Sourceを広く保持する正本であり、特定画面に何を表示するかとは別問題である。

## Decision

表示判断を次の一方向に統一する。

```text
Exploration Dataset + Knowledge Pack
                ↓
        LensPreset（表示宣言）
                ↓
     Domain Projection（検証・導出）
                ↓
       LENS / MAP renderer
```

`LensPreset`は当面、次の二つだけを表示契約として持つ。

- `visibleEntityKinds`: 関係図へ投影できるEntity種別
- `mapConnections`: MAPへ投影する地点列と、その根拠Assertion

MAP Projectionは、地点・線だけでなく、`origin`、Assertion、Source、confidence、review statusを一緒に返す。描画部品はPackや人物名・地名を直接参照せず、Projection結果を描画する。

複数のMAP接続は同時に薄く表示し、選択中の線だけを強調する。線を選ぶと、その接続を支えるAssertionとSourceへ到達できるようにする。

## Guardrails

- EntityやAssertionへ画面座標・色・開閉状態を入れない。
- 地点集合や同一Journeyだけを理由に接続線を生成しない。
- MAP接続は最低2地点と、originに応じた根拠（探索由来ならClaim、Knowledge Pack由来ならAssertion）を必要とする。
- Presetが参照するEntity・Assertion・座標はスキーマ検証する。
- UI内で `entity.kind !== "place"` のようなPack固有の除外を追加しない。
- UI内で特定人物・地名のIDから線を組み立てない。
- 固有図法が必要なLENSは専用rendererを維持してよいが、入力はProjectionとする。

## Consequences

新しい人物や訪問地を追加するとき、基礎知識はEntity・Assertion・Sourceへ、表示範囲はPresetへ追加する。LENSとMAPの双方を個別修正する必要が減り、元データを失わずに画面ごとの責務を分離できる。

既存LENSを一度に万能rendererへ統合しない。維新志士から適用し、新規作成または既存更新のタイミングで段階移行する。
