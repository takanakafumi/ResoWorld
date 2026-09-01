import { describe, expect, it } from "vitest";

import type { ParsedExplorationDocument } from "@/domain/imports/types";
import type { ReviewDataset } from "@/domain/review/types";

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

function dataset(): ReviewDataset {
  return {
    datasetId: "exploration-demo",
    privacy: "local-only",
    documents: [{ id: "document-first-trip", title: "最初の旅", sourceSha256: "a".repeat(64) }],
    claims: [],
    atlas: null,
  };
}

describe("mergeImportedDocument", () => {
  it("adds a document without requiring an atlas or knowledge pack", () => {
    const result = mergeImportedDocument({ dataset: dataset(), document: imported });
    expect(result.status).toBe("added");
    expect(result.dataset.documents).toHaveLength(2);
    expect(result.dataset.documents[1]).toEqual({ id: imported.id, title: imported.title, sourceSha256: imported.sha256 });
    expect(result.dataset.atlas).toBeNull();
  });

  it("is idempotent for the same document id and source hash", () => {
    const first = mergeImportedDocument({ dataset: dataset(), document: imported });
    const second = mergeImportedDocument({ dataset: first.dataset, document: imported });
    expect(second.status).toBe("unchanged");
    expect(second.dataset).toBe(first.dataset);
  });

  it("requires review when a known document changes", () => {
    const first = mergeImportedDocument({ dataset: dataset(), document: imported });
    try {
      mergeImportedDocument({ dataset: first.dataset, document: { ...imported, sha256: "c".repeat(64) } });
      throw new Error("Expected an import conflict");
    } catch (error) {
      expect(error).toBeInstanceOf(DatasetImportConflict);
      expect((error as DatasetImportConflict).code).toBe("document_changed");
    }
  });

  it("rejects the same content under another document id", () => {
    const first = mergeImportedDocument({ dataset: dataset(), document: imported });
    expect(() => mergeImportedDocument({ dataset: first.dataset, document: { ...imported, id: "document-renamed" } })).toThrowError(/already imported/);
  });
});
