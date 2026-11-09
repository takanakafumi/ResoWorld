import { describe, expect, it } from "vitest";
import type { Claim } from "@/domain/knowledge/schema";
import type { ReviewAtlasSpot } from "@/domain/review/types";
import {
  detectRebindableClaims,
  rebindClaimsToNewSpot,
} from "./claim-rebinding";

describe("Claim Re-binding Specification (未踏候補地実踏時のClaim再バインド / Issue #4)", () => {
  const museumSpot: ReviewAtlasSpot = {
    id: "spot-kyushu-history-museum",
    name: "九州歴史資料館",
    region: "小郡・太宰府",
    kind: "博物館・考古資料館",
    latitude: 33.43,
    longitude: 130.55,
    claimIds: ["claim-yamato-01"],
  };

  const sampleClaims: Claim[] = [
    {
      schemaVersion: "0.2.0",
      id: "claim-yamato-01",
      statement: "山門老松神社の境内は、古代の在地首長・田油津媛の伝承地である。",
      subject: { name: "田油津媛", type: "Person" },
      predicate: "associated_with",
      object: { kind: "entity", entity: { name: "山門老松神社", type: "Place" } },
      qualifiers: {},
      claimKind: "assertion",
      originType: "imported",
      reviewStatus: "confirmed",
      epistemic: { verification: "source-checked", modality: "interpretive" },
      historicalTime: { kind: "named", label: "古代", precision: "broad-range" },
      places: [
        { name: "九州歴史資料館", role: "observed_place" },
        { name: "山門老松神社", role: "intended_place" },
      ],
      evidence: [],
      createdAt: "2026-11-09T00:00:00Z",
    },
    {
      schemaVersion: "0.2.0",
      id: "claim-other-02",
      statement: "九州歴史資料館には太宰府政庁の出土瓦が展示されている。",
      subject: { name: "出土瓦", type: "Artifact" },
      predicate: "exhibited_at",
      object: { kind: "entity", entity: { name: "九州歴史資料館", type: "Place" } },
      qualifiers: {},
      claimKind: "observation",
      originType: "user",
      reviewStatus: "confirmed",
      epistemic: { verification: "personal-evidence", modality: "asserted" },
      historicalTime: null,
      places: [{ name: "九州歴史資料館", role: "observed_place" }],
      evidence: [],
      createdAt: "2026-11-09T00:00:00Z",
    },
  ];

  it("detects rebindable claims via intended_place metadata upon new spot creation", () => {
    const newSpot: ReviewAtlasSpot = {
      id: "spot-yamato-oimatsu",
      name: "山門老松神社",
      region: "八女・みやま",
      kind: "神社",
      latitude: 33.15,
      longitude: 130.50,
      claimIds: [],
    };

    const matches = detectRebindableClaims({
      spot: newSpot,
      claims: sampleClaims,
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].claimId).toBe("claim-yamato-01");
    expect(matches[0].currentAnchorPlaceName).toBe("九州歴史資料館");
    expect(matches[0].matchedIntendedPlaceName).toBe("山門老松神社");
    expect(matches[0].reason).toBe("intended_place_matched");
  });

  it("seamlessly rebinds claims to new physical spot while preserving exhibition site as evidence_place", () => {
    const newSpot: ReviewAtlasSpot = {
      id: "spot-yamato-oimatsu",
      name: "山門老松神社",
      region: "八女・みやま",
      kind: "神社",
      latitude: 33.15,
      longitude: 130.50,
      claimIds: [],
    };

    const { updatedSpot, updatedClaims } = rebindClaimsToNewSpot({
      spot: newSpot,
      claims: sampleClaims,
      claimIdsToRebind: ["claim-yamato-01"],
    });

    // スポット側の claimIds に追加されていること
    expect(updatedSpot.claimIds).toContain("claim-yamato-01");

    // クレーム側の places が更新されていること
    const reboundClaim = updatedClaims.find((c) => c.id === "claim-yamato-01");
    expect(reboundClaim).toBeDefined();

    // 新設スポットが主座（subject_place）になっていること
    const subjectPlace = reboundClaim?.places.find((p) => p.role === "subject_place");
    expect(subjectPlace?.name).toBe("山門老松神社");

    // 元の展示館が物証閲覧地（evidence_place）として継承・保持されていること
    const evidencePlace = reboundClaim?.places.find((p) => p.role === "evidence_place");
    expect(evidencePlace?.name).toBe("九州歴史資料館");

    // 関係ないClaim（claim-other-02）は一切変更されていないこと
    const otherClaim = updatedClaims.find((c) => c.id === "claim-other-02");
    expect(otherClaim?.places).toEqual([{ name: "九州歴史資料館", role: "observed_place" }]);
  });
});
