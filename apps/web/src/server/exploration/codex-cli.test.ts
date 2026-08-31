import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildCodexExecArgs,
  CodexResearchError,
  parseCodexResearchOutput,
} from "./codex-cli";

describe("Codex CLI wrapper boundaries", () => {
  it("uses an ephemeral read-only run with structured output", () => {
    const args = buildCodexExecArgs("schema.json", "result.json");
    expect(args).toEqual(
      expect.arrayContaining([
        "--search",
        "--ephemeral",
        "--ignore-user-config",
        "--skip-git-repo-check",
        "read-only",
        "--output-schema",
        "schema.json",
        "--output-last-message",
        "result.json",
      ]),
    );
  });

  it("rejects unstructured output", () => {
    expect(() => parseCodexResearchOutput("not json")).toThrow(
      CodexResearchError,
    );
  });
});
