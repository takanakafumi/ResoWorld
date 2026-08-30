import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import type { ImportedPassage } from "@/domain/imports/types";

import { LOCAL_EXTRACTION_MODELS, requestOllamaClaimExtraction } from "./ollama";

const anonymousPassages: ImportedPassage[] = [
  {
    id: "passage-anonymous-observation",
    documentId: "document-anonymous",
    startLine: 1,
    endLine: 2,
    sectionPath: ["地点A"],
    text: "地点Aでは石段と古い標柱を観察した。標柱の建立年代は確認できなかった。",
    sha256: "a".repeat(64),
  },
  {
    id: "passage-anonymous-hypothesis",
    documentId: "document-anonymous",
    startLine: 4,
    endLine: 5,
    sectionPath: ["仮説"],
    text: "地点Aと地点Bの配置には関係があるかもしれない。次回、地図と現地資料で検証したい。",
    sha256: "b".repeat(64),
  },
];

describe.skipIf(process.env.RESOWORLD_LIVE_OLLAMA_TEST !== "true")(
  "live local Ollama extraction",
  () => {
    for (const model of LOCAL_EXTRACTION_MODELS) {
      it(
        `${model} returns schema-valid Claims without external data`,
        async () => {
          const result = await requestOllamaClaimExtraction({
            model,
            documentTitle: "匿名探索記録",
            passages: anonymousPassages,
          });
          expect(result.provider).toBe("ollama");
          expect(result.output.claims.length).toBeGreaterThan(0);
          expect(
            result.output.claims.every((claim) =>
              claim.evidence.every((item) =>
                anonymousPassages.some(
                  (passage) => passage.id === item.passageId,
                ),
              ),
            ),
          ).toBe(true);
          console.info(
            JSON.stringify({
              model,
              claims: result.output.claims.length,
              durationMs: result.durationMs,
              usage: result.usage,
            }),
          );
        },
        900_000,
      );
    }
  },
);
