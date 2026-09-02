import { z } from "zod";

export const LENS_PACK_SCHEMA_VERSION = "0.1.0" as const;

const IdSchema = z.string().trim().regex(/^[a-z0-9][a-z0-9-]*$/);

export const LensEntityKindSchema = z.enum([
  "deity",
  "person",
  "place",
  "polity",
  "tradition",
  "concept",
  "text",
  "event",
  "group",
]);

export const LensRelationFamilySchema = z.enum([
  "genealogy",
  "succession",
  "route",
  "identification",
  "textual-attestation",
  "historical-context",
  "influence",
  "syncretism",
  "classification",
  "conceptual-comparison",
  "ritual",
  "enshrinement",
  "association",
]);

export const LensAssertionNatureSchema = z.enum([
  "source-statement",
  "reviewed-reference",
  "scholarly-hypothesis",
  "interpretive-model",
  "user-model",
]);

export const LensEntitySchema = z.object({
  id: IdSchema,
  kind: LensEntityKindSchema,
  label: z.string().trim().min(1),
  aliases: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().min(1).optional(),
  coordinates: z
    .object({ latitude: z.number(), longitude: z.number() })
    .optional(),
});

export const LensSourceSchema = z.object({
  id: IdSchema,
  kind: z.enum([
    "classical-text",
    "modern-reference",
    "research-publication",
    "user-input",
  ]),
  title: z.string().trim().min(1),
  authors: z.array(z.string().trim().min(1)).default([]),
  publisher: z.string().trim().min(1).optional(),
  publishedAt: z.string().regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/).optional(),
  citation: z.string().trim().min(1).optional(),
  url: z.url().optional(),
  retrievedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  locator: z.string().trim().min(1).optional(),
  contentHash: z.string().regex(/^sha256:[a-f0-9]{64}$/).optional(),
  reviewStatus: z.enum(["candidate", "reviewed", "rejected"]).default("candidate"),
  note: z.string().trim().min(1).optional(),
});

