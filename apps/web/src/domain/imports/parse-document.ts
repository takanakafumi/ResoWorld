import { createHash } from "node:crypto";

import type {
  ImportedPassage,
  ParsedExplorationDocument,
} from "./types";

type ParseDocumentInput = {
  relativePath: string;
  text: string;
  sha256: string;
  byteLength: number;
};

function hashText(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function documentIdFor(relativePath: string) {
  const pathHash = hashText(relativePath.toLocaleLowerCase("ja-JP")).slice(0, 16);
  return `document-${pathHash}`;
}

function titleFor(relativePath: string) {
  return relativePath.replace(/\.txt$/i, "");
}

export function parseExplorationDocument({
  relativePath,
  text,
  sha256,
  byteLength,
}: ParseDocumentInput): ParsedExplorationDocument {
  const normalizedText = text.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = normalizedText.split("\n");
  const documentId = documentIdFor(relativePath);
  const sectionHeadings: string[] = [];
  const passages: ImportedPassage[] = [];

  let passageStartLine: number | null = null;
  let passageLines: string[] = [];
  let passageSectionPath: string[] = [];

  const flushPassage = (endLine: number) => {
    if (passageStartLine === null || passageLines.length === 0) {
      passageStartLine = null;
      passageLines = [];
      return;
    }

    const passageText = passageLines.join("\n").trimEnd();
    const passageSha256 = hashText(passageText);
    passages.push({
      id: `passage-${documentId}-${passageStartLine}-${passageSha256.slice(0, 12)}`,
      documentId,
      startLine: passageStartLine,
      endLine,
      sectionPath: passageSectionPath,
      text: passageText,
      sha256: passageSha256,
    });

    passageStartLine = null;
    passageLines = [];
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (heading) {
      flushPassage(lineNumber - 1);
      const level = heading[1].length;
      sectionHeadings.length = level - 1;
      sectionHeadings[level - 1] = heading[2].trim();
      return;
    }

    if (line.trim().length === 0) {
      flushPassage(lineNumber - 1);
      return;
    }

    if (passageStartLine === null) {
      passageStartLine = lineNumber;
      passageSectionPath = sectionHeadings.filter(Boolean);
    }
    passageLines.push(line);
  });

  flushPassage(lines.length);

  return {
    id: documentId,
    title: titleFor(relativePath),
    relativePath,
    sha256,
    lineCount: lines.length,
    byteLength,
    passages,
  };
}
