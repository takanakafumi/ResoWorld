import "server-only";

import { readFile, realpath, stat } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";

import { KnowledgeDatasetSchema } from "@/domain/knowledge/schema";

import {
  LocalReviewDatasetError,
  localReviewDatasetConfigFromEnvironment,
  type LocalReviewDatasetConfig,
} from "./local-dataset";

export async function loadLocalKnowledgeDataset(
  config: LocalReviewDatasetConfig = localReviewDatasetConfigFromEnvironment(),
) {
  if (!config.enabled || !config.rootPath || !config.relativePath) {
    throw new LocalReviewDatasetError(
      "not_configured",
      "Local review dataset is not configured.",
    );
  }
  if (!isAbsolute(config.rootPath) || isAbsolute(config.relativePath)) {
    throw new LocalReviewDatasetError("invalid_path", "Review dataset paths are invalid.");
  }

  const root = await realpath(config.rootPath);
  const candidate = await realpath(resolve(root, config.relativePath));
  const relativeToRoot = relative(root, candidate);
  if (
    relativeToRoot.startsWith("..") ||
    isAbsolute(relativeToRoot) ||
    !candidate.toLocaleLowerCase("en-US").endsWith(".json")
  ) {
    throw new LocalReviewDatasetError(
      "invalid_path",
      "Review dataset must be a JSON file inside the configured root.",
    );
  }
  if (!(await stat(candidate)).isFile()) {
    throw new LocalReviewDatasetError("invalid_path", "Review dataset is not a regular file.");
  }

  try {
    return KnowledgeDatasetSchema.parse(JSON.parse(await readFile(candidate, "utf8")));
  } catch (error) {
    if (error instanceof LocalReviewDatasetError) throw error;
    throw new LocalReviewDatasetError("invalid_dataset", "Review dataset is invalid.");
  }
}
