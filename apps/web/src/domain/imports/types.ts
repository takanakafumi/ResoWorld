export type ImportedPassage = {
  id: string;
  documentId: string;
  startLine: number;
  endLine: number;
  sectionPath: string[];
  text: string;
  sha256: string;
};

export type ParsedExplorationDocument = {
  id: string;
  title: string;
  relativePath: string;
  sha256: string;
  lineCount: number;
  byteLength: number;
  passages: ImportedPassage[];
};

export type LocalImportFile = {
  relativePath: string;
  name: string;
  size: number;
};

export type LocalImportPreview = ParsedExplorationDocument & {
  changedFromExpectedHash: boolean;
};

export type LocalImportConfig = {
  enabled: boolean;
  rootPath: string | null;
  maxBytes: number;
};
