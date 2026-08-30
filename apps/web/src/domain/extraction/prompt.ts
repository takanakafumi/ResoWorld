import { z } from "zod";

import type { ImportedPassage } from "@/domain/imports/types";

import { ClaimExtractionOutputSchema } from "./schema";

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
