import type { ParsedExplorationDocument } from "@/domain/imports/types";
import {
  KnowledgeDatasetSchema,
  type Claim,
  type KnowledgeDataset,
} from "@/domain/knowledge/schema";

export class DatasetImportConflict extends Error {
  constructor(
    public readonly code:
      | "document_changed"
      | "duplicate_content"
      | "claim_id_conflict"
      | "foreign_evidence",
    message: string,
  ) {
    super(message);
    this.name = "DatasetImportConflict";
  }
}

export type DatasetImportResult = {
  dataset: KnowledgeDataset;
  status: "added" | "unchanged";
  addedClaimCount: number;
};

export function mergeImportedDocument(input: {
  dataset: KnowledgeDataset;
  document: ParsedExplorationDocument;
  claims?: Claim[];
}): DatasetImportResult {
  const claims = input.claims ?? [];
  const existingDocument = input.dataset.documents.find(
    (document) => document.id === input.document.id,
  );

  if (existingDocument) {
    if (existingDocument.sha256 === input.document.sha256) {
      return { dataset: input.dataset, status: "unchanged", addedClaimCount: 0 };
    }
    throw new DatasetImportConflict(
      "document_changed",
      "Document " + input.document.id + " has changed and requires review before re-import.",
    );
  }

  const duplicate = input.dataset.documents.find(
    (document) => document.sha256 === input.document.sha256,
  );
  if (duplicate) {
    throw new DatasetImportConflict(
      "duplicate_content",
      "Document content is already imported as " + duplicate.id + ".",
    );
  }

  const existingClaims = new Set(input.dataset.claims.map((claim) => claim.id));
  for (const claim of claims) {
    if (existingClaims.has(claim.id)) {
      throw new DatasetImportConflict(
        "claim_id_conflict",
        "Claim " + claim.id + " is already present in the dataset.",
      );
    }
    if (
      claim.evidence.some(
        (evidence) => evidence.passage.documentId !== input.document.id,
      )
    ) {
      throw new DatasetImportConflict(
        "foreign_evidence",
        "Claim " + claim.id + " refers to evidence outside " + input.document.id + ".",
      );
    }
  }

  const dataset = KnowledgeDatasetSchema.parse({
    ...input.dataset,
    documents: [
      ...input.dataset.documents,
      {
        id: input.document.id,
        title: input.document.title,
        path: input.document.relativePath,
        sha256: input.document.sha256,
        authorType: "user-authored",
        privacy: "private",
        observedAt: null,
        documentedAt: null,
        dateStatus: "not-present-in-source",
      },
    ],
    claims: [...input.dataset.claims, ...claims],
  });

  return { dataset, status: "added", addedClaimCount: claims.length };
}