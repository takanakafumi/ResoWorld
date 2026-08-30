import { createHash } from "node:crypto";
import {
  lstat,
  readFile,
  readdir,
  realpath,
  stat,
} from "node:fs/promises";
import { basename, dirname, extname, isAbsolute, join, relative } from "node:path";

import { parseExplorationDocument } from "@/domain/imports/parse-document";
import type {
  LocalImportConfig,
  LocalImportFile,
  LocalImportPreview,
} from "@/domain/imports/types";

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export class LocalImportError extends Error {
  constructor(
    public readonly code:
      | "disabled"
      | "not_configured"
      | "invalid_root"
      | "invalid_path"
      | "unsupported_type"
      | "not_found"
      | "not_regular_file"
      | "file_too_large"
      | "invalid_utf8",
    message: string,
  ) {
    super(message);
    this.name = "LocalImportError";
  }
}

export function localImportConfigFromEnvironment(): LocalImportConfig {
  return {
    enabled: process.env.RESOWORLD_LOCAL_IMPORT_ENABLED === "true",
    rootPath: process.env.RESOWORLD_IMPORT_DIR?.trim() || null,
    maxBytes: DEFAULT_MAX_BYTES,
  };
}

async function resolveConfiguredRoot(config: LocalImportConfig) {
  if (!config.enabled) {
    throw new LocalImportError("disabled", "Local import is disabled.");
  }
  if (!config.rootPath) {
    throw new LocalImportError(
      "not_configured",
      "The local import directory is not configured.",
    );
  }
  if (!isAbsolute(config.rootPath)) {
    throw new LocalImportError(
      "invalid_root",
      "The local import directory must be an absolute path.",
    );
  }

  try {
    const root = await realpath(/* turbopackIgnore: true */ config.rootPath);
    const rootStat = await stat(/* turbopackIgnore: true */ root);
    if (!rootStat.isDirectory()) {
      throw new LocalImportError(
        "invalid_root",
        "The configured import root is not a directory.",
      );
    }
    return root;
  } catch (error) {
    if (error instanceof LocalImportError) throw error;
    throw new LocalImportError(
      "invalid_root",
      "The configured import root cannot be accessed.",
    );
  }
}

function assertSafeFileName(relativePath: string) {
  if (
    !relativePath ||
    isAbsolute(relativePath) ||
    basename(relativePath) !== relativePath ||
    relativePath === "." ||
    relativePath === ".."
  ) {
    throw new LocalImportError("invalid_path", "Invalid import file path.");
  }
  if (extname(relativePath).toLocaleLowerCase("en-US") !== ".txt") {
    throw new LocalImportError(
      "unsupported_type",
      "Only .txt files can be imported in this PoC.",
    );
  }
}

export async function listLocalImportFiles(
  config = localImportConfigFromEnvironment(),
): Promise<LocalImportFile[]> {
  const root = await resolveConfiguredRoot(config);
  const entries = await readdir(/* turbopackIgnore: true */ root, { withFileTypes: true });

  const files = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          !entry.isSymbolicLink() &&
          extname(entry.name).toLocaleLowerCase("en-US") === ".txt",
      )
      .map(async (entry) => {
        const fileStat = await stat(join(/* turbopackIgnore: true */ root, entry.name));
        return {
          relativePath: entry.name,
          name: entry.name.replace(/\.txt$/i, ""),
          size: fileStat.size,
        };
      }),
  );

  return files.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath, "ja"),
  );
}

export async function previewLocalImport(
  relativePath: string,
  options: {
    expectedSha256?: string;
    config?: LocalImportConfig;
  } = {},
): Promise<LocalImportPreview> {
  assertSafeFileName(relativePath);
  const config = options.config ?? localImportConfigFromEnvironment();
  const root = await resolveConfiguredRoot(config);
  const candidate = join(/* turbopackIgnore: true */ root, relativePath);

  try {
    const candidateStat = await lstat(/* turbopackIgnore: true */ candidate);
    if (!candidateStat.isFile() || candidateStat.isSymbolicLink()) {
      throw new LocalImportError(
        "not_regular_file",
        "The selected path is not a regular file.",
      );
    }
    if (candidateStat.size > config.maxBytes) {
      throw new LocalImportError(
        "file_too_large",
        "The selected file exceeds the local import size limit.",
      );
    }

    const resolvedCandidate = await realpath(/* turbopackIgnore: true */ candidate);
    const relativeToRoot = relative(root, resolvedCandidate);
    if (
      relativeToRoot.startsWith("..") ||
      isAbsolute(relativeToRoot) ||
      dirname(resolvedCandidate).toLocaleLowerCase("en-US") !==
        root.toLocaleLowerCase("en-US")
    ) {
      throw new LocalImportError(
        "invalid_path",
        "The selected file is outside the configured import root.",
      );
    }

    const bytes = await readFile(/* turbopackIgnore: true */ resolvedCandidate);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new LocalImportError(
        "invalid_utf8",
        "The selected file is not valid UTF-8 text.",
      );
    }

    return {
      ...parseExplorationDocument({
        relativePath,
        text,
        sha256,
        byteLength: bytes.byteLength,
      }),
      changedFromExpectedHash:
        options.expectedSha256 !== undefined &&
        options.expectedSha256.toLocaleLowerCase("en-US") !== sha256,
    };
  } catch (error) {
    if (error instanceof LocalImportError) throw error;
    throw new LocalImportError("not_found", "The selected file was not found.");
  }
}
