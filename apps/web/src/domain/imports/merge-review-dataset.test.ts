import { describe, expect, it } from "vitest";

import type { ParsedExplorationDocument } from "@/domain/imports/types";
import { validDatasetFixture } from "@/domain/knowledge/fixtures";

import {
  DatasetImportConflict,
  mergeExtractedDocument,
  mergeImportedDocument,
} from "./merge-review-dataset";

const imported: ParsedExplorationDocument = {
  id: "document-second-trip",
  title: "別の旅",
  relativePath: "別の旅.txt",
  sha256: "b".repeat(64),
  lineCount: 2,
  byteLength: 20,
  passages: [],
};

describe("mergeImportedDocument", () => {
  it("adds a private document without requiring an atlas or knowledge pack", () => {
    const result = mergeImportedDocument({
      dataset: structuredClone(validDatasetFixture),
      document: imported,
    });

    expect(result.status).toBe("added");
    expect(result.dataset.documents.at(-1)).toEqual({
      id: imported.id,
      title: imported.title,
      path: imported.relativePath,
      sha256: imported.sha256,
      authorType: "user-authored",
      privacy: "private",
      observedAt: null,
      documentedAt: null,
      dateStatus: "not-present-in-source",
    });
  });

  it("is idempotent for the same document id and source hash", () => {
    const first = mergeImportedDocument({
      dataset: structuredClone(validDatasetFixture),
      document: imported,
    });
    const second = mergeImportedDocument({
      dataset: first.dataset,
      document: imported,
    });

    expect(second.status).toBe("unchanged");
    expect(second.dataset).toBe(first.dataset);
  });

  it("requires review when a known document changes", () => {
    const first = mergeImportedDocument({
      dataset: structuredClone(validDatasetFixture),
      document: imported,
    });

    try {
      mergeImportedDocument({
        dataset: first.dataset,
        document: { ...imported, sha256: "c".repeat(64) },
      });
      throw new Error("Expected an import conflict");
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetImportConflict);
      expect((error as DatasetImportConflict).code).toBe("document_changed");
    }
  });

  it("rejects the same content under another document id", () => {
    const first = mergeImportedDocument({
      dataset: structuredClone(validDatasetFixture),
      document: imported,
    });

    expect(() =>
      mergeImportedDocument({
        dataset: first.dataset,
        document: { ...imported, id: "document-renamed" },
      }),
    ).toThrowError(/already imported/);
  });
});

describe("mergeExtractedDocument", () => {
  it("reuses the canonical document when identical content has an older id", () => {
    const first = mergeImportedDocument({
      dataset: structuredClone(validDatasetFixture),
      document: imported,
    });
    const sourceClaim = structuredClone(validDatasetFixture.claims[0]);
    const claim = {
      ...sourceClaim,
      id: "claim-from-renamed-document",
      evidence: sourceClaim.evidence.map((evidence) => ({
        ...evidence,
        passage: {
          ...evidence.passage,
          documentId: "document-renamed",
          documentSha256: imported.sha256,
        },
      })),
    };
    const result = mergeExtractedDocument({
      dataset: first.dataset,
      document: { ...imported, id: "document-renamed" },
      claims: [claim],
    });

    expect(result.addedClaimCount).toBe(1);
    expect(result.dataset.documents.filter(({ sha256 }) => sha256 === imported.sha256)).toHaveLength(1);
    expect(result.dataset.claims.at(-1)?.evidence[0].passage.documentId).toBe(imported.id);
  });

  it("preserves an existing review decision for the same deterministic claim", () => {
    const sourceClaim = structuredClone(validDatasetFixture.claims[0]);
    const documentSha256 = sourceClaim.evidence[0].passage.documentSha256;
    const existingDocument = validDatasetFixture.documents.find(
      ({ sha256 }) => sha256 === documentSha256,
    );
    expect(existingDocument).toBeDefined();
    const result = mergeExtractedDocument({
      dataset: structuredClone(validDatasetFixture),
      document: {
        ...imported,
        id: "document-new-parser-id",
        sha256: documentSha256,
      },
      claims: [{
        ...sourceClaim,
        reviewStatus: "suggested",
        evidence: sourceClaim.evidence.map((evidence) => ({
          ...evidence,
          passage: { ...evidence.passage, documentId: "document-new-parser-id" },
        })),
      }],
    });

    expect(result.status).toBe("unchanged");
    expect(result.dataset.claims.find(({ id }) => id === sourceClaim.id)?.reviewStatus)
      .toBe(sourceClaim.reviewStatus);
  });
});
