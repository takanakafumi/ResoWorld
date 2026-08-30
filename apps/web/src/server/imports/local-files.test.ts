import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { LocalImportConfig } from "@/domain/imports/types";

import {
  listLocalImportFiles,
  previewLocalImport,
} from "./local-files";

const temporaryDirectories: string[] = [];

async function createImportRoot() {
  const root = await mkdtemp(join(tmpdir(), "resoworld-import-test-"));
  temporaryDirectories.push(root);
  return root;
}

function configFor(rootPath: string): LocalImportConfig {
  return {
    enabled: true,
    rootPath,
    maxBytes: 1024 * 1024,
  };
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("local file imports", () => {
  it("lists only direct UTF-8 text candidates", async () => {
    const root = await createImportRoot();
    await writeFile(join(root, "記録A.txt"), "記録A", "utf8");
    await writeFile(join(root, "画像.jpg"), "not an image", "utf8");

    await expect(listLocalImportFiles(configFor(root))).resolves.toEqual([
      {
        relativePath: "記録A.txt",
        name: "記録A",
        size: Buffer.byteLength("記録A"),
      },
    ]);
  });

  it("reads UTF-8 text and detects a changed document hash", async () => {
    const root = await createImportRoot();
    await writeFile(join(root, "記録.txt"), "# 見出し\n\n現地観察", "utf8");

    const preview = await previewLocalImport("記録.txt", {
      config: configFor(root),
      expectedSha256: "0".repeat(64),
    });

    expect(preview.passages).toHaveLength(1);
    expect(preview.passages[0].text).toBe("現地観察");
    expect(preview.changedFromExpectedHash).toBe(true);
  });

  it.each(["../outside.txt", "folder/inside.txt", "C:\\outside.txt"])(
    "rejects unsafe paths: %s",
    async (unsafePath) => {
      const root = await createImportRoot();

      await expect(
        previewLocalImport(unsafePath, { config: configFor(root) }),
      ).rejects.toMatchObject({
        code: "invalid_path",
      });
    },
  );

  it("rejects invalid UTF-8", async () => {
    const root = await createImportRoot();
    await writeFile(join(root, "invalid.txt"), Buffer.from([0xc3, 0x28]));

    await expect(
      previewLocalImport("invalid.txt", { config: configFor(root) }),
    ).rejects.toMatchObject({
      code: "invalid_utf8",
    });
  });

  it("requires an explicit enabled flag", async () => {
    const root = await createImportRoot();

    await expect(
      listLocalImportFiles({ ...configFor(root), enabled: false }),
    ).rejects.toMatchObject({
      code: "disabled",
    });
  });
});
