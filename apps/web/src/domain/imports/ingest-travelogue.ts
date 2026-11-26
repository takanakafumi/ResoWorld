import { createHash } from "node:crypto";
import { z } from "zod";

import {
  ClaimKindSchema,
  ClaimSchema,
  EntityTypeSchema,
  EpistemicStateSchema,
  HistoricalTimeSchema,
  SourceNatureSchema,
  type Claim,
} from "@/domain/knowledge/schema";
import { CertaintyTierSchema } from "@/domain/knowledge/source-evaluation";
import { lensEntityNamesMatch } from "@/domain/lens-packs/entity-identity";
import { registeredLensKnowledgePacks, registeredLensTopics } from "@/domain/lens-packs/knowledge-registry";
import {
  auditLensTopicGovernance,
  type LensTopicGovernanceReport,
} from "@/domain/lenses/taxonomy-governance";
import {
  auditStratumGovernance,
  type StratumGovernanceReport,
} from "@/domain/review/stratum-governance";
import type {
  ReviewAtlas,
  ReviewAtlasConnection,
  ReviewAtlasSpot,
  ReviewDataset,
  ReviewExplorationSuggestion,
} from "@/domain/review/types";

import type { JourneyRegistrationDraft } from "./journey-candidate";
import { materializeJourneyRegistration } from "./materialize-journey";

const FORBIDDEN_KIND_STATUS_PATTERN = /(候補|要確認|未定|仮設|仮登録)/;
const ABSOLUTE_PATH_PATTERN = /^([a-zA-Z]:\\|\/|~\/)/;

const TravelogueDocumentSpecSchema = z.object({
  title: z.string().trim().min(1),
  logicalPath: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !ABSOLUTE_PATH_PATTERN.test(value), {
      message:
        "logicalPath must be a repository-relative logical path (e.g. '旅行記/foo.md'), never an absolute local filesystem path (Principle 19).",
    }),
  observedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  documentedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const TravelogueSpotSpecSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .refine((value) => value.startsWith("spot-"), {
      message: "spot id must start with 'spot-'",
    }),
  name: z.string().trim().min(1),
  region: z.string().trim().min(1),
  kind: z
    .string()
    .trim()
    .min(1)
    .refine((value) => !FORBIDDEN_KIND_STATUS_PATTERN.test(value), {
      message:
        "spot.kind must describe objective physical reality only, without status words like 候補/要確認/未定 (Principle 9 & 11).",
    }),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  addressState: z.string().trim().min(1).optional(),
  addressCity: z.string().trim().min(1).optional(),
});

const TravelogueClaimSpecSchema = z
  .object({
    id: z.string().trim().min(1),
    spotId: z.string().trim().min(1),
    statement: z.string().trim().min(1),
    predicate: z.string().trim().min(1),
    objectName: z.string().trim().min(1),
    objectType: EntityTypeSchema,
    claimKind: ClaimKindSchema.default("observation"),
    sourceNature: SourceNatureSchema.default("Observation"),
    modality: EpistemicStateSchema.shape.modality.default("qualified"),
    certaintyTier: CertaintyTierSchema.default("A"),
    historicalTime: HistoricalTimeSchema,
    startLine: z.number().int().positive(),
    endLine: z.number().int().positive(),
    note: z.string().trim().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.endLine < value.startLine) {
      ctx.addIssue({
        code: "custom",
        path: ["endLine"],
        message: "endLine must be >= startLine",
      });
    }
  });

const TravelogueItinerarySpecSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .refine((value) => value.startsWith("itinerary-"), {
      message: "itinerary connection id must start with 'itinerary-' (ADR-0028)",
    }),
  eyebrow: z.string().trim().min(1),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  spotIds: z.array(z.string().trim().min(1)).min(2).optional(),
  claimIds: z.array(z.string().trim().min(1)).min(1).optional(),
  concepts: z.array(z.string().trim().min(1)).default([]),
  facets: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        label: z.string().trim().min(1),
        weight: z.number().int().min(1).max(5),
      }),
    )
    .default([{ id: "itinerary", label: "現地訪問行程", weight: 4 }]),
  eraLabel: z.string().trim().min(1).optional(),
  eraMapLabel: z.string().trim().min(1).optional(),
});

const TravelogueSuggestionSpecSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  targetName: z.string().trim().min(1),
  targetPlaceId: z.string().trim().min(1).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  question: z.string().trim().min(1),
  missingInformation: z.string().trim().min(1),
  reason: z.string().trim().min(1),
  expectedObservation: z.string().trim().min(1),
  uncertainty: z.string().trim().min(1),
  claimIds: z.array(z.string().trim().min(1)).default([]),
  anchorSpotIds: z.array(z.string().trim().min(1)).default([]),
  connectionIds: z.array(z.string().trim().min(1)).default([]),
  lensId: z.string().trim().min(1),
  topicId: z.string().trim().min(1),
});

export const TravelogueIngestManifestSchema = z.object({
  schemaVersion: z.literal("0.1.0").default("0.1.0"),
  createdAt: z.string().trim().min(1).optional(),
  document: TravelogueDocumentSpecSchema,
  journey: z.object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
  }),
  spots: z.array(TravelogueSpotSpecSchema).min(1),
  claims: z.array(TravelogueClaimSpecSchema).min(1),
  itineraryConnection: TravelogueItinerarySpecSchema.optional(),
  retireSuggestionIds: z.array(z.string().trim().min(1)).default([]),
  addSuggestions: z.array(TravelogueSuggestionSpecSchema).default([]),
});

export type TravelogueIngestManifest = z.infer<typeof TravelogueIngestManifestSchema>;

export type MatchedLensPackNode = {
  packId: string;
  entityId: string;
  entityLabel: string;
  spotId: string;
  spotName: string;
  hasExplicitPrimarySpotId: boolean;
  boundSpotId?: string;
};

export type TraveloguePromotionReport = {
  matchedPackNodes: MatchedLensPackNode[];
  nodesMissingPrimarySpotId: MatchedLensPackNode[];
  retiredSuggestionIds: string[];
  addedSuggestionIds: string[];
  unretiredMatchingSuggestions: Array<{ suggestionId: string; targetName: string; matchedSpotId: string }>;
};

export type IngestTravelogueResult = {
  dataset: ReviewDataset & {
    documents: Array<Record<string, unknown>>;
    atlas: ReviewAtlas;
  };
  summary: {
    documentId: string;
    documentSha256: string;
    journeyId: string;
    ingestedSpotIds: string[];
    ingestedClaimCount: number;
    totalSpots: number;
    totalClaims: number;
    totalJourneys: number;
    totalSuggestions: number;
  };
  promotionReport: TraveloguePromotionReport;
  governance: {
    stratum: StratumGovernanceReport;
    lens: LensTopicGovernanceReport;
    totalViolations: number;
  };
};

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function extractLineSlice(lines: readonly string[], startLine: number, endLine: number): string {
  if (startLine < 1 || endLine > lines.length) {
    throw new Error(
      `Line range ${startLine}-${endLine} is out of bounds for document with ${lines.length} lines.`,
    );
  }
  const quote = lines.slice(startLine - 1, endLine).join("\n").trim();
  if (!quote) {
    throw new Error(`Extracted quote for lines ${startLine}-${endLine} is empty.`);
  }
  return quote;
}

/**
 * 単一の正規旅行記インポート・ドメイン実体化関数（原則 ⑮・⑰・㉓・㉗）。
 *
 * 1. Manifest を Zod スキーマ検証（ローカル絶対パス・kind ステータス汚染を型・スキーマ層で遮断）。
 * 2. 原文テキストから SHA-256 と行番号一致の quote / passageSha256 を決定論的に算出。
 * 3. 全 Claim を ClaimSchema 検証し、主訪問地へ role: "observed_place" を必須付与（原則 ⑰）。
 * 4. materializeJourneyRegistration を必ず経由してスポット・ジャーニーを実体化（原則 ⑮）。
 * 5. 新規候補の (lensId, topicId) を registeredLensTopics と厳密照合（原則 ㉓）。
 * 6. LENS パック横断の昇格レポートと STRATUM/LENS ガバナンス監査を同時生成（ADR-0029 / ADR-0030）。
 */
