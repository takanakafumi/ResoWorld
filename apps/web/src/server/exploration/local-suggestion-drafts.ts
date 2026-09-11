import "server-only";

import { readFile, readdir, realpath } from "node:fs/promises";
import { basename, isAbsolute, join, relative } from "node:path";

import { SuggestionDraftFileSchema } from "@/domain/exploration/suggestion-drafts";
import { localReviewRoot } from "@/server/imports/local-journey-candidates";
import { LocalReviewDatasetError } from "@/server/review/local-dataset";

async function suggestionDraftRoot() {
  const root = await localReviewRoot();
  const directory = await realpath(join(root, ".resoworld", "suggestion-drafts"));
  const fromRoot = relative(root, directory);
  if (fromRoot.startsWith("..") || isAbsolute(fromRoot)) throw new LocalReviewDatasetError("invalid_path", "Suggestion draft directory is outside the review root.");
  return directory;
}

export async function listLocalSuggestionDrafts() {
  try {
    const directory = await suggestionDraftRoot();
    const entries = await readdir(directory, { withFileTypes: true });
    const drafts = [];
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".ollama.json")) continue;
      try {
        const parsed = SuggestionDraftFileSchema.safeParse(JSON.parse(await readFile(join(directory, entry.name), "utf8")));
        if (parsed.success) drafts.push({ file: entry.name, draft: parsed.data });
      } catch {
        // A partial or manually edited draft must not make the whole Import page unavailable.
      }
    }
    return drafts.sort((left, right) => right.draft.createdAt.localeCompare(left.draft.createdAt));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return [];
    throw error;
  }
}

export async function loadLocalSuggestionDraft(file: string) {
  if (!file || isAbsolute(file) || basename(file) !== file || !file.endsWith(".ollama.json")) {
    throw new LocalReviewDatasetError("invalid_path", "Suggestion draft path is invalid.");
  }
  const directory = await suggestionDraftRoot();
  const path = await realpath(join(directory, file));
  const fromDirectory = relative(directory, path);
  if (fromDirectory.startsWith("..") || isAbsolute(fromDirectory)) throw new LocalReviewDatasetError("invalid_path", "Suggestion draft is outside its directory.");
  return SuggestionDraftFileSchema.parse(JSON.parse(await readFile(path, "utf8")));
}
