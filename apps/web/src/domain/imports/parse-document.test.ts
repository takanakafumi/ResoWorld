import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import { parseExplorationDocument } from "./parse-document";

describe("parseExplorationDocument", () => {
  it("splits Japanese Markdown-like text into anchored Passages", () => {
    const text = [
      "# 探索記録",
      "",
      "最初の観察です。",
      "二行目も同じ段落です。",
      "",
      "## 次の場所",
      "",
      "新しい問いが生まれました。",
    ].join("\r\n");
    const sha256 = createHash("sha256").update(text).digest("hex");

    const document = parseExplorationDocument({
      relativePath: "匿名旅行記.txt",
      text,
      sha256,
      byteLength: Buffer.byteLength(text),
    });

    expect(document.title).toBe("匿名旅行記");
    expect(document.passages).toHaveLength(2);
    expect(document.passages[0]).toMatchObject({
      startLine: 3,
      endLine: 4,
      sectionPath: ["探索記録"],
      text: "最初の観察です。\n二行目も同じ段落です。",
    });
    expect(document.passages[1]).toMatchObject({
      startLine: 8,
      endLine: 8,
      sectionPath: ["探索記録", "次の場所"],
    });
  });

  it("keeps the document ID stable when only content changes", () => {
    const first = parseExplorationDocument({
      relativePath: "同じ名前.txt",
      text: "最初の内容",
      sha256: "1".repeat(64),
      byteLength: 15,
    });
    const second = parseExplorationDocument({
      relativePath: "同じ名前.txt",
      text: "変更後の内容",
      sha256: "2".repeat(64),
      byteLength: 18,
    });

    expect(first.id).toBe(second.id);
    expect(first.sha256).not.toBe(second.sha256);
  });
});
