import "server-only";

import { copyFile, readFile, realpath, rename, stat, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve } from "node:path";

import { KnowledgeDatasetSchema } from "@/domain/knowledge/schema";
import type { KnowledgeDataset } from "@/domain/knowledge/schema";

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

export async function applyLocalKnowledgeDataset(candidateFile: string, dataset: KnowledgeDataset, config: LocalReviewDatasetConfig = localReviewDatasetConfigFromEnvironment()) {
  if (!config.enabled || !config.rootPath || !config.relativePath || !isAbsolute(config.rootPath) || isAbsolute(config.relativePath)) throw new LocalReviewDatasetError("not_configured", "Local review dataset is not configured.");
  const root = await realpath(config.rootPath);
  const destination = await realpath(resolve(root, config.relativePath));
  const relativeToRoot = relative(root, destination);
  if (relativeToRoot.startsWith("..") || isAbsolute(relativeToRoot) || !destination.toLocaleLowerCase("en-US").endsWith(".json")) throw new LocalReviewDatasetError("invalid_path", "Review dataset must be a JSON file inside the configured root.");
  const validated = KnowledgeDatasetSchema.parse(dataset);
  const safeCandidateName = candidateFile.replace(/\.journey-candidate\.json$/, "").replace(/[^a-zA-Z0-9._-]+/g, "-");
  const backup = join(root, `${basename(config.relativePath, ".json")}.before-entities-${safeCandidateName}-${Date.now()}.json`);
  const temporary = destination + ".tmp";
  await copyFile(destination, backup);
  await writeFile(temporary, JSON.stringify(validated, null, 2) + "\n", "utf8");
  await rename(temporary, destination);
  return { datasetFile: config.relativePath, backupFile: basename(backup) };
}
