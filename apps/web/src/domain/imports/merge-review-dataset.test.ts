import { describe, expect, it } from "vitest";

import type { ParsedExplorationDocument } from "@/domain/imports/types";
import { validDatasetFixture } from "@/domain/knowledge/fixtures";

import { DatasetImportConflict, mergeImportedDocument } from "./merge-review-dataset";

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