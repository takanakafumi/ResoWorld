import { z } from "zod";

import type { ImportedPassage } from "@/domain/imports/types";

import { ClaimExtractionOutputSchema } from "./schema";

export const CLAIM_EXTRACTION_PROMPT_VERSION = "2026-09-10.1";

export const CLAIM_EXTRACTION_INSTRUCTIONS = `あなたは探索記録をEvidence付きClaim候補へ変換する抽出器です。

成功条件:
- 入力Passageから重要な主張・観察・疑問・仮説・提案を漏らさず抽出する。
- 各Claimは、直接根拠となる入力passageIdを1件以上参照する。
- 原文にない事実、出典、日付、固有名詞、因果関係を補わない。
- ユーザーの観察・仮説、AIナレーターの説明、外部史料への言及を区別する。
- AIナレーターの説明そのものをHistoricalSourceやArchaeologyとして扱わない。検証済みの外部史料が入力内で明示されない限り、sourceNatureは内容の出所に応じてAISuggestionまたはAlternativeとする。
- 伝承、神話的時間、推測、疑問、提案をassertedな歴史事実へ昇格させない。
- statementは日本語で、原文の確実性と話者を保った自己完結した文にする。
- predicateは英小文字snake_caseの短い関係名にする。
- 同じ意味のClaimを重複させない。
- 一つの文を語句ごとの細粒度Claimへ分解しない。後から訪問・場所・時代・概念を再認識するために単独で意味を持つ粒度へまとめる。
- Claimをまとめる場合でも、原文が訪問したと明示する固有の場所は省略せず、placesへ1地点ずつ列挙してroleをobserved_placeにする。市町村などの代表地点だけへ丸めない。
- 「A、B、Cを巡った」のような訪問先一覧では、A・B・Cを同じClaimのplacesへそれぞれ含める。人物名、一般名詞、単に言及された場所を訪問地点へ昇格させない。
- 単なる移動時刻、交通手段、食事、価格、宿泊、天候、一般的な感想は、重要な観察・疑問・仮説・接続の根拠でない限りClaimにしない。
- 同じ対象について連続するPassageが一つの観察や説明を構成する場合は、Evidenceを複数参照する一つのClaimを優先する。
- sourceTitle/sourceUrl/noteが原文にない場合はnullにする。

出力形状はStructured OutputsのJSON Schemaにのみ従う。`;

export type ExtractionPassagePayload = {
  passageId: string;
  startLine: number;
  endLine: number;
  sectionPath: string[];
  text: string;
};

export function buildExtractionPassagePayload(
  passages: ImportedPassage[],
): ExtractionPassagePayload[] {
  return passages.map((passage) => ({
    passageId: passage.id,
    startLine: passage.startLine,
    endLine: passage.endLine,
    sectionPath: passage.sectionPath,
    text: passage.text,
  }));
}

export function buildExtractionInput(
  documentTitle: string,
  passages: ImportedPassage[],
) {
  return JSON.stringify(
    {
      task: "extract_claim_candidates",
      documentTitle,
      passages: buildExtractionPassagePayload(passages),
    },
    null,
    2,
  );
}

export const ClaimExtractionJsonSchema = (() => {
  const schema = z.toJSONSchema(ClaimExtractionOutputSchema, {
    target: "draft-2020-12",
  });
  delete schema.$schema;
  return schema;
})();