export const LensViewpointSchema = z.object({
  id: IdSchema,
  kind: z.enum(["source", "hypothesis", "analytical", "user"]),
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

export const LensAssertionSchema = z.object({
  id: IdSchema,
  subjectId: IdSchema,
  predicate: z.string().trim().regex(/^[a-z][a-z0-9_]*$/),
  objectId: IdSchema,
  relationFamily: LensRelationFamilySchema,
  nature: LensAssertionNatureSchema,
  viewpointIds: z.array(IdSchema).min(1),
  sourceIds: z.array(IdSchema).min(1),
  hypothesisGroupId: IdSchema.optional(),
  sequence: z.number().int().nonnegative().optional(),
  confidence: z.enum(["high", "medium", "low", "disputed", "not-rated"]),
  reviewStatus: z.enum(["draft", "reviewed", "rejected"]),
  note: z.string().trim().min(1).optional(),
});

export const LensMapConnectionSchema = z.object({
  id: IdSchema,
  label: z.string().trim().min(1),
  description: z.string().trim().min(1),
  anchorEntityId: IdSchema.optional(),
  contextEntityIds: z.array(IdSchema).default([]),
  placeEntityIds: z.array(IdSchema).min(2),
  pointFocusEntityIds: z.record(IdSchema, IdSchema).default({}),
  assertionIds: z.array(IdSchema).min(1),
  appearance: z.object({
    color: z.string().regex(/^#[0-9a-f]{6}$/i),
    dashArray: z.tuple([z.number().positive(), z.number().positive()]).optional(),
    legendLabel: z.string().trim().min(1).optional(),
  }).optional(),
});

export const LensPresetSchema = z.object({
  id: IdSchema,
  label: z.string().trim().min(1),
  lensType: z.enum(["route", "genealogy", "relationship", "timeline"]),
  description: z.string().trim().min(1),
  rootEntityIds: z.array(IdSchema).min(1),
  relationFamilies: z.array(LensRelationFamilySchema).min(1),
  viewpointIds: z.array(IdSchema).default([]),
  hypothesisGroupIds: z.array(IdSchema).default([]),
  expansionDepth: z.number().int().min(1).max(12).default(1),
  visibleEntityKinds: z.array(LensEntityKindSchema).min(1).optional(),
  mapConnections: z.array(LensMapConnectionSchema).default([]),
});

export const LensKnowledgePackSchema = z
  .object({
    schemaVersion: z.literal(LENS_PACK_SCHEMA_VERSION),
    id: IdSchema,
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    label: z.string().trim().min(1),
    description: z.string().trim().min(1),
    status: z.enum(["draft", "active", "superseded"]),
    releasedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    entities: z.array(LensEntitySchema).min(1),
    sources: z.array(LensSourceSchema).min(1),
    viewpoints: z.array(LensViewpointSchema).min(1),
    assertions: z.array(LensAssertionSchema).min(1),
    presets: z.array(LensPresetSchema).min(1),
  })
  .superRefine((pack, context) => {
    const entityIds = new Set(pack.entities.map((entity) => entity.id));
    const sourceById = new Map(pack.sources.map((source) => [source.id, source]));
    const sourceIds = new Set(sourceById.keys());
    const viewpointIds = new Set(pack.viewpoints.map((viewpoint) => viewpoint.id));
    const hypothesisGroupIds = new Set(
      pack.assertions.flatMap((assertion) =>
        assertion.hypothesisGroupId ? [assertion.hypothesisGroupId] : [],
      ),
    );
    const assertionIds = new Set<string>();
    const assertionById = new Map(pack.assertions.map((assertion) => [assertion.id, assertion]));
    const entityById = new Map(pack.entities.map((entity) => [entity.id, entity]));

    const checkDuplicates = (
      values: { id: string }[],
      path: "entities" | "sources" | "viewpoints" | "presets",
    ) => {
      const seen = new Set<string>();
      values.forEach((value, index) => {
        if (seen.has(value.id)) {
          context.addIssue({
            code: "custom",
            path: [path, index, "id"],
            message: `Duplicate id: ${value.id}`,
          });
        }
        seen.add(value.id);
      });
    };

    checkDuplicates(pack.entities, "entities");
    checkDuplicates(pack.sources, "sources");
    checkDuplicates(pack.viewpoints, "viewpoints");
    checkDuplicates(pack.presets, "presets");

    pack.assertions.forEach((assertion, index) => {
      if (assertionIds.has(assertion.id)) {
        context.addIssue({
          code: "custom",
          path: ["assertions", index, "id"],
          message: `Duplicate id: ${assertion.id}`,
        });
      }
      assertionIds.add(assertion.id);

      for (const [field, entityId] of [
        ["subjectId", assertion.subjectId],
        ["objectId", assertion.objectId],
      ] as const) {
        if (!entityIds.has(entityId)) {
          context.addIssue({
            code: "custom",
            path: ["assertions", index, field],
            message: `Unknown entity: ${entityId}`,
          });
        }
      }
      assertion.sourceIds.forEach((sourceId, sourceIndex) => {
        if (!sourceIds.has(sourceId)) {
          context.addIssue({
            code: "custom",
            path: ["assertions", index, "sourceIds", sourceIndex],
            message: `Unknown source: ${sourceId}`,
          });
        } else if (
          assertion.reviewStatus === "reviewed" &&
          sourceById.get(sourceId)?.reviewStatus !== "reviewed"
        ) {
          context.addIssue({
            code: "custom",
            path: ["assertions", index, "sourceIds", sourceIndex],
            message: `Reviewed assertion requires a reviewed source: ${sourceId}`,
          });
        }
      });
      assertion.viewpointIds.forEach((viewpointId, viewpointIndex) => {
        if (!viewpointIds.has(viewpointId)) {
          context.addIssue({
            code: "custom",
            path: ["assertions", index, "viewpointIds", viewpointIndex],
            message: `Unknown viewpoint: ${viewpointId}`,
          });
        }
      });
    });

    pack.presets.forEach((preset, presetIndex) => {
      preset.rootEntityIds.forEach((entityId, entityIndex) => {
        if (!entityIds.has(entityId)) {
          context.addIssue({
            code: "custom",
            path: ["presets", presetIndex, "rootEntityIds", entityIndex],
            message: `Unknown entity: ${entityId}`,
          });
        }
      });
      preset.viewpointIds.forEach((viewpointId, viewpointIndex) => {
        if (!viewpointIds.has(viewpointId)) {
          context.addIssue({
            code: "custom",
            path: ["presets", presetIndex, "viewpointIds", viewpointIndex],
            message: `Unknown viewpoint: ${viewpointId}`,
          });
        }
      });
      preset.hypothesisGroupIds.forEach((groupId, groupIndex) => {
        if (!hypothesisGroupIds.has(groupId)) {
          context.addIssue({
            code: "custom",
            path: ["presets", presetIndex, "hypothesisGroupIds", groupIndex],
            message: `Unknown hypothesis group: ${groupId}`,
          });
        }
      });
      if (preset.visibleEntityKinds) {
        preset.rootEntityIds.forEach((entityId, entityIndex) => {
          const entity = entityById.get(entityId);
          if (entity && !preset.visibleEntityKinds!.includes(entity.kind)) {
            context.addIssue({
              code: "custom",
              path: ["presets", presetIndex, "rootEntityIds", entityIndex],
              message: `Root entity kind is hidden by preset: ${entityId}`,
            });
          }
        });
      }
      const mapConnectionIds = new Set<string>();
      preset.mapConnections.forEach((connection, connectionIndex) => {
        if (mapConnectionIds.has(connection.id)) {
          context.addIssue({
            code: "custom",
            path: ["presets", presetIndex, "mapConnections", connectionIndex, "id"],
            message: `Duplicate map connection id: ${connection.id}`,
          });
        }
        mapConnectionIds.add(connection.id);
        const referencedEntityIds = new Set(connection.placeEntityIds);
        if (connection.anchorEntityId) referencedEntityIds.add(connection.anchorEntityId);
        connection.contextEntityIds.forEach((entityId) => referencedEntityIds.add(entityId));
        connection.placeEntityIds.forEach((entityId, entityIndex) => {
          const entity = entityById.get(entityId);
          if (!entity) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "placeEntityIds", entityIndex], message: `Unknown entity: ${entityId}` });
          } else if (entity.kind !== "place" || !entity.coordinates) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "placeEntityIds", entityIndex], message: `Map place requires a place entity with coordinates: ${entityId}` });
          }
        });
        if (connection.anchorEntityId && !entityIds.has(connection.anchorEntityId)) {
          context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "anchorEntityId"], message: `Unknown entity: ${connection.anchorEntityId}` });
        }
        connection.contextEntityIds.forEach((entityId, entityIndex) => {
          if (!entityIds.has(entityId)) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "contextEntityIds", entityIndex], message: `Unknown entity: ${entityId}` });
          }
        });
        Object.entries(connection.pointFocusEntityIds).forEach(([placeEntityId, focusEntityId]) => {
          if (!connection.placeEntityIds.includes(placeEntityId)) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "pointFocusEntityIds", placeEntityId], message: `Point focus key must be a declared place: ${placeEntityId}` });
          }
          if (!entityIds.has(focusEntityId)) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "pointFocusEntityIds", placeEntityId], message: `Unknown focus entity: ${focusEntityId}` });
          }
        });
        connection.assertionIds.forEach((assertionId, assertionIndex) => {
          const assertion = assertionById.get(assertionId);
          if (!assertion) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "assertionIds", assertionIndex], message: `Unknown assertion: ${assertionId}` });
          } else if (!referencedEntityIds.has(assertion.subjectId) || !referencedEntityIds.has(assertion.objectId)) {
            context.addIssue({ code: "custom", path: ["presets", presetIndex, "mapConnections", connectionIndex, "assertionIds", assertionIndex], message: `Map assertion must connect declared entities: ${assertionId}` });
          }
        });
      });
    });
  });

export type LensKnowledgePack = z.infer<typeof LensKnowledgePackSchema>;
export type LensAssertion = z.infer<typeof LensAssertionSchema>;
export type LensSource = z.infer<typeof LensSourceSchema>;
