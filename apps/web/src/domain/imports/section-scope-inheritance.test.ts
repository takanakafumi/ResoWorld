import { describe, expect, it } from "vitest";
import {
  applySectionScopeInheritance,
  auditSectionScopeClaimLinkage,
  isGeneralHeading,
  matchSpotInHeading,
  parseDocumentSections,
} from "./section-scope-inheritance";
import type { Claim } from "@/domain/knowledge/schema";
import type { ReviewDataset } from "@/domain/review/types";

describe("section-scope claim inheritance (ADR-0020)", () => {
  describe("isGeneralHeading and matchSpotInHeading", () => {
    it("identifies summary and meta headings", () => {
      expect(isGeneralHeading("旅の概要")).toBe(true);
      expect(isGeneralHeading("今日の旅を一言でまとめるなら")).toBe(true);
      expect(isGeneralHeading("三日間の軌跡")).toBe(true);
      expect(isGeneralHeading("今日一番面白かった発見")).toBe(true);
      expect(isGeneralHeading("④ 高祖神社")).toBe(false);
      expect(isGeneralHeading("7. 筑紫神社 ― 「八百万の神」を実感")).toBe(false);
    });

    it("matches spot names in headings with various decorators and prefixes", () => {
      const spots = [
        { id: "spot-koso", name: "高祖神社" },
        { id: "spot-chikushi", name: "筑紫神社" },
        { id: "spot-munakata", name: "宗像大社 辺津宮" },
        { id: "spot-shirakami", name: "白神社" },
      ];

      expect(matchSpotInHeading("# ④ 高祖神社", spots)?.id).toBe("spot-koso");
      expect(matchSpotInHeading("### 7. 筑紫神社 ― 「八百万の神」を実感", spots)?.id).toBe("spot-chikushi");
      expect(matchSpotInHeading("## 白神社――街中に残っていた「かつての海」", spots)?.id).toBe("spot-shirakami");
      expect(matchSpotInHeading("## 旅の概要", spots)).toBeUndefined();
    });
  });

  describe("parseDocumentSections", () => {
    it("calculates accurate line ranges regardless of heading depth (H1 vs H2 vs H3)", () => {
      const markdown = [
        "# 今日の小旅行", // L1
        "イントロダクション", // L2
        "## ① 伊都国歴史博物館", // L3
        "展示を見学した。", // L4
        "# ② 高祖神社", // L5
        "高祖山を背負った社殿。", // L6
        "さらに高祖山には怡土城跡がある。", // L7
        "後世の防衛拠点として機能した。", // L8
        "### 現地の印象", // L9 (nested sub-heading under Koso Shrine)
        "厳かな雰囲気だった。", // L10
        "# ③ 平原遺跡", // L11
        "アマテラスの眠る墓。", // L12
      ].join("\n");

      const spots = [
        { id: "spot-museum", name: "伊都国歴史博物館" },
        { id: "spot-koso", name: "高祖神社" },
        { id: "spot-hirabaru", name: "平原遺跡" },
      ];

      const sections = parseDocumentSections(markdown, spots);
      expect(sections.length).toBeGreaterThanOrEqual(3);

      const kosoSection = sections.find((s) => s.anchorSpot?.id === "spot-koso");
      expect(kosoSection).toBeDefined();
      expect(kosoSection?.startLine).toBe(5);
      // Next main spot heading is line 11 (平原遺跡), so Koso section ends at line 10
      expect(kosoSection?.endLine).toBe(10);
    });
  });

  describe("auditSectionScopeClaimLinkage and applySectionScopeInheritance", () => {
    it("detects orphaned claims in section and safely inherits them to visited spot", () => {
      const mockSpots = [
        {
          id: "spot-koso",
          name: "高祖神社",
          region: "糸島",
          kind: "神社",
          latitude: 33.54,
          longitude: 130.26,
          claimIds: ["claim-1"], // only claim-1 is linked initially!
        },
      ];

      const mockClaims: Claim[] = [
        {
          schemaVersion: "0.2.0",
          id: "claim-1",
          statement: "高祖神社の社殿は高祖山を背負っている。",
          subject: { name: "高祖神社", type: "Place" },
          predicate: "located_at",
          object: { kind: "entity", entity: { name: "高祖山", type: "Place" } },
          qualifiers: {},
          places: [{ name: "高祖神社", role: "observed_place" }],
          claimKind: "observation",
          originType: "user",
          reviewStatus: "confirmed",
          epistemic: { verification: "personal-evidence", modality: "asserted" },
          historicalTime: null,
          evidence: [
            {
              id: "ev-1",
              role: "supports",
              sourceNature: "Observation",
              documentVoice: "user-narrator",
              passage: {
                documentId: "doc-1",
                documentSha256: "sha1",
                startLine: 6,
                endLine: 6,
                quote: "高祖山を背負った社殿。",
                passageSha256: "pass-sha1",
              },
            },
          ],
          createdAt: "2026-10-18T00:00:00Z",
        },
        {
          schemaVersion: "0.2.0",
          id: "claim-2", // Extracted under Koso Shrine section, but orphaned because subject is 高祖山
          statement: "高祖山には怡土城跡が存在する。",
          subject: { name: "高祖山", type: "Place" },
          predicate: "has_feature",
          object: { kind: "entity", entity: { name: "怡土城跡", type: "Place" } },
          qualifiers: {},
          places: [{ name: "高祖山", role: "subject_place" }],
          claimKind: "observation",
          originType: "user",
          reviewStatus: "confirmed",
          epistemic: { verification: "personal-evidence", modality: "asserted" },
          historicalTime: null,
          evidence: [
            {
              id: "ev-2",
              role: "supports",
              sourceNature: "Observation",
              documentVoice: "user-narrator",
              passage: {
                documentId: "doc-1",
                documentSha256: "sha1",
                startLine: 7,
                endLine: 7,
                quote: "さらに高祖山には怡土城跡がある。",
                passageSha256: "pass-sha2",
              },
            },
          ],
          createdAt: "2026-10-18T00:00:00Z",
        },
        {
          schemaVersion: "0.2.0",
          id: "claim-3", // Cross-site comparison claim (mentioning 出雲大社)
          statement: "出雲大社と比べると社殿の規模は控えめである。",
          subject: { name: "出雲大社", type: "Place" },
          predicate: "compared_to",
          object: { kind: "entity", entity: { name: "高祖神社", type: "Place" } },
          qualifiers: {},
          places: [{ name: "出雲大社", role: "subject_place" }],
          claimKind: "observation",
          originType: "user",
          reviewStatus: "confirmed",
          epistemic: { verification: "personal-evidence", modality: "asserted" },
          historicalTime: null,
          evidence: [
            {
              id: "ev-3",
              role: "supports",
              sourceNature: "Observation",
              documentVoice: "user-narrator",
              passage: {
                documentId: "doc-1",
                documentSha256: "sha1",
                startLine: 8,
                endLine: 8,
                quote: "出雲大社と比べると社殿の規模は控えめである。",
                passageSha256: "pass-sha3",
              },
            },
          ],
          createdAt: "2026-10-18T00:00:00Z",
        },
      ];

      const mockDataset: ReviewDataset = {
        datasetId: "test-dataset",
        privacy: "local-only",
        documents: [
          {
            id: "doc-1",
            title: "テスト旅程",
          },
        ],
        claims: mockClaims,
        atlas: {
          title: "Test Atlas",
          journeys: [
            {
              id: "journey-1",
              label: "テストジャーニー",
              documentIds: ["doc-1"],
              spotIds: ["spot-koso"],
              connectionIds: [],
            },
          ],
          spots: mockSpots,
          connections: [],
          suggestions: [],
        },
      };

      const mockText = [
        "# テスト旅程", // L1
        "旅の始まり。", // L2
        "# ① 高祖神社", // L3
        "鳥居をくぐる。", // L4
        "境内に入った。", // L5
        "高祖山を背負った社殿。", // L6
        "さらに高祖山には怡土城跡がある。", // L7
        "出雲大社と比べると社殿の規模は控えめである。", // L8
        "# ② 次の場所", // L9
        "移動した。", // L10
      ].join("\n");

      // Register spots for cross-site exclusion test
      mockSpots.push({
        id: "spot-izumo",
        name: "出雲大社",
        region: "出雲",
        kind: "神社",
        latitude: 35.4,
        longitude: 132.6,
        claimIds: [],
      });

      const orphaned = auditSectionScopeClaimLinkage(
        mockDataset,
        (docId) => (docId === "doc-1" ? mockText : undefined),
      );

      // claim-2 (怡土城跡) should be detected as orphaned from spot-koso!
      // claim-3 (出雲大社) should NOT be orphaned because it is a cross-site comparison to spot-izumo!
      expect(orphaned).toHaveLength(1);
      expect(orphaned[0].claim.id).toBe("claim-2");
      expect(orphaned[0].spot.id).toBe("spot-koso");

      // Apply inheritance
      const result = applySectionScopeInheritance(
        mockDataset,
        (docId) => (docId === "doc-1" ? mockText : undefined),
      );

      expect(result.linkedCount).toBe(1);
      const updatedKoso = result.dataset.atlas?.spots.find((s) => s.id === "spot-koso");
      expect(updatedKoso?.claimIds).toContain("claim-2");

      // Running audit on updated dataset should yield 0 orphaned claims (idempotency)
      const orphanedAfter = auditSectionScopeClaimLinkage(
        result.dataset,
        (docId) => (docId === "doc-1" ? mockText : undefined),
      );
      expect(orphanedAfter).toHaveLength(0);
    });
  });
});
