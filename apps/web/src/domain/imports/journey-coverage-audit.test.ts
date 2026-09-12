import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";
import type { ReviewDataset } from "@/domain/review/types";

import { auditDatasetCoverage, auditJourneyCoverage } from "./journey-coverage-audit";

function dataset(): ReviewDataset {
  const claim = {
    ...validClaimFixture,
    id: "claim-toma",
    subject: { ...validClaimFixture.subject, id: "toma-state", name: "投馬国" },
    evidence: [{ ...validClaimFixture.evidence[0], passage: { ...validClaimFixture.evidence[0].passage, documentId: "doc-a" } }],
  };
  return {
    datasetId: "audit",
    privacy: "anonymized-demo",
    documents: [{ id: "doc-a", title: "旅" }],
    claims: [claim],
    atlas: {
      title: "Atlas",
      journeys: [{ id: "journey-a", label: "探索A", documentIds: ["doc-a"], spotIds: ["spot-a"], connectionIds: [] }],
      spots: [{ id: "spot-a", name: "投馬国候補", region: "九州", kind: "古代候補", latitude: 33, longitude: 130, claimIds: ["claim-toma"] }],
      connections: [],
      suggestions: [],
    },
  };
}

describe("auditJourneyCoverage", () => {
  it("reports resolved journey counts and applicable lenses", () => {
    const [audit] = auditJourneyCoverage(dataset());
    expect(audit).toMatchObject({ documentCount: 1, spotCount: 1, connectionCount: 0 });
    expect(audit.lensIds).toContain("route");
    expect(audit.lensMatches).toContainEqual(expect.objectContaining({
      lensId: "route",
      label: "倭人条の記述順",
      claimCount: 1,
      spotCount: 1,
      spotNames: ["投馬国候補"],
      claimStatements: [expect.any(String)],
    }));
    expect(audit.issues).toEqual([]);
  });

  it("does not expose a Pack's political preset as a route match", () => {
    const input = dataset();
    input.claims[0].subject = { ...input.claims[0].subject, id: "himiko", name: "卑弥呼" };
    const [audit] = auditJourneyCoverage(input);
    expect(audit.lensMatches.some(({ lensId, presetId }) => lensId === "route" && presetId === "wajinden-politics")).toBe(false);
  });

  it("reports broken references without hiding valid journey data", () => {
    const input = dataset();
    input.atlas!.journeys![0].documentIds.push("doc-missing");
    input.atlas!.journeys![0].spotIds.push("spot-missing");
    input.atlas!.journeys![0].connectionIds.push("connection-missing");
    input.atlas!.spots[0].claimIds.push("claim-missing");

    const [audit] = auditJourneyCoverage(input);
    expect(audit.spotCount).toBe(1);
    expect(audit.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "missing-document",
      "missing-spot",
      "missing-connection",
      "missing-claim",
    ]));
  });

  it("treats absent lens knowledge as information rather than an import error", () => {
    const input = dataset();
    input.claims[0].subject = { ...input.claims[0].subject, id: "unregistered", name: "未登録の関心" };
    const [audit] = auditJourneyCoverage(input);
    expect(audit.issues).toContainEqual(expect.objectContaining({ severity: "info", code: "no-lens-material" }));
    expect(audit.issues.some((issue) => issue.severity === "error")).toBe(false);
    expect(audit.lensGaps).toContainEqual(expect.objectContaining({ lensId: "politics", entityKinds: expect.arrayContaining(["person", "polity"]) }));
  });

  it("recognizes the Wajinden political preset through the shared registry", () => {
    const input = dataset();
    input.claims[0].subject = { ...input.claims[0].subject, id: "himiko", name: "卑弥呼" };
    const [audit] = auditJourneyCoverage(input);
    expect(audit.lensMatches).toContainEqual(expect.objectContaining({ lensId: "politics", presetId: "wajinden-politics" }));
  });
});

describe("auditDatasetCoverage", () => {
  it("finds material that never entered a Journey or the MAP", () => {
    const input = dataset();
    input.documents.push({ id: "doc-orphan", title: "未整理の旅" });
    input.atlas!.spots.push({ id: "spot-orphan", name: "未所属地点", region: "九州", kind: "史跡", latitude: 33, longitude: 131, claimIds: [] });
    input.atlas!.connections.push({ id: "connection-orphan", connectionKind: "documented", initialStatus: "confirmed", eyebrow: "関係", title: "未所属接続", summary: "未所属", spotIds: ["spot-a", "spot-orphan"], claimIds: ["claim-toma"], concepts: [], facets: [], eras: [] });
    input.claims.push({ ...input.claims[0], id: "claim-unmapped", claimKind: "observation", places: [{ entityId: "unmapped-place", name: "未反映の訪問地", role: "observed_place" }] });

    const audit = auditDatasetCoverage(input);
    expect(audit.issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      "unassigned-document",
      "unassigned-spot",
      "unassigned-connection",
      "observed-place-not-mapped",
    ]));
  });

  it("groups observed-place claims and accepts one mapped claim", () => {
    const input = dataset();
    input.claims[0].claimKind = "observation";
    input.claims[0].places = [{ entityId: "visited-place", name: "訪問地", role: "observed_place" }];
    input.claims.push({ ...input.claims[0], id: "claim-second" });

    const audit = auditDatasetCoverage(input);
    expect(audit).toMatchObject({ observedPlaceCount: 1, mappedObservedPlaceCount: 1 });
    expect(audit.issues.some((issue) => issue.code === "observed-place-not-mapped")).toBe(false);
  });

  it("does not turn suggestions and hypotheses into missing visited spots", () => {
    const input = dataset();
    input.claims[0].places = [{ entityId: "future-place", name: "次回の候補", role: "observed_place" }];
    input.claims[0].claimKind = "suggestion";

    const audit = auditDatasetCoverage(input);
    expect(audit.observedPlaceCount).toBe(0);
    expect(audit.issues.some((issue) => issue.code === "observed-place-not-mapped")).toBe(false);
  });

  it("does not turn a known polity into a missing physical MAP spot", () => {
    const input = dataset();
    input.claims[0].claimKind = "observation";
    input.claims[0].places = [{ entityId: "na-state", name: "奴国", role: "observed_place" }];

    const audit = auditDatasetCoverage(input);
    expect(audit.observedPlaceCount).toBe(0);
    expect(audit.issues.some((issue) => issue.code === "observed-place-not-mapped")).toBe(false);
  });
});
