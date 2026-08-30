import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import type { LocalImportConfig } from "@/domain/imports/types";

import { previewLocalImport } from "./local-files";

const temporaryDirectories: string[] = [];

async function createImportRoot() {
  const root = await mkdtemp(join(tmpdir(), "resoworld-boundary-test-"));
  temporaryDirectories.push(root);
  return root;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

describe("local import boundaries", () => {
  it("rejects unsupported file types before filesystem access", async () => {
    const config: LocalImportConfig = {
      enabled: true,
      rootPath: await createImportRoot(),
      maxBytes: 1024,
    };

    await expect(
      previewLocalImport("notes.md", { config }),
    ).rejects.toMatchObject({ code: "unsupported_type" });
  });

  it("rejects files over the configured size limit", async () => {
    const root = await createImportRoot();
    await writeFile(join(root, "large.txt"), "1234567890", "utf8");
    const config: LocalImportConfig = {
      enabled: true,
      rootPath: root,
      maxBytes: 5,
    };

    await expect(
      previewLocalImport("large.txt", { config }),
    ).rejects.toMatchObject({ code: "file_too_large" });
  });
});