export function ingestTravelogue(params: {
  dataset: ReviewDataset & {
    documents?: Array<Record<string, unknown>>;
    atlas: ReviewAtlas;
  };
  rawText: string;
  manifest: TravelogueIngestManifest;
  runGovernanceAudit?: boolean;
}): IngestTravelogueResult {
  const parsed = TravelogueIngestManifestSchema.parse(params.manifest);
  const createdAt = parsed.createdAt ?? `${parsed.document.observedAt}T12:00:00Z`;
  const lines = params.rawText.split(/\r?\n/);
  const documentSha256 = sha256(params.rawText);
  const documentId = `document-${documentSha256.slice(0, 16)}`;

  const spotById = new Map(parsed.spots.map((s) => [s.id, s]));

  // Validate suggestion topic scoping strictly against registeredLensTopics (Principle 23)
  const topicById = new Map(registeredLensTopics.map((t) => [t.id, t]));
  for (const suggestion of parsed.addSuggestions) {
    const topic = topicById.get(suggestion.topicId);
    if (!topic) {
      throw new Error(
        `Suggestion "${suggestion.id}" references unregistered topicId "${suggestion.topicId}" (Principle 23).`,
      );
    }
    if (topic.perspectiveId !== suggestion.lensId) {
      throw new Error(
        `Suggestion "${suggestion.id}" lensId "${suggestion.lensId}" does not match topic "${suggestion.topicId}" perspectiveId "${topic.perspectiveId}" (Principle 23).`,
      );
    }
  }

  // Build and validate all Claims with mandatory observed_place (Principle 17)
  const newClaims: Claim[] = parsed.claims.map((spec) => {
    const spot = spotById.get(spec.spotId);
    if (!spot) {
      throw new Error(`Claim "${spec.id}" references unknown spotId "${spec.spotId}".`);
    }
    const quote = extractLineSlice(lines, spec.startLine, spec.endLine);
    return ClaimSchema.parse({
      schemaVersion: "0.2.0",
      id: spec.id,
      statement: spec.statement,
      subject: {
        id: spot.id,
        name: spot.name,
        type: "Place",
      },
      predicate: spec.predicate,
      object: {
        kind: "entity",
        entity: {
          name: spec.objectName,
          type: spec.objectType,
        },
      },
      qualifiers: {},
      claimKind: spec.claimKind,
      originType: "user",
      reviewStatus: "confirmed",
      epistemic: {
        verification: "personal-evidence",
        modality: spec.modality,
      },
      certaintyTier: spec.certaintyTier,
      temporalScope: "historical_target",
      historicalTime: spec.historicalTime,
      places: [
        {
          entityId: spot.id,
          name: spot.name,
          role: "observed_place",
        },
      ],
      evidence: [
        {
          role: "supports",
          sourceNature: spec.sourceNature,
          documentVoice: "user-narrator",
          passage: {
            documentId,
            documentSha256,
            startLine: spec.startLine,
            endLine: spec.endLine,
            quote,
            passageSha256: sha256(quote),
          },
          note: spec.note,
        },
      ],
      createdAt,
    });
  });

  // Merge document and claims idempotently
  const nextDocument = {
    id: documentId,
    title: parsed.document.title,
    path: parsed.document.logicalPath,
    sha256: documentSha256,
    authorType: "user-authored",
    privacy: "private",
    observedAt: parsed.document.observedAt,
    documentedAt: parsed.document.documentedAt ?? parsed.document.observedAt,
    dateStatus: "known",
  };
  const existingDocuments = params.dataset.documents ?? [];
  const nextDocuments = [
    ...existingDocuments.filter((doc) => doc.id !== documentId),
    nextDocument,
  ];

  const newClaimIdSet = new Set(newClaims.map((c) => c.id));
  const nextClaims = [
    ...params.dataset.claims.filter((c) => !newClaimIdSet.has(c.id)),
    ...newClaims,
  ];

  // Materialize spots & journey through canonical materializeJourneyRegistration (Principle 15)
  const journeyExists = (params.dataset.atlas.journeys ?? []).some(
    (journey) => journey.id === parsed.journey.id,
  );
  const draft: JourneyRegistrationDraft = {
    schemaVersion: "0.2.0",
    status: "reviewed_candidate",
    mode: journeyExists ? "existing" : "new",
    targetJourney: {
      id: parsed.journey.id,
      label: parsed.journey.label,
    },
    documentIds: [documentId],
    claimIds: newClaims.map((c) => c.id),
    placeCandidates: parsed.spots.map((spot) => {
      const entityKey = spot.id.slice("spot-".length);
      return {
        entityId: entityKey,
        name: spot.name,
        roles: ["observed_place" as const],
        claimIds: newClaims.filter((c) => c.subject.id === spot.id).map((c) => c.id),
      };
    }),
    placeResolutions: Object.fromEntries(
      parsed.spots.map((spot) => {
        const entityKey = spot.id.slice("spot-".length);
        const regionParts = spot.region.split(/\s*[·・]\s*/).filter(Boolean);
        return [
          entityKey,
          {
            query: `${spot.name} ${spot.region}`,
            status: "candidate" as const,
            selected: {
              id: entityKey,
              provider: "official-source" as const,
              displayName: `${spot.name} (${spot.region})`,
              latitude: spot.latitude,
              longitude: spot.longitude,
              category: "place",
              type: spot.kind,
              address: {
                state: spot.addressState ?? regionParts[0] ?? spot.region,
                city: spot.addressCity ?? regionParts[1] ?? "",
              },
              attribution: "ResoWorld field travelogue manifest",
            },
          },
        ];
      }),
    ),
    connectionDecision: parsed.itineraryConnection ? "review_ordered_route" : "no_connection",
    lensDecision: "reuse_existing",
  };

  const materializedAtlas = materializeJourneyRegistration(params.dataset.atlas, draft, nextClaims);

  const finalSpots: ReviewAtlasSpot[] = materializedAtlas.spots.map((spot) => {
    const spec = spotById.get(spot.id);
    if (!spec) return spot;
    return {
      ...spot,
      name: spec.name,
      region: spec.region,
      kind: spec.kind,
      latitude: spec.latitude,
      longitude: spec.longitude,
      positionStatus: "confirmed" as const,
      mapRole: "visited-place" as const,
    };
  });

  // Optional physical itinerary connection (ADR-0028: genuine physical walk only)
  let finalConnections = [...materializedAtlas.connections];
  const journeyConnectionIds: string[] = [];
  if (parsed.itineraryConnection) {
    const itin = parsed.itineraryConnection;
    const itinSpotIds = itin.spotIds ?? parsed.spots.map((s) => s.id);
    const itinClaimIds =
      itin.claimIds ??
      parsed.spots
        .map((s) => newClaims.find((c) => c.subject.id === s.id)?.id)
        .filter((id): id is string => Boolean(id));
    const connection: ReviewAtlasConnection = {
      id: itin.id,
      connectionKind: "itinerary",
      initialStatus: "confirmed",
      eyebrow: itin.eyebrow,
      title: itin.title,
      summary: itin.summary,
      spotIds: itinSpotIds,
      claimIds: itinClaimIds,
      concepts: itin.concepts,
      facets: itin.facets,
      lensId: "itinerary",
      topicId: null,
      displayMode: "line",
      eras: [
        {
          id: `era-${itin.id.replace(/^itinerary-/, "")}`,
          label: itin.eraLabel ?? `${parsed.document.observedAt} 現地訪問`,
          range: parsed.document.observedAt,
          mapLabel: itin.eraMapLabel ?? itin.title,
          mapLayer: "present",
          spotIds: itinSpotIds,
          claimIds: itinClaimIds,
        },
      ],
    };
    finalConnections = [
      ...finalConnections.filter((c) => c.id !== connection.id),
      connection,
    ];
    journeyConnectionIds.push(connection.id);
  }

  const finalJourneys = (materializedAtlas.journeys ?? []).map((journey) =>
    journey.id === parsed.journey.id
      ? {
          ...journey,
          connectionIds: [...new Set([...(journey.connectionIds ?? []), ...journeyConnectionIds])],
        }
      : journey,
  );

  // Suggestions: retire promoted Frontier candidates and add new deferred Frontier candidates
  const retireSet = new Set(parsed.retireSuggestionIds);
  const addedSuggestions: ReviewExplorationSuggestion[] = parsed.addSuggestions.map((s) => ({
    id: s.id,
    title: s.title,
    targetName: s.targetName,
    targetPlaceId: s.targetPlaceId,
    targetKind: "knowledge_unvisited",
    actionType: "field_visit",
    latitude: s.latitude,
    longitude: s.longitude,
    question: s.question,
    missingInformation: s.missingInformation,
    reason: s.reason,
    expectedObservation: s.expectedObservation,
    uncertainty: s.uncertainty,
    claimIds: s.claimIds,
    anchorSpotIds: s.anchorSpotIds,
    connectionIds: s.connectionIds,
    lensId: s.lensId,
    topicId: s.topicId,
    initialStatus: "suggested",
  }));
  const addedSuggestionIds = new Set(addedSuggestions.map((s) => s.id));
  const finalSuggestions = [
    ...(materializedAtlas.suggestions ?? []).filter(
      (s) => !retireSet.has(s.id) && !addedSuggestionIds.has(s.id),
    ),
    ...addedSuggestions,
  ];

  const nextAtlas: ReviewAtlas = {
    ...materializedAtlas,
    spots: finalSpots,
    connections: finalConnections,
    journeys: finalJourneys,
    suggestions: finalSuggestions,
  };

  // Build tri-space promotion report across all registered LENS packs
  const uniquePacks = [
    ...new Map(registeredLensKnowledgePacks.map((entry) => [entry.pack.id, entry.pack])).values(),
  ];
  const matchedPackNodes: MatchedLensPackNode[] = [];
  for (const pack of uniquePacks) {
    for (const entity of pack.entities) {
      if (entity.kind !== "place" || entity.spatialGranularity === "area") continue;
      for (const spot of parsed.spots) {
        const matchedByPrimary = entity.primarySpotId === spot.id;
        const matchedByName =
          lensEntityNamesMatch(entity.label, spot.name) ||
          (entity.aliases ?? []).some((alias) => lensEntityNamesMatch(alias, spot.name));
        if (matchedByPrimary || matchedByName) {
          matchedPackNodes.push({
            packId: pack.id,
            entityId: entity.id,
            entityLabel: entity.label,
            spotId: spot.id,
            spotName: spot.name,
            hasExplicitPrimarySpotId: entity.primarySpotId === spot.id,
            boundSpotId: entity.primarySpotId,
          });
        }
      }
    }
  }

  const unretiredMatchingSuggestions: TraveloguePromotionReport["unretiredMatchingSuggestions"] = [];
  for (const suggestion of finalSuggestions) {
    for (const spot of parsed.spots) {
      if (lensEntityNamesMatch(suggestion.targetName, spot.name)) {
        unretiredMatchingSuggestions.push({
          suggestionId: suggestion.id,
          targetName: suggestion.targetName,
          matchedSpotId: spot.id,
        });
      }
    }
  }

  // Run STRATUM & LENS governance audits (ADR-0029 & ADR-0030)
  const stratumReport: StratumGovernanceReport =
    params.runGovernanceAudit === false
      ? {
          calendarYearViolations: [],
          umbrellaClaimBleedViolations: [],
          kindMismatchViolations: [],
          unsafeRegexRuleViolations: [],
          archetypeSubstringViolations: [],
        }
      : auditStratumGovernance({ spots: finalSpots, claims: nextClaims });

  const lensReport: LensTopicGovernanceReport =
    params.runGovernanceAudit === false
      ? {
          missingExplicitSpatialScaleTopicIds: [],
          unusedTopicFocusKeys: [],
          registryDriftViolations: [],
          highDensityViolations: [],
          unregisteredPresetViolations: [],
          invalidScopeClusterRefs: [],
        }
      : auditLensTopicGovernance();

  const totalViolations =
    stratumReport.calendarYearViolations.length +
    stratumReport.umbrellaClaimBleedViolations.length +
    stratumReport.kindMismatchViolations.length +
    stratumReport.unsafeRegexRuleViolations.length +
    stratumReport.archetypeSubstringViolations.length +
    lensReport.missingExplicitSpatialScaleTopicIds.length +
    lensReport.unusedTopicFocusKeys.length +
    lensReport.registryDriftViolations.length +
    lensReport.highDensityViolations.length +
    lensReport.unregisteredPresetViolations.length +
    lensReport.invalidScopeClusterRefs.length;

  return {
    dataset: {
      ...params.dataset,
      documents: nextDocuments,
      claims: nextClaims,
      atlas: nextAtlas,
    },
    summary: {
      documentId,
      documentSha256,
      journeyId: parsed.journey.id,
      ingestedSpotIds: parsed.spots.map((s) => s.id),
      ingestedClaimCount: newClaims.length,
      totalSpots: finalSpots.length,
      totalClaims: nextClaims.length,
      totalJourneys: finalJourneys.length,
      totalSuggestions: finalSuggestions.length,
    },
    promotionReport: {
      matchedPackNodes,
      nodesMissingPrimarySpotId: matchedPackNodes.filter((m) => !m.hasExplicitPrimarySpotId),
      retiredSuggestionIds: [...retireSet],
      addedSuggestionIds: [...addedSuggestionIds],
      unretiredMatchingSuggestions,
    },
    governance: {
      stratum: stratumReport,
      lens: lensReport,
      totalViolations,
    },
  };
}
