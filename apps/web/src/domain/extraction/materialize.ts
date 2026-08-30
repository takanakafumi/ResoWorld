import { createHash } from "node:crypto";

import type { ImportedPassage } from "@/domain/imports/types";
import {
  ClaimSchema,
  SCHEMA_VERSION,
  type Claim,
} from "@/domain/knowledge/schema";

import type { ClaimExtractionOutput } from "./schema";

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha256").update(value, "utf8").digest("hex").slice(0, 20)}`;
}

export function materializeExtractedClaims(input: {
  output: ClaimExtractionOutput;
  passages: ImportedPassage[];
  documentSha256: string;
  createdAt: string;
  extractedBy?: "ollama" | "openai";
}): Claim[] {
  const passageById = new Map(
    input.passages.map((passage) => [passage.id, passage]),
  );

  return input.output.claims.map((candidate, claimIndex) => {
    const evidence = candidate.evidence.map((item, evidenceIndex) => {
      const passage = passageById.get(item.passageId);
      if (!passage) {
        throw new Error(`Unknown evidence passage: ${item.passageId}`);
      }

      const source =
        item.sourceTitle || item.sourceUrl
          ? {
              ...(item.sourceTitle ? { title: item.sourceTitle } : {}),
              ...(item.sourceUrl ? { url: item.sourceUrl } : {}),
            }
          : undefined;

      return {
        id: stableId(
          "evidence",
          `${item.passageId}:${candidate.statement}:${evidenceIndex}`,
        ),
        role: item.role,
        sourceNature: item.sourceNature,
        documentVoice: item.documentVoice,
        passage: {
          documentId: passage.documentId,
          documentSha256: input.documentSha256,
          startLine: passage.startLine,
          endLine: passage.endLine,
          quote: passage.text,
          passageSha256: passage.sha256,
        },
        ...(source ? { source } : {}),
        ...(item.note ? { note: item.note } : {}),
      };
    });

    const subject = {
      ...candidate.subject,
      id: stableId(
        "entity",
        `${candidate.subject.type}:${candidate.subject.name}`,
      ),
    };
    const object =
      candidate.object.kind === "entity"
        ? {
            kind: "entity" as const,
            entity: {
              ...candidate.object.entity,
              id: stableId(
                "entity",
                `${candidate.object.entity.type}:${candidate.object.entity.name}`,
              ),
            },
          }
        : candidate.object;

    const claim = {
      schemaVersion: SCHEMA_VERSION,
      id: stableId(
        "claim",
        `${candidate.statement}:${candidate.evidence.map((item) => item.passageId).join(":")}:${claimIndex}`,
      ),
      statement: candidate.statement,
      subject,
      predicate: candidate.predicate,
      object,
      qualifiers: {
        extractedBy:
          input.extractedBy === "ollama"
            ? "ollama-local"
            : "openai-responses-api",
      },
      claimKind: candidate.claimKind,
      originType: candidate.originType,
      reviewStatus: "suggested" as const,
      epistemic: candidate.epistemic,
      historicalTime:
        candidate.historicalTime?.kind === "calendar"
          ? {
              kind: "calendar" as const,
              ...(candidate.historicalTime.label
                ? { label: candidate.historicalTime.label }
                : {}),
              startYear: candidate.historicalTime.startYear,
              ...(candidate.historicalTime.endYear !== null
                ? { endYear: candidate.historicalTime.endYear }
                : {}),
              approximate: candidate.historicalTime.approximate,
            }
          : candidate.historicalTime?.kind === "unknown"
            ? {
                kind: "unknown" as const,
                ...(candidate.historicalTime.label
                  ? { label: candidate.historicalTime.label }
                  : {}),
              }
            : candidate.historicalTime,
      places: candidate.places.map((place) => ({
        ...place,
        entityId: stableId("entity", `Place:${place.name}`),
      })),
      evidence,
      createdAt: input.createdAt,
    };

    return ClaimSchema.parse(claim);
  });
}
