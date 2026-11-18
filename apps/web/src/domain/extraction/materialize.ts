import { createHash } from "node:crypto";
import type { z } from "zod";

import type { ImportedPassage } from "@/domain/imports/types";
import {
  ClaimSchema,
  SCHEMA_VERSION,
  type Claim,
  type HistoricalTime,
  type TemporalScope,
} from "@/domain/knowledge/schema";

import type {
  ClaimExtractionOutputSchema,
  ExtractedClaimCandidate,
} from "./schema";

type ExtractedClaimInput = Omit<ExtractedClaimCandidate, "temporalScope"> & {
  temporalScope?: ExtractedClaimCandidate["temporalScope"];
};

export type MaterializeClaimsInput = {
  claims: ExtractedClaimInput[];
};

const TRIP_SCHEDULE_OR_PRESENT_OBSERVATION_TIME =
  /^(?:旅の\d+日目|今回の三日間|現代・令和（現地観察）|現代)$/;

function stableId(prefix: string, value: string) {
  return `${prefix}-${createHash("sha256").update(value, "utf8").digest("hex").slice(0, 20)}`;
}

function normalizeExtractedHistoricalTime(
  value: ExtractedClaimInput["historicalTime"],
): HistoricalTime | null {
  if (!value) return null;
  if (value.kind === "calendar") {
    return {
      kind: "calendar",
      ...(value.label ? { label: value.label } : {}),
      startYear: value.startYear,
      ...(value.endYear !== null ? { endYear: value.endYear } : {}),
      approximate: value.approximate,
    };
  }
  if (value.kind === "unknown") {
    return {
      kind: "unknown",
      ...(value.label ? { label: value.label } : {}),
    };
  }
  return value;
}

export function resolveClaimTemporalMetadata(
  candidate: Pick<
    ExtractedClaimInput,
    "temporalScope" | "historicalTime" | "claimKind" | "places" | "evidence"
  >,
): { temporalScope: TemporalScope; historicalTime: HistoricalTime | null } {
  const normalizedTime = normalizeExtractedHistoricalTime(candidate.historicalTime);

  if (candidate.temporalScope === "historical_target") {
    return {
      temporalScope: "historical_target",
      historicalTime: normalizedTime ?? { kind: "unknown" },
    };
  }
  if (candidate.temporalScope === "field_observation") {
    return {
      temporalScope: "field_observation",
      historicalTime: null,
    };
  }
  if (candidate.temporalScope === "atemporal") {
    return {
      temporalScope: "atemporal",
      historicalTime: null,
    };
  }

  const hasObservedPlace = candidate.places.some(
    (place) => place.role === "observed_place",
  );
  const hasHistoricalEvidence = candidate.evidence.some(
    (item) =>
      item.sourceNature === "HistoricalSource" ||
      item.sourceNature === "Archaeology" ||
      item.sourceNature === "Tradition",
  );

  if (normalizedTime !== null) {
    if (
      normalizedTime.kind === "named" &&
      TRIP_SCHEDULE_OR_PRESENT_OBSERVATION_TIME.test(normalizedTime.label)
    ) {
      return {
        temporalScope:
          candidate.claimKind === "synthesis" ||
          candidate.claimKind === "question" ||
          candidate.claimKind === "suggestion"
            ? "atemporal"
            : "field_observation",
        historicalTime: null,
      };
    }
    return {
      temporalScope: "historical_target",
      historicalTime: normalizedTime,
    };
  }

  if (
    candidate.claimKind === "observation" ||
    hasObservedPlace ||
    candidate.evidence.some((item) => item.sourceNature === "Observation")
  ) {
    return {
      temporalScope: "field_observation",
      historicalTime: null,
    };
  }

  if (hasHistoricalEvidence) {
    return {
      temporalScope: "historical_target",
      historicalTime: { kind: "unknown" },
    };
  }

  return {
    temporalScope: "atemporal",
    historicalTime: null,
  };
}

export function materializeExtractedClaims(input: {
  output: z.input<typeof ClaimExtractionOutputSchema>;
  passages: ImportedPassage[];
  documentSha256: string;
  createdAt: string;
  extractedBy?: "lmstudio";
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

    const { temporalScope, historicalTime } = resolveClaimTemporalMetadata(candidate);

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
        extractedBy: "lmstudio-local",
      },
      claimKind: candidate.claimKind,
      originType: candidate.originType,
      reviewStatus: "suggested" as const,
      epistemic: candidate.epistemic,
      temporalScope,
      historicalTime,
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
